"""One sheet to review a class by: the new render beside a real photo and
the side diagram, the old render, the elevation laid over the diagram, and
every feature pair (reference | render):

    python3 scripts/accuracy/review.py <code> <render prefix> <out.png> [--old <old prefix>] [--photo <ref id>] [--view <view>] [--match <dir>] [--extra a.png,b.png]
"""

import json
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crops import load_evidence, open_ref  # noqa: E402

WIDTH = 2400


def fit(im, w, h):
    im = im.copy()
    im.thumbnail((w, h), Image.LANCZOS)
    return im


def flat(path):
    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    bg.alpha_composite(im)
    return bg.convert("RGB")


def main(argv):
    code, prefix, out = argv[0], argv[1], argv[2]
    opt = {argv[i]: argv[i + 1] for i in range(3, len(argv) - 1, 2)}
    base, ev = load_evidence(code)
    spec = json.load(open(os.path.join(base, "spec.json")))
    photo_id = opt.get("--photo") or next(r for r, v in ev["refs"].items() if v["kind"] == "photo")
    view = opt.get("--view", "hero")
    blocks = []

    def label(im, text):
        canvas = Image.new("RGB", (im.width, im.height + 30), "white")
        canvas.paste(im, (0, 30))
        ImageDraw.Draw(canvas).text((6, 8), text, fill="black")
        return canvas

    half = WIDTH // 2 - 10
    row1 = [label(fit(flat(f"{prefix}-{view}.png"), half, 700), f"new render ({view})"),
            label(fit(open_ref(base, ev["refs"][photo_id]), half, 700), f"reference: {ev['refs'][photo_id]['commons'].split('File:')[-1]} ({ev['refs'][photo_id]['author']}, {ev['refs'][photo_id]['licence']})")]
    blocks.append(row1)
    if "--old" in opt and os.path.exists(f"{opt['--old']}-hero.png"):
        new_hero = flat(f"{prefix}-hero.png") if os.path.exists(f"{prefix}-hero.png") else None
        row = [label(fit(flat(f"{opt['--old']}-hero.png"), half, 400), "old render (hero), before this pilot")]
        if new_hero:
            row.append(label(fit(new_hero, half, 400), "new render (hero)"))
        blocks.append(row)
    cal = spec["calibration"]
    dia = open_ref(base, ev["refs"][cal["ref"]])
    blocks.append([label(fit(dia, WIDTH, 300), f"side diagram: {ev['refs'][cal['ref']]['author']}, {ev['refs'][cal['ref']]['licence']}")])
    # Any extra images (a before | after comparison, say), each with its file name as the label.
    for extra in opt.get("--extra", "").split(","):
        if extra:
            blocks.append([label(fit(Image.open(extra).convert("RGB"), WIDTH, 700), os.path.basename(extra))])
    # Camera matches (scripts/accuracy/match.py overlay): outline and blend per photo.
    if "--match" in opt:
        for photo in sorted({f.split("-")[1] for f in os.listdir(opt["--match"]) if f.startswith(f"{code}-") and f.endswith("-outline.png")}):
            solved_path = os.path.join(base, "match", f"{photo}.solved.json")
            score = ""
            if os.path.exists(solved_path):
                sv = json.load(open(solved_path))
                score = f" (held-out worst {sv['worstHeldOutCm']} cm, fit rms {sv['rmsFit']} px)"
            row = [label(fit(Image.open(os.path.join(opt["--match"], f"{code}-{photo}-{kind}.png")).convert("RGB"), half, 800), f"camera match {photo}: {kind}{score}")
                   for kind in ("outline", "blend")]
            blocks.append(row)
    if os.path.exists(f"{prefix}-elevation-overlay.png"):
        blocks.append([label(fit(Image.open(f"{prefix}-elevation-overlay.png").convert("RGB"), WIDTH, 420), "flat elevation of the render with the diagram laid over it at half strength")])
    if os.path.exists(f"{prefix}-pairs.png"):
        blocks.append([label(fit(Image.open(f"{prefix}-pairs.png").convert("RGB"), WIDTH, 3200), "feature pairs: reference | render")])
    h = sum(max(b.height for b in row) + 16 for row in blocks) + 60
    sheet = Image.new("RGB", (WIDTH, h), "white")
    d = ImageDraw.Draw(sheet)
    d.text((10, 15), f"Class {code}: {spec['subject']}", fill="black")
    y = 60
    for row in blocks:
        x = 0
        for b in row:
            sheet.paste(b, (x, y))
            x += b.width + 20
        y += max(b.height for b in row) + 16
    sheet.save(out)
    print(out, sheet.size)


if __name__ == "__main__":
    main(sys.argv[1:])
