"""Cuts a class's reference images into one-feature crops and samples its
colours, from classes/<code>/evidence.json:

    python3 scripts/accuracy/crops.py <code>

Writes classes/<code>/crops/<id>.png (each crop enlarged so its long side
is at least 480 px, for looking at one feature at a time), a contact sheet
of them all (crops/_sheet.png), and classes/<code>/samples.json: for each
colour sample, the median of its box and its spread, and, where the sample
names a neutral patch in the same photo, the colour corrected so that patch
is the white of the paint, WHITE (a white balance and an exposure
correction at once). That only holds where the sample and its neutral
patch stand in the same light, which is why each sample names its own.

evidence.json:

    {
      "refs": {"<id>": {"file": "refs/...", "commons": "...", "author": "...",
                         "licence": "...", "date": "...", "kind": "diagram|photo",
                         "unit": "...", "view": "...", "light": "..."}},
      "crops": [{"id": "...", "ref": "<ref id>", "box": [x0, y0, x1, y1],
                 "feature": "...", "reading": "what one look at this crop shows"}],
      "samples": [{"id": "...", "ref": "<ref id>", "box": [x0, y0, x1, y1],
                   "what": "...", "neutral": "<sample id of a grey/white patch>"}]
    }
"""

import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from measure import sample, to_hex  # noqa: E402

# What a neutral patch is taken to be: white paint as the renderer's
# liveries give it. A grey neutral patch names its own value ("neutralIs").
WHITE = 240.0

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def load_evidence(code):
    base = os.path.join(ROOT, "classes", code)
    with open(os.path.join(base, "evidence.json")) as f:
        return base, json.load(f)


def open_ref(base, ref):
    im = Image.open(os.path.join(base, ref["file"])).convert("RGBA")
    flat = Image.new("RGBA", im.size, (255, 255, 255, 255))
    flat.alpha_composite(im)
    return flat.convert("RGB")


def enlarge(img, min_side=480):
    k = max(1, min_side / max(img.size))
    if k > 1:
        img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    return img


def main(code):
    base, ev = load_evidence(code)
    out = os.path.join(base, "crops")
    os.makedirs(out, exist_ok=True)
    images = {}

    def ref_image(rid):
        if rid not in images:
            images[rid] = open_ref(base, ev["refs"][rid])
        return images[rid]

    tiles = []
    for c in ev.get("crops", []):
        crop = ref_image(c["ref"]).crop(tuple(c["box"]))
        big = enlarge(crop)
        big.save(os.path.join(out, f"{c['id']}.png"))
        tiles.append((c["id"], big))

    if tiles:
        w = 360
        cols = 4
        cells = []
        for name, im in tiles:
            t = im.copy()
            t.thumbnail((w, w))
            cells.append((name, t))
        rows = (len(cells) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * w, rows * (w + 18)), "white")
        d = ImageDraw.Draw(sheet)
        for i, (name, t) in enumerate(cells):
            x, y = (i % cols) * w, (i // cols) * (w + 18)
            sheet.paste(t, (x, y))
            d.text((x + 2, y + w + 2), name, fill="black")
        sheet.save(os.path.join(out, "_sheet.png"))

    # Where every sample and crop sits in its photo, to check each box is on
    # the patch it claims before trusting a number from it.
    by_ref = {}
    for kind, items in (("crop", ev.get("crops", [])), ("sample", ev.get("samples", []))):
        for it in items:
            by_ref.setdefault(it["ref"], []).append((kind, it))
    for rid, items in by_ref.items():
        im = ref_image(rid).copy()
        d = ImageDraw.Draw(im)
        for kind, it in items:
            colour = (255, 0, 255) if kind == "sample" else (0, 200, 255)
            d.rectangle(it["box"], outline=colour, width=2 if kind == "sample" else 1)
            d.text((it["box"][0] + 2, it["box"][1] + 2), it["id"], fill=colour)
        im.save(os.path.join(out, f"_boxes-{rid}.jpg"), quality=85)

    results = {}
    raw = {}
    for s in ev.get("samples", []):
        img = np.asarray(ref_image(s["ref"]), dtype=np.int32)
        med, iqr = sample(img, s["box"])
        raw[s["id"]] = med
        results[s["id"]] = {"ref": s["ref"], "box": s["box"], "what": s["what"], "median": to_hex(med),
                            "iqr": [int(v) for v in iqr]}
    for s in ev.get("samples", []):
        n = s.get("neutral")
        if not n:
            continue
        # Scale each channel so the neutral patch comes out as white paint.
        target = next(t for t in ev["samples"] if t["id"] == n).get("neutralIs", WHITE)
        gain = target / np.maximum(raw[n], 1)
        results[s["id"]]["balanced"] = to_hex(np.clip(raw[s["id"]] * gain, 0, 255))
        results[s["id"]]["neutral"] = n
    with open(os.path.join(base, "samples.json"), "w") as f:
        json.dump(results, f, indent=1)
    for k, v in results.items():
        print(f"{k:28s} {v['median']} {v.get('balanced', ''):8s} iqr {v['iqr']}  {v['what']}")
    print(f"{len(tiles)} crops -> {out}")


if __name__ == "__main__":
    main(sys.argv[1])
