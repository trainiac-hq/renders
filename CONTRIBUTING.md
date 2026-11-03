# Contributing

## Adding a class

1. **Reference photos.** Find a few on Wikimedia Commons: one head-on or
   three-quarter of the cab end, one side-on. Fetch them with their
   attribution:

   ```sh
   bun scripts/fetch-ref.ts 397 "File:Some photo of a 397.jpg" "File:Another.jpg"
   ```

   This saves freely licensed photos to `classes/397/refs/` and lists every
   one in `classes/397/SOURCES.md`.

2. **Geometry.** Add an entry to the family file it belongs to
   (`classes/electric.ts`, `diesel.ts`, `hitachi.ts`, `loco.ts`), or start a
   new file. Lengths are metres; x runs back from the nose tip, y up from the
   rail head. See `model/types.ts` for every field. Start from a similar
   class and change what differs:
   - `heights`, `cab` and `next` (lengths, doors, windows, bogies, roof kit)
     from a published side drawing or photo;
   - `nose.profile`, the nose's silhouette from the side;
   - `nose.face` for a flat or raked front, drawn head-on with `u` running
     0–1 across the body;
   - `form` for anything with a long nose: its plan (`setback`,
     `squareness`) and its features head-on (`form.front`).

3. **Fleet.** Add the class number and its operators to `classes/fleet.ts`.

4. **Checklist.** Write `classes/<code>/checklist.md`: every visible detail
   of the cab end and side, one line each, with its status. At least: nose
   shape, windscreen and cab window shapes, lamp layout and order (which
   side the headlamp is), the warning panel's shape, livery bands. Tick an
   item only after comparing the render and a photo from the same view,
   side by side at the same scale, and say what you compared. Judge left
   and right on the unmirrored photo.

5. **Check and render.**

   ```sh
   bun run validate
   bun scripts/render-all.ts --only 397-TP --views hero,plate,close,face,side
   ```

## Measuring a class (the accuracy method)

Eyeballing a whole photo misses things; one feature at a time, measured,
does not. The 377, 323 and 800 were done this way, and every class should be.

0. **Fleet first.** Check FLEET.md: render only the operators that run (or
   recently ran) the class, in the livery they carry now.
1. **Evidence.** Fetch the side diagram (Commons has series by Unisouth,
   Chiltern006, WestRail642fan and others; keep PNGs whole with
   `fetch-ref.ts`) and several current photos (`--width 2400`): side,
   three-quarter, head-on, close-ups. List them in `evidence.json` with
   their licence. Only freely licensed files go in `refs/`.
2. **Crops.** In `evidence.json`, one crop per feature: lamp cluster,
   windscreen, warning panel, gangway, cab door, each bodyside door,
   window rows, livery edges at each car end, roof line, bogies.
   `crops.py` cuts them and draws every box on its photo
   (`crops/_boxes-*.jpg`): check the boxes landed before trusting a number.
   Look at each crop on its own and write what it shows in `reading`; give
   the important ones (front, livery, doors) to a second reader too, and
   settle any disagreement with a tighter crop.
3. **Colours** are sampled, never guessed: the median of a clean patch,
   normalised against a white or silver patch on the same surface in the
   same light (`neutral`). Front colours rarely have one; say so.
4. **Measure.** `measure.py runs` along a row of the diagram gives every
   door and window edge in pixels. Calibrate each axis separately: these
   drawings are often stretched (the 323's is 13% taller than it is long,
   the 800's 20%), so scale lengths to published car lengths and heights
   to published heights, and cross-check against a photo along one line
   (a 1D projective fit through door edges; proportions up one vertical).
   Where a photo and the diagram disagree, the photo wins; write down why.
5. **Spec.** Put every number in `spec.json` `model`, its source in `trace`.
   Build the class and its livery from the spec (`classes/electric.ts`
   `electrostar377`, `hunslet323`; `hitachi.ts` `iet800`).
6. **Verify.** Render the `elevation` view and the `ref-…` views; run
   `elevation.py` (fails beyond tolerance) and `compare.py`; judge each
   pair on its own, have a second reader judge the front, livery and door
   pairs, fix, re-render, until they pass. Include a `corner-door` pair
   (the cab corner and first door, three-quarter): a door wrapped round
   the corner measures right from the side and only shows there. Update
   the checklist with what was compared.
7. **Camera match.** For two or three photos (the leading car, straight
   track), pick 8-12 well-spread points whose place on the model is exact
   (`landmarks.py` lists them: door corners, lamp centres, windscreen
   corners, gangway frame, axles; a match file can add spec points such as
   a livery corner). Place each with `pick.py`, one zoomed panel per point,
   and write them to `classes/<code>/match/<photo>.json` with two or three
   held out. Then:

   ```sh
   python3 scripts/accuracy/match.py solve 323 p214 --train 323-LM     # camera, held-out error in cm
   python3 scripts/accuracy/match.py measure 323 p214 --train 323-LM   # where the photo puts each point
   bun scripts/render-all.ts --only 323-LM --views match-p214,match-p214-flat
   python3 scripts/accuracy/match.py overlay 323 p214 out/renders/323-LM out/match
   ```

   `solve` fails when a held-out point lands more than 6 cm off on the
   train. A point the solve can't fit, or `measure` puts somewhere else
   than the spec, is a wrong pick or a wrong model: zoom in again, and if
   the pick holds, the model moves (the 323's cab door and face heights
   were found this way). A solve from the bodyside points alone, then
   measuring the face's points with it, separates a face error from a
   side error. `test_match.py` checks the solver on a synthetic camera.

Geometry the pipeline checks for every class (`pipeline/bodyside.ts`):
every door (with a cab door's grab rails) and window must lie on the flat
of the bodyside, clear of the nose's corner and the car ends; the check
names the feature and how far it reaches. A long nose's own cab window,
which sits on the curve by design, is marked `glazingOnNose`.

## Adding a livery

Liveries are per operator in `liveries/<ATOC code>.ts`: a `default`, and
entries by class number or family (`iet`, `sprinter`, ...) where the
operator paints a kind of train differently. Colours are hex; bands are
fractions of the bodyside height; shapes on the leading car are metres
from the nose tip. Add the operator to `liveries/index.ts` and its classes'
`operators` in `classes/fleet.ts`, and record the photos you worked from.

## Bogies and couplers

Every class has had the same generic bogie and coupler. `model/gear.ts`
holds the types that look different from a platform (bogies: `generic`,
`inside-frame`; couplers: `generic`, `dellner`, `scharfenberg`, `bsi`,
`tightlock`) and one table, `GEAR`, of which class runs on which:

```ts
// model/gear.ts
export const GEAR = {
  '345': { bogie: 'inside-frame', coupler: 'dellner' },
};
```

Add your classes when you have photos of their gear (cite them in the
spec.json `trace`); a class not in the table renders as before. A type's
numbers are nominal: if your drawings disagree, refine the type (it is
shared) or add one, with the Blender builder beside the others
(`BOGIES` in `pipeline/blender/gear.py`, `typed_coupler` in
`pipeline/blender/body.py`). `landmarks.py` reads the axle-end covers'
offset from the type, so camera matches stay right.

## Snowploughs

A class whose units carry a plough under the cab end sets `plough` on its
ClassArt (model/types.ts `Plough`), measured from a head-on or three-quarter
photo: `top` and `bottom` heights above the rail, `halfWidth` seen head-on,
`ahead` (how far the V's point leads the face) and `sides` (how far its outer
ends do), optional `rake` (foot ahead of top, default 0.08) and `color` (a
livery field such as `panel` or `under`, or a hex; default `panel`). Off
unless given. pipeline/blender/body.py `plough()` builds it.

## Logos and wordmarks

Every train carries its operator's branding where the real one does (decided
2026-10-05: every class x livery), measured like any other
feature. The artwork is vector, one SVG per piece in `logos/` (`GW.svg`;
add a wordmark or emblem as `GW-wordmark.svg`), with its source and licence
in `logos/SOURCES.md`. A livery lists what it carries in `branding`; the
numbers come from the class's spec.json like everything else, with their
source in `trace` (the 800 is the worked example: `classes/800/spec.json`
`model.livery.branding` and `trace["livery.branding"]`):

```jsonc
// a class spec.json, model.livery
"branding": [
  // the GWR logo between the cab door and door 1, level, on both sides
  { "logo": "GW", "at": [6.43, 2.12], "height": 0.62, "color": "#AEB4B4" },
  // the logo on the yellow: at is [u across, y up], height on the surface
  { "logo": "GW", "on": "front", "at": [0.5, 2.24], "height": 0.31, "color": "#3A3D3B" }
]
```

```ts
// liveries/GW.ts
'800': { ..., branding: spec800.model.livery.branding as unknown as Livery['branding'] },
```

- `at` is the artwork's centre: on a side, [x back from that car's front,
  y up]; on the front, [u across 0..1, y up]. `car: 'next'` puts it on the
  second car. `height` is the artwork's own height before `rotate`
  (degrees anticlockwise as seen; 90 for lettering reading upwards).
- On the front, the artwork lies in the face's tangent plane where its
  centre lands and is dropped onto the surface along that normal, so
  `height` is measured on the surface: on a raked nose the lettering keeps
  its proportions. Measure its width against something across the face
  (the lamps' spacing on a head-on photo) and divide by the artwork's
  aspect.
- `color` paints every shape one colour (most files in `logos/` are white,
  fitted for the app's badges); leave it out to keep the artwork's colours.
- Both sides by default (`sides: 'near' | 'far'` for one). On the far side
  the artwork is turned round so it reads (and its rotation with it);
  `far: 'mirrored'` where the real train carries a mirror image there.
- Measuring: pick the logo's extremes and the doors beside it on two
  photos; read them on the bodyside plane through a solved match camera,
  or, where the camera was solved far from the cab, as proportions between
  door edges whose model positions are known. Height is safest against a
  door's height on the same photo.
- No published artwork (a class's own lettering, "First class", an old
  wordmark)? Trace it off a photo: `scripts/accuracy/trace_logo.py <photo>
  --quad <the artwork's corners, reading order> --aspect <w/h> --out
  logos/<ATOC>-<what>.svg` squares the box up, splits ink from paint, and
  writes smoothed outlines (no pixel steps) plus a check image beside the
  SVG. List the photo and its licence in `logos/SOURCES.md`.
- The check (`pipeline/branding.ts`) fails a missing file, and a side logo
  that reaches onto the nose's corner or a car end, off the bodyside, or
  over a door or window. Blender reports each piece it lays on, and a
  front logo any of whose points found no surface.

## Pull requests

- [ ] `bun run validate` passes for every class
- [ ] `bun run typecheck` passes
- [ ] reference photos fetched, SOURCES.md complete
- [ ] checklist written, items marked honestly
- [ ] renders of the cab end (`close`) and `hero` attached to the PR, beside a photo
