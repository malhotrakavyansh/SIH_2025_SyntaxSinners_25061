from tibetan_ocr.pipeline import extract_text as _extract_text


def extract_text(image_path: str) -> str:
    """Runs the Digital Archive's Tibetan OCR pipeline: real line detection followed by
    per-line character recognition (BDRC's trained ONNX models), not a generative model
    transcribing freely - see tibetan_ocr/pipeline.py for why that distinction matters."""
    return _extract_text(image_path)
