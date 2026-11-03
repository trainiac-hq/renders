"""Running gear and equipment: bogies with turned wheels, coil springs and
axleboxes; the cases, tanks and pipes under the floor; what stands on the
roof."""

import math

import bmesh
import bpy
from mathutils import Vector

from body import box, cylinder, link, sphere
from common import H, HALF, SCENE

GAUGE = 0.7175


def lathe(name, profile, materials, pick, segments=48):
    """A solid of revolution about the Y axis from (radius, y) points, a
    face's material chosen by pick(radius, y) of its centre."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, a, 0)) for r, a in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 1, 0), angle=math.tau, steps=segments, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in materials:
        me.materials.append(m)
    for poly in me.polygons:
        c = poly.center
        poly.material_index = pick(math.hypot(c.x, c.z), c.y)
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(40))
    return me


def wheel_mesh(p):
    """A monobloc wheel: hub, dished web, rim with its tread and flange.
    y runs outwards from the flange side."""
    R = SCENE["wheel"] / 2
    profile = [
        (0.0, 0.11), (0.09, 0.11), (0.115, 0.085), (0.14, 0.06), (R - 0.09, 0.045), (R - 0.07, 0.07), (R - 0.055, 0.13),
        (R, 0.13), (R, 0.02), (R + 0.006, 0.006), (R + 0.028, -0.004), (R + 0.03, -0.018), (R + 0.02, -0.026),
        (R - 0.05, -0.026), (R - 0.075, 0.0), (R - 0.09, 0.02), (0.14, 0.03), (0.1, -0.01), (0.07, -0.03), (0.0, -0.03),
    ]
    return lathe("wheel", profile, [p.wheel, p.tread], lambda r, y: 1 if r > R - 0.003 else 0)


def spring_mesh(radius, height, coils, wire, material):
    curve = bpy.data.curves.new("spring", "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = wire
    curve.bevel_resolution = 2
    spline = curve.splines.new("POLY")
    steps = int(coils * 24)
    spline.points.add(steps)
    for i in range(steps + 1):
        t = i / steps
        a = t * coils * math.tau
        spline.points[i].co = (radius * math.cos(a), radius * math.sin(a), height * t, 1)
    curve.materials.append(material)
    return curve


def bogie(i, cx, p, wheel, spring):
    """The generic bogie: outside frame over coil-sprung axleboxes."""
    r = SCENE["wheel"] / 2
    wb = SCENE["wheelbase"] / 2
    for sx in (-wb, wb):
        x = cx + sx
        cylinder(f"axle{i}", (x, -0.85, r), (x, 0.85, r), 0.075, p.frame, vertices=24)
        for side in (-1, 1):
            w = bpy.data.objects.new(f"wheel{i}", wheel)
            w.location = (x, side * (GAUGE - 0.005), r)
            w.scale = (1, side, 1)
            link(w)
            # Axlebox with its end cover, and the coil spring standing on it.
            cylinder(f"axlebox{i}", (x, side * 0.9, r), (x, side * 1.1, r), 0.12, p.frame)
            cylinder(f"axlebox cover{i}", (x, side * 1.1, r), (x, side * 1.13, r), 0.085, p.metal)
            box(f"axlebox top{i}", x - 0.16, x + 0.16, side * 0.9, side * 1.08, r + 0.04, r + 0.16, p.frame, bevel=0.03)
            s = bpy.data.objects.new(f"spring{i}", spring)
            s.location = (x + (0.2 if sx < 0 else -0.2), side * 0.99, r + 0.1)
            link(s)
            # Primary damper alongside.
            cylinder(f"primary damper{i}", (x + (0.36 if sx < 0 else -0.36), side * 1.09, r - 0.05),
                     (x + (0.3 if sx < 0 else -0.3), side * 1.09, r + 0.32), 0.035, p.metal, vertices=16)
    for side in (-1, 1):
        # Side frame: high over the axleboxes, dropping in the middle.
        for sx in (-1, 1):
            box(f"frame end{i}", cx + sx * (wb + 0.35), cx + sx * (wb - 0.3), side * 0.92, side * 1.06, r + 0.3, r + 0.48, p.frame,
                bevel=0.04)
        box(f"frame{i}", cx - wb + 0.25, cx + wb - 0.25, side * 0.92, side * 1.06, r + 0.02, r + 0.34, p.frame, bevel=0.05)
        for sx in (-1, 1):
            # The frame's slope between its ends and middle.
            a, b = Vector((cx + sx * (wb - 0.35), side * 0.99, r + 0.4)), Vector((cx + sx * (wb - 0.62), side * 0.99, r + 0.2))
            cylinder(f"frame slope{i}", a, b, 0.09, p.frame, vertices=16)
        # Air spring between frame and body, and a yaw damper.
        cylinder(f"airspring{i}", (cx, side * 0.95, r + 0.34), (cx, side * 0.95, H["bottom"] - 0.02), 0.22, p.rubber)
        cylinder(f"yaw damper{i}", (cx - 0.9, side * 1.14, r + 0.22), (cx - 0.15, side * 1.14, r + 0.3), 0.04, p.metal, vertices=16)
    box(f"transom{i}", cx - 0.28, cx + 0.28, -0.92, 0.92, r - 0.04, r + 0.26, p.frame, bevel=0.04)
    for sx in (-0.45, 0.45):
        # Brake discs on the axles, inside the wheels.
        for x in (cx - wb + 0.0, cx + wb):
            cylinder(f"disc{i}", (x, sx - 0.03, r), (x, sx + 0.03, r), r * 0.72, p.frame)


def inside_frame(i, cx, p, wheel, spring):
    """Inside-frame bogie (model/gear.ts): the side frames and axleboxes run
    between the wheels, so the side shows the wheels' outer faces with
    their wheel-mounted brake discs and axle-end covers, and behind them
    the frame, its rubber primary springs and the air springs."""
    r = SCENE["wheel"] / 2
    wb = SCENE["wheelbase"] / 2
    out = SCENE["gear"]["axlebox"]
    for sx in (-wb, wb):
        x = cx + sx
        cylinder(f"axle{i}", (x, -out + 0.02, r), (x, out - 0.02, r), 0.075, p.frame, vertices=24)
        for side in (-1, 1):
            w = bpy.data.objects.new(f"wheel{i}", wheel)
            w.location = (x, side * (GAUGE - 0.005), r)
            w.scale = (1, side, 1)
            link(w)
            # Brake disc bolted to the wheel's outer web, and the axle-end cover on the hub.
            cylinder(f"wheel disc{i}", (x, side * (GAUGE + 0.06), r), (x, side * (GAUGE + 0.09), r), r * 0.7, p.frame)
            cylinder(f"axle end{i}", (x, side * (GAUGE + 0.09), r), (x, side * out, r), 0.08, p.metal)
            # Axlebox inside the wheel, a rubber chevron spring above it.
            box(f"axlebox{i}", x - 0.15, x + 0.15, side * 0.44, side * 0.6, r - 0.12, r + 0.12, p.frame, bevel=0.03)
            box(f"primary{i}", x - 0.12, x + 0.12, side * 0.45, side * 0.59, r + 0.12, r + 0.22, p.rubber, bevel=0.02)
    for side in (-1, 1):
        # The side frame between the wheels: deep at the middle, over the axleboxes at the ends.
        box(f"frame{i}", cx - wb - 0.25, cx + wb + 0.25, side * 0.42, side * 0.58, r + 0.18, r + 0.36, p.frame, bevel=0.05)
        box(f"frame belly{i}", cx - wb + 0.3, cx + wb - 0.3, side * 0.42, side * 0.58, r - 0.08, r + 0.2, p.frame, bevel=0.05)
        # Air spring on the frame, and a yaw damper outside the wheels to the body.
        cylinder(f"airspring{i}", (cx, side * 0.62, r + 0.36), (cx, side * 0.62, H["bottom"] - 0.02), 0.22, p.rubber)
        cylinder(f"yaw damper{i}", (cx - 0.9, side * 1.0, r + 0.32), (cx - 0.2, side * 1.0, r + 0.36), 0.04, p.metal, vertices=16)
    box(f"transom{i}", cx - 0.25, cx + 0.25, -0.58, 0.58, r - 0.02, r + 0.26, p.frame, bevel=0.04)


# Bogie builders by type (model/gear.ts BOGIES).
BOGIES = {"generic": bogie, "inside-frame": inside_frame}


def underframe(p):
    """Equipment under the floor between the bogies: cases of several sizes,
    a long tank, and pipe runs along the solebar."""
    sizes = [(2.3, 0.5), (1.4, 0.38), (3.0, 0.56), (0.9, 0.3), (2.6, 0.46), (1.7, 0.42)]
    for j, (a, b) in enumerate(SCENE["under"]):
        x, k = a, 0
        while x < b - 0.5:
            w, depth = sizes[(j * 2 + k) % len(sizes)]
            w = min(w, b - x)
            top = H["bottom"] + 0.02
            if k % 4 == 2 and w > 1.5:
                # A tank, rounded along its length.
                cylinder(f"tank{j}_{k}", (x + 0.1, -0.05, top - 0.3), (x + w - 0.15, -0.05, top - 0.3), 0.3, p.under)
                box(f"tank strap{j}_{k}", x + 0.3, x + 0.38, -0.4, 0.4, top - 0.62, top, p.metal, bevel=0.01)
            else:
                inset = 0.2 + 0.08 * (k % 2)
                box(f"case{j}_{k}", x, x + w - 0.12, -HALF + inset, HALF - inset, max(0.36, top - depth), top, p.under, bevel=0.025)
                # Hinged covers on the case's face.
                if w > 1.2:
                    for c in range(int(w // 0.9)):
                        cx = x + 0.1 + c * 0.9
                        box("cover", cx, cx + 0.75, -HALF + inset - 0.012, -HALF + inset + 0.01, top - depth + 0.06, top - 0.05, p.under,
                            bevel=0.01)
            x += w
            k += 1
        for z, rr in ((0.25, 0.025), (0.12, 0.018)):
            for side in (-1, 1):
                cylinder("pipe", (a, side * (HALF - 0.25), H["bottom"] - z), (b, side * (HALF - 0.25), H["bottom"] - z), rr, p.metal,
                         vertices=12)


def roof(p):
    for k, item in enumerate(SCENE["roof"]):
        top = item.get("top", H["roof"])
        if item["kind"] == "pantograph":
            pantograph(k, item["x"], top, p)
        elif item["kind"] == "dome":
            sphere(f"dome{k}", (item["x"] + item["w"] / 2, 0, top - 0.05), 1, p.kit, scale=(item["w"] / 2, 0.6, 0.2))
            for side in (-1, 1):
                box("grille", item["x"] + item["w"] * 0.2, item["x"] + item["w"] * 0.8, side * 0.55, side * 0.57, top - 0.02, top + 0.08,
                    p.black, bevel=0.005)
        else:
            height = 0.22 if item["kind"] == "exhaust" else 0.2
            wide = 0.35 if item["kind"] == "exhaust" else 0.85
            box(f"pod{k}", item["x"], item["x"] + item["w"], -wide, wide, top - 0.12, top + height, p.kit, bevel=0.14, segments=6)


def pantograph(k, x, top, p):
    """A single-arm pantograph, lowered."""
    box(f"pan base{k}", x - 0.95, x + 0.95, -0.42, 0.42, top + 0.12, top + 0.18, p.metal, bevel=0.02)
    for sx in (-0.75, 0.75):
        for sy in (-0.36, 0.36):
            for d in range(4):
                cylinder("insulator", (x + sx, sy, top - 0.02 + d * 0.035), (x + sx, sy, top + 0.01 + d * 0.035), 0.055 - 0.01 * (d % 2),
                         p.insulator, vertices=16)
    for sy in (-0.3, 0.3):
        cylinder(f"pan lower{k}", (x - 0.6, sy, top + 0.2), (x + 0.3, sy * 0.4, top + 0.48), 0.028, p.metal, vertices=12)
    cylinder(f"pan upper{k}", (x + 0.3, 0, top + 0.48), (x - 0.3, 0, top + 0.68), 0.02, p.metal, vertices=12)
    for dx in (-0.36, -0.26):
        box(f"pan head{k}", x + dx - 0.025, x + dx + 0.025, -0.85, 0.85, top + 0.67, top + 0.71, p.black, bevel=0.01)
    cylinder("pan horn", (x - 0.31, -0.85, top + 0.69), (x - 0.31, -0.98, top + 0.62), 0.012, p.metal, vertices=8)
    cylinder("pan horn", (x - 0.31, 0.85, top + 0.69), (x - 0.31, 0.98, top + 0.62), 0.012, p.metal, vertices=8)


def build(p):
    wheel = wheel_mesh(p)
    spring = spring_mesh(0.09, 0.26, 5.5, 0.017, p.spring)
    build_bogie = BOGIES[SCENE["gear"]["bogie"]]
    for i, cx in enumerate(SCENE["bogies"]):
        build_bogie(i, cx, p, wheel, spring)
    underframe(p)
    roof(p)
