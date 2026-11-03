"""Where a point on the train lands in a render, from the camera the
render wrote beside itself (<prefix>-<view>.camera.json)."""

import json


def load(path):
    with open(path) as f:
        return json.load(f)


def project(cam, x, y, z=None):
    """Pixel (column, row) of the point x back from the nose tip, y up from
    the rail, z across (the near side negative; on the near bodyside when
    not given)."""
    if z is None:
        z = -1.4
    m = cam["worldToCamera"]
    p = (x, z, y, 1.0)
    cx, cy, cz = (sum(m[i][k] * p[k] for k in range(4)) for i in range(3))
    w, h = cam["width"], cam["height"]
    if cam["type"] == "ORTHO":
        s = w / cam["orthoScale"]
        return w / 2 + cx * s, h / 2 - cy * s
    f = cam["lens"] / cam["sensor"] * w
    sx, sy = cam.get("shift", (0, 0))
    return w / 2 - sx * w + f * cx / -cz, h / 2 + sy * w - f * cy / -cz


def box(cam, x0, x1, y0, y1, z0, z1, margin=0.06):
    """The pixel box round a box on the train, grown by `margin` of its size."""
    pts = [project(cam, x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]
    us, vs = [p[0] for p in pts], [p[1] for p in pts]
    du, dv = (max(us) - min(us)) * margin, (max(vs) - min(vs)) * margin
    return [round(min(us) - du), round(min(vs) - dv), round(max(us) + du), round(max(vs) + dv)]
