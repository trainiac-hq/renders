# Trainiac renders

3D renders of British passenger trains, each class in each operator's
livery, for the [Trainiac](https://traini.ac) app. Every train is built
procedurally from data — a class's dimensions, nose, windows and doors, an
operator's livery — and rendered in Blender, so adding a class or a livery
is adding data, not modelling by hand.

## What's here

```
classes/        the trains
  diesel.ts, electric.ts, hitachi.ts, loco.ts   geometry, one entry per class
  fleet.ts      class number -> geometry, and the operators running it
  <code>/       per class: checklist.md, SOURCES.md, refs/ (reference photos and
                side diagrams); for measured classes also evidence.json (every
                reference, crop and colour sample), spec.json (the measured
                numbers, each with its source in `trace`) and samples.json
liveries/       one file per operator (ATOC code), shared.ts for what they share
logos/          operators' logos and wordmarks as SVGs, laid on as the trains carry them
model/          the data's types (types.ts), curve and shape helpers
resolve.ts      which geometry and livery a class and operator get; what's rendered
pipeline/       data -> scene: shells (shell.ts), textures (paint.ts), laid-on
                details (decals.ts), outline rules (outline.ts), scene export
                (scene.ts); Blender side in train.py and blender/
validate/       the geometry checks, runnable without Blender
scripts/        render-all, publish (WebP + manifest), export, contact-sheet, fetch-ref
  accuracy/     measure a class from its references and check a render against them
FLEET.md        which operators run which classes, audited against sources
out/            everything generated (ignored)
rendered/       the last full render of every train, kept so it survives without a re-render
MANIFEST.md     the published manifest's format
```

## Running it

Needs [Bun](https://bun.sh), [Blender](https://www.blender.org) 5.2+ (Cycles;
Metal on macOS) and `cwebp` for publishing.

```sh
bun install
bun run validate                               # every class: geometry checks, no Blender
bun scripts/render-all.ts --only 390-VT --views hero,plate,close
bun scripts/render-all.ts                      # everything not yet rendered
bun scripts/publish.ts                         # out/renders/*.png -> out/publish/
bun scripts/contact-sheet.ts                   # out/contact-sheet-hero.png
```

A train's name is `<class>-<operator>` (`390-VT`), `generic-<operator>` for
an unknown class, or `generic-none`. Views: `hero` (the cab car and the start
of the next, catalogue angle), `plate` (the cab end), and for checking
`close`, `corner`, `side`, `face`, `top`. `--threads N` (or `BLENDER_THREADS`) caps Blender's CPU threads; `TRAIN_SAMPLES` (default 256),
`TRAIN_SUPERSAMPLE` (default 2) and `--track` (stand it on track) change how
it's rendered. Each render writes `<name>-validate.json`; a failed check
stops the render (set `TRAIN_STRICT=0` to render anyway).

The ground shadow fades out before every edge of a hero or plate, so the
app never shows it cut off in a straight line: the shadow catcher fades
towards the frame's edges, and each hero and plate is checked against a
render of the train alone (`<name>-<view>-train.png`). Renders from before
that are faded the same way by `publish.ts` (`pipeline/edges.ts`), which
publishes nothing whose shadow still reaches an edge and writes what it
found to `out/publish/edges.json`.

## How a train is built

- **Shell.** A car is one closed surface: the loading gauge's section
  (`form.width`, `form.tumblehome`) carried along the car, its front shaped by
  the side view's nose profile (`nose.profile`) and how far the nose's sides
  stand back from its centre line (`form.setback`, `form.squareness`).
- **Paint.** The livery is drawn flat as the side view and the front view
  and projected onto the shell, every outline rounded at its corners.
- **Laid-on details.** On a long nose (`form.front`), the windscreen,
  surrounds, panel, grilles and lines are thin meshes laid onto the surface
  in an unwrapping of it, so their edges stay exact on any curve.
- **Branding.** Logos and wordmarks are built from their SVGs' own curves
  and laid on where the real train carries them (CONTRIBUTING.md).
- **Modelled details.** Windows and doors are cut in; lamp clusters are
  recessed with reflectors and covers; wipers, bogies, underframe, roof
  equipment, couplers and gangways are modelled.

## The checks

`validate` fails a class when any outline has a corner sharper than 20°, a
paint edge (a livery shape, a warning panel, a surround) wobbles: after
fairing, any bend shorter than 20 cm between two bending the other way
deeper than 0.8 mm (`WOBBLE` in `pipeline/outline.ts`), a joint on a long
nose stops a few centimetres short of the paint's edge, a
part (a lamp, a grille, a window) comes within its margin of the edge of what
holds it, a colour is left showing as a sliver past what's laid over it, a
livery line doesn't meet itself across the nose, or anything laid on would
hang off the body. Inside Blender, every laid-on vertex is ray-cast onto the
shell and must sit 0.4–3.1 mm off it; every door and window must sit on the
flat bodyside, clear of the nose's corner and the car ends, layers must be at least 0.25 mm apart,
and an ID render of the cab end must show no body colour between regions.

## Measuring a class

The 377, 323 and 800 are built from measurements rather than by eye
(Python 3 with Pillow and NumPy):

```sh
python3 scripts/accuracy/grid.py <ref> grid.png [x0 y0 x1 y1]   # read off boxes
python3 scripts/accuracy/crops.py 377        # crops/, samples.json from evidence.json
python3 scripts/accuracy/measure.py runs <diagram> row 150     # door, window edges
bun scripts/render-all.ts --only 377-SN --views ref-419,ref-side,elevation
python3 scripts/accuracy/elevation.py 377 out/renders/377-SN   # numbers, fails out of tolerance
python3 scripts/accuracy/compare.py 377 out/renders/377-SN     # reference | render pairs
python3 scripts/accuracy/review.py 377 out/renders/377-SN review.png --match out/match
python3 scripts/accuracy/match.py solve 377 p419 --train 377-SN      # camera of a photo (OpenCV)
python3 scripts/accuracy/test_match.py                              # the solver recovers a known camera
python3 scripts/accuracy/edges.py out/renders/800-GW-match-p311-flat.png F5C400 0B3D2E  # paint edges smooth to the pixel
```

A photo's camera can be solved from points on it whose place on the model
is known (`match.py`), and the model rendered from that camera and drawn
over the photo as outlines. The `elevation` view is the train square on, unlit, every surface its
paint colour, at a fixed scale, so its doors, windows and livery edges can
be measured to the pixel against the spec, and the side diagram laid over
it. A class's `spec.json` can add views (`ref-…`) that match the cameras
of its reference photos; `pairs` crops the same feature from both. See
CONTRIBUTING.md for the method.

See CONTRIBUTING.md to add a class or a livery, and LICENSES.md for the
licences (noncommercial use only).
