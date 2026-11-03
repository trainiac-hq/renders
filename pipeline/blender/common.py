"""What every part of the renderer shares: the scene file, colours, node
helpers, and the body's surfaces for placing things on it.

Coordinates in the scene files are metres: x back from the nose tip, y up
from the rail head, z across. Blender's are X = x, Y = z, Z = y.
"""

import json
import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT = argv[0], argv[1]
VIEWS = argv[2:] or ["hero", "plate"]
SCENE = json.load(open(os.path.join(SRC, "scene.json")))
H = SCENE["heights"]
HALF = SCENE["width"] / 2
FEATURES = SCENE["features"]
SAMPLES = int(os.environ.get("TRAIN_SAMPLES", "256"))
# Whether the train stands on a short length of track, or on nothing but its shadow.
TRACK = os.environ.get("TRAIN_TRACK", "none") == "track"
DEBUG = os.environ.get("TRAIN_DEBUG")


# What the geometry checks found, written out beside the renders.
REPORT = []


def report(check, name, ok, detail):
    REPORT.append({"check": check, "name": name, "ok": bool(ok), "detail": detail})
    if not ok:
        print(f"VALIDATION FAILED: {check}: {name}: {detail}")


def srgb(hex_colour, alpha=1.0):
    """A #RRGGBB colour as linear RGBA, which is what Blender's sockets take."""
    h = hex_colour.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i : i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, alpha)


# --- Surfaces ----------------------------------------------------------------------------

_hw = FEATURES["halfWidth"]
_nose = FEATURES["nose"]


def half_width(y):
    """Half the body's width at a height."""
    i = (y - _hw["y0"]) / _hw["step"]
    i = min(max(i, 0), len(_hw["w"]) - 1.001)
    k = int(i)
    t = i - k
    return _hw["w"][k] * (1 - t) + _hw["w"][k + 1] * t


def nose_x(y, z):
    """How far back from the nose tip the leading car's surface is at (y, z), or None outside it."""
    fj = (y - _nose["y0"]) / _nose["step"]
    fi = (z - _nose["z0"]) / _nose["step"]
    if fj < 0 or fi < 0 or fj > _nose["ny"] - 1 or fi > _nose["nz"] - 1:
        return None
    j, i = min(int(fj), _nose["ny"] - 2), min(int(fi), _nose["nz"] - 2)
    tj, ti = fj - j, fi - i
    total, weight = 0.0, 0.0
    for dj, wj in ((0, 1 - tj), (1, tj)):
        for di, wi in ((0, 1 - ti), (1, ti)):
            v = _nose["x"][(j + dj) * _nose["nz"] + i + di]
            if v is not None and wj * wi > 0:
                total += v * wj * wi
                weight += wj * wi
    return total / weight if weight > 0 else None


def nose_x_clamped(y, z):
    """The nose surface at (y, z), pulling z in (and y onto the nose) until it's on the body."""
    y = min(max(y, _nose["y0"]), _nose["y0"] + (_nose["ny"] - 1) * _nose["step"])
    for k in range(100):
        v = nose_x(y, z * (1 - k * 0.01))
        if v is not None:
            return v
    raise ValueError(f"no nose surface near y={y:.3f}, z={z:.3f}")


# --- Shader node helpers -------------------------------------------------------------------


class Graph:
    def __init__(self, tree):
        self.tree = tree
        self.nodes = tree.nodes
        self.links = tree.links

    def node(self, kind, **props):
        n = self.nodes.new(kind)
        for k, v in props.items():
            setattr(n, k, v)
        return n

    def link(self, a, b):
        self.links.new(a, b)

    def set(self, socket, v):
        if isinstance(v, (int, float, tuple)):
            socket.default_value = v
        else:
            self.link(v, socket)

    def math(self, op, a, b=None, clamp=False):
        n = self.node("ShaderNodeMath", operation=op, use_clamp=clamp)
        for i, v in enumerate((a, b)):
            if v is not None:
                self.set(n.inputs[i], v)
        return n.outputs[0]

    def mix(self, a, b, factor, blend="MIX"):
        n = self.node("ShaderNodeMix", data_type="RGBA", blend_type=blend, clamp_factor=True)
        self.set(n.inputs[6], a)
        self.set(n.inputs[7], b)
        self.set(n.inputs[0], factor)
        return n.outputs[2]

    def mixf(self, a, b, factor):
        n = self.node("ShaderNodeMix", data_type="FLOAT", clamp_factor=True)
        self.set(n.inputs[2], a)
        self.set(n.inputs[3], b)
        self.set(n.inputs[0], factor)
        return n.outputs[0]

    def smoothstep(self, value, lo, hi):
        n = self.node("ShaderNodeMapRange", interpolation_type="SMOOTHSTEP")
        n.inputs["From Min"].default_value = lo
        n.inputs["From Max"].default_value = hi
        self.set(n.inputs["Value"], value)
        return n.outputs[0]

    def position(self):
        sep = self.node("ShaderNodeSeparateXYZ")
        self.link(self.node("ShaderNodeNewGeometry").outputs["Position"], sep.inputs[0])
        return sep.outputs

    def noise(self, scale, vector=None, stretch=(1, 1, 1), detail=4.0, roughness=0.55):
        """Noise in world space, optionally stretched along axes (bigger = longer features)."""
        n = self.node("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = scale
        n.inputs["Detail"].default_value = detail
        n.inputs["Roughness"].default_value = roughness
        geo = self.node("ShaderNodeNewGeometry")
        mapping = self.node("ShaderNodeMapping")
        mapping.inputs["Scale"].default_value = tuple(1 / s for s in stretch)
        self.link(vector if vector is not None else geo.outputs["Position"], mapping.inputs["Vector"])
        self.link(mapping.outputs[0], n.inputs["Vector"])
        return n.outputs["Fac"]


def new_material(name):
    m = bpy.data.materials.new(name)
    m.node_tree.nodes.clear()
    return m, Graph(m.node_tree)


def principled(g, **values):
    n = g.node("ShaderNodeBsdfPrincipled")
    for k, v in values.items():
        g.set(n.inputs[k], v)
    return n


def output(g, shader, displacement=None):
    out = g.node("ShaderNodeOutputMaterial")
    g.link(shader, out.inputs["Surface"])
    return out


def image(g, name, vector, colour=False):
    img = bpy.data.images.load(os.path.join(SRC, name))
    img.colorspace_settings.name = "sRGB" if colour else "Non-Color"
    img.alpha_mode = "CHANNEL_PACKED"
    n = g.node("ShaderNodeTexImage", image=img, interpolation="Linear", extension="EXTEND")
    g.link(vector, n.inputs["Vector"])
    if colour:
        return n.outputs["Color"]
    sep = g.node("ShaderNodeSeparateColor")
    g.link(n.outputs["Color"], sep.inputs[0])
    return [sep.outputs[0], sep.outputs[1], sep.outputs[2], n.outputs["Alpha"]]


def projection(g, domain, axis):
    """Texture coordinates for a texture spanning `domain`, seen along an axis."""
    pos = g.position()
    across = pos["X"] if axis == "side" else pos["Y"]
    u = g.math("DIVIDE", g.math("SUBTRACT", across, domain["x0"]), domain["x1"] - domain["x0"])
    v = g.math("DIVIDE", g.math("SUBTRACT", pos["Z"], domain["y0"]), domain["y1"] - domain["y0"])
    comb = g.node("ShaderNodeCombineXYZ")
    g.link(u, comb.inputs[0])
    g.link(v, comb.inputs[1])
    return comb.outputs[0]


def radians(d):
    return math.radians(d)
