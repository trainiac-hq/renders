# Class 376 Electrostar, Southeastern (navy): detail checklist

Compared against the 376-SE renders of 2026-10-05 20:08 (64 samples: `elevation`, `ref-016`,
`ref-019`, `ref-026`, `ref-035`, `match-p016`), built from `spec.json` by `electrostarFromSpec`.
These renders predate the shared paint-edge merge and the operator logos (wordmark, wheelchair
signs), so neither is judged here. The photos are p016 (right side, three-quarter), p019 and p026
376031 (left side), p035 (face at 28.6°).

Ticked only when a crop of the render beside the same area of a photo matches in shape,
position, size and material. Left and right are as seen looking forward from the cab, judged
against the unmirrored photo.

Status: `todo`, `partial` (present, not yet matching), `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Upright yellow face, band leaning back gently, navy dome rounding back | done (`corner-door`, `dome`) |
| 2 | Nose plan | No gangway; flat face with medium-radius vertical corners | done |
| 3 | Windscreen | One black band, three equal panes, orange line along its top turning up at the corners, destination display top left | partial (band, panes, orange line right; no destination display; the orange line steps at the near corner where the photo's is continuous) |
| 4 | Wipers | Three, one per pane, pantograph arms | partial (three, placed right; single thin arms, not pantograph pairs) |
| 5 | Cab-side window | Left side only, 0.82-1.25 x 2.31-2.98, top-front corner round, rear corners square | partial (left side right in place and size; corners all equally round; the right side wrongly has one too: the pipeline puts cab glazing on both sides) |
| 6 | Warning panel | Yellow band 1.257-1.985 m only, navy above and below, round outer bottom corners | done (`yellow`) |
| 7 | Lamp clusters | Figure-of-eight, head outboard and higher, tail inboard and lower, in a yellow plate with a thin black outline and screws | partial (shape, size and order right; the plate renders dark grey, not yellow; tail lens a plain beige disc, not an LED matrix) |
| 8 | Lower front | Two navy bumper blocks with a crease, a rectangular recess about 1 m wide holding the Dellner head | todo (render has a black trapezoid patch with a small grey block; no recess, no bumper blocks) |
| 9 | Number | "376 035" dark navy-black, top left of the yellow | done |
| 10 | Dome marker | D-shaped surround with a thin bright outline holding an oval lens | todo (no marker drawn) |
| 11 | Cab door | Navy leaf 1.38-2.26, one tall window split by a transom at 2.33, no outside rail | partial (place and colour right; no transom; white grab rails both sides of the door that the photos do not show) |
| 12 | Orange ring | Top panel 2.88-3.13 with a tan vent, bars, bottom bar; black frame filling the ring | partial (panel and bars right, elevation measured within 0.011 m; no vent; navy between the panes where the photo's frame is black; no hoppers) |
| 13 | Passenger doors | Two light-blue leaves, one tall window each, black opening frame; orange head on door 1 of car 1 only | done for leaves, windows and head (elevation within 0.026 m); partial for the opening's black frame and button panel, not drawn |
| 14 | Window panes | Ten flush black-framed panes on car 1; three abutting panes behind door 2 in one surround | partial (positions within 0.023 m; the black surround is not drawn, so panes sit on navy; no hoppers) |
| 15 | Livery | Navy body, light grey saloon roof, navy cab dome, orange cantrail line | done |
| 16 | Car end | Body tapers at the corner, dark gap to car 2, grey roof to the end | partial (`car-end` render crop small and soft; taper and gap not clearly readable) |

## Elevation (`elevation.py 376 …/376-SE`)

28/31 within tolerance. The three failures are the derived per-pane checks behind door 2
(15.22-16.03, 16.03-16.78, 16.78-18.58): the panes abut in one black surround on the train as in
the render, so one run of glass is 15.22-18.57 and no pane edge can be seen. An explicit check of
that run passes (0.010 m). Making the per-pane checks pass needs the shared derived checks to
treat abutting panes as one run; the model is right.

## Pairs (`compare.py 376 …/376-SE`), each judged on its own

- `corner-door` (ref-016, right side): nose corner, cab door, ring, door 1 and its orange head
  in the right places and colours; the render has a cab-side window on this side (the train has
  plain navy) and white rails either side of the cab door that the photo lacks.
- `lamps` (ref-035): figure-of-eight shape, size, head outboard and tail inboard right, number
  above right; plate dark grey instead of yellow with a black outline, no screws, tail a plain disc.
- `lamps-far` (ref-035): same as `lamps`, mirrored correctly.
- `lamps-lit` (ref-019): same layout; the photo's tail is lit red, the render's is unlit, and
  the plate is again dark grey.
- `screens` (ref-035): one band, three equal panes, orange line along the top right; no
  destination display, wipers single arms not pantographs.
- `yellow` (ref-035): band edges, round outer bottom corners, navy above and below, number and
  lamp-iron right.
- `lower` (ref-035): does not match: black trapezoid and a small grey block where the photo has a
  rectangular recess with the coupler head between two navy bumper blocks.
- `dome` (ref-035): navy dome and orange line right; no D-shaped marker; the line steps at the
  corner; the render crop's top is past the frame (black).
- `cab-door` (ref-016): navy door in place; window lacks the transom; white rails not in photo.
- `cab-side-left` (ref-026): window in place and size, corners all round where the rear ones
  should be square; door window lacks the transom; rails not in photo.
- `cab-side-right` (ref-016): does not match: the render has a window here; the photo is plain
  navy with a latch and sticker.
- `first-door` (ref-016): light-blue leaves, tall windows and orange head match; no black frame
  round the opening.
- `ring` (ref-016): orange panel, bars and bottom bar match in place; no vent; navy between the
  panes where the photo is black; no hopper.
- `door2` (match-p016, moved from ref-016, whose framing put door 2 off the left edge): leaves,
  windows and navy head match; no black opening frame or button panel.
- `car-end` (match-p016, moved from ref-016 for the same reason): navy, grey roof and orange
  line right; the crop is too small to judge the taper and the gap.
- `cab-end-left` (ref-019): window ahead of the cab door, cab door, ring and door 1 with its head
  in the right order and places; the cab door's window lacks the transom; white rails not in photo.
