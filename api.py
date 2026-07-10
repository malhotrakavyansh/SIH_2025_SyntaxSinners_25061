import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from chatbot import BodhiChatbot

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Please create a .env file.")

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

bodhi = BodhiChatbot(api_key=api_key)

# Define the JSON schemas for requests and responses
class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = []

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