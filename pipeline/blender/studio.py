"""The studio: soft area lights for shape, an environment for reflections,
a floor that only keeps the shadow, the optional length of track, and the
cameras."""

import json
import math
import os

import bpy
import numpy as np
from mathutils import Vector

from body import box, link
from common import DEBUG, SCENE, TRACK, Graph, new_material, output, principled, report, srgb

HDRI = os.environ.get("TRAIN_HDRI", "city")


def area(name, location, target, size, power, colour=(1, 1, 1)):
    data = bpy.data.lights.new(name, "AREA")
    data.shape = "RECTANGLE"
    data.size, data.size_y = size
    data.energy = power
    data.color = colour
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = (Vector(target) - Vector(location)).to_track_quat("-Z", "Y")
    # Diffuse light only: reflections come from the environment, so paint
    # takes its shape from these and never a hot highlight.
    obj.visible_glossy = False
    return link(obj)


def lights():
    mid = (SCENE["extent"][0] + SCENE["extent"][1]) / 2
    key = area("key", (mid - 30, -28, 18), (mid - 6, 0, 1.5), (30, 20), 9000, (1.0, 0.97, 0.93))
    fill = area("fill", (mid, -40, 3), (mid, 0, 2), (60, 10), 3500, (0.94, 0.97, 1.0))
    rim = area("rim", (mid + 10, 25, 12), (mid, 0, 2), (60, 10), 2000)
    area("overhead", (mid, 0, 12), (mid, 0, 0), (60, 10), 3500)
    # The shadow on the floor comes only from overhead and the sky, so it
    # gathers softly under the train rather than being thrown aside.
    lit = bpy.data.collections.new("lit")
    for obj in bpy.context.scene.objects:
        if obj.type in {"MESH", "CURVE"} and not obj.is_shadow_catcher:
            lit.objects.link(obj)
    for light in (key, fill, rim):
        light.light_linking.receiver_collection = lit

    world = bpy.data.worlds.new("studio")
    bpy.context.scene.world = world
    g = Graph(world.node_tree)
    g.nodes.clear()
    env = g.node("ShaderNodeTexEnvironment")
    folder = bpy.utils.system_resource("DATAFILES", path=os.path.join("studiolights", "world"))
    env.image = bpy.data.images.load(os.path.join(folder, f"{HDRI}.exr"))
    mapping = g.node("ShaderNodeMapping")
    mapping.inputs["Rotation"].default_value = (0, 0, math.radians(200))
    g.link(g.node("ShaderNodeTexCoord").outputs["Generated"], mapping.inputs["Vector"])
    g.link(mapping.outputs[0], env.inputs["Vector"])
    bg = g.node("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = 0.7
    g.link(env.outputs["Color"], bg.inputs["Color"])
    out = g.node("ShaderNodeOutputWorld")
    g.link(bg.outputs[0], out.inputs[0])


# --- The ground ---------------------------------------------------------------------------


def fading(g, shader, x0, x1, fade=4.0):
    """`shader` fading to nothing over `fade` metres at each end of [x0, x1]."""
    pos = g.position()
    shown = g.math("MULTIPLY", g.smoothstep(pos["X"], x0, x0 + fade), g.smoothstep(pos["X"], x1, x1 - fade))
    mix = g.node("ShaderNodeMixShader")
    g.link(shown, mix.inputs[0])
    g.link(g.node("ShaderNodeBsdfTransparent").outputs[0], mix.inputs[1])
    g.link(shader, mix.inputs[2])
    return mix.outputs[0]


def track_material(name, x0, x1, colour, roughness, metallic=0.0, stones=False):
    m, g = new_material(name)
    base = colour
    normal = None
    if stones:
        # Ballast: angular stones of a few greys and browns, deep gaps.
        cells = g.node("ShaderNodeTexVoronoi", feature="F1")
        cells.inputs["Scale"].default_value = 22.0
        g.link(g.node("ShaderNodeNewGeometry").outputs["Position"], cells.inputs["Vector"])
        edges = g.node("ShaderNodeTexVoronoi", feature="DISTANCE_TO_EDGE")
        edges.inputs["Scale"].default_value = 22.0
        g.link(g.node("ShaderNodeNewGeometry").outputs["Position"], edges.inputs["Vector"])
        sep = g.node("ShaderNodeSeparateColor")
        g.link(cells.outputs["Color"], sep.inputs[0])
        base = g.mix(srgb("#5C574F"), srgb("#8C8478"), sep.outputs[0])
        base = g.mix(base, srgb("#4A3A2E"), g.math("MULTIPLY", sep.outputs[1], 0.35))
        gap = g.smoothstep(edges.outputs["Distance"], 0.0, 0.12)
        base = g.mix(srgb("#1E1C1A"), base, gap)
        bump = g.node("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.8
        bump.inputs["Distance"].default_value = 0.02
        g.link(gap, bump.inputs["Height"])
        normal = bump.outputs["Normal"]
    values = {"Base Color": base, "Roughness": roughness, "Metallic": metallic}
    if normal is not None:
        values["Normal"] = normal
    output(g, fading(g, principled(g, **values).outputs[0], x0, x1))
    return m


def ground():
    x0, x1 = SCENE["extent"][0] - 5, SCENE["extent"][1] + 3
    floor_z = 0.0
    if TRACK:
        head = track_material("rail head", x0, x1, (0.62, 0.62, 0.63, 1), 0.25, 1.0)
        web = track_material("rail", x0, x1, srgb("#4E3B2F"), 0.75, 0.2)
        sleeper = track_material("sleeper", x0, x1, srgb("#8F8A82"), 0.85)
        ballast = track_material("ballast", x0, x1, srgb("#77716A"), 0.95, stones=True)
        for side in (-1, 1):
            y = side * (0.7175 + 0.035)
            box("rail head", x0, x1, y - 0.036, y + 0.036, -0.045, 0.0, head, bevel=0.01)
            box("rail web", x0, x1, y - 0.009, y + 0.009, -0.15, -0.04, web, bevel=0)
            box("rail foot", x0, x1, y - 0.075, y + 0.075, -0.172, -0.15, web, bevel=0.005)
        x = x0
        while x < x1:
            box("sleeper", x, x + 0.26, -1.25, 1.25, -0.37, -0.172, sleeper, bevel=0.02)
            x += 0.65
        # The ballast shoulder, a low trapezoid.
        verts = [(x0, -1.9, -0.55), (x1, -1.9, -0.55), (x1, 1.9, -0.55), (x0, 1.9, -0.55),
                 (x0, -1.45, -0.3), (x1, -1.45, -0.3), (x1, 1.45, -0.3), (x0, 1.45, -0.3)]
        faces = [(4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (1, 2, 6, 5), (3, 0, 4, 7)]
        me = bpy.data.meshes.new("ballast")
        me.from_pydata(verts, [], faces)
        me.materials.append(ballast)
        link(bpy.data.objects.new("ballast", me))
        floor_z = -0.55
    bpy.ops.mesh.primitive_plane_add(size=1, location=((x0 + x1) / 2, 0, floor_z))
    floor = bpy.context.active_object
    floor.scale = (x1 - x0 + 60, 80, 1)
    floor.is_shadow_catcher = True
    floor.data.materials.append(catcher_material())


# How far in from each edge of the frame the shadow fades to nothing, in
# pixels of the finished render.
SHADOW_FADE_PX = 24
# How much wider than the picture, all round, it is rendered before being
# cropped, in pixels of the finished render: the denoiser leaves junk along
# the edges of what it denoises (alpha up to 50 in a corner, where there
# is nothing), and that belongs outside the picture.
OVERSCAN_PX = 16


def catcher_material():
    """The floor as the camera sees it fades out towards the frame's edges,
    so the shadow never meets one: the floor is wide and the overhead light
    long, and without this the shadow runs out of the picture and is cut
    off in a straight line. Only camera rays see the fade; light bouncing
    off the floor onto the train is the same everywhere. `set_shadow_fade`
    places the fade, in the rendered frame's own units, for each view."""
    m, g = new_material("shadow catcher")
    window = g.node("ShaderNodeSeparateXYZ")
    g.link(g.node("ShaderNodeTexCoord").outputs["Window"], window.inputs[0])
    shown = 1.0
    for axis in ("x", "y"):
        # No fade until a view places one.
        start = g.node("ShaderNodeValue", name=f"fade {axis} start").outputs[0]
        start.default_value = -1.0
        end = g.node("ShaderNodeValue", name=f"fade {axis} end").outputs[0]
        end.default_value = -0.5
        coord = window.outputs[axis.upper()]
        for distance in (coord, g.math("SUBTRACT", 1.0, coord)):
            ramp = g.node("ShaderNodeMapRange", interpolation_type="SMOOTHSTEP")
            g.link(start, ramp.inputs["From Min"])
            g.link(end, ramp.inputs["From Max"])
            g.link(distance, ramp.inputs["Value"])
            shown = g.math("MULTIPLY", shown, ramp.outputs[0])
    camera_ray = g.node("ShaderNodeLightPath").outputs["Is Camera Ray"]
    shown = g.math("SUBTRACT", 1.0, g.math("MULTIPLY", camera_ray, g.math("SUBTRACT", 1.0, shown)))
    mix = g.node("ShaderNodeMixShader")
    g.link(shown, mix.inputs[0])
    g.link(g.node("ShaderNodeBsdfTransparent").outputs[0], mix.inputs[1])
    # What Cycles gives a surface with no material, as the floor had before.
    g.link(g.node("ShaderNodeBsdfDiffuse").outputs[0], mix.inputs[2])
    output(g, mix.outputs[0])
    return m


def set_shadow_fade(width, height, margin=0):
    """Fades the shadow out over the SHADOW_FADE_PX pixels inside each edge
    of a width x height picture, rendered with `margin` more all round."""
    m = bpy.data.materials.get("shadow catcher")
    if m is None:
        return
    for axis, size in (("x", width), ("y", height)):
        full = size + 2 * margin
        m.node_tree.nodes[f"fade {axis} start"].outputs[0].default_value = margin / full
        m.node_tree.nodes[f"fade {axis} end"].outputs[0].default_value = (margin + SHADOW_FADE_PX) / full


class overscan:
    """Widens the render by `margin` pixels all round without moving or
    scaling anything in it: the camera sees the same picture with a border."""

    def __init__(self, cam, margin):
        self.cam, self.margin = cam, margin

    def __enter__(self):
        scene, data = bpy.context.scene, self.cam.data
        w, h = scene.render.resolution_x, scene.render.resolution_y
        self.keep = (w, h, data.sensor_width, data.ortho_scale, data.shift_x, data.shift_y)
        # The sensor fits the width, so a pixel stays the same size when
        # the sensor grows with the width; shifts are in sensor widths.
        k = (w + 2 * self.margin) / w
        scene.render.resolution_x, scene.render.resolution_y = w + 2 * self.margin, h + 2 * self.margin
        data.sensor_width *= k
        data.ortho_scale *= k
        data.shift_x /= k
        data.shift_y /= k
        return self

    def __exit__(self, *exc):
        scene, data = bpy.context.scene, self.cam.data
        w, h, data.sensor_width, data.ortho_scale, data.shift_x, data.shift_y = self.keep
        scene.render.resolution_x, scene.render.resolution_y = w, h


def read_png(path):
    """An 8-bit PNG as (h, w, 4) floats 0..1, top row first."""
    img = bpy.data.images.load(path)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1]
    bpy.data.images.remove(img)
    return px


def finish(path, factor, margin):
    """Crops the overscan border off a render and scales it down by a whole
    factor, averaging each block with its colour weighted by alpha."""
    px = read_png(path)
    cut = margin * factor
    if cut:
        px = px[cut:-cut, cut:-cut]
    h, w = px.shape[0] // factor, px.shape[1] // factor
    alpha = px[..., 3:]
    blocks = np.concatenate([px[..., :3] * alpha, alpha], axis=-1).reshape(h, factor, w, factor, 4).mean(axis=(1, 3))
    a = blocks[..., 3:]
    blocks[..., :3] = np.where(a > 0, blocks[..., :3] / np.maximum(a, 1e-8), 0)
    img = bpy.data.images.new("finished", w, h, alpha=True)
    img.pixels.foreach_set(np.ascontiguousarray(blocks[::-1]).ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def train_mask(path):
    """Renders the frame again with only the train in it, flat and quick,
    and returns where the train is: the shadow is whatever else has alpha.
    Widened by a pixel, since this pass and the render anti-alias the
    silhouette a little differently."""
    scene = bpy.context.scene
    keep = scene.render.filepath
    with flat_albedo():
        scene.render.filepath = path
        bpy.ops.render.render(write_still=True)
    scene.render.filepath = keep
    train = read_png(path)[..., 3] > 0
    grown = train.copy()
    grown[1:] |= train[:-1]
    grown[:-1] |= train[1:]
    grown[:, 1:] |= train[:, :-1]
    grown[:, :-1] |= train[:, 1:]
    return grown


# The most alpha the shadow may have where it meets the frame's edge, out
# of 255: none, but for the noise the denoiser leaves.
SHADOW_EDGE_ALPHA = 2


def shadow_edge_check(view, path, train):
    """The shadow must fade out before every edge of the frame, or the app
    shows it cut off in a straight line. The train itself may run out of
    the frame (it does, on the right)."""
    alpha = np.round(read_png(path)[..., 3] * 255).astype(np.int32)
    alpha[train] = 0
    edges = {"top": alpha[0], "bottom": alpha[-1], "left": alpha[:, 0], "right": alpha[:, -1]}
    worst = {k: int(v.max()) for k, v in edges.items()}
    report("shadow edges", f"{view}: the shadow fades out before the frame's edges", max(worst.values()) <= SHADOW_EDGE_ALPHA,
           "most shadow alpha at each edge (limit %d): %s" % (SHADOW_EDGE_ALPHA, ", ".join(f"{k} {v}" for k, v in worst.items())))


# --- Cameras --------------------------------------------------------------------------------

# Render sizes, 3x the points they're shown at in the app.
SIZES = {"hero": (1110, 240), "plate": (480, 270), "close": (900, 700), "corner": (900, 900), "side": (1200, 420), "face": (600, 700), "top": (900, 400)}

# The azimuth of the camera from straight ahead (90 is side on), its
# elevation, the lens, and how far back from the nose the frame reaches;
# the train runs on out of the frame beyond that. A long lens from low
# down, like a catalogue photograph of a model.
VIEW = {
    "hero": {"azimuth": 70, "elevation": 4, "lens": 120, "frame": "cab+5"},
    "plate": {"azimuth": 70, "elevation": 4, "lens": 120, "frame": 10.5},
    # A close look at the cab end, for checking against photos.
    "close": {"azimuth": 38, "elevation": 4, "lens": 120, "frame": 4.5},
    # The lower corner of the cab end on the near side, close: the regression crop for livery edges.
    "corner": {"azimuth": 45, "elevation": 4, "lens": 120, "frame": 1.3, "below": 2.0, "near": True},
    "side": {"azimuth": 90, "elevation": 0, "lens": None, "frame": 7},
    "face": {"azimuth": 0, "elevation": 0, "lens": None, "frame": 12},
    "top": {"azimuth": 90, "elevation": 89, "lens": None, "frame": 7},
}

# The flat side elevation the accuracy checks measure: orthographic, the
# leading car and the next whole, at a fixed scale, every surface its paint
# colour unlit (see flat_albedo).
ELEVATION_PX_PER_M = 80

# Views a class's spec asks for, to match the camera of a reference photo:
# {name: {azimuth, elevation, lens, frame, size: [w, h]}}.
# A view may instead give the camera outright, as scripts/accuracy/match.py
# solves it from a photo: {matrix (camera to world, Blender axes), lens
# (mm on a 36 mm wide sensor), size, flat (render unlit paint colours)}.
for _name, _spec in json.loads(os.environ.get("TRAIN_VIEWS", "{}")).items():
    VIEW[_name] = dict(_spec) if "matrix" in _spec else {k: _spec[k] for k in ("azimuth", "elevation", "lens", "frame")}
    SIZES[_name] = tuple(_spec.get("size", (900, 700)))


def outline_points():
    """Points on the train itself, for framing it."""
    pts = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH" or obj.is_shadow_catcher or obj.hide_render:
            continue
        if obj.name.startswith(("rail", "sleeper", "ballast")):
            continue
        step = 7 if obj.name.startswith("car") else 1
        m = obj.matrix_world
        verts = obj.data.vertices
        pts.extend(m @ verts[i].co for i in range(0, len(verts), step))
    return pts


def elevation_camera():
    """An orthographic camera square onto the near side, framing the leading
    car and the next exactly, ELEVATION_PX_PER_M pixels to the metre."""
    scene = bpy.context.scene
    cars = SCENE["cars"][:2]
    x0 = SCENE["extent"][0] - 0.4
    x1 = cars[-1]["x0"] + cars[-1]["length"] + 0.4
    y0, y1 = -0.3, SCENE["heights"]["roof"] + 0.5
    w, h = round((x1 - x0) * ELEVATION_PX_PER_M), round((y1 - y0) * ELEVATION_PX_PER_M)
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    data = bpy.data.cameras.new("elevation")
    data.type = "ORTHO"
    data.sensor_fit = "HORIZONTAL"
    data.ortho_scale = x1 - x0
    obj = link(bpy.data.objects.new("elevation", data))
    scene.camera = obj
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 1, 0)).to_track_quat("-Z", "Y")
    obj.location = Vector(((x0 + x1) / 2, -40, (y0 + y1) / 2))
    return obj


def write_camera(obj, path):
    """What a render's camera was, so a point on the train can be found in
    the image: scripts/accuracy projects feature boxes with it."""
    scene = bpy.context.scene
    bpy.context.view_layer.update()
    data = obj.data
    info = {
        "width": scene.render.resolution_x,
        "height": scene.render.resolution_y,
        "type": data.type,
        "lens": data.lens,
        "sensor": data.sensor_width,
        "orthoScale": data.ortho_scale,
        "shift": [data.shift_x, data.shift_y],
        # World to camera, row-major. Blender's axes: X = x back from the
        # nose, Y = z across (the near side negative), Z = y up.
        "worldToCamera": [list(row) for row in obj.matrix_world.inverted()],
        # Where each car starts along the train, x back from the nose tip.
        "cars": [{"x0": c["x0"], "length": c["length"]} for c in SCENE["cars"]],
    }
    with open(path, "w") as f:
        json.dump(info, f, indent=1)


class flat_albedo:
    """Every material shows its paint colour, unlit and unweathered, through
    a Standard view transform, so a pixel's colour is the livery's hex: the
    `albedo` node a material marks, else its Principled BSDF's base colour."""

    def __enter__(self):
        scene = bpy.context.scene
        self.keep = (scene.view_settings.view_transform, scene.view_settings.exposure, scene.render.filter_size,
                     scene.cycles.samples, scene.cycles.use_denoising)
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.exposure = 0
        scene.render.filter_size = 0.01
        scene.cycles.samples, scene.cycles.use_denoising = 4, False
        self.swaps = []
        for mat in bpy.data.materials:
            if not mat.node_tree:
                continue
            nodes, links = mat.node_tree.nodes, mat.node_tree.links
            out = next((n for n in nodes if n.type == "OUTPUT_MATERIAL"), None)
            if out is None:
                continue
            source = None
            marked = nodes.get("albedo")
            if marked is not None and marked.inputs[0].is_linked:
                source = marked.inputs[0].links[0].from_socket
            emit = nodes.new("ShaderNodeEmission")
            if source is None:
                bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
                base = bsdf.inputs["Base Color"] if bsdf else None
                if base is not None and base.is_linked:
                    source = base.links[0].from_socket
                elif base is not None:
                    emit.inputs["Color"].default_value = base.default_value
                else:
                    emit.inputs["Color"].default_value = (0, 0, 0, 1)
            if source is not None:
                links.new(source, emit.inputs["Color"])
            surface = out.inputs["Surface"]
            before = surface.links[0].from_socket if surface.is_linked else None
            links.new(emit.outputs[0], surface)
            self.swaps.append((mat, emit, before))
        self.hidden = [o for o in scene.objects if o.type == "LIGHT" or o.is_shadow_catcher]
        for o in self.hidden:
            o.hide_render = True
        world = scene.world
        self.world_strength = None
        bg = next((n for n in world.node_tree.nodes if n.type == "BACKGROUND"), None) if world else None
        if bg is not None:
            self.world_strength = (bg, bg.inputs["Strength"].default_value)
            bg.inputs["Strength"].default_value = 0
        return self

    def __exit__(self, *exc):
        scene = bpy.context.scene
        for mat, emit, before in self.swaps:
            out = next(n for n in mat.node_tree.nodes if n.type == "OUTPUT_MATERIAL")
            if before is not None:
                mat.node_tree.links.new(before, out.inputs["Surface"])
            mat.node_tree.nodes.remove(emit)
        for o in self.hidden:
            o.hide_render = False
        if self.world_strength:
            bg, v = self.world_strength
            bg.inputs["Strength"].default_value = v
        (scene.view_settings.view_transform, scene.view_settings.exposure, scene.render.filter_size,
         scene.cycles.samples, scene.cycles.use_denoising) = self.keep


def camera(view):
    if view == "elevation":
        return elevation_camera()
    scene = bpy.context.scene
    spec = VIEW[view]
    if "matrix" in spec:
        from mathutils import Matrix
        w, h = SIZES[view]
        scene.render.resolution_x, scene.render.resolution_y = w, h
        scene.render.resolution_percentage = 100
        data = bpy.data.cameras.new(view)
        data.sensor_fit = "HORIZONTAL"
        data.sensor_width = 36.0
        data.lens = spec["lens"]
        data.shift_x, data.shift_y = spec.get("shift", (0, 0))
        data.clip_start, data.clip_end = 0.05, 1000
        obj = link(bpy.data.objects.new(view, data))
        obj.matrix_world = Matrix(spec["matrix"])
        scene.camera = obj
        return obj
    w, h = SIZES[view]
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    data = bpy.data.cameras.new(view)
    if spec["lens"]:
        data.lens = spec["lens"]
    else:
        data.type = "ORTHO"
    data.sensor_fit = "HORIZONTAL"
    obj = link(bpy.data.objects.new(view, data))
    scene.camera = obj
    az, el = math.radians(spec["azimuth"]), math.radians(spec["elevation"])
    direction = Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), -math.sin(el)))
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("-Z", "Y")
    reach = spec["frame"]
    if isinstance(reach, str):
        reach = SCENE["cars"][0]["length"] + float(reach.split("+")[1])
    pts = [p for p in outline_points() if p.x < SCENE["extent"][0] + reach]
    if "below" in spec:
        pts = [p for p in pts if p.z < spec["below"] and (not spec.get("near") or p.y < 0)]
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    co, scale = obj.camera_fit_coords(depsgraph, [c for p in pts for c in p])
    if spec["lens"]:
        # Back off a little so the train has room inside the frame.
        centre = sum(pts, Vector()) / len(pts)
        obj.location = Vector(co) - direction * (Vector(co) - centre).length * 0.04
    else:
        data.ortho_scale = scale * 1.05
        obj.location = Vector(co) - direction * 40
    if DEBUG:
        exec(open(DEBUG).read())
    return obj


# --- The gap check ---------------------------------------------------------------------------


def id_check(out):
    """Renders the cab end with every material a flat colour of its own and
    no anti-aliasing, then looks for the body's colour showing through
    between two other regions: a sliver where two areas of livery meant to
    meet don't. Writes the ID image beside the renders."""
    scene = bpy.context.scene
    keep = {k: getattr(scene.cycles, k) for k in ("samples", "use_denoising")}
    keep_filter, keep_transform = scene.render.filter_size, scene.view_settings.view_transform
    camera("close")
    scene.render.resolution_x, scene.render.resolution_y = 1800, 1400
    scene.cycles.samples, scene.cycles.use_denoising = 1, False
    scene.render.filter_size = 0.01
    scene.view_settings.view_transform = "Standard"

    # One flat colour per material.
    # Slots belong to the object or, shared, to its mesh: each is swapped once.
    originals, flats, ids, seen = [], {}, {}, set()
    for obj in scene.objects:
        if obj.type not in {"MESH", "CURVE"} or obj.is_shadow_catcher:
            continue
        for k, slot in enumerate(obj.material_slots):
            owner = obj.data if slot.link == "DATA" else obj
            if (owner.name, type(owner).__name__, k) in seen:
                continue
            seen.add((owner.name, type(owner).__name__, k))
            mat = slot.material
            if mat is None:
                continue
            if mat.name not in flats:
                k = len(flats) + 1
                colour = ((k * 37) % 255 / 255, (k * 91) % 255 / 255, (k * 173) % 255 / 255, 1)
                m, g = new_material(f"id {mat.name}")
                emit = g.node("ShaderNodeEmission")
                emit.inputs["Color"].default_value = colour
                output(g, emit.outputs[0])
                flats[mat.name] = m
                ids[mat.name] = tuple(round(c * 255) for c in colour[:3])
            originals.append((slot, mat))
            slot.material = flats[mat.name]
    path = f"{out}-ids.png"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)

    img = bpy.data.images.load(path)
    w, h = img.size
    px = (np.array(img.pixels[:]).reshape(h, w, 4) * 255).round().astype(np.int32)
    code = px[:, :, 0] * 65536 + px[:, :, 1] * 256 + px[:, :, 2]
    code[px[:, :, 3] < 128] = -1
    body = ids.get("body")
    flagged = 0
    if body is not None:
        body_code = body[0] * 65536 + body[1] * 256 + body[2]
        for k in (1, 2):
            for axis in (0, 1):
                a, b = np.roll(code, k, axis=axis), np.roll(code, -k, axis=axis)
                sliver = (code == body_code) & (a != body_code) & (b != body_code) & (a >= 0) & (b >= 0)
                flagged += int(sliver.sum())
    report("gaps", "body colour showing between regions", flagged == 0, f"{flagged} pixels in the ID pass at {w}x{h}")

    for slot, mat in originals:
        slot.material = mat
    for k, v in keep.items():
        setattr(scene.cycles, k, v)
    scene.render.filter_size, scene.view_settings.view_transform = keep_filter, keep_transform
