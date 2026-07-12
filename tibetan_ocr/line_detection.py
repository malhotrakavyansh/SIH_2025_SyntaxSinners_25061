from typing import List, Sequence, Tuple
from uuid import uuid1

import cv2
import numpy as np
import numpy.typing as npt

from tibetan_ocr.data import BBox, Line


def _get_contours(image: npt.NDArray) -> Sequence:
    contours, _ = cv2.findContours(image, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    return contours


def _optimize_contour(cnt, e: float = 0.001):
    epsilon = e * cv2.arcLength(cnt, True)
    return cv2.approxPolyDP(cnt, epsilon, True)


def _rotate_from_angle(image: np.ndarray, angle: float) -> np.ndarray:
    rows, cols = image.shape[:2]
    rot_matrix = cv2.getRotationMatrix2D((cols / 2, rows / 2), angle, 1)
    return cv2.warpAffine(image, rot_matrix, (cols, rows), borderValue=(0, 0, 0))


def _mask_n_crop(image: np.ndarray, mask: np.ndarray) -> np.ndarray:
    image = image.astype(np.uint8)
    mask = mask.astype(np.uint8)
    if len(image.shape) == 2:
        image = np.expand_dims(image, axis=-1)

    image_masked = cv2.bitwise_and(image, image, mask, mask)
    image_masked = np.delete(image_masked, np.where(~image_masked.any(axis=1))[0], axis=0)
    image_masked = np.delete(image_masked, np.where(~image_masked.any(axis=0))[0], axis=1)
    return image_masked


def _get_rotation_angle_from_lines(line_mask: npt.NDArray, max_angle: float = 5.0) -> float:
    contours, _ = cv2.findContours(line_mask, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    mask_threshold = (line_mask.shape[0] * line_mask.shape[1]) * 0.001
    contours = [x for x in contours if cv2.contourArea(x) > mask_threshold]
    if not contours:
        return 0.0

    angles = [cv2.minAreaRect(x)[2] for x in contours]
    low_angles = [x for x in angles if abs(x) != 0.0 and x < max_angle]
    high_angles = [x for x in angles if abs(x) != 90.0 and x > (90 - max_angle)]

    if len(low_angles) > len(high_angles) and len(low_angles) > 0:
        return float(np.mean(low_angles))
    elif len(high_angles) > 0:
        return -(90 - float(np.mean(high_angles)))
    return 0.0


def build_line_data(contour: np.ndarray, optimize: bool = True) -> Line:
    if optimize:
        contour = _optimize_contour(contour)

    x, y, w, h = cv2.boundingRect(contour)
    x_center = x + (w // 2)
    y_center = y + (h // 2)

    return Line(uuid1(), contour, BBox(x, y, w, h), (x_center, y_center))


def build_raw_line_data(image: npt.NDArray, line_mask: npt.NDArray):
    if len(line_mask.shape) == 3:
        line_mask = cv2.cvtColor(line_mask, cv2.COLOR_BGR2GRAY)

    angle = _get_rotation_angle_from_lines(line_mask)
    rot_mask = _rotate_from_angle(line_mask, angle)
    rot_img = _rotate_from_angle(image, angle)

    line_contours = _get_contours(rot_mask)
    line_contours = [x for x in line_contours if cv2.contourArea(x) > 10]
    rot_mask = cv2.cvtColor(rot_mask, cv2.COLOR_GRAY2RGB)

    return rot_img, rot_mask, line_contours, angle


def filter_line_contours(image: npt.NDArray, line_contours, threshold: float = 0.01) -> List:
    filtered = []
    for line_cnt in line_contours:
        _, _, w, h = cv2.boundingRect(line_cnt)
        if w > image.shape[1] * threshold and h > 10:
            filtered.append(line_cnt)
    return filtered


def _extract_line(image: npt.NDArray, mask: npt.NDArray, bbox_h: int, k_factor: float = 1.2):
    k_size = int(bbox_h * k_factor)
    morph_rect = cv2.getStructuringElement(shape=cv2.MORPH_RECT, ksize=(k_size, int(k_size * k_factor)))
    dilated_mask = cv2.dilate(mask, kernel=morph_rect, iterations=1)
    return _mask_n_crop(image, dilated_mask)


def _get_line_image(image: npt.NDArray, mask: npt.NDArray, bbox_h: int, bbox_tolerance: float = 2.5, k_factor: float = 1.2):
    try:
        tmp_k = k_factor
        line_img = _extract_line(image, mask, bbox_h, k_factor=tmp_k)

        attempts = 0
        while line_img.shape[0] > bbox_h * bbox_tolerance and attempts < 10:
            tmp_k = tmp_k - 0.1
            if tmp_k <= 0.1:
                break
            line_img = _extract_line(image, mask, bbox_h, k_factor=tmp_k)
            attempts += 1

        return line_img, tmp_k
    except Exception:
        fallback_img = np.zeros((bbox_h, bbox_h * 2, 3), dtype=np.uint8)
        return fallback_img, k_factor


def extract_line_images(image: npt.NDArray, line_data: List[Line], default_k: float = 1.7, bbox_tolerance: float = 3):
    current_k = default_k
    line_images = []

    for line in line_data:
        _, _, _, h = cv2.boundingRect(line.contour)
        tmp_mask = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
        cv2.drawContours(tmp_mask, [line.contour], -1, (255, 255, 255), -1)

        line_img, adapted_k = _get_line_image(image, tmp_mask, h, bbox_tolerance=bbox_tolerance, k_factor=current_k)
        line_images.append(line_img)
        if current_k != adapted_k:
            current_k = adapted_k

    return line_images


def _get_line_threshold(line_prediction: npt.NDArray, slice_width: int = 20) -> float:
    if len(line_prediction.shape) == 3:
        line_prediction = cv2.cvtColor(line_prediction, cv2.COLOR_BGR2GRAY)

    x, y, w, h = cv2.boundingRect(line_prediction)
    x_steps = (w // slice_width) // 2
    bbox_numbers = []

    for step in range(1, x_steps + 1):
        x_start = x + (x_steps * step)
        x_end = x_start + slice_width
        _slice = line_prediction[y : y + h, x_start:x_end]
        contours, _ = cv2.findContours(_slice, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        bbox_numbers.append((len(contours), contours))

    sorted_list = sorted(bbox_numbers, key=lambda x: x[0], reverse=True)
    if not sorted_list:
        return 0.0

    n_contours, contours = sorted_list[0]
    if n_contours == 0:
        return 0.0

    y_points = [cv2.boundingRect(c)[1] + cv2.boundingRect(c)[3] // 2 for c in contours]
    return float(np.median(y_points) // n_contours) if y_points else 0.0


def _sort_bbox_centers(bbox_centers: List[Tuple[int, int]], line_threshold: int = 20) -> List:
    if not bbox_centers:
        return []

    sorted_bbox_centers = []
    tmp_line: List[Tuple[int, int]] = []

    for center in bbox_centers:
        if tmp_line:
            ys = [y[1] for y in tmp_line]
            mean_y = np.mean(ys)
            if abs(mean_y - center[1]) > line_threshold:
                tmp_line.sort(key=lambda x: x[0])
                sorted_bbox_centers.append(tmp_line.copy())
                tmp_line.clear()
            tmp_line.append(center)
        else:
            tmp_line.append(center)

    if tmp_line:
        sorted_bbox_centers.append(tmp_line)

    for group in sorted_bbox_centers:
        group.sort(key=lambda x: x[0])

    return list(reversed(sorted_bbox_centers))


def _group_line_chunks(sorted_bbox_centers, lines: List[Line]):
    new_line_data = []
    for bbox_centers in sorted_bbox_centers:
        if len(bbox_centers) > 1:
            contour_stack = [
                line_data.contour
                for box_center in bbox_centers
                for line_data in lines
                if box_center == line_data.center
            ]
            stacked_contour = cv2.convexHull(np.vstack(contour_stack))
            x, y, w, h = cv2.boundingRect(stacked_contour)
            _bbox = BBox(x, y, w, h)
            new_line_data.append(
                Line(uuid1(), stacked_contour, _bbox, (_bbox.x + _bbox.w // 2, _bbox.y + _bbox.h // 2))
            )
        else:
            for _bcenter in bbox_centers:
                for line_data in lines:
                    if _bcenter == line_data.center:
                        new_line_data.append(line_data)
                        break

    return new_line_data


def sort_lines_by_threshold(line_mask: np.ndarray, lines: List[Line], group_lines: bool = True):
    bbox_centers = [x.center for x in lines]
    line_threshold = _get_line_threshold(line_mask)
    sorted_bbox_centers = _sort_bbox_centers(bbox_centers, line_threshold=line_threshold)

    if group_lines:
        return _group_line_chunks(sorted_bbox_centers, lines)

    bboxes = [x for xs in sorted_bbox_centers for x in xs]
    return [line for _bbox in bboxes for line in lines if _bbox == line.center]
