"""Fetches the ONNX model files this pipeline needs into MODELS_DIR, if not already
present. Not run automatically at import time - call once during setup/deploy
(`python -m tibetan_ocr.download_models`), since these are large (~500MB total) and
shouldn't be re-fetched on every process start.
"""

import io
import os
import zipfile

import requests

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

LINE_MODEL_URL = "https://media.githubusercontent.com/media/buda-base/tibetan-ocr-app/main/Models/Lines/PhotiLines.onnx"
OCR_MODELS_ZIP_URL = "https://github.com/buda-base/tibetan-ocr-app/releases/download/v0.1/bdrc_ocr_models_1.0.zip"

# Only the styles this pipeline actually routes between (print vs. cursive) - the zip
# contains more (Woodblock-Stacks, Modern) that we don't need.
OCR_MODEL_STYLES = ["Woodblock", "Ume_Druma"]


def _download(url: str) -> bytes:
    resp = requests.get(url, stream=True, timeout=120)
    resp.raise_for_status()
    return resp.content


def ensure_line_model() -> str:
    dest = os.path.join(MODELS_DIR, "Lines", "PhotiLines.onnx")
    if not os.path.isfile(dest):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        print(f"Downloading line-detection model from {LINE_MODEL_URL} ...")
        with open(dest, "wb") as f:
            f.write(_download(LINE_MODEL_URL))
    return dest


def ensure_ocr_models() -> None:
    missing = [
        style for style in OCR_MODEL_STYLES
        if not os.path.isfile(os.path.join(MODELS_DIR, "OCR", style, "OCRModel.onnx"))
    ]
    if not missing:
        return

    print(f"Downloading OCR recognition models from {OCR_MODELS_ZIP_URL} ...")
    zip_bytes = _download(OCR_MODELS_ZIP_URL)
    ocr_dir = os.path.join(MODELS_DIR, "OCR")
    os.makedirs(ocr_dir, exist_ok=True)

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        for style in OCR_MODEL_STYLES:
            for member in zf.namelist():
                if member.startswith(f"{style}/") and not member.endswith("/"):
                    target = os.path.join(ocr_dir, member)
                    os.makedirs(os.path.dirname(target), exist_ok=True)
                    with open(target, "wb") as f:
                        f.write(zf.read(member))


def ensure_all_models() -> None:
    ensure_line_model()
    ensure_ocr_models()


if __name__ == "__main__":
    ensure_all_models()
    print("All models present.")
