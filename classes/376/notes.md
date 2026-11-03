# Class 376: notes

Status: the evidence and spec are done (`evidence.json`, 43 crops, each read, with a second
reading on the front, livery and door crops; `samples.json`; `spec.json`; `match/p016.json`,
`match/p035.json`). Built by `electrostarFromSpec`; rendered and measured 2026-10-05 (see "Elevation and pairs").

Conventions: "left" and "right" always mean as seen looking forward from the cab. On the face,
`m` > 0 is the train's left. In landmarks, the left bodyside is the near (negative Y) side.

## Livery decision: navy (SE)

I took the latest dated Commons photo of each unit (2024-2025):

- **Navy:** 9 units (009, 010, 016, 017, 019, 021, 023, 031, 035).
- **White:** 8 units (002, 004, 005, 011, 012, 013, 026, 034).

Every photo from October and November 2025 shows a navy unit. Southeastern's refresh wraps every
unit in the current blue livery. The first unit came back in April 2025, and the first fully
refreshed unit was announced on 27 November 2025 (Wikipedia, citing the Southeastern newsroom).

- The navy colours are in `liveries.SE`.
- `liveries.SE-white` carries rough colours for the legacy livery. It is marked `rendered: false`.

## Sources of the numbers

- **Diagram:** the Unisouth 376 diagram is a pixel copy of the 377 drawing, so it is not used for
  anything.
- **Published:**
  - DM 19.95 m and MS/TS 19.69 m: Eversholt, via the Wikipedia infobox.
  - The doors are "200mm wider than the doors used on previous Electrostar/Turbostar units" and
    slide into the bodyside (sremg.org.uk). I found no published door width in mm.
- **Side, p016:** a 1D projective fit along car 1 (3840 px).
  - Anchors: the orange ring's front edge at 2.30 m (from p026) and the car end at 19.95 m.
  - Door heights at four columns fix the perspective.
  - Residuals are 2-3 px. The face silhouette comes out at +0.27 m, which is consistent with
    the corner radius.
  - The 377 hypothesis (doors 4.70-6.46 and 13.95-15.70) is **rejected**: its residuals reach
    21 px.
- **Cab door and cab-side window, p026:** both cab ends side-on, nose to nose, at 244 px/m. The
  white 376026 shows its right side and the navy 376031 its left side.
- **Face, p035:** a projective fit using the photo's focal length (30 mm APS-C, 2152 px). The
  camera turns out to be 28.6° off the face normal, so this is not a head-on view. A fit anchored
  on "body width 2.80 at the silhouette" gave a false scale.
  - The vertical scale (291 px/m) comes from the yellow top at 1.98 m (p026 profile) and the face
    orange line at 3.23 m.
  - The lamps come out at m ±1.04 (head) and ±0.79 (tail). That is almost exactly the 377's
    1.06 and 0.81, which supports the scale.

## What differs from the 377 body

| | 376 | 377 |
|---|---|---|
| Face | Flat, no gangway. One black band from 1.985 to 3.226 m with three equal 0.80 m panes (pillars at ±0.405). | Gangway |
| Yellow | One band, 1.257-1.985 m, edges ±1.267, outer bottom corners r 0.2. Navy above the band, navy valance below with a coupler recess. | Yellow cap over the screens |
| Wipers | Three, one per pane | Two |
| Car 1 length | 19.95 m (published DM) | 20.2 m |
| Cab door | 1.38-2.26 m (centre 1.82, leaf 0.88 m) | 0.97-1.79 m |
| Door 1 | Centre 5.72 | Centre 5.58 |
| Door 2 | Centre 14.32 | Centre 14.83 |
| Door width | 1.50 m measured opening, both doors (±0.06) | 1.76 m |
| First door's front edge from the face | 4.97 m | 4.70 m |
| Cab-side window | Left side only | |
| Roof | Light grey over the saloons; only the cab dome is navy | |

On the 376 face the lamp clusters use the same figure-of-eight layout, but the bezel is a yellow
plate with a thin black outline.

**Cab-side window: on the LEFT side only** (the driver's side, the positive-m and near side).

- Glass frame at x 0.82-1.25 m and y 2.31-2.98 m. The top-front corner is rounded (about 0.08 m),
  the bottom-front corner less so, and the rear corners are square against the cab door's front
  seal.
- Present on p019, p026 (376031), p031 and p010, which all show left sides.
- Absent on p016, p023, p035 and p026 (376026), which all show right sides. On the right side
  the cab side is plain navy, with only a latch and a sticker, from the corner to the door.

**Window layout on car 1**, all in flush black frames (1.79-2.84 m):

- Inside the ring: a wide pane with a hopper, then a narrow pane.
- Between the doors: narrow, then three wide panes with hoppers, then narrow.
- Behind door 2: three panes.

The 376 has no continuous window band.

## Livery shapes (navy)

- **Cantrail line:** orange, at 3.27-3.28 m on every car. On the face it is a thin line at
  3.226-3.247 m that turns up round the corners.
- **Orange ring (car 1, both sides):** around the first saloon window.
  - A thick top panel at 2.88-3.13 m with a tan vent.
  - Vertical bars at 2.30-2.35 m and 4.93-4.98 m, and a bottom bar at 1.72-1.76 m.
  - **Crop settled: `s-ring-016`**, with `s-ring-l-026` and `s-cab-l-019` for the left side.
- **Door head:** orange over **door 1 of car 1 only**, at 2.83-3.04 m. Door 2's head is navy.
- **Doors:** light blue leaves, each with one tall window of about 0.30 m (1.73-2.78 m).
  - The leaves stop at 2.83 m, and the opening has a black frame.
  - The cab door is navy, with one tall window split by a transom at 2.33 m.

## What the current model (`class376` = `class378` with a panel override) gets wrong

1. **Livery:** `liveries/SE.ts` `'376'` is white with yellow doors and a navy solebar band. The
   current livery is navy with light blue doors, the orange ring and door head, and a grey roof.
2. **Face:**
   - The yellow runs 0.4-1.92. The real yellow is 1.257-1.985, with navy above the band.
   - The model has one pane where there are three, and one wiper where there are three.
   - It has no number position, destination display, lamp iron or dome marker.
   - The lamp boxes are generic. The real lamps are figure-of-eight bezels with the head at
     ±1.04 / 1.555 m and the tail at ±0.79 / 1.495 m.
3. **Doors:**
   - The cab door is at 1.4 with w 0.6. Measured: 1.82, w 0.88.
   - The passenger doors are at 5.6 and 14.75 with w 1.6. Measured: 5.72 and 14.32, w 1.50.
   - The model has no cab-side window. The real one is on the left side only.
4. **Windows:** the model has 3 long strips. The real windows are 10 separate panes (see spec).
5. **Car lengths:** the model has 20.0 / 19.66. Published: 19.95 / 19.69.
6. **Nose profile:** the model's face leans back 0.2 m by 3.6 m. Measured on the p026 profile:
   the yellow face is upright, the band leans about 0.15 m by 3.23, the valance is set back
   0.08 m, and its bottom sweeps back.

## Doubts

- **Car 2:** door centres 5.30 and 14.40 come from p010 at long range (±0.25 m). The window
  layout there is coarse.
- **Door width:** door 1 and door 2 fit 1.44 and 1.55 m. I took 1.50 for both.
- **Cab door position:** p016's fit puts the cab door 0.15 m further back than p026 does. I used
  p026 because it is side-on.
- **Heights:** these rest on the Electrostar 0.955 / 3.28 m. The face orange line is 3.23 m on
  p035 and p010. The p026 profile reads 3.07 m, but that line is where it dips round the corner.
- **Not measured:**
  - The bogie centres and wheelbase (the frames hide the axleboxes).
  - The dome marker's height, which is approximate because the dome is set back.
- **Destination display:** a separate box at the top of the left pane (orange LED), under
  `face.shapes`, colour `destination`.

## Builder needs beyond the face schema

- `cab.sideWindow`, with `side: "left"`. A per-side glazing entry is needed.
- Hopper toplights (`cab.hoppers`).
- `liveries.SE.ring` and `doorHeads`, which are per-car, per-door shapes.
- `face.markerSurround`: a D-shaped outline with a flat bottom.
- `lampRim: "bezel"`: a yellow plate with a black outline line, rather than a black rim.
- The roof colour differs from the body colour, and only the dome is navy.

## Camera match

| Photo | Size | What it shows | Points |
|---|---|---|---|
| p016 | 3840x2559 | Leading car, nearly straight, right side, three-quarter | 12 (3 held out, including the off-plane `lamp0-tail`) |
| p035 | 1600x1067 | Face at 28.6°, right side | 12 (3 held out, including `iron-top`, a modelFace point) |
| p019 | 1600x1067 | Left side, three-quarter, tail lamps lit | Third option, not picked |

There are no axle points: the bogie frames hide the axleboxes on p016.

## Logos

Measured into `liveries.SE.logos` (SE-white is not rendered and was skipped). Ruler: on the
right side, the class calibration's projective fit on p016 (door edges, residuals 2-3 px);
on the left side, a 1D projective fit on p010 through the ten glass edges of the five panes
between doors 2 and 3 (rms 0.07 m). Heights on p016 between the window-surround bottom
(1.79) and the body bottom (0.955). Crops `logo-*`.

- **southeastern wordmark, cab car**: 9.49-10.81 m, 1.38-1.58 m (baseline to ascenders), between
  doors 2 and 3 under the window line. The sides agree on length (1.30/1.33 m) and differ by 0.17 m
  in place, so the two are averaged. Both sides read normally: "south" is white, "eastern" is light
  blue (#B0D2EA, lighter than the doors).
- **southeastern wordmark, next car**: 9.55-10.86 m, with the cab car's height. It is measured on the
  left side only (p010, jpeg-blocky). It is visible on the right side in p016 but too small to measure.
- **Wheelchair pictograms**: blue squares (#264D7A) with a white wheelchair, one each side of
  cab-car door 2 (the accessible door). The front one is 4.83-4.96 m, 1.33-1.54 m; the rear one is
  6.57-6.71 m, 1.38-1.59 m. They are on both sides. The next car's doors carry none.

Face: no logo, only the unit number. Art needed: `southeastern-wordmark`, `wheelchair-sign`.

## Elevation and pairs

Renders of 2026-10-05 (64 samples), before the paint-edge merge and the logos.

- **Elevation: 28/31** (was 23/30). The checks that were wrong:
  - Door 1 and door 2 openings ran from the door centre, which is the leaf joint, so they saw one
    leaf (5.72-6.44). They now measure each leaf from its own middle: 4.98-6.44 and 13.58-15.05.
  - The door 1 leaf column at x 5.35 ran up the leaf's window (5.19-5.49); it is at 5.60 now.
  - "Plain navy cab side, right side" cannot be seen: the elevation is the near (left) side,
    which has the window. It is now a glass run for that window (0.82-1.25, passes); the right
    side is judged on the `cab-side-right` pair.
  - The three panes behind door 2 abut in one black surround, on the train (p016) as in the
    render, so their derived per-pane checks merge into one run (15.22-18.57) and still fail. A
    run check of the whole surround passes. Needs the shared derived checks to join abutting
    panes; the model is right.
- **Pairs:** 16 judged (checklist.md). `door2` and `car-end` moved to `match-p016`: the
  `ref-016` framing put them off the edge. No model number changed.
- **Builder/pipeline gaps the pairs show** (none is a spec number): the cab-side window is drawn
  on the right side too; white grab rails beside the cab door that the train does not have; no
  transom in the cab door window; lamp plate dark grey, not yellow; no coupler recess or bumper
  blocks; no dome marker; no destination display; no ring vent; navy, not black, between panes
  inside the ring and round the windows (`windowSurround`); no hoppers; no black frame round the
  door openings.
