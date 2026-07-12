import cv2
import numpy.typing as npt
import pyewts

from tibetan_ocr.data import LineDetectionConfig
from tibetan_ocr.download_models import MODELS_DIR, ensure_all_models
from tibetan_ocr.line_detection import (
    build_line_data,
    build_raw_line_data,
    extract_line_images,
    filter_line_contours,
    sort_lines_by_threshold,
)
from tibetan_ocr.model_loader import load_ocr_model
from tibetan_ocr.models import LineDetection, OCRInference

import os

NO_TEXT_DETECTED = "NO_TEXT_DETECTED"


class TibetanOCRPipeline:
    """Detects text lines on a page image, then recognizes each line with two
    candidate models (print/woodblock and cursive/ume) and keeps whichever the
    model itself is more confident about. See ocr.py for why: BDRC doesn't ship a
    reliable print-vs-cursive classifier, so per-line confidence comparison is used
    as the routing signal instead of guessing up front."""

    def __init__(self):
        ensure_all_models()

        line_config = LineDetectionConfig(
            model_file=os.path.join(MODELS_DIR, "Lines", "PhotiLines.onnx"),
            patch_size=512,
        )
        self.line_detector = LineDetection(line_config)

        woodblock = load_ocr_model(os.path.join(MODELS_DIR, "OCR", "Woodblock"))
        ume_druma = load_ocr_model(os.path.join(MODELS_DIR, "OCR", "Ume_Druma"))
        self.ocr_models = [OCRInference(woodblock.config), OCRInference(ume_druma.config)]

        self.wylie_converter = pyewts.pyewts()

    def _recognize_line(self, line_image: npt.NDArray) -> str:
        candidates = [model.run(line_image) for model in self.ocr_models]
        text, _confidence = max(candidates, key=lambda c: c[1])
        return self.wylie_converter.toUnicode(text) if text else ""

    def run(self, image: npt.NDArray) -> str:
        line_mask = self.line_detector.predict(image)
        rot_img, rot_mask, line_contours, _angle = build_raw_line_data(image, line_mask)
        filtered_contours = filter_line_contours(rot_mask, line_contours)

        if not filtered_contours:
            # No lines detected - most likely no text on the page, but could also be a
            # resolution/segmentation miss. Fall back to treating the whole image as one
            # line rather than silently returning nothing.
            text = self._recognize_line(image)
            return text if text else NO_TEXT_DETECTED

        line_data = [build_line_data(c) for c in filtered_contours]
        sorted_lines = sort_lines_by_threshold(rot_mask, line_data, group_lines=True)
        line_images = extract_line_images(rot_img, sorted_lines)

        lines_text = [self._recognize_line(img) for img in line_images]
        lines_text = [t for t in lines_text if t]

        return "\n".join(lines_text) if lines_text else NO_TEXT_DETECTED


_pipeline: TibetanOCRPipeline | None = None


def get_pipeline() -> TibetanOCRPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = TibetanOCRPipeline()
    return _pipeline


def extract_text(image_path: str) -> str:
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")
    return get_pipeline().run(image)
