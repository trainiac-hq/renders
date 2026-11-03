"""Measures a train's flat side elevation against its class's spec:

    python3 scripts/accuracy/elevation.py <code> <render prefix> [--tol 0.06] [--livery <key>]

e.g. `python3 scripts/accuracy/elevation.py 377 out/renders/377-SN`, after
rendering the `elevation` view. The elevation is unlit paint colour, square
on, at a known scale, so every door, window and livery edge can be found to
the pixel and turned back into metres.

Checks come from classes/<code>/spec.json:

- every door and window of `model.cab` and `model.next`: the run of the
  door's (or glass's) colour through its middle must start and end where
  the spec says, within the tolerance;
- `elevation.checks`, any others: a `run` along a row, a `column` up one,
  an `edge` where one colour gives way to another, or a `colour` at a point.

Colours are named in `elevation.colours`. A class with several liveries
gives one block per livery under `elevations.<key>` instead, picked with
`--livery <key>` (the operator's ATOC code, say). Writes <prefix>-elevation-check.json
and <prefix>-elevation-overlay.png (the side diagram, scaled and aligned on
the nose and the rail, laid half over the render), and exits 1 if anything
is out of tolerance.
"""

import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import camera  # noqa: E402

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")


def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.int32)


class Elevation:
    def __init__(self, prefix, spec):
        self.img = np.asarray(Image.open(f"{prefix}-elevation.png").convert("RGBA"), dtype=np.int32)
        self.cam = camera.load(f"{prefix}-elevation.camera.json")
        cars = self.cam.get("cars") or [{"x0": 0}, {"x0": spec["model"]["cab"]["length"] + 0.7}]
        self.x0 = {"cab": cars[0]["x0"], "next": cars[1]["x0"]}
        self.ppm = self.cam["width"] / self.cam["orthoScale"]

    def px(self, car, x, y):
        u, v = camera.project(self.cam, self.x0[car] + x, y)
        return int(round(u)), int(round(v))

    def metres(self, car, u):
        u0, _ = camera.project(self.cam, self.x0[car], 0)
        return (u - u0) / self.ppm

    def height(self, v):
        _, v0 = camera.project(self.cam, 0, 0)
        return (v0 - v) / self.ppm

    def matches(self, u, v, colour, tol):
        h, w = self.img.shape[:2]
        if not (0 <= u < w and 0 <= v < h):
            return False
        p = self.img[v, u]
        return p[3] > 128 and int(np.abs(p[:3] - colour).max()) <= tol

    def run(self, car, y, mid, colour, tol, axis="x", lo=None):
        """The extent of `colour` through a point, in metres."""
        if axis == "x":
            u, v = self.px(car, mid, y)
            if not self.matches(u, v, colour, tol):
                return None
            a = u
            while self.matches(a - 1, v, colour, tol):
                a -= 1
            b = u
            while self.matches(b + 1, v, colour, tol):
                b += 1
            return self.metres(car, a - 0.5), self.metres(car, b + 0.5)
        u, v = self.px(car, lo, mid)
        if not self.matches(u, v, colour, tol):
            return None
        a = v
        while self.matches(u, a - 1, colour, tol):
            a -= 1
        b = v
        while self.matches(u, b + 1, colour, tol):
            b += 1
        return self.height(b + 0.5), self.height(a - 0.5)


def derived_checks(spec, block):
    """A run check for every door and window the spec places: doors only
    where the livery gives them a colour of their own (`door`)."""
    out = []
    model = spec["model"]
    lo, hi = model["heights"]["window"]
    mid = (lo + hi) / 2
    for car in ("cab", "next"):
        c = model[car]
        for d in c["doors"]:
            if d.get("cab") or "door" not in block.get("colours", {}):
                continue
            span = d.get("span", [None, None])
            y = (span[0] + 0.25) if span[0] is not None else model["heights"]["bottom"] + 0.4
            out.append({"kind": "run", "what": f"{car} door at {d['x']:.2f}", "car": car, "y": y,
                        "x": [d["x"] - d["w"] / 2, d["x"] + d["w"] / 2], "colour": "door",
                        "leaves": d.get("leaves", 1)})
        # Panes that meet with no pillar between them are one run of glass.
        runs = []
        for a, b in sorted(c["windows"]):
            if runs and a - runs[-1][1] < 0.02:
                runs[-1][1] = b
            else:
                runs.append([a, b])
        for a, b in runs:
            out.append({"kind": "run", "what": f"{car} window {a:.2f}-{b:.2f}", "car": car, "y": mid, "x": [a, b], "colour": "glass"})
    return out


def overlay(prefix, spec, el):
    cal = spec.get("calibration")
    # Only a diagram calibrated in pixels per metre, on the face and the rail, can be laid over the render.
    if not cal or any(k not in cal for k in ("pxPerM", "faceX", "railY")) or cal.get("ref") not in json.load(open(os.path.join(ROOT, "classes", spec["class"], "evidence.json")))["refs"]:
        return
    base = os.path.join(ROOT, "classes", spec["class"])
    ev = json.load(open(os.path.join(base, "evidence.json")))
    dia = Image.open(os.path.join(base, ev["refs"][cal["ref"]]["file"])).convert("RGBA")
    # A drawing's two axes may be at different scales (calibration.pxPerMVertical).
    k = el.ppm / cal["pxPerM"]
    kv = el.ppm / cal.get("pxPerMVertical", cal["pxPerM"])
    dia = dia.resize((round(dia.width * k), round(dia.height * kv)), Image.LANCZOS)
    u0, v0 = el.px("cab", 0, 0)
    render = Image.open(f"{prefix}-elevation.png").convert("RGBA")
    canvas = Image.new("RGBA", render.size, "white")
    canvas.alpha_composite(render)
    layer = Image.new("RGBA", render.size, (0, 0, 0, 0))
    layer.paste(dia, (round(u0 - cal["faceX"] * k), round(v0 - cal["railY"] * kv)))
    alpha = np.asarray(layer).copy()
    alpha[:, :, 3] = (alpha[:, :, 3] * 0.5).astype(np.uint8)
    canvas.alpha_composite(Image.fromarray(alpha))
    canvas.convert("RGB").save(f"{prefix}-elevation-overlay.png")


def main(argv):
    code, prefix = argv[0], argv[1]
    tol = float(argv[argv.index("--tol") + 1]) if "--tol" in argv else 0.06
    spec = json.load(open(os.path.join(ROOT, "classes", code, "spec.json")))
    block = spec["elevations"][argv[argv.index("--livery") + 1]] if "--livery" in argv else spec.get("elevation", {})
    el = Elevation(prefix, spec)
    colours = {k: hex_rgb(v) for k, v in block.get("colours", {}).items()}
    checks = derived_checks(spec, block) + block.get("checks", [])
    results = []
    for c in checks:
        name = c.get("colour") or c.get("to")
        if name not in colours:
            results.append({**c, "ok": False, "detail": f"no colour named {name} in elevation.colours"})
            continue
        colour = colours[name]
        ctol = c.get("colourTol", block.get("colourTol", {}).get(name, 40))
        t = c.get("tol", tol)
        if c["kind"] == "run" and c.get("leaves") == 2:
            # A pair of leaves: each from its own middle, the joint between them aside.
            a, b = c["x"]
            left = el.run(c["car"], c["y"], a + (b - a) / 4, colour, ctol)
            right = el.run(c["car"], c["y"], b - (b - a) / 4, colour, ctol)
            got = (left[0], right[1]) if left and right else None
            want = c["x"]
        elif c["kind"] == "run":
            got = el.run(c["car"], c["y"], (c["x"][0] + c["x"][1]) / 2, colour, ctol)
            want = c["x"]
        elif c["kind"] == "column":
            got = el.run(c["car"], None, (c["y"][0] + c["y"][1]) / 2, colour, ctol, axis="y", lo=c["x"])
            want = c["y"]
        elif c["kind"] == "edge":
            # The first pixel of `to` met walking from `from` along the row.
            u, v = el.px(c["car"], c["start"], c["y"])
            step = 1 if c["direction"] == "back" else -1
            got = None
            for i in range(int(el.ppm * 4)):
                if el.matches(u + i * step, v, colours[c["to"]], ctol):
                    got = (el.metres(c["car"], u + i * step), None)
                    break
            want = [c["x"], None]
            ctol = c.get("colourTol", ctol)
        elif c["kind"] == "colour":
            u, v = el.px(c["car"], c["at"][0], c["at"][1])
            p = el.img[v, u][:3]
            d = int(np.abs(p - colour).max())
            results.append({**c, "ok": d <= ctol, "detail": f"#{p[0]:02X}{p[1]:02X}{p[2]:02X}, off by {d}"})
            continue
        if got is None:
            results.append({**c, "ok": False, "detail": "colour not found there"})
            continue
        errs = [abs(g - w) for g, w in zip(got, want) if w is not None and g is not None]
        ok = all(e <= t for e in errs)
        shown = ", ".join(f"{g:.3f}" for g in got if g is not None)
        results.append({**c, "ok": ok, "detail": f"measured {shown} m, spec {want}, worst {max(errs):.3f} m (tolerance {t})"})
    for r in results:
        print(f"{'ok  ' if r['ok'] else 'FAIL'} {r['what']}: {r['detail']}")
    bad = [r for r in results if not r["ok"]]
    print(f"{len(results) - len(bad)}/{len(results)} within tolerance")
    with open(f"{prefix}-elevation-check.json", "w") as f:
        json.dump(results, f, indent=1)
    overlay(prefix, spec, el)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main(sys.argv[1:])
