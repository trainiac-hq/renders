"""Traces a logo or wordmark off a reference photo into an SVG for logos/,
for branding no operator publishes as artwork (a class's own lettering, a
"First class" mark, an old wordmark):

    python3 scripts/accuracy/trace_logo.py <photo> --quad x1,y1,x2,y2,x3,y3,x4,y4 \\
        --out logos/GW-first.svg [--aspect 3.2] [--ink light|dark] [--px 1200]

`--quad` is the artwork's box in the photo, corners in reading order:
top-left, top-right, bottom-right, bottom-left as the lettering reads. The
box is cut out and squared up (a perspective warp), so a photo at an angle
still gives the artwork's true proportions; `--aspect` (width over height)
overrides the proportions the corners imply, which is worth giving when
the box is foreshortened (measure it on a squarer photo, or from the
door it sits beside). The ink is split from the paint behind it by Otsu's
threshold, `--ink` saying which is which when the guess (ink is the
smaller part) is wrong.

The outlines are smoothed before they are written, so a traced logo has
no pixel steps: the mask is upsampled and blurred, the contour is smoothed
along its length and then simplified to within a tenth of a source pixel.
Each outline and its holes are one path (even-odd), filled with the ink's
median colour; a placement's `color` overrides it as usual.

Check the result beside the photo (it writes <out>.png, the trace over the
squared-up crop) and add the file to logos/SOURCES.md with the photo it came
from and that photo's licence.
"""

import argparse
import os

import cv2
import numpy as np

UPSAMPLE = 4


def warp(image, quad, aspect, px):
    q = np.array(quad, dtype=np.float32).reshape(4, 2)
    if aspect is None:
        w = (np.linalg.norm(q[1] - q[0]) + np.linalg.norm(q[2] - q[3])) / 2
        h = (np.linalg.norm(q[3] - q[0]) + np.linalg.norm(q[2] - q[1])) / 2
        aspect = w / h
    W, H = px, max(8, round(px / aspect))
    M = cv2.getPerspectiveTransform(q, np.array([[0, 0], [W, 0], [W, H], [0, H]], dtype=np.float32))
    return cv2.warpPerspective(image, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def mask_of(crop, ink):
    lum = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB)[:, :, 0]
    _, light = cv2.threshold(lum, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    if ink is None:
        ink = "light" if (light > 0).mean() < 0.5 else "dark"
    m = light if ink == "light" else 255 - light
    # Smooth the edge before tracing: upsampled and blurred, the 50% level
    # is a sub-pixel estimate of the edge rather than a staircase.
    big = cv2.resize(lum, None, fx=UPSAMPLE, fy=UPSAMPLE, interpolation=cv2.INTER_CUBIC).astype(np.float32)
    big = cv2.GaussianBlur(big, (0, 0), UPSAMPLE * 0.6)
    level = float(np.median(lum[light > 0])) / 2 + float(np.median(lum[light == 0])) / 2
    big_mask = (big > level) if ink == "light" else (big < level)
    return m > 0, big_mask.astype(np.uint8) * 255, ink


def smooth(contour, sigma):
    """A closed contour smoothed along its length (circular Gaussian)."""
    pts = contour.reshape(-1, 2).astype(np.float64)
    n = len(pts)
    if n < 8:
        return pts
    r = int(3 * sigma)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    out = np.empty_like(pts)
    for d in (0, 1):
        padded = np.concatenate([pts[-r:, d], pts[:, d], pts[:r, d]])
        out[:, d] = np.convolve(padded, k, mode="valid")
    return out


def trace(big_mask, min_area, sigma=1.5):
    contours, hierarchy = cv2.findContours(big_mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    paths = []
    if hierarchy is None:
        return paths
    hierarchy = hierarchy[0]
    for i, c in enumerate(contours):
        if hierarchy[i][3] != -1 or cv2.contourArea(c) < min_area:
            continue
        rings = [c]
        child = hierarchy[i][2]
        while child != -1:
            if cv2.contourArea(contours[child]) >= min_area / 4:
                rings.append(contours[child])
            child = hierarchy[child][0]
        out = []
        for ring in rings:
            s = smooth(ring, UPSAMPLE * sigma)
            s = cv2.approxPolyDP(s.astype(np.float32).reshape(-1, 1, 2), UPSAMPLE * 0.1, True).reshape(-1, 2)
            if len(s) >= 3:
                out.append(s / UPSAMPLE)
        if out:
            paths.append(out)
    return paths


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("photo")
    ap.add_argument("--quad", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--aspect", type=float)
    ap.add_argument("--ink", choices=["light", "dark"])
    ap.add_argument("--px", type=int, default=1200)
    ap.add_argument("--smooth", type=float, default=1.5, help="contour smoothing in source pixels (lower keeps small lettering crisp)")
    a = ap.parse_args()
    image = cv2.imread(a.photo, cv2.IMREAD_COLOR)
    if image is None:
        raise SystemExit(f"can't read {a.photo}")
    quad = [float(v) for v in a.quad.split(",")]
    if len(quad) != 8:
        raise SystemExit("--quad takes four corners: x1,y1,x2,y2,x3,y3,x4,y4")
    crop = warp(image, quad, a.aspect, a.px)
    small, big, ink = mask_of(crop, a.ink)
    H, W = crop.shape[:2]
    paths = trace(big, min_area=(W * H * UPSAMPLE ** 2) * 0.0005, sigma=a.smooth)
    if not paths:
        raise SystemExit("nothing traced: check the quad and --ink")
    b, g, r = np.median(crop[small], axis=0)
    fill = "#%02X%02X%02X" % (int(r), int(g), int(b))
    # Tight viewBox: the traced shapes' own extent, so `height` in a
    # placement is the artwork's height and nothing else.
    allpts = np.concatenate([ring for p in paths for ring in p])
    x0, y0 = allpts.min(axis=0)
    x1, y1 = allpts.max(axis=0)
    d = []
    for p in paths:
        sub = " ".join("M" + " L".join(f"{x - x0:.2f} {y - y0:.2f}" for x, y in ring) + " Z" for ring in p)
        d.append(f'<path fill-rule="evenodd" d="{sub}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x1 - x0:.2f} {y1 - y0:.2f}" fill="{fill}">'
           f'<title>traced from {os.path.basename(a.photo)}</title>' + "".join(d) + "</svg>\n")
    with open(a.out, "w") as f:
        f.write(svg)
    # The trace drawn over the crop, to check it.
    check = crop.copy()
    for p in paths:
        cv2.polylines(check, [np.round(ring).astype(np.int32).reshape(-1, 1, 2) for ring in p], True, (0, 0, 255), 1, cv2.LINE_AA)
    cv2.imwrite(a.out + ".png", check)
    n = sum(len(r) for p in paths for r in p)
    print(f"{a.out}: {len(paths)} shapes, {n} points, {x1 - x0:.0f} x {y1 - y0:.0f} (aspect {(x1 - x0) / (y1 - y0):.3f}), "
          f"{ink} ink {fill}; check {a.out}.png")


if __name__ == "__main__":
    main()
