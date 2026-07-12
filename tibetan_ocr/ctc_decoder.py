from typing import List, Tuple

import numpy as np


class GreedyCTCDecoder:
    """Standard greedy CTC decode: argmax per timestep, collapse repeats, drop blank
    (index 0). Also returns a confidence score (mean max-softmax-probability across
    timesteps) so callers can compare predictions from different models."""

    def __init__(self, charset: List[str]):
        self.vocab = [" "] + list(charset)  # index 0 reserved for CTC blank

    def decode(self, logits: np.ndarray) -> Tuple[str, float]:
        probs = _softmax(logits, axis=-1)
        idx = np.argmax(probs, axis=-1)
        max_probs = np.max(probs, axis=-1)

        chars = []
        confidences = []
        prev = -1
        for i, p in zip(idx, max_probs):
            if i != prev and i != 0:
                chars.append(self.vocab[i])
                confidences.append(p)
            prev = i

        text = "".join(chars)
        confidence = float(np.mean(confidences)) if confidences else 0.0
        return text, confidence


def _softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    x = x - np.max(x, axis=axis, keepdims=True)
    e = np.exp(x)
    return e / np.sum(e, axis=axis, keepdims=True)
