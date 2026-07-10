from google import genai
from PIL import Image

OCR_PROMPT = (
    "Extract and transcribe all visible text from this image exactly as it appears. "
    "Preserve the original script (Tibetan, Devanagari, Sanskrit, English, etc.) rather "
    "than translating or transliterating it. If the image contains no legible text "
    "(e.g. it is pure artwork with no writing), respond with exactly: NO_TEXT_DETECTED"
)


def extract_text(client: genai.Client, image_path: str) -> str:
    """Runs OCR on an image via Gemini's multimodal vision, returning the transcribed text."""
    img = Image.open(image_path)
    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[OCR_PROMPT, img],
    )
    return resp.text.strip()
