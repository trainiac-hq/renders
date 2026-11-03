"""Points on the model whose position is exactly known, for matching a
reference photo's camera (match.py). Read from the scene a train builds
(`bun pipeline/isolated.ts <train> <dir>` writes <dir>/scene.json):

    python3 scripts/accuracy/landmarks.py <scene dir> [--side near|far]

Coordinates are Blender's: X back from the nose tip, Y across (near side,
the one the hero view sees, negative), Z up from the rail. Names:

- door<k>-front-top / -front-bottom / -rear-top / -rear-bottom: the
  corners of every door's opening (the leading car's first door is k=0,
  the cab door if it has one), on the bodyside;
- lamp<k>-head / -tail: the centre of each lamp on a flat face; lamp 0 is
  on the near side; a second lamp of the same kind in one housing is
  lamp<k>-head-2;
- screen<k>-top-near / -top-far / -bottom-near / -bottom-far: each
  windscreen's glass at its corners (near = towards negative Y);
- gangway-frame-<bottom|top>-<near|far>: a standing-out gangway frame's
  corners, at its front;
- axle<k>: the centre of each wheel's hub on the visible side;
- axlebox<k>: the centre of each axlebox's end cover on the visible side,
  as far out as the class's bogie type puts it (model/gear.ts: 1.13 m on
  the generic bogie), off the bodyside's plane;
- bogie<k>-frame-<front|rear>-top: the outer top corner of each bogie side
  frame's end, on the visible side (the generic bogie only: an inside
  frame is behind the wheels);
- far-door<k>-...: the door corners on the other side, as seen through a
  head-on or end-on photo (a cab door's far edge);
- nose-tip: the foremost point of the nose on the centre line.

Points off the bodyside's plane (axleboxes, frames, the far side, the
nose and anything on the face) are what pin a camera's depth: match.py
will not score the face from a camera solved without them.

A match file may add its own points on the bodyside as [x, y] in
`model` (a livery corner from the spec, say), and on a flat face as
[z, y] in `modelFace` (a windscreen frame's corner).

`--side far` gives the bodyside and axle points on the other side (a
photo with the nose to the right shows that one).
"""

import json
import os
import sys

GAUGE = 0.7175  # pipeline/blender/gear.py
# The running gear as gear.py builds it: the axlebox cover's face, and the
# side frame's end (its outer face, how far beyond the axle, its top above it).
AXLEBOX_COVER = 1.13
FRAME_OUT = 1.06
FRAME_END = 0.35
FRAME_TOP = 0.48


class Scene:
    def __init__(self, path):
        with open(os.path.join(path, "scene.json")) as f:
            self.s = json.load(f)
        self.f = self.s["features"]

    def half_width(self, y):
        hw = self.f["halfWidth"]
        i = min(max((y - hw["y0"]) / hw["step"], 0), len(hw["w"]) - 1.001)
        k = int(i)
        t = i - k
        return hw["w"][k] * (1 - t) + hw["w"][k + 1] * t

    def nose_x(self, y, z):
        n = self.f["nose"]
        fj = (y - n["y0"]) / n["step"]
        fi = (z - n["z0"]) / n["step"]
        j = min(max(int(fj), 0), n["ny"] - 2)
        i = min(max(int(fi), 0), n["nz"] - 2)
        tj, ti = fj - j, fi - i
        total = weight = 0.0
        for dj, wj in ((0, 1 - tj), (1, tj)):
            for di, wi in ((0, 1 - ti), (1, ti)):
                v = n["x"][(j + dj) * n["nz"] + i + di]
                if v is not None and wj * wi > 0:
                    total += v * wj * wi
                    weight += wj * wi
        return total / weight if weight else None


def landmarks(path, side="near", extra=None, face_extra=None):
    sc = Scene(path)
    sgn = -1 if side == "near" else 1
    out = {}
    lead = [d for d in sc.f["doors"] if d["lead"]]
    for k, d in enumerate(sorted(lead, key=lambda d: d["x"])):
        for end, x in (("front", d["x"] - d["w"] / 2), ("rear", d["x"] + d["w"] / 2)):
            for level, y in (("top", d["hi"]), ("bottom", d["lo"])):
                out[f"door{k}-{end}-{level}"] = [x, sgn * sc.half_width(y), y]
    face = sc.f["face"]
    # Lamps: housings come in pairs, near side first when its z is negative.
    for k, units in enumerate(sorted(face["lampUnits"], key=lambda us: us[0]["x"] if us else 0)):
        for u in units:
            x = sc.nose_x(u["y"], u["x"])
            if x is not None:
                # A second lamp of the same kind in one housing (a marker beside the headlamp) is -2.
                name = f"lamp{k}-{u['kind']}"
                out[name if name not in out else f"{name}-2"] = [x, u["x"], u["y"]]
    # Windscreens: the glass outline's point nearest each corner of its box.
    for k, scr in enumerate(sorted(face["screens"], key=lambda p: sum(q[0] for q in p) / len(p))):
        zs, ys = [q[0] for q in scr], [q[1] for q in scr]
        for name, cz, cy in (("top-near", min(zs), max(ys)), ("top-far", max(zs), max(ys)),
                             ("bottom-near", min(zs), min(ys)), ("bottom-far", max(zs), min(ys))):
            q = min(scr, key=lambda q: (q[0] - cz) ** 2 + (q[1] - cy) ** 2)
            x = sc.nose_x(q[1], q[0])
            if x is not None:
                out[f"screen{k}-{name}"] = [x, q[0], q[1]]
    gf = face.get("gangwayFrame")
    if gf:
        o = gf["outline"]
        zs, ys = [q[0] for q in o], [q[1] for q in o]
        rake = gf.get("rake") or 0.0
        # A raked frame stands its depth ahead of the face at its foot and leans back from there.
        face_x = min(sc.nose_x(y, z) for z, y in o if not rake or y < min(ys) + 0.05)
        front = face_x - gf["depth"]
        for level, y in (("bottom", min(ys)), ("top", max(ys))):
            for s, z in (("near", min(zs)), ("far", max(zs))):
                out[f"gangway-frame-{level}-{s}"] = [front + rake * (y - min(ys)), z, y]
    wb = sc.s["wheelbase"]
    r = sc.s["wheel"] / 2
    for k, b in enumerate(sorted(sc.s["bogies"])[:2]):
        out[f"axle{2 * k}"] = [b - wb / 2, sgn * (GAUGE + 0.05), r]
        out[f"axle{2 * k + 1}"] = [b + wb / 2, sgn * (GAUGE + 0.05), r]
        cover = sc.s.get("gear", {}).get("axlebox", AXLEBOX_COVER)
        out[f"axlebox{2 * k}"] = [b - wb / 2, sgn * cover, r]
        out[f"axlebox{2 * k + 1}"] = [b + wb / 2, sgn * cover, r]
        if sc.s.get("gear", {}).get("bogie", "generic") == "generic":
            out[f"bogie{k}-frame-front-top"] = [b - wb / 2 - FRAME_END, sgn * FRAME_OUT, r + FRAME_TOP]
            out[f"bogie{k}-frame-rear-top"] = [b + wb / 2 + FRAME_END, sgn * FRAME_OUT, r + FRAME_TOP]
    for k, d in enumerate(sorted(lead, key=lambda d: d["x"])):
        for end, x in (("front", d["x"] - d["w"] / 2), ("rear", d["x"] + d["w"] / 2)):
            for level, y in (("top", d["hi"]), ("bottom", d["lo"])):
                out[f"far-door{k}-{end}-{level}"] = [x, -sgn * sc.half_width(y), y]
    # The nose's foremost point on the centre line.
    best = None
    n = sc.f["nose"]
    for j in range(n["ny"]):
        y = n["y0"] + j * n["step"]
        x = sc.nose_x(y, 0.0)
        if x is not None and (best is None or x < best[0]):
            best = [x, 0.0, y]
    if best:
        out["nose-tip"] = best
    # Points named by the match file itself, on the bodyside: [x, y] (a
    # livery corner, a stripe's end), placed on the visible side's surface.
    for name, (x, y) in (extra or {}).items():
        out[name] = [x, sgn * sc.half_width(y), y]
    # And on a flat face: [z, y] (z across, the near side negative), on the nose's surface.
    for name, (z, y) in (face_extra or {}).items():
        # Pulled in until it's on the body, as the renderer places things on the face.
        for k in range(100):
            x = sc.nose_x(y, z * (1 - k * 0.005))
            if x is not None:
                out[name] = [x, z * (1 - k * 0.005), y]
                break
    return out


if __name__ == "__main__":
    side = sys.argv[sys.argv.index("--side") + 1] if "--side" in sys.argv else "near"
    for k, v in landmarks(sys.argv[1], side).items():
        print(f"{k:28s} {v[0]:7.3f} {v[1]:7.3f} {v[2]:7.3f}")
