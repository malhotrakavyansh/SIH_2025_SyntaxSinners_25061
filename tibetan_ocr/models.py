from typing import Tuple

import cv2
import numpy as np
import numpy.typing as npt
import onnxruntime as ort

from tibetan_ocr.ctc_decoder import GreedyCTCDecoder
from tibetan_ocr.data import LineDetectionConfig, OCRModelConfig
from tibetan_ocr.image_utils import (
    binarize,
    get_execution_providers,
    normalize,
    pad_to_height,
    pad_to_width,
    preprocess_image,
    sigmoid,
    stitch_predictions,
    tile_image,
)


class LineDetection:
    """Wraps the PhotiLines ONNX model: outputs a binary mask marking text-line regions
    on the page. Trained on high-resolution manuscript scans - accuracy degrades on
    low-resolution source images since individual line strokes become indistinguishable."""

    def __init__(self, config: LineDetectionConfig):
        self._patch_size = config.patch_size
        self._session = ort.InferenceSession(config.model_file, providers=get_execution_providers())

    def _preprocess(self, image: npt.NDArray):
        padded_img, pad_x, pad_y = preprocess_image(image, self._patch_size)
        tiles, y_steps = tile_image(padded_img, self._patch_size)
        tiles = [normalize(binarize(x)) for x in tiles]
        return padded_img, np.array(tiles), y_steps, pad_x, pad_y

    def _crop(self, image: npt.NDArray, prediction: npt.NDArray, x_pad: int, y_pad: int) -> npt.NDArray:
        x_lim = prediction.shape[1] - x_pad
        y_lim = prediction.shape[0] - y_pad
        prediction = prediction[:y_lim, :x_lim]
        return cv2.resize(prediction, dsize=(image.shape[1], image.shape[0]))

    def predict(self, image: npt.NDArray, class_threshold: float = 0.9) -> npt.NDArray:
        _, tiles, y_steps, pad_x, pad_y = self._preprocess(image)

        batch = np.transpose(tiles, axes=[0, 3, 1, 2]).astype(np.float32)
        ort_batch = ort.OrtValue.ortvalue_from_numpy(batch)
        prediction = self._session.run_with_ort_values(["output"], {"input": ort_batch})[0].numpy()

        prediction = np.squeeze(prediction, axis=1)
        prediction = sigmoid(prediction)
        prediction = np.where(prediction > class_threshold, 1.0, 0.0)

        merged = stitch_predictions(prediction, y_steps=y_steps)
        merged = self._crop(image, merged, pad_x, pad_y)
        merged = merged.astype(np.uint8) * 255
        return merged


class OCRInference:
    """Wraps a per-line character recognition ONNX model (Easter2/CRNN + CTC). Expects a
    single cropped line image; outputs (text, confidence) where confidence is the mean
    max-softmax-probability across timesteps - used to pick between candidate models."""

    def __init__(self, config: OCRModelConfig):
        self.config = config
        self._session = ort.InferenceSession(config.model_file, providers=get_execution_providers())
        self.decoder = GreedyCTCDecoder(config.charset)

    def _pad_line(self, img: npt.NDArray, padding: str = "black") -> npt.NDArray:
        width_ratio = self.config.input_width / img.shape[1]
        height_ratio = self.config.input_height / img.shape[0]

        if width_ratio <= height_ratio:
            out_img = pad_to_width(img, self.config.input_width, self.config.input_height, padding)
        else:
            out_img = pad_to_height(img, self.config.input_width, self.config.input_height, padding)

        return cv2.resize(
            out_img, (self.config.input_width, self.config.input_height), interpolation=cv2.INTER_LINEAR
        )

    def _prepare_line(self, image: npt.NDArray) -> npt.NDArray:
        line_image = self._pad_line(image)
        line_image = binarize(line_image)
        if len(line_image.shape) == 3:
            line_image = cv2.cvtColor(line_image, cv2.COLOR_RGB2GRAY)

        line_image = line_image.reshape((1, self.config.input_height, self.config.input_width))
        line_image = (line_image / 127.5) - 1.0
        return line_image.astype(np.float32)

    def _pre_pad(self, image: npt.NDArray) -> npt.NDArray:
        """Adds a white patch of size HxH to the left and right of the line."""
        h, _, c = image.shape
        patch = np.full((h, h, c), 255, dtype=np.uint8)
        return np.hstack([patch, image, patch])

    def run(self, line_image: npt.NDArray, pre_pad: bool = True) -> Tuple[str, float, float]:
        if pre_pad:
            line_image = self._pre_pad(line_image)
        line_image = self._prepare_line(line_image)

        if self.config.swap_hw:
            line_image = np.transpose(line_image, axes=[0, 2, 1])
        if not self.config.squeeze_channel:
            line_image = np.expand_dims(line_image, axis=1)

        line_image = line_image.astype(np.float32)
        ort_batch = ort.OrtValue.ortvalue_from_numpy(line_image)
        logits = self._session.run_with_ort_values(
            [self.config.output_layer], {self.config.input_layer: ort_batch}
        )[0].numpy()
        logits = np.squeeze(logits)

        if logits.shape[0] == len(self.decoder.vocab):
            logits = np.transpose(logits, axes=[1, 0])  # -> (time, vocab)

        text, mean_confidence, min_confidence = self.decoder.decode(logits)
        return text.replace("§", " ").strip(), mean_confidence, min_confidence
