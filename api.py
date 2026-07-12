import os
import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
from chatbot import BodhiChatbot
import archive_store
import ocr

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Please create a .env file.")

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
        ocr_text = f"OCR failed: {e}"

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