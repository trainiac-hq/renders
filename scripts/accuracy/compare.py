"""Puts each feature of a render beside the same feature in its reference:

    python3 scripts/accuracy/compare.py <code> <render prefix> [--only id,id]

For every pair in classes/<code>/spec.json `pairs` — a reference crop (an
id from evidence.json) and the same feature on the train as a box in
metres (x back from the nose tip, y up from the rail, z across, the near
side negative) seen in one of the render's views — the render is cropped
where that box lands (through the view's camera.json), both are scaled to
the same height and set side by side: reference left, render right.

Writes <prefix>-pairs/<id>.png and a sheet of them all, <prefix>-pairs.png.
Each pair is then judged on its own, one at a time.
"""

import json
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import camera  # noqa: E402
from crops import enlarge, load_evidence, open_ref  # noqa: E402

HEIGHT = 420


def side_by_side(ref, render, label):
    a = ref.resize((round(ref.width * HEIGHT / ref.height), HEIGHT), Image.LANCZOS)
    b = render.resize((round(render.width * HEIGHT / render.height), HEIGHT), Image.LANCZOS)
    out = Image.new("RGB", (a.width + b.width + 12, HEIGHT + 22), "white")
    out.paste(a, (0, 22))
    out.paste(b, (a.width + 12, 22))
    d = ImageDraw.Draw(out)
    d.text((4, 4), f"{label}   reference | render", fill="black")
    return out


def main(argv):
    code, prefix = argv[0], argv[1]
    only = argv[argv.index("--only") + 1].split(",") if "--only" in argv else None
    base, ev = load_evidence(code)
    spec = json.load(open(os.path.join(base, "spec.json")))
    crops = {c["id"]: c for c in ev["crops"]}
    outdir = f"{prefix}-pairs"
    os.makedirs(outdir, exist_ok=True)
    made = []
    for pair in spec.get("pairs", []):
        if only and pair["id"] not in only:
            continue
        c = crops[pair["crop"]]
        ref = open_ref(base, ev["refs"][c["ref"]]).crop(tuple(c["box"]))
        if pair.get("mirror"):
            ref = ref.transpose(Image.FLIP_LEFT_RIGHT)
        path = f"{prefix}-{pair['view']}.png"
        if not os.path.exists(path):
            print(f"{pair['id']}: no {path}")
            continue
        cam = camera.load(f"{prefix}-{pair['view']}.camera.json")
        img = Image.open(path).convert("RGBA")
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.alpha_composite(img)
        # A render may be supersampled down from the size its camera was set to.
        k = img.width / cam["width"]
        x0, x1, y0, y1, z0, z1 = pair["box"]
        box = [round(v * k) for v in camera.box(cam, x0, x1, y0, y1, z0, z1, margin=0.0)]
        render = bg.convert("RGB").crop(tuple(box))
        sheet = side_by_side(ref, enlarge(render, 200), pair["id"])
        sheet.save(os.path.join(outdir, f"{pair['id']}.png"))
        made.append(sheet)
    if made:
        width = 1500
        rows, row, x = [], [], 0
        for s in made:
            t = s.copy()
            t.thumbnail((width // 2, HEIGHT // 2 + 11))
            if x + t.width > width and row:
                rows.append(row)
                row, x = [], 0
            row.append(t)
            x += t.width + 6
        rows.append(row)
        h = sum(max(t.height for t in r) + 6 for r in rows)
        grid = Image.new("RGB", (width, h), "white")
        y = 0
        for r in rows:
            x = 0
            for t in r:
                grid.paste(t, (x, y))
                x += t.width + 6
            y += max(t.height for t in r) + 6
        grid.save(f"{prefix}-pairs.png")
    print(f"{len(made)} pairs -> {outdir}")


if __name__ == "__main__":
    main(sys.argv[1:])
