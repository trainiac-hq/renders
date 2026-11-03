# Class 375: measurement notes

Status: evidence, crops (45, all read, front/side/livery crops second-read),
samples, spec.json, two match files. Every number's source is in
`spec.json` `trace`.

## Subject and fleet decisions

- Body: 375/7 and 375/8 (15 + 30 units, one body; dia78 covers both).
  Face and lamps: **375/8**. The 375/8 and 375/9 (30 + 27) have only the
  377/4 figure-of-eight bezel: f-face-805, f-face-821, p803, p814,
  f-lamps-r-908.
- Lamps differ by subclass. The 375/6 **and 375/7** (30 + 15 = 45 units)
  add a separate round tail lamp per side, outside the peanut, inboard and
  lower. Seen on f-face-713, f-face-706, f-lamps-r-613 and f-lamps-607,
  and both readers agree. On p613 it sits at m about 0.66 and y about
  1.43, r about 0.05. It is not rendered. To draw the /7 face,
  it goes under a per-subclass `faceShapes`.
- First class: none on the 2024-2026 train. Southeastern has declassified
  it (Commons, 375803 interior, 2024). The 2019 refurb diagram's yellow
  outline on car 3 is gone on p802 and p629 (2025). The cab car has none
  (dia78, dia6).
- Car 2 (`next`) has a **maroon** frame round its first bay and door 1 at
  the end next to the cab car, on both sides (p802, p629, p805, dia78). It
  is described in `liveries.SE.shapes`. I don't know what it signifies.
  Its colour is not balanced because there is no neutral on car 2.

## Body: differences from the 377

- The diagram `dia` is a pixel copy of the 377 drawing, so it was not used
  as evidence. Door and window positions come from the 375709 side-on
  (p709, two frames, 2015 white livery; the body is unchanged). The same
  method run on the 377's own side-on photo reads 9% long on both trains,
  so the ratio is what counts. Within 0.02 m, the 375 matches the 377: cab
  door 0.967-1.796 m (377: 1.787), door 1 front edge 4.70 m, first bay
  glass 1.92-4.58 m with its mullion at 2.74 m. The p713 and p814 1D fits
  agree with the 377's door spacing.
- Two things differ from the 377 spec:
  - The cab door's droplight is taller: 1.80-3.02 m with a transom at
    2.36 m. The 377 spec has 1.84-2.83.
  - The fixed cab-side window is 0.58-0.94 m by 2.35-3.02 m. The 377 spec
    has 2.42-2.81.
- The cab door is navy. The passenger door leaves are cyan full height,
  with no stripe. Leaf windows are 0.25-0.66 m from the door centre and
  1.90-2.87 m high.

## Face: differences from the 377 spec (p803, 508 px/m)

- Confirmed on the 375:
  - the cap, its top edge from 3.59 m at the centre to the orange line at
    m 1.185;
  - the orange line, 3.26-3.29 m, turning up the corner;
  - the gangway door half-width 0.375 including its seals;
  - the outer bottom panel radius of 0.2 m;
  - the screen top at 3.26 m.
- Different on the 375:
  - Gangway frame: half 0.487 at the front and 0.523 at its base, 1.02-3.53
    m. The 377 spec has 0.597 and 0.862-3.577.
  - Screen outer edge 1.265 (377: 1.336). Screen bottom and panel top at
    2.00 m (377: 1.875).
  - Panel bottom 1.31 m (377: 1.149). Panel outer edge 1.262.
  - Lamps: head m 1.031, y 1.548, r 0.122; LED m 0.781, y 1.475, r 0.079.
    Bezel radii 0.178 and 0.143. The 377 has r 0.105 and 0.065 at 1.37 and
    1.32 m.
  - Number: blue `#517ABC`, centre m ±0.90, y 1.84 m, digits 0.104 m high.
  - Wipers: pivot (0.90, 2.075), tip (0.56, 2.655).
  - Marker at 3.68 m.
- New items with no 377 equivalent: the destination display on the
  left-as-seen screen, the coupler and the valance.
- **Doubt.** Every lower-face height is 0.16-0.19 m above the 377 spec's,
  but the cap, the orange line and the valance bottom agree. p613 gives
  the same proportions. Either the 375 face really differs, or the 377's
  p308 vertical scale is about 8% large. The 377 needs re-checking
  before trusting either.

## What the current model (`class375 = electrostarBase`) gets wrong

- **Face:**
  - There is no proud gangway frame and no cap.
  - The orange line is missing.
  - The number is missing.
  - The lamps are boxes instead of the peanut.
  - The panel is one box at 0.9-1.92 m; the real panel is 1.31-2.00 m.
  - The lower face is yellow where it is navy.
- **Heights:** cantrail 3.43 and window 1.95-2.95 m. They should be 3.30
  and 1.80-2.87.
- **Doors:** the cab door is at 1.9 m and 0.75 m wide; it should be at
  1.38 m and 0.82 m wide. Doors are 1.4 m wide at 6.02/15.15; they should
  be 1.76 m wide at 5.58/14.83.
- **Windows:** the first bay is drawn as two windows at 2.45-3.16 and
  3.37-5.0 m. It is one bay at 1.92-4.58 m with a mullion at 2.74.
- **Running gear:** the wheelbase is 2.6; it should be 2.33 (377).
- **Livery** (`liveries/SE.ts` default):
  - Body `#1E2A5A` should be `#384274`.
  - Doors `#3CB4E5` (unsampled) should be `#449DC7`.
  - The orange band at 0.96-0.98 m should be at 3.27-3.30 m.
  - The window band is black; it should be navy with separate black
    panes.
  - The car 2 maroon frame is missing.
  - The navy number on yellow is missing.

## Camera-match photos

- `match/p814.json`: p814, 3840x2354. A three-quarter of 375814's far cab,
  showing the near (right) bodyside and the face. 9 points; held out:
  lamp0-tail, door1-rear-top, number-near-start.
- `match/p803.json`: p803, 3840x2560. Near head-on. 12 points; the depth
  comes from the marker (on the dome, set back) and the gangway door's top
  corners (proud of the face).
- Also usable: p713 (1600x1067, three-quarter, 375/7, so it has the third
  lamp) and p709 (3840x2616, side-on, wide-angle, from a moving train).

## Elevation and pairs

2026-10-05, on the 64-sample 375-SE renders (before logos and the paint-edge
merge). `elevation.py --livery SE` went from 21/26 to 25/27.

Wrong checks, fixed (each says why in its `what`):

- door 1 cyan column at x 5.2 ran up through the front leaf's pane
  (5.12-5.53); moved to 5.66.
- the navy column under the windows expected 1.0-1.75 m, neither edge: with
  no window band it runs body bottom to glass, 0.94-1.886 (measured
  0.942-1.880). Moved from 10.2 (under the wordmark) to 7.6.
- the cab pillar run at 2.0-2.1 hit the cab door's grab rail (2.03-2.07);
  now a colour point at 2.11.
- the car 2 band run read 0.62-4.58 because door 1 and its seam cut the
  row; it now ends at the door's front edge (4.602), the door top checked
  apart.
- the car 2 door-top column at 5.37 sat on the leaf joint; moved to 5.0.

Wrong livery, fixed in spec: the maroon band's rear end and the pillar's
rear edge were the 377's door edges (6.25, 4.49); car 2 door 1 is now
1.53 m wide (4.602-6.132). Band to 6.132, pillar to 4.602 (trace
`liveries.SE.shapes.doorEdges`). New check: navy at 6.2 behind the door
(fails until re-rendered).

Not fixable in the spec: the door leaves' tops are maroon on every photo
(p802, p629, p805), but `pipeline/paint.ts` paints door colour after every
livery shape. It needs a swoosh layer over the doors.

Pairs: 17, one line each in checklist.md. Model gaps they show: lamp
housing solid black (should be a yellow plate in a thin black line), no
dome or marker on the cap, gangway frame light grey (photo near black) and
rising into the cap, gangway handles on the edge not the middle, square
coupler (Dellner), no transom in the cab-door droplight, straight door-leaf
bottoms, yellow panel stopping short under the lamps. car-end is outside
the ref-814 view.

## Open questions

- Is the 377 face's vertical scale right (see the face doubt above)?
- Gangway frame depth: 0.47 m was kept from the 377. f-gangway-607 only
  bounds it to 1/4-1/3 of the frame width.
- Maroon colour and meaning.
- Axles are not picked: they are too dark or blurred in every photo.

## Logos

Measured into `liveries.SE.logos` (positions after the 0.20 m faceAhead move). Ruler:
1D projective fits along one row through door 1 and door 2 edges. With the spec's 1.76 m
door width both photos leave the same 0.11 m residual pattern, so the painted cyan reads
narrower than the opening at wordmark height; fitting the width too (centres 5.782/15.029)
gives 1.54 m (g613) and 1.52 m (m809) with residuals under 0.002 m. Heights per column
between window bottom 1.886 and body bottom 0.94. Crops `logo-*`. New refs: g613 (375613,
right side, 2024), m809 (375809, left side, 2024), s624 (375624, 2025).

- **southeastern wordmark, cab car**: lower-case one word, "south" white, "eastern" light
  blue, 9.66-11.08 m, 1.58-1.79 m, between doors 1 and 2 just under the windows. Both
  sides (g613 right 9.73-11.15, m809 left 9.59-11.01), same artwork reading normally, so
  "south" is the front half on the right side and the rear half on the left. "eastern"
  reads as the door cyan (#449DC7) wherever its thin strokes are not diluted by the navy.
- **southeastern wordmark, next car**: same place relative to door 1, 9.24-10.66 m (m809
  left side, 22 px wide, centre 9.95 = door 1 centre + 4.58 as on the cab car); also seen
  behind door 1 on p622 (left) and as a blur on p821 (right). Cab-car heights.

Face: no logos (unit number, warning label and lamps only, already in the spec). No
"First Class" vinyl on the maroon bay was visible on any photo. Art needed:
`southeastern-wordmark` (the same artwork the 376 uses).
