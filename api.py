import hashlib
import hmac
import os
import shutil
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import razorpay
from fastapi import Cookie, FastAPI, File, Form, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from chatbot import BodhiChatbot
import archive_store
import booking_store
import ocr
import submissions_store
import users_store

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

JWT_SECRET = os.getenv("JWT_SECRET", "dev-only-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7
ADMIN_EMAILS = {
    e.strip().lower() for e in os.getenv("ADMIN_EMAILS", "").split(",") if e.strip()
}

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/archive_uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="archive_uploads")

bodhi = BodhiChatbot(api_key=api_key)
archive_store.init_db()
booking_store.init_db()
users_store.init_db()
submissions_store.init_db()

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

def _create_razorpay_order(booking_type: str, payload: dict) -> RazorpayOrderResponse:
    """Creates a real Razorpay order. Nothing is confirmed or stored as a real booking
    yet - that only happens once /api/verify-payment confirms the payment actually went
    through and the signature checks out."""
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

    booking_store.add_pending_booking(order["id"], booking_type, float(amount), payload)

    return RazorpayOrderResponse(
        success=True,
        razorpayOrderId=order["id"],
        amount=float(amount),
        currency="INR",
        keyId=RAZORPAY_KEY_ID,
    )

@app.post("/api/create-order", response_model=RazorpayOrderResponse)
def create_tour_guide_order(payload: dict):
    return _create_razorpay_order("tour_guide", payload)

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

@app.post("/api/create-meditation-booking", response_model=RazorpayOrderResponse)
def create_meditation_booking(payload: dict):
    return _create_razorpay_order("meditation", payload)

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


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str


COOKIE_NAME = "sangha_session"


def _create_token(user: dict) -> str:
    payload = {
        "sub": user["id"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=JWT_EXPIRY_DAYS * 24 * 60 * 60,
        path="/",
    )


@app.post("/api/auth/register", response_model=UserResponse)
def register(request: RegisterRequest, response: Response):
    """New accounts default to the 'contributor' role. Emails listed in the ADMIN_EMAILS
    env var are promoted to 'admin' at registration time - there's no invite flow yet."""
    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if not request.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")

    role = "admin" if request.email.strip().lower() in ADMIN_EMAILS else "contributor"
    try:
        user = users_store.create_user(request.name.strip(), request.email, request.password, role=role)
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    token = _create_token(user)
    _set_session_cookie(response, token)
    return UserResponse(**user)


@app.post("/api/auth/login", response_model=UserResponse)
def login(request: LoginRequest, response: Response):
    user = users_store.verify_user(request.email, request.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = _create_token(user)
    _set_session_cookie(response, token)
    return UserResponse(**user)


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"success": True}


def _require_user(sangha_session: str | None) -> dict:
    """Shared auth check for any endpoint that needs a logged-in user. Raises 401
    if the session cookie is missing, expired, or no longer maps to a real user."""
    if sangha_session is None:
        raise HTTPException(status_code=401, detail="Not logged in.")
    payload = _decode_token(sangha_session)
    if payload is None:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    user = users_store.get_user_by_id(payload["sub"])
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists.")
    return user


@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user(sangha_session: str | None = Cookie(default=None)):
    return UserResponse(**_require_user(sangha_session))


@app.post("/api/submissions")
def create_submission(
    title: str = Form(...),
    monastery: str = Form(...),
    type: str = Form(...),
    year: str = Form(""),
    location: str = Form(""),
    description: str = Form(""),
    tags: str = Form(""),
    file: UploadFile = File(...),
    sangha_session: str | None = Cookie(default=None),
):
    """Public contribution flow: any logged-in user can submit an artifact for
    review. Unlike /archive/upload, this never publishes directly - it lands in
    submissions_store with status='pending' until an admin approves it."""
    user = _require_user(sangha_session)

    submission_id = uuid.uuid4().hex
    extension = Path(file.filename or "upload").suffix or ".jpg"
    image_filename = f"submission_{submission_id}{extension}"
    image_path = UPLOAD_DIR / image_filename

    with image_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        ocr_text = ocr.extract_text(str(image_path))
    except Exception as e:
        print(f"OCR failed for {image_path}: {e}")
        ocr_text = "OCR unavailable for this item."

    tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    created_id = submissions_store.add_submission({
        "contributor_id": user["id"],
        "contributor_name": user["name"],
        "title": title,
        "monastery": monastery,
        "type": type,
        "year": year,
        "location": location,
        "description": description,
        "image_filename": image_filename,
        "ocr_text": ocr_text,
        "tags": tag_list,
    })

    submission = submissions_store.get_submission(created_id)
    return {"success": True, "submission": submission}


@app.get("/api/submissions/mine")
def list_my_submissions(sangha_session: str | None = Cookie(default=None)):
    user = _require_user(sangha_session)
    return {"submissions": submissions_store.list_submissions_by_contributor(user["id"])}