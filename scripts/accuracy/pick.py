"""Zoomed crops round rough guesses of points, one panel per point with a
labelled pixel grid, for placing each correspondence exactly:

    python3 scripts/accuracy/pick.py <image> <out.png> name=x,y [name=x,y ...] [--r 60] [--step 10]

Look at each panel on its own and read the point off its grid.
"""

import sys

from PIL import Image, ImageDraw


def main(argv):
    opts = {"--r": "60", "--step": "10"}
    args = []
    i = 0
    while i < len(argv):
        if argv[i] in opts:
            opts[argv[i]] = argv[i + 1]
            i += 2
        else:
            args.append(argv[i])
            i += 1
    img = Image.open(args[0]).convert("RGB")
    r, step, zoom = int(opts["--r"]), int(opts["--step"]), 4
    panels = []
    for spec in args[2:]:
        name, xy = spec.split("=")
        x, y = (int(float(v)) for v in xy.split(","))
        crop = img.crop((x - r, y - r, x + r, y + r)).resize((2 * r * zoom, 2 * r * zoom), Image.NEAREST)
        d = ImageDraw.Draw(crop)
        for gx in range((x - r) // step * step + step, x + r, step):
            sx = (gx - x + r) * zoom
            d.line([(sx, 0), (sx, crop.height)], fill=(255, 0, 255) if gx % (5 * step) == 0 else (120, 0, 120), width=1)
            if gx % (5 * step) == 0:
                d.text((sx + 2, 2), str(gx), fill=(255, 0, 255))
        for gy in range((y - r) // step * step + step, y + r, step):
            sy = (gy - y + r) * zoom
            d.line([(0, sy), (crop.width, sy)], fill=(0, 255, 255) if gy % (5 * step) == 0 else (0, 110, 110), width=1)
            if gy % (5 * step) == 0:
                d.text((2, sy + 2), str(gy), fill=(0, 255, 255))
        d.text((4, crop.height - 14), name, fill=(255, 255, 0))
        panels.append(crop)
    cols = 3
    pw, ph = panels[0].size
    sheet = Image.new("RGB", (cols * (pw + 6), ((len(panels) + cols - 1) // cols) * (ph + 6)), "black")
    for k, p in enumerate(panels):
        sheet.paste(p, ((k % cols) * (pw + 6), (k // cols) * (ph + 6)))
    sheet.save(args[1])


if __name__ == "__main__":
    main(sys.argv[1:])
