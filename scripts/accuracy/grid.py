"""A region of an image with a labelled pixel grid over it, for reading off
the boxes that go into evidence.json:

    python3 scripts/accuracy/grid.py <image> <out.png> [x0 y0 x1 y1] [--step 100] [--width 1400]

Grid labels are in the full image's pixels, whatever the scaling.
"""

import sys

from PIL import Image, ImageDraw


def main(argv):
    opts = {}
    args = []
    i = 0
    while i < len(argv):
        if argv[i].startswith("--"):
            opts[argv[i]] = argv[i + 1]
            i += 2
        else:
            args.append(argv[i])
            i += 1
    img = Image.open(args[0]).convert("RGB")
    box = tuple(int(v) for v in args[2:6]) if len(args) >= 6 else (0, 0, img.width, img.height)
    step = int(opts.get("--step", 100))
    width = int(opts.get("--width", 1400))
    crop = img.crop(box)
    k = width / crop.width
    crop = crop.resize((width, round(crop.height * k)), Image.LANCZOS)
    d = ImageDraw.Draw(crop)
    x0, y0, x1, y1 = box
    for x in range((x0 // step + 1) * step, x1, step):
        sx = (x - x0) * k
        d.line([(sx, 0), (sx, crop.height)], fill=(255, 0, 255), width=1)
        d.text((sx + 2, 2), str(x), fill=(255, 0, 255))
    for y in range((y0 // step + 1) * step, y1, step):
        sy = (y - y0) * k
        d.line([(0, sy), (crop.width, sy)], fill=(0, 255, 255), width=1)
        d.text((2, sy + 2), str(y), fill=(0, 255, 255))
    crop.save(args[1])


if __name__ == "__main__":
    main(sys.argv[1:])
