"""Logos and wordmarks (pipeline/branding.ts places them): each built from
its SVG's own curves, filled, as a thin mesh laid on the train, so it is as
sharp at any size as the artwork is. On a bodyside it follows the side's
tumblehome. On the front it is laid onto whatever is there (the shell, or a
long nose's panel over it) along the face's normal at the artwork's centre,
so its size is measured on the surface: on a raked nose the lettering keeps
its proportions instead of being squashed as a projection along the train
would squash it."""

import math
import os

import addon_utils
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

from body import link, mesh_from
from common import SCENE, SRC, half_width, report
from materials import paint
from common import srgb

# How far the artwork stands off what it is laid on: over the 0.4-3.1 mm
# the long nose's decals take, and well clear of the paint's own texture.
LIFT = 0.0035
# Curve resolution: segments per Bezier span of the outlines.
RESOLUTION = 24
# Each shape stands this much further off than the one drawn before it, as
# the SVG paints them (later over earlier), so a letter on a box never
# shares the box's plane.
STACK = 0.0002


def artwork(path):
    """The SVG's filled shapes as one mesh in its own plane (x right, y up),
    centred, 1 unit high; the colour of each face's fill; and each vertex's
    layer, its shape's place in the SVG's painting order."""
    addon_utils.enable("io_curve_svg", default_set=False)
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=path)
    # The importer names its curves Curve, Curve.001, ... in document order.
    curves = sorted((o for o in bpy.data.objects if o not in before and o.type == "CURVE"), key=lambda o: o.name)
    if not curves:
        raise SystemExit(f"branding: nothing to draw in {path}")
    verts, faces, colours, layers = [], [], [], []
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for layer, obj in enumerate(curves):
        obj.data.dimensions = "2D"
        obj.data.fill_mode = "BOTH"
        obj.data.resolution_u = RESOLUTION
        fill = obj.active_material.diffuse_color[:] if obj.active_material else (1, 1, 1, 1)
        me = obj.evaluated_get(depsgraph).to_mesh()
        m = obj.matrix_world
        base = len(verts)
        verts.extend((m @ v.co).to_tuple() for v in me.vertices)
        layers.extend([layer] * len(me.vertices))
        for p in me.polygons:
            faces.append(tuple(base + i for i in p.vertices))
            colours.append(tuple(fill))
        obj.evaluated_get(depsgraph).to_mesh_clear()
    for obj in curves:
        bpy.data.objects.remove(obj, do_unlink=True)
    xs, ys = [v[0] for v in verts], [v[1] for v in verts]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    k = 1.0 / (max(ys) - min(ys))
    flat = [((x - cx) * k, (y - cy) * k) for x, y, _ in verts]
    faces, colours = split(flat, faces, colours, layers)
    return flat, faces, colours, (max(xs) - min(xs)) * k, layers


# Longest triangle edge laid on, in artwork heights.
MAX_EDGE = 0.25


def split(flat, faces, colours, layers):
    """Long triangles cut in four until short, so a large shape (a sign's
    panel) follows a curved face rather than cutting under it. Adds the
    new points to `flat` and `layers`."""
    out_f, out_c = [], []

    def go(tri, c, depth):
        i, j, k = tri
        if depth >= 6 or max(math.dist(flat[i], flat[j]), math.dist(flat[j], flat[k]), math.dist(flat[k], flat[i])) <= MAX_EDGE:
            out_f.append(tri)
            out_c.append(c)
            return
        mids = []
        for p, q in ((i, j), (j, k), (k, i)):
            flat.append(((flat[p][0] + flat[q][0]) / 2, (flat[p][1] + flat[q][1]) / 2))
            layers.append(layers[p])
            mids.append(len(flat) - 1)
        a, b, d = mids
        for t in ((i, a, d), (a, j, b), (d, b, k), (a, b, d)):
            go(t, c, depth + 1)

    for f, c in zip(faces, colours):
        if len(f) == 3:
            go(f, c, 0)
        else:
            out_f.append(f)
            out_c.append(c)
    return out_f, out_c


def materials_for(colours, override):
    """One satin paint per fill colour, or the one the placement gives."""
    out, index = [], []
    by = {}
    for c in colours:
        key = override or "#%02X%02X%02X" % tuple(round(max(0.0, min(1.0, v)) ** (1 / 2.2) * 255) for v in c[:3])
        if key not in by:
            by[key] = len(out)
            out.append(paint(f"branding {key}", srgb(key)))
        index.append(by[key])
    return out, index


def caster(depsgraph, reach=6.0):
    """scene.ray_cast's answer, from search trees built once over the meshes
    within `reach` metres of the nose: scene.ray_cast builds its own on every
    call, which took half an hour for a front logo of a thousand points."""
    trees = []
    for o in bpy.context.scene.objects:
        if o.type != "MESH" or min((o.matrix_world @ Vector(c)).x for c in o.bound_box) > reach:
            continue
        m = o.matrix_world
        inv = m.inverted()
        trees.append((BVHTree.FromObject(o, depsgraph), m, inv, inv.to_3x3(), inv.transposed().to_3x3()))

    def cast(origin, direction, distance=10.0):
        best = None
        for tree, m, inv, rot, normals in trees:
            loc, n, _, _ = tree.ray_cast(inv @ origin, rot @ direction, distance)
            if loc is None:
                continue
            w = m @ loc
            if best is None or (w - origin).length < best[0]:
                best = ((w - origin).length, w, (normals @ n).normalized())
        return (True, best[1], best[2]) if best else (False, None, None)

    return cast


def build():
    places = SCENE.get("branding") or []
    for k, b in enumerate(places):
        flat, faces, colours, width, layers = artwork(os.path.join(SRC, b["file"]))
        mats, index = materials_for(colours, b["color"])
        h = b["height"]
        # Stretched across where the measured width differs from the artwork's proportions.
        sx = b["width"] / (width * h) if b.get("width") else 1.0
        flat = [(x * sx, y) for x, y in flat]
        t = math.radians(b["rotate"])
        c, s = math.cos(t), math.sin(t)
        cx, cy = b["at"]

        def turned(x, y, flip):
            # Mirrored, it is turned the other way too, so that seen from
            # the far side it is turned as `rotate` says.
            if flip:
                return cx + (-x * c + y * s) * h, cy + (x * s + y * c) * h
            return cx + (x * c - y * s) * h, cy + (x * s + y * c) * h

        if b["on"] == "side":
            for side in b["sides"]:
                sgn = -1 if side == "near" else 1
                # Seen from the far side the train runs the other way: the
                # artwork is turned round so it reads, unless it is a mirror image there.
                flip = side == "far" and b["far"] == "reads"
                verts = []
                for (x, y), layer in zip(flat, layers):
                    X, Y = turned(x, y, flip)
                    verts.append(Vector((X, sgn * (half_width(Y) + LIFT + layer * STACK), Y)))
                obj = mesh_from(f"branding {k} {side}", verts, faces if sgn < 0 or flip else [f[::-1] for f in faces], mats, index, smooth=False)
                link(obj)
            report("branding", f"{b['file']}", True, f"{len(faces)} faces on the {' and '.join(b['sides'])} side, {width * h * sx:.3f} x {h:.3f} m")
        elif b["on"] == "flank":
            for side in b["sides"]:
                flip = side == "far" and b["far"] == "reads"
                flank(k, b, side, flat, faces if side == "near" or flip else [f[::-1] for f in faces], mats, index, lambda x, y, fl=flip: turned(x, y, fl), layers)
        else:
            front(k, b, flat, faces, mats, index, lambda x, y: turned(x, y, False), layers)


def flank(k, b, side, flat, faces, mats, index, turned, layers):
    """On the nose's flank: each point of the artwork, placed in the side view
    at [x, y], dropped onto the curved surface from that side and lifted off
    it along the surface's normal."""
    cast = caster(bpy.context.evaluated_depsgraph_get(), reach=max(X for X, _ in (turned(x, y) for x, y in flat)) + 1.0)
    sgn = -1 if side == "near" else 1
    verts, missed = [], 0
    for (x, y), layer in zip(flat, layers):
        X, Y = turned(x, y)
        got, loc, nn = cast(Vector((X, sgn * 3.0, Y)), Vector((0.0, -sgn, 0.0)))
        if not got:
            missed += 1
            loc, nn = Vector((X, sgn * half_width(Y), Y)), Vector((0.0, sgn, 0.0))
        nn = nn if nn.y * sgn > 0 else -nn
        verts.append(loc + nn * (LIFT + layer * STACK))
    link(mesh_from(f"branding {k} flank {side}", verts, faces, mats, index, smooth=False))
    report("branding", f"{b['file']} on the {side} flank", missed == 0, f"{len(verts) - missed} of {len(verts)} points laid on the nose")


def front(k, b, flat, faces, mats, index, turned, layers):
    """On the front: the artwork's plane is the face's tangent plane where
    its centre lands (seen head-on, the near side, negative Y, is on the
    right), and each point is dropped onto the surface along that normal."""
    cast = caster(bpy.context.evaluated_depsgraph_get())
    cz, cy = b["at"]
    hit, centre, normal = cast(Vector((-5.0, cz, cy)), Vector((1.0, 0.0, 0.0)))
    if not hit:
        report("branding", f"{b['file']} on the front", False, f"nothing on the front at [{cz:.3f}, {cy:.3f}]")
        return
    n = normal.normalized()
    if n.x > 0:
        n = -n
    across = Vector((0.0, -1.0, 0.0))
    across = (across - n * n.dot(across)).normalized()
    up = n.cross(across)
    if up.z < 0:
        up = -up
    verts, missed = [], 0
    for (x, y), layer in zip(flat, layers):
        # In metres from the centre, turned as placed.
        X, Y = turned(x, y)
        P = centre + across * (X - cz) + up * (Y - cy)
        got, loc, nn = cast(P + n * 0.5, -n)
        if not got:
            missed += 1
            loc, nn = P, n
        nn = nn if nn.dot(n) > 0 else -nn
        verts.append(loc + nn * (LIFT + layer * STACK))
    link(mesh_from(f"branding {k} front", verts, faces, mats, index, smooth=False))
    report("branding", f"{b['file']} on the front", missed == 0,
           f"{len(verts) - missed} of {len(verts)} points laid on the front, centre at x {centre.x:.3f}, face normal {tuple(round(v, 2) for v in n)}")
