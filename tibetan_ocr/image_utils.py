from math import ceil
from typing import List, Tuple

import cv2
import numpy as np
import numpy.typing as npt
import onnxruntime as ort


def get_execution_providers() -> List[str]:
    return ort.get_available_providers()


def resize_to_height(image: npt.NDArray, target_height: int) -> Tuple[npt.NDArray, float]:
    scale_ratio = target_height / image.shape[0]
    image = cv2.resize(
        image,
        (int(image.shape[1] * scale_ratio), target_height),
        interpolation=cv2.INTER_LINEAR,
    )
    return image, scale_ratio


def resize_to_width(image: npt.NDArray, target_width: int) -> Tuple[npt.NDArray, float]:
    scale_ratio = target_width / image.shape[1]
    image = cv2.resize(
        image,
        (target_width, int(image.shape[0] * scale_ratio)),
        interpolation=cv2.INTER_LINEAR,
    )
    return image, scale_ratio


def get_paddings(image: npt.NDArray, patch_size: int = 512) -> Tuple[int, int]:
    max_x = ceil(image.shape[1] / patch_size) * patch_size
    max_y = ceil(image.shape[0] / patch_size) * patch_size
    return max_x - image.shape[1], max_y - image.shape[0]


def pad_image(image: npt.NDArray, pad_x: int, pad_y: int, pad_value: int = 0) -> npt.NDArray:
    return np.pad(
        image,
        pad_width=((0, pad_y), (0, pad_x), (0, 0)),
        mode="constant",
        constant_values=pad_value,
    )


def preprocess_image(
    image: npt.NDArray,
    patch_size: int = 512,
    clamp_width: int = 4096,
    clamp_height: int = 2048,
    clamp_size: bool = True,
) -> Tuple[npt.NDArray, int, int]:
    """Resizes/pads the image so it tiles evenly into patch_size x patch_size patches.
    Small source images (below patch_size) get upscaled first, since the line-detection
    model was trained on high-resolution manuscript scans - this is at best a partial
    mitigation for low-resolution input, not a fix (upscaling can't recover detail that
    was never captured)."""
    if clamp_size and image.shape[1] > image.shape[0] and image.shape[1] > clamp_width:
        image, _ = resize_to_width(image, clamp_width)
    elif clamp_size and image.shape[0] > image.shape[1] and image.shape[0] > clamp_height:
        image, _ = resize_to_height(image, clamp_height)
    elif image.shape[0] < patch_size:
        image, _ = resize_to_height(image, patch_size)

    # Upscaling a very wide/short (or very narrow/tall) image to patch_size on its short
    # side can blow the other side up far past clamp_width/clamp_height (e.g. a 2062x77
    # single-line crop upscales to ~13700px wide), which then tiles into dozens of
    # patches and can exhaust available memory in the ONNX runtime. Re-clamp after the
    # upscale so extreme aspect ratios can't runaway like that.
    if clamp_size and image.shape[1] > clamp_width:
        image, _ = resize_to_width(image, clamp_width)
    elif clamp_size and image.shape[0] > clamp_height:
        image, _ = resize_to_height(image, clamp_height)

    pad_x, pad_y = get_paddings(image, patch_size)
    padded_img = pad_image(image, pad_x, pad_y, pad_value=255)
    return padded_img, pad_x, pad_y


def tile_image(padded_img: npt.NDArray, patch_size: int = 512) -> Tuple[List[npt.NDArray], int]:
    x_steps = int(padded_img.shape[1] / patch_size)
    y_steps = int(padded_img.shape[0] / patch_size)
    y_splits = np.split(padded_img, y_steps, axis=0)
    patches = [np.split(x, x_steps, axis=1) for x in y_splits]
    patches = [x for xs in patches for x in xs]
    return patches, y_steps


def stitch_predictions(prediction: npt.NDArray, y_steps: int) -> npt.NDArray:
    pred_y_split = np.split(prediction, y_steps, axis=0)
    x_slices = [np.hstack(x) for x in pred_y_split]
    return np.vstack(x_slices)


def sigmoid(x: npt.NDArray) -> npt.NDArray:
    return 1 / (1 + np.exp(-x))


def normalize(image: npt.NDArray) -> npt.NDArray:
    return image.astype(np.float32) / 255.0


def binarize(img: npt.NDArray, adaptive: bool = True, block_size: int = 51, c: int = 13) -> npt.NDArray:
    line_img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    if adaptive:
        bw = cv2.adaptiveThreshold(
            line_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block_size, c
        )
    else:
        _, bw = cv2.threshold(line_img, 120, 255, cv2.THRESH_BINARY)
    return cv2.cvtColor(bw, cv2.COLOR_GRAY2RGB)


def pad_to_width(img: npt.NDArray, target_width: int, target_height: int, padding: str) -> npt.NDArray:
    _, _, channels = img.shape
    tmp_img, _ = resize_to_width(img, target_width)
    height = tmp_img.shape[0]
    middle = (target_height - height) // 2

    fill = 255 if padding == "white" else 0
    upper = np.full((middle, target_width, channels), fill, dtype=np.uint8)
    lower = np.full((target_height - height - middle, target_width, channels), fill, dtype=np.uint8)
    return np.vstack([upper, tmp_img, lower])


def pad_to_height(img: npt.NDArray, target_width: int, target_height: int, padding: str) -> npt.NDArray:
    _, _, channels = img.shape
    tmp_img, _ = resize_to_height(img, target_height)
    width = tmp_img.shape[1]
    middle = (target_width - width) // 2

    fill = 255 if padding == "white" else 0
    left = np.full((target_height, middle, channels), fill, dtype=np.uint8)
    right = np.full((target_height, target_width - width - middle, channels), fill, dtype=np.uint8)
    return np.hstack([left, tmp_img, right])
