"""Renders one train from a directory written by scene.ts.

    Blender -b --factory-startup --python train.py -- <dir> <out-prefix> [views...]

Writes <out-prefix>-<view>.png for each view (hero, plate) with a
transparent background and a soft contact shadow, and beside it
<out-prefix>-<view>.camera.json, the camera it was taken with. The
`elevation` view is the flat, unlit side the accuracy checks measure.
TRAIN_TRACK=track stands the train on a short length of track;
TRAIN_SAMPLES sets the sample count; TRAIN_VIEWS adds views (a class's
spec.json `views`). The parts are in blender/; logos and wordmarks
(blender/branding.py) are added after the ID check, since the body
showing between their letters is meant.
"""

import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "blender"))

import bpy  # noqa: E402

import body  # noqa: E402
import branding  # noqa: E402
import gear  # noqa: E402
import studio  # noqa: E402
import json  # noqa: E402

from common import OUT, REPORT, SAMPLES, VIEWS  # noqa: E402
from materials import Palette  # noqa: E402

scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "METAL" if sys.platform == "darwin" else "OPTIX"
prefs.get_devices()
for d in prefs.devices:
    d.use = True
scene.cycles.device = "GPU"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.seed = 7
scene.render.film_transparent = True
scene.render.filter_size = 1.2
# Rendered at twice the size and scaled down: edges come out crisp
# where the denoiser alone would soften them.
SUPERSAMPLE = int(os.environ.get("TRAIN_SUPERSAMPLE", "2"))
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.view_settings.view_transform = "Khronos PBR Neutral"
scene.view_settings.look = "None"
scene.view_settings.exposure = -0.2

# Each stage announced, for render-all's progress line and <train>.log.
T0 = time.time()


def stage(name):
    print(f"train: {name} ({time.time() - T0:.0f} s in)", flush=True)


stage("building the model")
palette = Palette()
body.build(palette)
body.bellows(palette)
body.coupler(palette)
body.plough(palette)
gear.build(palette)
studio.ground()
studio.lights()
# Geometry checks first; the gap check renders an ID pass of the cab end.
stage("checking for gaps")
studio.id_check(OUT)
# Logos after the ID pass: the body shows through their lettering by design.
stage("laying on logos")
branding.build()
json.dump(REPORT, open(f"{OUT}-validate.json", "w"), indent=1)
if os.environ.get("TRAIN_STRICT", "1") == "1" and not all(r["ok"] for r in REPORT):
    raise SystemExit("validation failed: see " + f"{OUT}-validate.json")
for view in VIEWS:
    stage(f"rendering {view}")
    cam = studio.camera(view)
    w, h = scene.render.resolution_x, scene.render.resolution_y
    path = f"{OUT}-{view}.png"
    scene.render.filepath = path
    studio.write_camera(cam, f"{OUT}-{view}.camera.json")
    if view == "elevation" or studio.VIEW.get(view, {}).get("flat"):
        # Measured, not looked at: flat paint colours, no supersampling.
        with studio.flat_albedo():
            bpy.ops.render.render(write_still=True)
        continue
    with studio.overscan(cam, studio.OVERSCAN_PX):
        studio.set_shadow_fade(w, h, studio.OVERSCAN_PX)
        scene.render.resolution_percentage = 100 * SUPERSAMPLE
        bpy.ops.render.render(write_still=True)
        scene.render.resolution_percentage = 100
    studio.finish(path, SUPERSAMPLE, studio.OVERSCAN_PX)
    if view in ("hero", "plate"):
        # What the app shows: its shadow must not be cut off by the frame.
        studio.shadow_edge_check(view, path, studio.train_mask(f"{OUT}-{view}-train.png"))
json.dump(REPORT, open(f"{OUT}-validate.json", "w"), indent=1)
if os.environ.get("TRAIN_STRICT", "1") == "1" and not all(r["ok"] for r in REPORT):
    raise SystemExit("validation failed: see " + f"{OUT}-validate.json")
