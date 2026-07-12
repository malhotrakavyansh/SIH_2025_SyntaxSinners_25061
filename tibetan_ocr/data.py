from dataclasses import dataclass
from typing import List, Tuple
from uuid import UUID

import numpy.typing as npt


@dataclass
class BBox:
    x: int
    y: int
    w: int
    h: int


@dataclass
class Line:
    guid: UUID
    contour: npt.NDArray
    bbox: BBox
    center: Tuple[int, int]


@dataclass
class LineDetectionConfig:
    model_file: str
    patch_size: int


@dataclass
class OCRModelConfig:
    model_file: str
    input_width: int
    input_height: int
    input_layer: str
    output_layer: str
    squeeze_channel: bool
    swap_hw: bool
    charset: List[str]
    add_blank: bool


@dataclass
class OCRModel:
    name: str
    path: str
    config: OCRModelConfig
