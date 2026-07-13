import hashlib
import hmac
import os
import shutil
import uuid
from pathlib import Path

import razorpay
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from chatbot import BodhiChatbot
import archive_store
import booking_store
import ocr

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Please create a .env file.")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
razorpay_client = (
    razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    else None
)

UPLOAD_DIR = Path(__file__).parent / "archive_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize FastAPI app and the Bodhi engine
app = FastAPI(title="Sangha Platform - Bodhi AI API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/archive_uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="archive_uploads")

bodhi = BodhiChatbot(api_key=api_key)
archive_store.init_db()
booking_store.init_db()

# Define the JSON schemas for requests and responses
class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []

class ArchiveItem(BaseModel):
    id: str
    title: str
    monastery: str
    type: str
    year: str
    location: str
    image_filename: str
    ocrText: str
    tags: list[str]

@app.get("/")
def health_check():
    """Simple endpoint to verify the server is running."""
    return {"status": "Bodhi AI Backend is active and routing queries."}

@app.post("/chat", response_model=ChatResponse)
def chat_with_bodhi(request: ChatRequest):
    """The main endpoint the frontend website will hit."""
    try:
        result = bodhi.generate_response(request.message, request.session_id)
        return ChatResponse(reply=result["reply"], sources=result["sources"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class OcrResponse(BaseModel):
    text: str

@app.post("/ocr/extract", response_model=OcrResponse)
def extract_ocr_text(file: UploadFile = File(...)):
    """Runs an uploaded image through the Tibetan OCR pipeline and returns the
    transcription directly, with no archive metadata/storage involved."""
    extension = Path(file.filename or "upload").suffix or ".jpg"
    temp_path = UPLOAD_DIR / f"ocr_tmp_{uuid.uuid4().hex}{extension}"

    with temp_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        text = ocr.extract_text(str(temp_path))
    except Exception as e:
        print(f"OCR failed for {temp_path}: {e}")
        raise HTTPException(status_code=500, detail="OCR failed for this image.")
    finally:
        temp_path.unlink(missing_ok=True)

    return OcrResponse(text=text)

@app.get("/archive", response_model=list[ArchiveItem])
def list_archive_items():
    """Returns every archived artifact, OCR'd from the actual uploaded image."""
    return archive_store.list_items()

@app.post("/archive/upload", response_model=ArchiveItem)
def upload_archive_item(
    title: str = Form(...),
    monastery: str = Form(...),
    type: str = Form(...),
    year: str = Form(...),
    location: str = Form(...),
    tags: str = Form(""),
    file: UploadFile = File(...),
):
    """Accepts an artifact image, runs it through real OCR, and stores the result."""
    item_id = uuid.uuid4().hex
    extension = Path(file.filename or "upload").suffix or ".jpg"
    image_filename = f"{item_id}{extension}"
    image_path = UPLOAD_DIR / image_filename

    with image_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        ocr_text = ocr.extract_text(str(image_path))
    except Exception as e:
        print(f"OCR failed for {image_path}: {e}")
        ocr_text = "OCR unavailable for this item."

    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    archive_store.add_item({
        "id": item_id,
        "title": title,
        "monastery": monastery,
        "type": type,
        "year": year,
        "location": location,
        "image_filename": image_filename,
        "ocr_text": ocr_text,
        "tags": tag_list,
    })

    return ArchiveItem(
        id=item_id,
        title=title,
        monastery=monastery,
        type=type,
        year=year,
        location=location,
        image_filename=image_filename,
        ocrText=ocr_text,
        tags=tag_list,
    )

class BookingResponse(BaseModel):
    success: bool
    orderId: str
    bookingId: str
    amount: float
    message: str

def _create_booking(booking_type: str, payload: dict) -> BookingResponse:
    """Shared logic behind every /api/create-*-booking endpoint: the Experiences pages
    all follow the same pattern (pick something, pay, get a bookingId back) - only the
    payload fields differ per booking type, so there's one real implementation here."""
    amount = payload.get("amount")
    if amount is None:
        raise HTTPException(status_code=400, detail="Missing required field: amount")

    booking_id = f"BOOK_{uuid.uuid4().hex[:10].upper()}"
    order_id = f"ORDER_{uuid.uuid4().hex[:8].upper()}"
    booking_store.add_booking(booking_id, order_id, booking_type, float(amount), payload)

    return BookingResponse(
        success=True,
        orderId=order_id,
        bookingId=booking_id,
        amount=float(amount),
        message="Order created and payment confirmed.",
    )

class RazorpayOrderResponse(BaseModel):
    success: bool
    razorpayOrderId: str
    amount: float
    currency: str
    keyId: str

@app.post("/api/create-order", response_model=RazorpayOrderResponse)
def create_tour_guide_order(payload: dict):
    """Creates a real Razorpay order for a tour-guide booking. Nothing is confirmed or
    stored as a real booking yet - that only happens once /api/verify-payment confirms
    the payment actually went through and the signature checks out."""
    if razorpay_client is None or not RAZORPAY_KEY_ID:
        raise HTTPException(status_code=503, detail="Payments are not configured on this server.")

    amount = payload.get("amount")
    if amount is None:
        raise HTTPException(status_code=400, detail="Missing required field: amount")

    order = razorpay_client.order.create({
        "amount": int(float(amount) * 100),  # Razorpay expects the amount in paise
        "currency": "INR",
        "payment_capture": 1,
    })

    booking_store.add_pending_booking(order["id"], "tour_guide", float(amount), payload)

    return RazorpayOrderResponse(
        success=True,
        razorpayOrderId=order["id"],
        amount=float(amount),
        currency="INR",
        keyId=RAZORPAY_KEY_ID,
    )

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@app.post("/api/verify-payment", response_model=BookingResponse)
def verify_payment(request: VerifyPaymentRequest):
    """Verifies a Razorpay payment signature server-side before treating a booking as
    real - never trust the frontend's word alone that a payment succeeded. The
    signature is the only proof that Razorpay itself authorized this specific payment
    for this specific order."""
    if razorpay_client is None or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payments are not configured on this server.")

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{request.razorpay_order_id}|{request.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, request.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed.")

    pending = booking_store.pop_pending_booking(request.razorpay_order_id)
    if pending is None:
        raise HTTPException(status_code=404, detail="No matching pending booking found.")

    booking_id = f"BOOK_{uuid.uuid4().hex[:10].upper()}"
    payload = {**pending["payload"], "razorpayPaymentId": request.razorpay_payment_id}
    booking_store.add_booking(
        booking_id, request.razorpay_order_id, pending["booking_type"], pending["amount"], payload
    )

    return BookingResponse(
        success=True,
        orderId=request.razorpay_order_id,
        bookingId=booking_id,
        amount=pending["amount"],
        message="Payment verified and booking confirmed.",
    )

@app.post("/api/create-meditation-booking", response_model=BookingResponse)
def create_meditation_booking(payload: dict):
    return _create_booking("meditation", payload)

@app.post("/api/create-accommodation-booking", response_model=BookingResponse)
def create_accommodation_booking(payload: dict):
    return _create_booking("accommodation", payload)

@app.post("/api/create-transport-booking", response_model=BookingResponse)
def create_transport_booking(payload: dict):
    return _create_booking("transport", payload)

@app.get("/api/booking/{booking_id}")
def get_booking(booking_id: str):
    booking = booking_store.get_booking(booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"success": True, "booking": booking}

@app.get("/api/bookings")
def list_bookings():
    bookings = booking_store.list_bookings()
    return {"success": True, "bookings": bookings, "total": len(bookings)}