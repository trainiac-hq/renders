"""Pixel measurements on a reference image or a render.

    python3 scripts/accuracy/measure.py runs <image> row <y> [x0 x1] [--tol 24] [--min 3]
    python3 scripts/accuracy/measure.py runs <image> col <x> [y0 y1] [--tol 24] [--min 3]
    python3 scripts/accuracy/measure.py sample <image> <x0> <y0> <x1> <y1>

`runs` walks one row (or column) and prints each run of near-constant
colour: where it starts and ends, and its colour. On a side diagram, a row
through the windows gives every door and window edge. `sample` gives the
median colour of a box and how much it varies, for colours taken from a
photo rather than guessed.
"""

import sys

import numpy as np
from PIL import Image


def load(path):
    """An image as RGB, anything transparent (a diagram's background) white."""
    im = Image.open(path).convert("RGBA")
    flat = Image.new("RGBA", im.size, (255, 255, 255, 255))
    flat.alpha_composite(im)
    return np.asarray(flat.convert("RGB"), dtype=np.int32)


def to_hex(c):
    return "#%02X%02X%02X" % tuple(int(round(v)) for v in c)


def runs(line, tol=24, min_len=3):
    """Runs of colours in a line of pixels: (start, end exclusive, colour).
    A pixel joins the run while it stays within `tol` (max channel) of the
    run's first pixel; runs shorter than `min_len` (anti-aliasing) merge
    into neither neighbour and are dropped."""
    out = []
    start = 0
    for i in range(1, len(line) + 1):
        if i == len(line) or np.abs(line[i] - line[start]).max() > tol:
            if i - start >= min_len:
                out.append((start, i, np.median(line[start:i], axis=0)))
            start = i
    return out


def sample(img, box):
    x0, y0, x1, y1 = box
    patch = img[y0:y1, x0:x1].reshape(-1, 3)
    med = np.median(patch, axis=0)
    q1, q3 = np.percentile(patch, 25, axis=0), np.percentile(patch, 75, axis=0)
    return med, q3 - q1


def main(argv):
    cmd = argv[0]
    if cmd == "runs":
        path, axis, at = argv[1], argv[2], int(argv[3])
        rest, opts, i = [], {}, 4
        while i < len(argv):
            if argv[i].startswith("--"):
                opts[argv[i]] = argv[i + 1]
                i += 2
            else:
                rest.append(argv[i])
                i += 1
        tol = int(opts.get("--tol", 24))
        min_len = int(opts.get("--min", 3))
        img = load(path)
        line = img[at, :] if axis == "row" else img[:, at]
        lo, hi = (int(rest[0]), int(rest[1])) if len(rest) >= 2 else (0, len(line))
        for s, e, c in runs(line[lo:hi], tol, min_len):
            print(f"{s + lo:6d} {e + lo:6d} {e - s:6d} {to_hex(c)}")
    elif cmd == "sample":
        img = load(argv[1])
        med, iqr = sample(img, tuple(int(v) for v in argv[2:6]))
        print(to_hex(med), "iqr", " ".join(f"{v:.0f}" for v in iqr))
    else:
        raise SystemExit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
