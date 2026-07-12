import json
import os

from tibetan_ocr.data import OCRModel, OCRModelConfig


def load_ocr_model(model_dir: str) -> OCRModel:
    """Loads an OCR model from a directory containing model_config.json + OCRModel.onnx,
    matching the layout BDRC ships its model bundles in."""
    config_file = os.path.join(model_dir, "model_config.json")
    with open(config_file, encoding="utf-8") as f:
        raw = json.load(f)

    config = OCRModelConfig(
        model_file=os.path.join(model_dir, raw["onnx-model"]),
        input_width=raw["input_width"],
        input_height=raw["input_height"],
        input_layer=raw["input_layer"],
        output_layer=raw["output_layer"],
        squeeze_channel=raw["squeeze_channel_dim"] == "yes",
        swap_hw=raw["swap_hw"] == "yes",
        charset=raw["charset"],
        add_blank=raw["add_blank"] == "yes",
    )

    return OCRModel(name=os.path.basename(model_dir.rstrip("/\\")), path=model_dir, config=config)
