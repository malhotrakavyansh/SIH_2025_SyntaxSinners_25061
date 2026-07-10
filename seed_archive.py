"""One-time seed script: migrates the original 4 sample artifacts into the
real archive pipeline (copies the image, runs actual OCR, stores in the DB).

Run once after setting up the backend: python seed_archive.py
"""
import os
import shutil
import uuid
from pathlib import Path

from dotenv import load_dotenv
from google import genai

import archive_store
import ocr

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set. Please create a .env file.")

UPLOAD_DIR = Path(__file__).parent / "archive_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
PUBLIC_DIR = Path(__file__).parent / "sih-website" / "public"

SEED_ITEMS = [
    {
        "title": "Lotus-Born Guru Mural",
        "monastery": "Tashiding",
        "type": "mural",
        "year": "17th c.",
        "location": "West Sikkim",
        "tags": ["AI-OCR processed", "High-res"],
        "source_image": PUBLIC_DIR / "lotus.jpg",
    },
    {
        "title": "Silk Thangka – Avalokiteśvara",
        "monastery": "Rumtek",
        "type": "thangka",
        "year": "18th c.",
        "location": "Gangtok",
        "tags": ["Color-corrected", "AI-enhanced"],
        "source_image": PUBLIC_DIR / "thangka.jpg",
    },
    {
        "title": "Palm-leaf Manuscript Folio",
        "monastery": "Pemayangtse",
        "type": "manuscript",
        "year": "16th c.",
        "location": "Pelling",
        "tags": ["OCR-ready", "Metadata complete"],
        "source_image": PUBLIC_DIR / "manuscript.jpeg",
    },
    {
        "title": "Wall Mural – Wheel of Life",
        "monastery": "Dubdi",
        "type": "mural",
        "year": "17th c.",
        "location": "Yuksom",
        "tags": ["AI-OCR processed", "Gigapixel"],
        "source_image": PUBLIC_DIR / "wheel.jpg",
    },
]


def main():
    archive_store.init_db()
    client = genai.Client(api_key=api_key)

    for seed in SEED_ITEMS:
        source = seed["source_image"]
        if not source.exists():
            print(f"skip (missing file): {source}")
            continue

        item_id = uuid.uuid4().hex
        image_filename = f"{item_id}{source.suffix}"
        dest = UPLOAD_DIR / image_filename
        shutil.copyfile(source, dest)

        print(f"Running OCR on {source.name}...")
        try:
            ocr_text = ocr.extract_text(client, str(dest))
        except Exception as e:
            ocr_text = f"OCR failed: {e}"

        archive_store.add_item({
            "id": item_id,
            "title": seed["title"],
            "monastery": seed["monastery"],
            "type": seed["type"],
            "year": seed["year"],
            "location": seed["location"],
            "image_filename": image_filename,
            "ocr_text": ocr_text,
            "tags": seed["tags"],
        })
        print(f"  -> {ocr_text[:80]}")

    print("Done.")


if __name__ == "__main__":
    main()
