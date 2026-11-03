"""How smooth the paint's edges are in a render: every boundary between
two paint colours traced to a fraction of a pixel, and its wobble
measured the way pipeline/outline.ts measures an outline's (WOBBLE).

    python3 scripts/accuracy/edges.py <flat render.png> <colour> <colour> [--box x0 y0 x1 y1] [--draw out.png]

Use an unlit render, where every surface is its paint colour: a
`match-…-flat` view, or `elevation`. Colours are hex (`F5C400`). For
each pixel the fraction of the way from the second colour to the first
is read off the line between them (pixels far from that line, a third
colour or the background, belong to neither); the boundary is that
fraction's half-way contour on a 4x upsampling, so an anti-aliased edge
is placed between pixels and a stair-stepped one shows its steps.

Along each boundary, each point's sagitta is taken against the chord
REACH px either side; a bend shorter than RUN px between two bending the
other way is a wobble, and its depth the amount. Fails (exit 1) when any
is deeper than LIMIT px: a smooth curve rendered at this size never
weaves by that much, a pixel staircase or a kinked outline does.
"""

import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw

REACH = 6.0
RUN = 40.0
LIMIT = 0.6
UP = 4


def hexrgb(s):
    s = s.lstrip("#")
    return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)


def linear(c):
    """sRGB 0-255 to linear light 0-1: the renderer blends edges there."""
    c = np.asarray(c, dtype=np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def fraction(rgb, a, b):
    """How far each pixel is from b towards a (0..1), in linear light where
    the renderer blends an edge, and whether it lies on that blend at all
    (within 12 levels of it as stored): a seam drawn on the paint, a lamp,
    a third colour is on neither side."""
    la, lb, lp = linear(a), linear(b), linear(rgb)
    d = la - lb
    t = np.clip(((lp - lb) @ d) / (d @ d), 0, 1)
    # The blend from b to a, as stored (sRGB): its nearest sample to each pixel.
    steps = np.linspace(0, 1, 65)
    blend = lb + steps[:, None] * d
    stored = np.where(blend <= 0.0031308, blend * 12.92, 1.055 * blend ** (1 / 2.4) - 0.055) * 255
    flat = rgb.reshape(-1, 3)
    off = np.full(len(flat), np.inf)
    for c in stored:
        off = np.minimum(off, np.linalg.norm(flat - c, axis=1))
    return t, (off < 12.0).reshape(rgb.shape[:-1])


def resample(pts, step=1.0, closed=False):
    path = np.vstack([pts, pts[:1]]) if closed else pts
    seg = np.linalg.norm(np.diff(path, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    if s[-1] < 2 * step:
        return path
    n = int(s[-1] / step)
    at = np.linspace(0, s[-1], n, endpoint=not closed)
    return np.stack([np.interp(at, s, path[:, 0]), np.interp(at, s, path[:, 1])], axis=1)


def wobble(pts, closed=False):
    """Deepest wobble along a path in pixels, and where."""
    p = resample(pts, 0.5, closed)
    n = len(p)
    k = int(REACH / 0.5)
    if n < 2 * k + 3:
        return 0.0, None
    idx = np.arange(n)
    if closed:
        a, b = p[(idx - k) % n], p[(idx + k) % n]
    else:
        a, b = p[np.clip(idx - k, 0, n - 1)], p[np.clip(idx + k, 0, n - 1)]
    d = b - a
    l = np.linalg.norm(d, axis=1) + 1e-9
    h = ((p[:, 0] - a[:, 0]) * d[:, 1] - (p[:, 1] - a[:, 1]) * d[:, 0]) / l
    if not closed:
        h[:k] = 0
        h[n - k:] = 0
    quiet = 0.08
    runs = []
    for i in range(n):
        s = 0 if abs(h[i]) < quiet else int(np.sign(h[i]))
        if runs and runs[-1][0] == s:
            r = runs[-1]
            r[2] = i
            if abs(h[i]) > r[3]:
                r[3], r[4] = abs(h[i]), i
        else:
            runs.append([s, i, i, abs(h[i]), i])
    bends = [r for r in runs if r[0] != 0]
    worst, where = 0.0, None
    m = len(bends)
    for i in range(1, m - 1) if not closed else range(m):
        if m < 3:
            break
        before, r, after = bends[(i - 1) % m], bends[i], bends[(i + 1) % m]
        if before[0] == r[0] or after[0] == r[0]:
            continue
        if ((r[2] - r[1]) % n + 1) * 0.5 >= RUN:
            continue
        depth = min(r[3], max(before[3], after[3]))
        if depth > worst:
            worst, where = depth, p[r[4]]
    return worst, where


def boundaries(path, ca, cb, box=None):
    img = np.asarray(Image.open(path).convert("RGBA")).astype(np.float64)
    if box:
        x0, y0, x1, y1 = box
        img = img[y0:y1, x0:x1]
    else:
        x0 = y0 = 0
    rgb, alpha = img[..., :3], img[..., 3] > 200
    t, near = fraction(rgb, hexrgb(ca), hexrgb(cb))
    valid = near & alpha
    big = cv2.resize(t.astype(np.float32), None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
    ok = cv2.resize(valid.astype(np.uint8), None, fx=UP, fy=UP, interpolation=cv2.INTER_NEAREST).astype(bool)
    ok = cv2.erode(ok.astype(np.uint8), np.ones((2 * UP + 1, 2 * UP + 1), np.uint8)).astype(bool)
    mask = (big > 0.5).astype(np.uint8)
    contours, _ = cv2.findContours(mask, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    paths = []
    for c in contours:
        c = c.reshape(-1, 2)
        keep = ok[c[:, 1], c[:, 0]]
        # Split into runs lying between the two colours.
        start = None
        for i, k in enumerate(list(keep) + [False]):
            if k and start is None:
                start = i
            elif not k and start is not None:
                if i - start > 4 * UP * REACH:
                    seg = c[start:i].astype(np.float64)
                    # Contour pixels sit on the inside: the edge is half a step out.
                    paths.append(seg / UP + np.array([x0, y0]) + 0.5 / UP)
                start = None
    return paths


def smooth_path(seg):
    """The contour's pixel steps at the 4x scale averaged out: a box filter of one source pixel."""
    k = UP
    if len(seg) < 2 * k + 1:
        return seg
    pad = np.vstack([np.repeat(seg[:1], k, 0), seg, np.repeat(seg[-1:], k, 0)])
    ker = np.ones(2 * k + 1) / (2 * k + 1)
    return np.stack([np.convolve(pad[:, 0], ker, "valid"), np.convolve(pad[:, 1], ker, "valid")], axis=1)


def measure(path, ca, cb, box=None, draw=None):
    results = []
    for seg in boundaries(path, ca, cb, box):
        w, at = wobble(smooth_path(seg))
        results.append((w, at, len(seg) / UP, seg))
    results.sort(key=lambda r: -r[0])
    if draw:
        im = Image.open(path).convert("RGB")
        d = ImageDraw.Draw(im)
        for w, at, _, seg in results:
            colour = (255, 0, 0) if w > LIMIT else (0, 200, 255)
            d.line([tuple(q) for q in seg], fill=colour, width=1)
            if at is not None and w > LIMIT:
                d.ellipse([at[0] - 6, at[1] - 6, at[0] + 6, at[1] + 6], outline=(255, 0, 0), width=2)
        im.save(draw)
    return results


if __name__ == "__main__":
    args = sys.argv[1:]
    box = None
    draw = None
    if "--box" in args:
        i = args.index("--box")
        box = [int(v) for v in args[i + 1:i + 5]]
        del args[i:i + 5]
    if "--draw" in args:
        i = args.index("--draw")
        draw = args[i + 1]
        del args[i:i + 2]
    path, ca, cb = args[:3]
    res = measure(path, ca, cb, box, draw)
    if not res:
        raise SystemExit(f"no boundary between {ca} and {cb} found")
    worst = res[0][0]
    for w, at, length, _ in res[:8]:
        where = f"at ({at[0]:.0f}, {at[1]:.0f})" if at is not None else ""
        print(f"  edge {length:6.0f} px long: wobble {w:.2f} px {where}")
    print(f"{'ok' if worst <= LIMIT else 'FAIL'}: worst wobble {worst:.2f} px (limit {LIMIT} px) over {len(res)} edges")
    sys.exit(0 if worst <= LIMIT else 1)
