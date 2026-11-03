"""The bodyshells and what is modelled into them: glazing set into the body
(recessed in rubber gaskets, or near flush with a black border), door and
gangway edges as grooves, lamp housings with reflectors and lenses, wipers,
the coupler and the bellows between cars.

Openings are cut with exact booleans by cutters that follow the body's own
surface, so their floors sit at a constant depth below it whatever its
curve. The cutters carry the materials the cut faces take: glass for a
window's floor, rubber for its sides. The cut shell then takes its shading
normals from an uncut copy, so the booleans leave no marks on the paint.
"""

import math
import os

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

from common import FEATURES, H, SCENE, SRC, half_width, nose_x, nose_x_clamped, report

GASKET = FEATURES["glazing"] == "gasket"
# How far the glass sits below the body's surface.
PANE_DEPTH = 0.045 if GASKET else 0.012


# --- Small builders ---------------------------------------------------------------------


def link(obj, collection=None):
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def mesh_from(name, verts, faces, materials, face_materials=None, smooth=True, normals=None):
    """A mesh object. Given `normals` (one per vertex), they become its
    shading normals as they are, and the mesh is taken as given: tidying it
    would renumber the vertices they belong to."""
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    if normals is not None:
        for m in materials:
            me.materials.append(m)
        if face_materials is not None:
            me.polygons.foreach_set("material_index", face_materials)
        # Wind every face to agree with the normals, so nothing is seen from behind.
        bm = bmesh.new()
        bm.from_mesh(me)
        bm.verts.ensure_lookup_table()
        for f in bm.faces:
            want = sum((Vector(normals[v.index]) for v in f.verts), Vector())
            if f.normal.dot(want) < 0:
                f.normal_flip()
        bm.to_mesh(me)
        bm.free()
        me.shade_smooth()
        me.normals_split_custom_set_from_vertices([tuple(n) for n in normals])
        return bpy.data.objects.new(name, me)
    me.validate()
    for m in materials:
        me.materials.append(m)
    if face_materials is not None:
        me.polygons.foreach_set("material_index", face_materials)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        me.shade_smooth()
    return bpy.data.objects.new(name, me)


MAX_TURN = 20


def check_outline(name, pts, place=None):
    """Fails the build on any corner sharper than MAX_TURN degrees: every
    outline should arrive filleted (scripts/trains/outline.ts)."""
    # On the face, outlines are given as seen head-on, which foreshortens
    # them where the nose turns away; scene.ts checked them in true metres
    # over the surface. Here only flat (bodyside) outlines are checked.
    if place in (on_front, on_front_normal):
        return pts
    n = len(pts)
    for i in range(n):
        p, c, q = pts[i - 1], pts[i], pts[(i + 1) % n]
        a, b = (c[0] - p[0], c[1] - p[1]), (q[0] - c[0], q[1] - c[1])
        la, lb = math.hypot(*a), math.hypot(*b)
        if la == 0 or lb == 0:
            continue
        cos = max(-1.0, min(1.0, (a[0] * b[0] + a[1] * b[1]) / (la * lb)))
        turn = math.degrees(math.acos(cos))
        if turn > MAX_TURN:
            report("corners", name, False, f"a {turn:.0f} degree corner at {c}")
            raise ValueError(f"{name}: a {turn:.0f} degree corner at {c} - outlines must be filleted")
    return pts


def signed_area(pts):
    return sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))) / 2


def resample_even(pts, spacing):
    """A closed polyline resampled to points `spacing` apart along it."""
    closed = list(pts) + [pts[0]]
    lengths = [0.0]
    for a, b in zip(closed, closed[1:]):
        lengths.append(lengths[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = lengths[-1]
    n = max(8, int(total / spacing))
    out, j = [], 0
    for k in range(n):
        dist = total * k / n
        while j < len(closed) - 2 and lengths[j + 1] < dist:
            j += 1
        span = lengths[j + 1] - lengths[j] or 1
        t = (dist - lengths[j]) / span
        a, b = closed[j], closed[j + 1]
        out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    return out


def offset(pts, d):
    """A closed polyline moved outwards by d (inwards when negative)."""
    # Uneven spacing (a run of near-coincident points) makes an offset's
    # corners fold back on themselves: resample evenly first.
    pts = resample_even(pts, 0.004)
    sign = 1 if signed_area(pts) > 0 else -1
    out = []
    n = len(pts)
    for i in range(n):
        p, c, q = pts[i - 1], pts[i], pts[(i + 1) % n]
        normals = []
        for a, b in ((p, c), (c, q)):
            dx, dy = b[0] - a[0], b[1] - a[1]
            length = math.hypot(dx, dy) or 1
            normals.append((dy / length * sign, -dx / length * sign))
        nx, ny = normals[0][0] + normals[1][0], normals[0][1] + normals[1][1]
        length = math.hypot(nx, ny) or 1
        # Keep the offset even at corners.
        cos = max(0.5, (normals[0][0] * nx + normals[0][1] * ny) / length)
        out.append((c[0] + nx / length * d / cos, c[1] + ny / length * d / cos))
    return out


def on_side(side):
    """Places [x, y] on a bodyside, `t` metres in from the surface."""
    return lambda p, t: Vector((p[0], side * (half_width(p[1]) - t), p[1]))


def on_front(p, t):
    """Places [z, y] on the leading car's face, `t` metres in from the surface."""
    return Vector((nose_x_clamped(p[1], p[0]) + t, p[0], p[1]))


def cutter(name, pts, place, depth, floor, walls, collection):
    """A solid that cuts an opening to `depth` below the surface, its floor
    following the surface. The cut takes `floor` and `walls` materials."""
    check_outline(name, pts, place)
    outer = [place(p, -0.3) for p in pts]
    inner = [place(p, depth) for p in pts]
    n = len(pts)
    verts = outer + inner
    faces = [list(range(n))[::-1], list(range(n, 2 * n))]
    faces += [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    obj = mesh_from(name, verts, faces, [floor, walls], [0, 0] + [1] * n, smooth=False)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bm.to_mesh(obj.data)
    bm.free()
    obj.hide_render = True
    obj.display_type = "WIRE"
    return link(obj, collection)


def groove(name, pts, place, width, depth, material, collection):
    """A narrow groove along a closed outline: a door's edge, a gangway door's."""
    check_outline(name, pts, place)
    obj = ring_solid(name, offset(pts, width / 2), offset(pts, -width / 2), place, -0.3, depth, material, collection)
    obj.hide_render = True
    obj.display_type = "WIRE"
    return obj


def ring_solid(name, outer, inner, place, t0, t1, material, collection=None):
    """A solid ring between two outlines of the same count, from t0 to t1
    below the surface (negative stands proud of it)."""
    n = len(outer)
    loops = [[place(p, t0) for p in outer], [place(p, t1) for p in outer], [place(p, t0) for p in inner], [place(p, t1) for p in inner]]
    verts = [v for loop in loops for v in loop]
    o = [k * n for k in range(4)]
    faces = []
    for i in range(n):
        j = (i + 1) % n
        faces.append((o[0] + i, o[0] + j, o[2] + j, o[2] + i))
        faces.append((o[1] + i, o[3] + i, o[3] + j, o[1] + j))
        faces.append((o[0] + i, o[1] + i, o[1] + j, o[0] + j))
        faces.append((o[2] + i, o[2] + j, o[3] + j, o[3] + i))
    obj = mesh_from(name, verts, faces, [material], smooth=False)
    return link(obj, collection)


def gasket(name, pts, place, material, radius=0.011):
    """A rubber seal round an opening, standing just proud of the surface."""
    check_outline(name, pts)
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new("POLY")
    spline.points.add(len(pts) - 1)
    for sp, p in zip(spline.points, pts):
        v = place(p, -0.002)
        sp.co = (v.x, v.y, v.z, 1)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new(name, curve)
    obj.data.materials.append(material)
    return link(obj)


def cylinder(name, start, end, radius, material, vertices=32):
    a, b = Vector(start), Vector(end)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=d.length, location=(a + b) / 2)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    bevel = obj.modifiers.new("bevel", "BEVEL")
    bevel.width = min(radius * 0.25, 0.012)
    bevel.segments = 2
    bevel.limit_method = "ANGLE"
    return obj


def sphere(name, centre, radius, material, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=radius, location=centre)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj


def closed(obj):
    """Whether a mesh is watertight: every edge between exactly two faces."""
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    ok = all(e.is_manifold for e in bm.edges)
    bm.free()
    return ok


def box(name, x0, x1, y0, y1, z0, z1, material, bevel=0.03, segments=3):
    """An axis-aligned box in Blender coordinates, its edges rounded."""
    # Built from data, not operators: each operator call updates the whole scene (0.6 s a box).
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=(x1 - x0, y1 - y0, z1 - z0), verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    obj = link(bpy.data.objects.new(name, me))
    obj.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    if bevel:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = min(bevel, (x1 - x0) / 2.1, (y1 - y0) / 2.1, (z1 - z0) / 2.1)
        mod.segments = segments
        mod.limit_method = "NONE"
        mod.harden_normals = True
    obj.data.materials.append(material)
    me.shade_smooth()
    return obj


# --- The shells --------------------------------------------------------------------------


def load_shell(car, material):
    base = os.path.join(SRC, car["mesh"])
    v = np.fromfile(base + ".v.bin", dtype=np.float32).reshape(-1, 3)
    q = np.fromfile(base + ".q.bin", dtype=np.uint32).reshape(-1, 4)
    t = np.fromfile(base + ".t.bin", dtype=np.uint32).reshape(-1, 3)
    verts = np.stack([v[:, 0], v[:, 2], v[:, 1]], axis=1)
    faces = [tuple(f) for f in q.tolist()] + [tuple(f) for f in t.tolist()]
    obj = mesh_from(car["mesh"], verts, faces, [material])
    obj.data.set_sharp_from_angle(angle=math.radians(50))
    return link(obj)


def decals(spec, p):
    """A long nose's glazing, surrounds and panel, laid on its surface."""
    base = os.path.join(SRC, spec["mesh"])
    v = np.fromfile(base + ".v.bin", dtype=np.float32).reshape(-1, 3)
    q = np.fromfile(base + ".q.bin", dtype=np.uint32).reshape(-1, 4)
    t = np.fromfile(base + ".t.bin", dtype=np.uint32).reshape(-1, 3)
    m = np.fromfile(base + ".m.bin", dtype=np.uint8)
    n = np.fromfile(base + ".n.bin", dtype=np.float32).reshape(-1, 3)
    lift = np.fromfile(base + ".l.bin", dtype=np.float32)
    raised = np.fromfile(base + ".r.bin", dtype=np.float32)
    verts = np.stack([v[:, 0], v[:, 2], v[:, 1]], axis=1)
    normals = np.stack([n[:, 0], n[:, 2], n[:, 1]], axis=1)

    # Each vertex laid onto the shell as built, along the surface's normal,
    # at its layer's lift: so nothing sinks into the body's facets or
    # floats off it.
    shell = bpy.data.objects[SCENE["cars"][0]["mesh"]].data
    tree = BVHTree.FromPolygons([vv.co[:] for vv in shell.vertices], [pp.vertices[:] for pp in shell.polygons])
    missed = []
    for i in range(len(verts)):
        origin = Vector(verts[i]) + Vector(normals[i]) * 0.05
        hit, _, _, _ = tree.ray_cast(origin, -Vector(normals[i]), 0.1)
        if hit is None:
            missed.append(i)
            hit = tree.find_nearest(Vector(verts[i]))[0]
        verts[i] = hit + Vector(normals[i]) * float(lift[i])
        # A raised point lifted a long way where the shell folds (a nose's
        # centre line) comes nearer the facets either side than its lift:
        # carried on until it stands that far from all of them.
        if raised[i] > 0:
            for _ in range(4):
                gap = (Vector(verts[i]) - tree.find_nearest(Vector(verts[i]))[0]).length
                if gap >= lift[i] - 1e-6:
                    break
                verts[i] = Vector(verts[i]) + Vector(normals[i]) * (float(lift[i]) - gap) * 1.2
    where = ""
    if missed:
        pts = verts[missed]
        where = " between " + ", ".join(f"{a}={pts[:, k].min():.2f}..{pts[:, k].max():.2f}" for k, a in enumerate("xyz"))
    report("surface", "decal vertices laid on the shell", not missed, f"{len(missed)} of {len(verts)} found no shell under them{where}")

    # How far every vertex sits from the shell, the nearest way.
    # Measured from the body, less what a raised panel adds by design.
    gaps = np.array([(Vector(verts[i]) - tree.find_nearest(Vector(verts[i]))[0]).length for i in range(len(verts))]) - raised
    worst = int(gaps.argmax())
    nearest = int(gaps.argmin())
    low, high = float(gaps.min()), float(gaps.max())
    report("surface", "decal clearance", 0.0004 <= low and high <= 0.0031,
           f"{low * 1000:.2f} to {high * 1000:.2f} mm off the body (allowed 0.4 to 3.1); furthest at {tuple(round(float(c), 3) for c in verts[worst])}"
           f", closest at {tuple(round(float(c), 3) for c in verts[nearest])}")
    layers = sorted(set(round(float(x), 6) for x in lift - raised))
    report("z-fighting", "decal layers", all(b - a >= 0.00025 for a, b in zip(layers, layers[1:])),
           "layers at " + ", ".join(f"{x * 1000:.2f}" for x in layers) + " mm")

    faces = [tuple(f) for f in q.tolist()] + [tuple(f) for f in t.tolist()]
    obj = mesh_from("nose decals", verts, faces, [p.named(name) for name in spec["materials"]], m.tolist(), normals=normals)
    if raised.max() > 0:
        # A raised panel shades by its own shape, its step included; the
        # rest keeps the body's smooth normals.
        me = obj.data
        me.normals_split_custom_set_from_vertices([(0, 0, 0)] * len(me.vertices))
        geometric = [v.normal.copy() for v in me.vertices]
        me.normals_split_custom_set_from_vertices(
            [tuple(geometric[i]) if raised[i] > 1e-5 else tuple(normals[i]) for i in range(len(me.vertices))])
    return link(obj)


def antenna(x, p):
    """A small aerial dome on the nose's top, x back from the tip."""
    lo, hi = H["bottom"], H["roof"]
    for _ in range(40):
        mid = (lo + hi) / 2
        if (nose_x(mid, 0.0) or 0.0) < x:
            lo = mid
        else:
            hi = mid
    sphere("antenna", (x, 0, lo - 0.01), 1, p.black, scale=(0.09, 0.09, 0.035))


def grab_rails(k, door, p):
    """Grab rails up both sides of a cab door, on standoffs off the body."""
    y0, y1 = door["lo"] + 0.35, door["hi"] - 0.25
    for side in (-1, 1):
        for dx in (-door["w"] / 2 - 0.07, door["w"] / 2 + 0.07):
            x = door["x"] + dx
            out = lambda y, t: Vector((x, side * (half_width(y) + t), y))
            cylinder(f"grab rail{k}", out(y0, 0.045), out(y1, 0.045), 0.014, p.steel_bright, vertices=16)
            for y in (y0, y1):
                cylinder(f"grab stand{k}", out(y, -0.01), out(y, 0.05), 0.011, p.steel_bright, vertices=12)


def car_of(x):
    cars = SCENE["cars"]
    return 0 if x < cars[0]["x0"] + cars[0]["length"] + 0.3 else 1


def build(p):
    """Builds the shells with everything set into them. `p` is the palette."""
    shells = [load_shell(car, p.body) for car in SCENE["cars"]]
    cuts = [bpy.data.collections.new(f"cuts{i}") for i in range(len(shells))]
    for c in cuts:
        bpy.context.scene.collection.children.link(c)

    # Bodyside glazing, both sides.
    for k, pane in enumerate(FEATURES["panes"]):
        car = car_of(sum(q[0] for q in pane) / len(pane))
        for side in (-1, 1):
            place = on_side(side)
            cutter(f"pane{k}", pane, place, PANE_DEPTH, p.glass, p.rubber if GASKET else p.black, cuts[car])
            if GASKET:
                gasket(f"gasket{k}", pane, place, p.rubber)

    # Door edges and the joint between a pair of leaves.
    for k, door in enumerate(FEATURES["doors"]):
        car = car_of(door["x"])
        half = door["w"] / 2
        outline = rounded_rect(door["x"] - half, door["lo"], door["x"] + half, door["hi"], 0.05)
        for side in (-1, 1):
            place = on_side(side)
            groove(f"door{k}", outline, place, 0.012, 0.014, p.rubber, cuts[car])
            if door["leaves"] == 2:
                split = rounded_rect(door["x"] - 0.005, door["lo"] + 0.01, door["x"] + 0.005, door["hi"] - 0.01, 0.005)
                cutter(f"split{k}", split, place, 0.014, p.rubber, p.rubber, cuts[car])

    if SCENE["decals"]:
        decals(SCENE["decals"], p)

    if SCENE["antenna"] is not None:
        antenna(SCENE["antenna"], p)
    for k, door in enumerate(FEATURES["doors"]):
        if door["cab"]:
            grab_rails(k, door, p)

    face = FEATURES["face"]
    if face:
        front_details(face, p, cuts[0])

    for shell, collection in zip(shells, cuts):
        if not collection.objects:
            continue
        # An uncut copy to take shading from.
        source = shell.copy()
        source.data = shell.data.copy()
        source.hide_render = True
        source.name = shell.name + " smooth"
        link(source)
        cut = shell.modifiers.new("cut", "BOOLEAN")
        cut.operation = "DIFFERENCE"
        cut.operand_type = "COLLECTION"
        cut.collection = collection
        # Manifold is ~150x faster (0.4 s vs 65 s a train) but needs closed meshes; exact otherwise.
        cut.solver = "MANIFOLD" if all(closed(o) for o in (shell, *collection.objects)) else "EXACT"
        cut.material_mode = "TRANSFER"
        shading = shell.modifiers.new("shading", "DATA_TRANSFER")
        shading.object = source
        shading.use_loop_data = True
        shading.data_types_loops = {"CUSTOM_NORMAL"}
        shading.loop_mapping = "POLYINTERP_NEAREST"
    return shells


def rounded_rect(x0, y0, x1, y1, r, per=8):
    r = min(r, (x1 - x0) / 2, (y1 - y0) / 2)
    out = []
    for cx, cy, start in ((x1 - r, y0 + r, -90), (x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180)):
        for i in range(per + 1):
            a = math.radians(start + 90 * i / per)
            out.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return out


# --- The face of a flat front ------------------------------------------------------------


def bounds(pts):
    zs, ys = [q[0] for q in pts], [q[1] for q in pts]
    return min(zs), max(zs), min(ys), max(ys)


def front_details(face, p, collection):
    # Windscreens and the gangway door's window, set in gaskets, with wipers.
    for k, screen in enumerate(face["screens"]):
        cutter(f"screen{k}", screen, on_front, PANE_DEPTH, p.glass, p.rubber if GASKET else p.black, collection)
        if GASKET:
            gasket(f"screen gasket{k}", screen, on_front, p.rubber, radius=0.013)
    # Grilles on a flat face: a perforated panel just proud of the paint.
    for k, gr in enumerate(face.get("grilles") or []):
        cover(f"face grille{k}", gr, -0.002, p.face_grille)
    # Recesses cut back into the face (the coupler's, between the skirts).
    for k, r in enumerate(face.get("recesses") or []):
        cutter(f"recess{k}", r["outline"], on_front, r["depth"], p.black, p.black, collection)
    # Wipers on every screen wide enough for one, cut in or laid on.
    for k, w in enumerate(face["wipers"]):
        wiper(k, w["pivot"], w["tip"], -0.006 if face["laidOn"] else PANE_DEPTH, p)

    # Lamp clusters: a black recess cut into the body along its normal,
    # holding a chrome reflector with its bulb and a red tail lamp (fitted
    # inside the housing by scene.ts), under a clear cover flush with the
    # surface.
    for k, lamp in enumerate(face["lamps"]):
        housing = offset(lamp, 0.012)
        rim = p.black if face.get("lampRim") == "black" else p.chrome
        tail = p.diffuser if face.get("tailLens") == "clear" else p.tail
        if face.get("lampStyle") == "glazed":
            glazed_lamp(k, lamp, face["lampUnits"][k], p, collection, face.get("glazedTail"))
            continue
        if face.get("lampStyle") == "flush":
            # Flush: a shallow black pocket under one clear cover that
            # follows the surface; behind it a shallow reflector and a
            # round LED cluster, nothing standing proud.
            cutter(f"lamp{k}", housing, on_front_normal, 0.014, p.black, p.black, collection)
            for i, unit in enumerate(face["lampUnits"][k]):
                c, r = (unit["x"], unit["y"]), unit["r"]
                if unit["kind"] == "head":
                    cylinder(f"reflector{k}{i}", on_front_normal(c, 0.0135), on_front_normal(c, 0.009), r, p.chrome)
                    sphere(f"bulb{k}{i}", on_front_normal(c, 0.009), r * 0.22, p.bulb)
                else:
                    cylinder(f"led cluster{k}{i}", on_front_normal(c, 0.0135), on_front_normal(c, 0.009), r, p.led)
            cover(f"lamp cover{k}", housing, 0.002, p.cover)
            continue
        back = p.named(f"paint:{face['lampBack']}") if face.get("lampBack") else p.metal
        cutter(f"lamp{k}", housing, on_front_normal, 0.07, back, rim, collection)
        for i, unit in enumerate(face["lampUnits"][k]):
            c, r = (unit["x"], unit["y"]), unit["r"]
            head = unit["kind"] == "head"
            if unit["kind"] == "marker":
                # A small white marker: an LED cluster, unlit, behind the cover.
                cylinder(f"marker{k}{i}", on_front_normal(c, 0.068), on_front_normal(c, 0.052), r, p.led)
                continue
            cylinder(f"reflector{k}{i}", on_front_normal(c, 0.068), on_front_normal(c, 0.052), r, p.chrome if head else tail)
            if head:
                sphere(f"bulb{k}{i}", on_front_normal(c, 0.045), r * 0.32, p.bulb)
        cover(f"lamp cover{k}", housing, 0.003, p.cover)

    # Pockets cut back into the face: a coupler's opening between bumper blocks.
    for k, pocket in enumerate(face.get("pockets") or []):
        cutter(f"pocket{k}", pocket["outline"], on_front, pocket["depth"], p.recess, p.recess, collection)

    # Blocks standing out ahead of the face, ribbed across: anticlimbers.
    for k, block in enumerate(face.get("blocks") or []):
        out = block["outline"]
        front = min(nose_x_clamped(y, z) for z, y in out)
        prism(f"block{k}", out, front - block["depth"], front + 0.15, p.black, bevel=0.012)
        z0, z1, y0, y1 = bounds(out)
        n = block.get("ribs") or 0
        for i in range(n):
            # Each rib a bar across the block's front, a little proud of it.
            yc = y0 + (y1 - y0) * (i + 0.5) / n
            hb = (y1 - y0) / n * 0.28
            box(f"block{k} rib{i}", front - block["depth"] - 0.018, front - block["depth"] + 0.02, z0 + 0.012, z1 - 0.012, yc - hb, yc + hb, p.black, bevel=0.006)

    # The unit number, white on the black panel under a windscreen, or as the class says.
    if face["number"]:
        spec = face["number"]
        number(spec, p)
        if spec.get("both"):
            number({**spec, "at": (-spec["at"][0], spec["at"][1])}, p)

    if face["gangway"] and face["gangwayFrame"]:
        gangway_box(face["gangway"], face["gangwayFrame"], p)
    # The gangway door: its edge as a gap, the rubber surround standing
    # proud round it, hinges down one side, a handle.
    elif face["gangway"]:
        door = face["gangway"]
        groove("gangway door", door, on_front, 0.012, 0.02, p.rubber, collection)
        if face.get("gangwayMount", "surround") == "surround":
            surround = ring_solid("gangway surround", offset(door, 0.2), offset(door, 0.012), on_front, -0.07, 0.02, p.studded)
            bevel = surround.modifiers.new("bevel", "BEVEL")
            bevel.width = 0.02
            bevel.segments = 3
            bevel.limit_method = "ANGLE"
        z0, z1, y0, y1 = bounds(door)
        for y in (y0 + 0.35, y1 - 0.35):
            s = nose_x_clamped(y, z0 + 0.03)
            box("hinge", s - 0.02, s + 0.01, z0 + 0.005, z0 + 0.06, y - 0.06, y + 0.06, p.metal, bevel=0.008)
        hy = (y0 + y1) / 2 - 0.15
        s = nose_x_clamped(hy, z1 - 0.07)
        cylinder("handle", (s - 0.035, z1 - 0.07, hy - 0.09), (s - 0.035, z1 - 0.07, hy + 0.09), 0.012, p.metal)
        cylinder("handle stem", (s - 0.035, z1 - 0.07, hy), (s + 0.005, z1 - 0.07, hy), 0.008, p.metal)


def glazed_lamp(k, lamp, units, p, collection, tail_lens=None):
    """A lamp under clear glass, as on a Hitachi's nose: a deep dark recess
    cut along the surface's normal, a thin raised lip of body colour round
    its outline, the glass flush with the surface, and behind it a
    honeycomb LED cluster (its emitters each modelled) and a chrome
    headlamp reflector with its lamp."""
    housing = offset(lamp, 0.012)
    cutter(f"lamp{k}", housing, on_front_normal, LAMP_DEPTH, p.recess, p.recess, collection)
    lip = ring_solid(f"lamp lip{k}", offset(housing, LIP_WIDTH), offset(housing, -0.002), on_front_normal, -LIP_RISE, 0.008, p.body)
    bevel = lip.modifiers.new("bevel", "BEVEL")
    bevel.width = 0.003
    bevel.segments = 2
    bevel.limit_method = "ANGLE"
    # The joint round the lip, where the lamp's moulding meets the body.
    groove(f"lamp joint{k}", offset(housing, LIP_WIDTH + 0.004), on_front_normal, 0.004, 0.006, p.seam, collection)
    for i, unit in enumerate(units):
        c, r = (unit["x"], unit["y"]), unit["r"]
        if unit["kind"] == "head":
            # The reflector bowl, the lamp in its middle, a dark bezel round it.
            cylinder(f"headlamp bezel{k}{i}", on_front_normal(c, LAMP_DEPTH - 0.002), on_front_normal(c, 0.026), r, p.black)
            cylinder(f"reflector{k}{i}", on_front_normal(c, 0.027), on_front_normal(c, 0.024), r * 0.86, p.chrome)
            sphere(f"bulb{k}{i}", on_front_normal(c, 0.022), r * 0.2, p.bulb)
            # The lens's row of bright prisms under the lamp.
            for j in range(6):
                q = (c[0] + (j - 2.5) * r * 0.14, c[1] - r * 0.45)
                cylinder(f"prism{k}{i}{j}", on_front_normal(q, 0.024), on_front_normal(q, 0.02), r * 0.045, p.chrome, vertices=8)
        else:
            cylinder(f"led ring{k}{i}", on_front_normal(c, LAMP_DEPTH - 0.002), on_front_normal(c, 0.027), r, p.chrome)
            cylinder(f"led board{k}{i}", on_front_normal(c, 0.03), on_front_normal(c, 0.026), r * 0.93, p.led_board)
            led_dots(f"leds{k}{i}", c, r, 0.026, p.tail if tail_lens == "red" else p.led_dot)
            if tail_lens == "red":
                # The tail's own red lens over its LEDs, just behind the cover.
                cylinder(f"tail lens{k}{i}", on_front_normal(c, 0.016), on_front_normal(c, 0.013), r, p.red_lens)
    cover(f"lamp cover{k}", offset(housing, -0.001), 0.003, p.lamp_glass)


# Glazed lamps: how deep the recess behind the glass is, and the lip round it.
LAMP_DEPTH = 0.06
LIP_WIDTH = 0.014
LIP_RISE = 0.003
# An LED cluster's emitters: a honeycomb, this far apart for a cluster of
# radius 1, each this big; the outer ring this far in from the edge.
LED_PITCH = 0.26
LED_SIZE = 0.075
LED_EDGE = 0.86


def led_dots(name, centre, r, depth, material):
    """The emitters of a round LED cluster, a honeycomb of small domes on
    its board, as one mesh."""
    o = on_front_normal(centre, depth)
    n = (on_front_normal(centre, depth - 0.01) - o).normalized()
    u = n.cross(Vector((0.0, 0.0, 1.0))).normalized()
    v = u.cross(n).normalized()
    pitch, size = LED_PITCH * r, LED_SIZE * r
    verts, faces = [], []
    rows = int(LED_EDGE / LED_PITCH / 0.866) + 1
    for j in range(-rows, rows + 1):
        b = j * pitch * 0.866
        shift = pitch / 2 if j % 2 else 0.0
        for i in range(-rows - 1, rows + 2):
            a = i * pitch + shift
            if math.hypot(a, b) > LED_EDGE * r - size:
                continue
            base = len(verts)
            mid = o + u * a + v * b
            ring = 10
            for q in range(ring):
                t = q / ring * math.tau
                verts.append(mid + (u * math.cos(t) + v * math.sin(t)) * size)
            verts.append(mid + n * size * 0.6)
            for q in range(ring):
                faces.append((base + q, base + (q + 1) % ring, base + ring))
    return link(mesh_from(name, verts, faces, [material]))


def prism(name, outline, x0, x1, material, bevel=0.0):
    """An outline on the front ([z, y]) carried straight along the train from x0 to x1, capped."""
    n = len(outline)
    verts = [Vector((x, z, y)) for x in (x0, x1) for z, y in outline]
    faces = [tuple(range(n))[::-1], tuple(range(n, 2 * n))]
    for i in range(n):
        j = (i + 1) % n
        faces.append((i, j, n + j, n + i))
    obj = link(mesh_from(name, verts, faces, [material], smooth=False))
    if bevel:
        b = obj.modifiers.new("bevel", "BEVEL")
        b.width = bevel
        b.segments = 3
        b.limit_method = "ANGLE"
    return obj


def clip_below(outline, top):
    """The part of a closed outline ([z, y]) below the height `top`."""
    out = []
    n = len(outline)
    for i in range(n):
        a, b = outline[i], outline[(i + 1) % n]
        if a[1] <= top:
            out.append(a)
        if (a[1] <= top) != (b[1] <= top):
            t = (top - a[1]) / (b[1] - a[1])
            out.append((a[0] + (b[0] - a[0]) * t, top))
    return out


def gangway_box(door, frame, p):
    """A gangway standing out ahead of the face: the dark frame round the
    door at the front, grey bellows behind it back to the face, the door
    flush in the frame with its seams, hinges and handle."""
    outline = resample_even(frame["outline"], 0.01)
    rake = frame.get("rake") or 0.0
    before = set(bpy.data.objects)
    if rake:
        # Leaning back with a raked face: built upright from its foot, then sheared.
        foot = min(y for _, y in outline)
        face_x = min(nose_x_clamped(y, z) for z, y in outline if y < foot + 0.05)
    else:
        face_x = min(nose_x_clamped(y, z) for z, y in outline)
    front = face_x - frame["depth"]
    # Bellows: folds of rubber from the face forward to the frame.
    inner = offset(outline, -0.035)
    bellows = p.named(f"paint:{frame['bellows']}") if frame.get("bellows") else p.bellows
    prism("gangway bellows", inner, front + 0.1, face_x + 0.08, bellows)
    folds = max(3, int((face_x - front - 0.1) / 0.06))
    for i in range(folds):
        x = front + 0.1 + (face_x - front - 0.1) * (i + 0.5) / folds
        prism("gangway fold", offset(outline, -0.015), x - 0.012, x + 0.012, bellows, bevel=0.006)
    frame_material = p.named(f"paint:{frame['color']}") if frame.get("color") else p.studded
    prism("gangway frame", outline, front, front + 0.12, frame_material, bevel=0.02)
    # The door, a few millimetres proud of the frame, its edge a dark gap.
    prism("gangway door gap", offset(door, 0.012), front - 0.002, front + 0.05, p.rubber)
    prism("gangway door", door, front - 0.008, front + 0.05, p.gangway_door)
    if frame.get("lower"):
        # Its lower part in another colour, a skin of paint over the door.
        below = clip_below(door, frame["lower"]["to"])
        if len(below) >= 3:
            prism("gangway door lower", below, front - 0.0088, front - 0.0078, p.named(f"paint:{frame['lower']['color']}"))
    z0, z1, y0, y1 = bounds(door)
    for f in frame["seams"]:
        z = z0 + (z1 - z0) * f
        box("gangway seam", front - 0.0095, front - 0.007, z - 0.004, z + 0.004, y0 + 0.04, y1 - 0.04, p.seam, bevel=0.001)
    for y in (y0 + 0.35, y1 - 0.35):
        box("hinge", front - 0.03, front, z0 + 0.005, z0 + 0.06, y - 0.06, y + 0.06, p.metal, bevel=0.008)
    if rake:
        for obj in set(bpy.data.objects) - before:
            for v in obj.data.vertices:
                v.co.x += rake * (v.co.z + obj.location.z - foot)


def surface_slope(y, z, e=0.01):
    """How the face's surface (x back from the tip) changes across and up, at (y, z)."""

    def diff(f0, f1, step):
        if f0 is not None and f1 is not None:
            return (f1 - f0) / step
        return None

    here = nose_x(y, z)
    dz = diff(nose_x(y, z - e), nose_x(y, z + e), 2 * e)
    if dz is None:
        dz = diff(nose_x(y, z - e), here, e) if z > 0 else diff(here, nose_x(y, z + e), e)
    dy = diff(nose_x(y - e, z), nose_x(y + e, z), 2 * e)
    if dy is None:
        dy = diff(nose_x(y - e, z), here, e) or diff(here, nose_x(y + e, z), e) or 0.0
    return dz or 0.0, dy


def on_front_normal(q, t):
    """A point [z, y] of the face `t` metres in from the surface along its normal."""
    z, y = q
    x = nose_x_clamped(y, z)
    dz, dy = surface_slope(y, z)
    inward = Vector((1.0, -dz, -dy)).normalized()
    return Vector((x, z, y)) + inward * t


def cover(name, outline, t, material, rings=10):
    """A thin sheet filling an outline on the face, `t` metres in from the
    surface: rings of the outline shrinking to its middle, so it follows
    the surface's curve."""
    cz = sum(q[0] for q in outline) / len(outline)
    cy = sum(q[1] for q in outline) / len(outline)
    n = len(outline)
    verts, faces = [], []
    for k in range(rings):
        f = 1 - k / rings
        verts.extend(on_front_normal((cz + (q[0] - cz) * f, cy + (q[1] - cy) * f), t) for q in outline)
    verts.append(on_front_normal((cz, cy), t))
    for k in range(rings - 1):
        for i in range(n):
            j = (i + 1) % n
            faces.append((k * n + i, k * n + j, (k + 1) * n + j, (k + 1) * n + i))
    centre = len(verts) - 1
    last = (rings - 1) * n
    for i in range(n):
        faces.append((last + i, last + (i + 1) % n, centre))
    return link(mesh_from(name, verts, faces, [material]))


def number(spec, p):
    """White numerals on the face, standing just proud of it."""
    curve = bpy.data.curves.new("number", "FONT")
    curve.body = spec["text"]
    curve.size = spec["height"] * 1.35
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.extrude = 0.0008
    if spec.get("weight") == "light":
        # A light sans: Arial where the system has it, its strokes thinned.
        path = "/System/Library/Fonts/Supplemental/Arial.ttf"
        if os.path.exists(path):
            curve.font = bpy.data.fonts.load(path, check_existing=True)
        curve.offset = -0.045 * spec["height"]
    curve.materials.append(p.named(f"paint:{spec['color']}") if spec.get("color") else p.white)
    obj = bpy.data.objects.new("number", curve)
    z, y = spec["at"]
    at = on_front_normal((z, y), -0.004)
    obj.location = at
    # Text lies in its local XY plane facing +Z: turn it to face forward
    # (-X), reading across the train from the viewer's left.
    dz, dy = surface_slope(y, z)
    outward = -Vector((1.0, -dz, -dy)).normalized()
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = outward.to_track_quat("Z", "Y")
    return link(obj)


def wiper(k, pivot, tip, glass, p):
    """A parked wiper from pivot to tip on the glass, which lies `glass`
    metres in from the surface: arm, blade and the pivot's boss."""
    length = math.hypot(tip[0] - pivot[0], tip[1] - pivot[1])
    lo = (pivot[0] + (tip[0] - pivot[0]) * 0.12 / length, pivot[1] + (tip[1] - pivot[1]) * 0.12 / length)
    # Arm and blade follow the glass's curve: each built through points
    # set off the surface along its normal, so they never cut into it.
    conforming(f"wiper arm{k}", pivot, tip, glass - 0.022, glass - 0.016, 0.008, p.metal)
    conforming(f"wiper blade{k}", lo, tip, glass - 0.009, glass - 0.009, 0.006, p.rubber)
    cylinder(f"wiper pivot{k}", on_front_normal(pivot, glass - 0.03), on_front_normal(pivot, glass - 0.002), 0.02, p.metal,
             vertices=16)


def conforming(name, a, b, ta, tb, radius, material, steps=24):
    """A rod from face point a to b, held off the surface by ta..tb (negative is outward)."""
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    curve.use_fill_caps = True
    spline = curve.splines.new("POLY")
    spline.points.add(steps)
    for i in range(steps + 1):
        t = i / steps
        q = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
        v = on_front_normal(q, ta + (tb - ta) * t)
        spline.points[i].co = (v.x, v.y, v.z, 1)
    curve.materials.append(material)
    return link(bpy.data.objects.new(name, curve))


# --- Between and under the cars ---------------------------------------------------------------


def bellows(p):
    """Concertina bellows between the cars."""
    for a, b in SCENE["gangways"]:
        half = SCENE["width"] / 2 * 0.72
        lo, hi = H["bottom"] + 0.3, H["cantrail"] - 0.02
        box("bellows", a - 0.2, b + 0.2, -half, half, lo, hi, p.rubber, bevel=0.1)
        n = max(3, int((b - a + 0.4) / 0.07))
        for i in range(n):
            x = a - 0.18 + (b - a + 0.36) * (i + 0.5) / n
            box("fold", x - 0.018, x + 0.018, -half - 0.03, half + 0.03, lo - 0.03, hi + 0.03, p.rubber, bevel=0.015)


# Couplers by type (model/gear.ts COUPLERS): the head's face size and
# whether an electrical head rides below it.
COUPLER_TYPES = {
    "dellner": (0.3, True),
    "scharfenberg": (0.34, True),
    "bsi": (0.32, False),
    "tightlock": (0.28, False),
}


def coupler(p):
    cp = SCENE["coupler"]
    if cp is None:
        return
    x, y = cp["x"], cp["y"]
    kind = SCENE["gear"]["coupler"]
    if kind != "generic":
        typed_coupler(p, kind, x, y)
        return
    cylinder("coupler shank", (x + 0.6, 0, y), (x - 0.15, 0, y), 0.075, p.under)
    box("coupler head", x - 0.36, x - 0.12, -0.19, 0.19, y - 0.17, y + 0.17, p.under, bevel=0.035)
    box("coupler face", x - 0.38, x - 0.34, -0.15, 0.15, y - 0.13, y + 0.13, p.metal, bevel=0.01)
    for z in (-0.13, 0.13):
        cylinder("air pipe", (x + 0.1, z, y - 0.05), (x - 0.25, z, y - 0.22), 0.022, p.rubber, vertices=12)


def typed_coupler(p, kind, x, y):
    """A coupler of a known type, its head forward of the nose face at x
    (negative is forward), centred y up."""
    face, electrical = COUPLER_TYPES[kind]
    h = face / 2
    cylinder("coupler shank", (x + 0.6, 0, y), (x - 0.14, 0, y), 0.075, p.under)
    if kind in ("dellner", "scharfenberg"):
        # Square head; on its face a cone beside a funnel, the air ports between.
        box("coupler head", x - 0.36, x - 0.12, -h, h, y - h, y + h, p.under, bevel=0.03)
        box("coupler face", x - 0.38, x - 0.355, -h + 0.02, h - 0.02, y - h + 0.02, y + h - 0.02, p.metal, bevel=0.008)
        cylinder("coupler cone", (x - 0.38, h * 0.5, y + h * 0.15), (x - 0.43, h * 0.5, y + h * 0.15), 0.055, p.metal, vertices=24)
        cylinder("coupler cone tip", (x - 0.43, h * 0.5, y + h * 0.15), (x - 0.47, h * 0.5, y + h * 0.15), 0.03, p.metal, vertices=24)
        cylinder("coupler funnel", (x - 0.383, -h * 0.5, y + h * 0.15), (x - 0.375, -h * 0.5, y + h * 0.15), 0.06, p.rubber, vertices=24)
        for z in (-0.05, 0.05):
            cylinder("coupler port", (x - 0.386, z, y - h * 0.45), (x - 0.376, z, y - h * 0.45), 0.018, p.rubber, vertices=16)
    elif kind == "bsi":
        # Round head, flat face with the hook and buffer ring proud of it.
        cylinder("coupler head", (x - 0.12, 0, y), (x - 0.36, 0, y), h, p.under, vertices=40)
        cylinder("coupler face", (x - 0.36, 0, y), (x - 0.38, 0, y), h - 0.03, p.metal, vertices=40)
        cylinder("coupler ring", (x - 0.38, 0, y), (x - 0.395, 0, y), h * 0.45, p.under, vertices=32)
        box("coupler hook", x - 0.43, x - 0.37, h * 0.3, h * 0.55, y - 0.05, y + 0.05, p.metal, bevel=0.01)
    else:
        # Tightlock: a knuckle upright on one side of the head, a guard arm on the other.
        box("coupler head", x - 0.34, x - 0.12, -h, h, y - h * 0.85, y + h * 0.85, p.under, bevel=0.03)
        cylinder("coupler knuckle", (x - 0.39, h * 0.55, y - h), (x - 0.39, h * 0.55, y + h), 0.055, p.under, vertices=24)
        box("coupler guard arm", x - 0.42, x - 0.32, -h, -h * 0.4, y - h * 0.6, y + h * 0.6, p.under, bevel=0.02)
    if electrical:
        # The electrical head on its slide below.
        box("electrical head", x - 0.34, x - 0.1, -h * 0.9, h * 0.9, y - h - 0.17, y - h - 0.04, p.under, bevel=0.02)
        box("electrical face", x - 0.355, x - 0.335, -h * 0.8, h * 0.8, y - h - 0.15, y - h - 0.06, p.rubber, bevel=0.006)
    for z in (-h + 0.02, h - 0.02):
        cylinder("air pipe", (x + 0.1, z, y - 0.05), (x - 0.25, z, y - 0.22), 0.022, p.rubber, vertices=12)


def plough(p):
    """A snowplough under the leading end (model/types.ts Plough): a bent
    steel plate, its point on the centre line leading its outer ends, the
    foot raked forward of the top, given thickness so it reads from the side."""
    pl = SCENE.get("plough")
    if not pl:
        return
    from materials import paint
    from common import srgb
    mat = paint("plough", srgb(pl["color"]))
    x0, hw, rake = pl["x"], pl["halfWidth"], pl.get("rake", 0.08)
    verts, faces = [], []
    for z in (-hw, 0.0, hw):
        lead = pl["ahead"] if z == 0.0 else pl["sides"]
        verts.append((x0 - lead, z, pl["top"]))
        verts.append((x0 - lead - rake, z, pl["bottom"]))
    faces = [(0, 1, 3, 2), (2, 3, 5, 4)]
    obj = mesh_from("plough", verts, faces, [mat], smooth=False)
    solid = obj.modifiers.new("thickness", "SOLIDIFY")
    solid.thickness = 0.025
    link(obj)
    report("plough", "snowplough", True, f"{2 * hw:.2f} m wide, {pl['bottom']:.2f}-{pl['top']:.2f} m up, point {pl['ahead']:.2f} m ahead of the face")
