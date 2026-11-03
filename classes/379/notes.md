# Class 379: notes

Evidence: `evidence.json` (13 refs, 44 crops with readings, second readings on the
front, livery and door crops; 31 colour samples), `samples.json`, `spec.json`
(every number traced), `match/g018.json`, `match/g003.json`.

Sign convention: `m` > 0 = right as seen head-on = the train's LEFT side. Every side photo
used (g018, g003, l029) shows the train's RIGHT bodyside (nose to the right of the frame),
which is Blender +Y, so both match files are `"side": "far"`, and the visible lamp/screen
are lamp1/screen1.

## Livery decisions

- **GN (2025-2026)**: never repainted. Every dated GN photo (379002/022 2025-02-10,
  379024 2025-04-04, 379010/028/027/006 2025-05-29, 379003 2025-10-09, 379018 2026-07-31:
  8 units, 5 dates) shows the ex-NXEA/GA scheme: white body, near-black door leaves,
  light grey roof, a thin orange cantrail line that sweeps up round the cab corner into the
  cap line, a thin yellow first-class strip, white lower face and white dome. GN logos and
  "First Class" vinyls are not rendered.
- **LE (2019-2021)**: the same scheme with Greater Anglia / Stansted Express vinyls
  (379029 2021-05, 379017 2021-07, 379008 2019). Sampled separately (l029, l017): doors
  #212029 vs GN #2F3436, panel yellow #FEAE18 vs #EFB131, strip #E5B53F vs #FCE56E. The
  differences are inside the spread between GN photos of the same paint (GN yellows run
  #EFA517-#F0BE2E) and the 2021 photos are more saturated, so this is the same paint; the
  LE entry keeps its own sampled values anyway. No red doors, no swoosh.
- No cab-end shape, no car-end band, no window band, no door stripes (s-corner-018,
  s-end-018, s-end-003, s-side-l029).
- First-class strip: 3.205-3.255 m, from 2.03 m (slanted cut a few cm behind the cab
  door) to 4.675 (door 1), then 6.305-11.80 m; it stops over door 1 (both readers). The
  diagram draws it continuous: wrong.
- 379002 has no warning triangle on its left panel; seven other units do. Kept fleet-wide.

## Body: what differs from the 377

- **Car length 20.20 m, not 20.70.** Published: DMC/DMS 20.39 m for both 377 and 379
  (Wikipedia, Bombardier Electrostar dimensions table; includes the gangway), intermediates
  19.99 m. On g018 a 1D projective fit through cab door, door 1, door 2 and the car end
  fits L = 20.0-20.2 at 1.9-2.3 px rms; L = 20.70 with the diagram's door positions gives
  10.8-15.9 px. g003 agrees (1.2 px vs 8.9). The WestRail642fan drawing is ~2.5 % long.
- **Doors**: door 1 4.675-6.305 (centre 5.49, leaf pair 1.63 m wide), door 2
  13.985-15.615 (centre 14.80); spacing 9.31 m. The diagram's 9.02 m spacing is rejected;
  the 377's centres (5.582/14.829, w 1.76) fit at 4.8 px rms with +/-8 px door-edge
  residuals, so the 379's door is narrower and ~0.09 m nearer the cab (or the 377's 1.76
  includes the black surround: worth checking on the 377).
- **Windows**: separately framed with white pillars and ~0.08 m corner radius, no black
  band. Bay 1: a narrow pane 2.16-2.93 next to the cab door, a wide one 3.00-4.54. Bay 2:
  glazing 6.63-13.83 as four panes. Beyond door 2: weak (far, 50 px/m), 377 kept.
- **No fixed pane ahead of the cab door** (plain white corner panel).
- Door leaves near-black with a tall narrow window in each leaf, panes [0.15, 0.63] from
  the door centre.
- Heights, wheelbase, bogies, car 2 and the nose profile: the 377's (same shell; g018
  bodyside proportions match within 0.04 m).

## Face

377/4 layout, white lower face and dome, triangle on the left panel only, number on the
right panel only. Measured head-on on g024 (telephoto, symmetric, 301 px/m from the 2.80 m
silhouette, round head lens confirms vertical = horizontal), checked on l017 and g018.

**Every face number disagrees with classes/377/spec.json** while all their ratios agree:
head lamp m 0.962 (377: 1.06), tail 0.733 (0.81), screen outer 1.178 (1.336), frame half
0.505 (0.597); screen bottom 2.062 (1.875), lamps 1.655/1.584 (1.37/1.32), panel bottom
1.436 (1.149). Three photos with independent anchors (g024 body width + rail gauge, l017
lamp spacing, g018 rail) agree with each other within ~0.05 m. The 377's own photos show
the same ~0.2 m of white outside the panels that its spec leaves out (0.06 m), so I think
the 377's p308 calibration is about 13 % too coarse. classes/375/spec.json (same cab)
falls in between (lamps 1.548, screen outer 1.265, screen bottom 2.0). Someone should settle
one Electrostar cab and use it for all three; the cap outline agrees with the 375's within
0.02 m.

## Current model (`class379 = { ...class387, nose: electrostarGangway }`) gets wrong

- Old pre-measurement body: cantrail 3.43, window 1.95-2.95, doors at 6.02/15.15, length
  20.4, wheelbase 2.6. The spec has 3.30, 1.84-2.87, 5.49/14.80, 20.20, 2.33.
- Old gangway nose: no proud frame or bellows, no figure-of-eight bezel (two housings a
  side), no cap line, wipers parked on the outer edges, the yellow running down the lower
  face, no triangle, no dome marker.
- LE livery with red doors and swoosh: wrong, doors are near-black and there's no swoosh.
- GN default doors light grey (#C3C7CB): wrong, near-black.

## Doubts

- Absolute face heights hang on the cap line = 3.26 m (the side's cantrail line sweeps
  into it) and on a rail estimate of +/-10 px on g018.
- Gangway frame depth, nose profile and screen frame width are not measured (377 values).
- Bay 3 windows and car 2: not measured.

## Camera-match photos

- **g018** 379018 at King's Cross, 2026-07-31, 3840x2880: close three-quarter of the
  right side, sharp, straight track; face (lamp, screen, triangle) plus the whole cab car
  side. `match/g018.json`: 13 points (3 off-plane on the face), 3 held out.
- **g003** 379003 at Shepreth Branch Jn, 2025-10-09, 3648x2184: from above, both lamp
  clusters and both screens visible plus the cab car's side. `match/g003.json`: 10 points
  (6 on the face, both sides), 3 held out. Axles hidden or ambiguous on both, so none were
  picked.
- **g024** 379024 at Hornsey, 2025-04-04, 3840x2883: telephoto head-on, the face reference
  (no bodyside, so no match file).

## Logos

Measured into `liveries.GN.logos` and `liveries.LE.logos` (the livery decision above said
GN logos and "First Class" vinyls were not rendered; this records them for the decal
mechanism). Ruler: 1D projective fits along one row through door 1 (4.675/6.305) and
door 2 (13.985/15.615) edges; heights per column between window bottom 1.84 and body
bottom 0.94 (the crease reads 1.27). Crops `logo-*`. New refs in evidence: g027 (left
side, GN) and l029b (left side, LE, 2019).

GN:
- **Great Northern logo, cab car**: purple box with white "Great Northern" 9.48-10.75 m,
  1.55-1.82 m, and a light-blue downward triangle under it to 1.32 m. g018 and g003 agree
  within 0.08 m. Same art on the left side (g027, 9.4-10.7): the triangle hangs under the
  right-hand part of the box as seen, so under the front half on the right side and the
  rear half on the left. Box #392B4F, triangle #6EB2DB.
- **First Class box**: outlined white box, black text set to its right end, 7.06-8.21 m,
  1.43-1.67 m. Right side only (g018, g003); the left side is bare there (g027).
- **Great Northern logo, next car**: 9.72-10.99 m (g003, rms 0.17 m), cab-car heights.
  Left side not seen.

LE:
- **greateranglia wordmark, cab car**: 8.85-11.32 m, 1.30-1.67 m, both sides (l029
  right, l029b left agree within 0.11 m), reads normally on both: "greater" red
  (#B05D62 from thin strokes, the paint is deeper), "anglia" near-black #2E2C2B.
- **First Class box**: 7.05-8.22 m, 1.43-1.65 m, the same vinyl and place as GN's.
  Right side only (bare on l029b).
- **greateranglia wordmark, next car**: seen foreshortened on l029b, 8.85-11.30 m.

Face: no logos on either livery (unit number and warning triangle only, already in the
spec). Art needed: `great-northern-logo`, `first-class-box`, `greater-anglia-wordmark`.

## Elevation and pairs

379-GN, renders of 2026-10-05 (before logos and the paint-edge merge): `elevation.py`
29/29, was 26/29. All three failures were wrong checks, no model number changed:

- door 1 leaf column at x 5.2: its middle (2.1 m) fell in the leaf's window; moved to 4.95,
  on the front leaf's paint (0.967-3.255 measured vs 0.955-3.256).
- door 1 leaves run: probed the middle of the pair, where the joint (#1B1D1E) is darker than
  the door colour by more than its tolerance; now `leaves: 2` (each leaf from its own middle),
  4.869-6.494 vs 4.875-6.505. Door 2 given the same, and both names now carry the x they test
  (they still said 4.675-6.305 and 13.985-15.615).
- white panel ahead of the cab door: expected 0.5-1.16, with no source; in a flat elevation
  the curving corner is still white seen side-on, so it runs to the nose outline
  (`nose.profile` at 2.3 m: 0.024) and the cab door's front edge (1.577 - 0.41 = 1.167).
  Measured 0.069-1.144.

Same fixes applied to `elevations.LE`. 379-LE, rendered 2026-10-05 21:11 (16 samples, logos as
meshes): 29/29, was 27/29. Both failures were one wrong check, no model or livery number changed:

- the two first-class strip runs at row 3.23 (2.23-4.875 and 6.505-12.0) broke at single
  pixels (3.31, 8.74, 11.24: #E7C177, 55 off). The strip is four pixels tall and 3.23 rounds onto
  its bottom row, which the low-sample render's pixel filter speckles with the white below; the
  row above is clean. Moved to 3.24 (the rendered strip is 3.218-3.255): measured 2.231-4.857
  and 6.507-11.994. The GN render (64 samples) passed at 3.23 (worst 34 off); GN left as is.
- No check row crosses an LE logo: the wordmark (both sides, cab 9.05-11.52 and next
  8.85-11.30, 1.30-1.67) lies between the doors' rows (x 4.875-6.505, 14.185-15.815) and
  under the window rows; the First Class box (7.25-8.42) is on the right side only.

LE pairs judged 2026-10-06 against 379-LE ref-l017/ref-l029 (logos as meshes): z signs were
already right; `cab-end-le` widened to z 0.4-1.46 so the crop reaches the panel and lamps as the
l029 crop does. lamps-le and cab-end-le match; face-le shows the same open face items as GN
(gangway frame too big and grey, door seams, no destination display, coupler). The LE wordmark and
First Class box sit where l029 has them and read right. No cab side window ahead of the cab door
on either the render's or the photo's right side, unlike the 387 (see its notes).

Pairs: every box had z on the far side (see the sign convention above: the side photos are
+z), so 17 of 24 crops showed the gangway or the wrong panel. Flipped all; corner-door cut to
x 1.25 to match its crop. Judgements in checklist.md. Model questions, not changed:

- gangway frame looks too wide and too tall head-on (top near the roof, hiding the dome and
  its marker; photo: frame top just above the cap), and grey-brown not near-black.
- the warning triangle renders as a rounded teardrop (corner rounding), not a triangle.
- the cab door window is narrower than the photo's and has no droplight bar.
- door leaves read dark navy on the photos (door, bay2, cab-end-le) against #2F3436.
- ref-018 cannot show the car end, so `car-end` needs another view or framing.
