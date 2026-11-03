# Class 455: notes (2026-10-06)

Rendered: South Western Railway, historical (last service 2026-03-20), in the
livery the units carried to the end: South West Trains red with the blue and
orange cab-end sweep, yellow door surrounds, SWR's white wordmark on each car.
No 455 was repainted into SWR's own livery; 455868's BR blue/grey heritage
scheme is a one-off and is not rendered. All photos are 2022-2026 and show the
refurbished front (new lamp boxes, gangway frame); 455/7, /8 and /9 fronts are
the same (p701, p733, p861, p920). The rendered second car is the MSO in every
sub-class (the 455/7's ex-508 TSO is car 3).

## What was measured

- Bodyside: the Unisouth SWT diagram, the same template as the 317/318/320
  drawings. Horizontal scale from the bogie centres (14.17 m), vertical from
  rail to roof (3.77 m); x from the face (diagram 123 px), the gangway frame
  standing 0.30 m ahead of it. Windows confirmed on 455864 (p864) by a 1D
  projective fit: held-out edge 0.6 cm; door centres within 1.6 cm. Door
  leaves narrower than drawn (1.52 m, not 1.74).
- Face: 455861 (p861), long lens, nearly head-on: 388.7 px/m, anchored on the
  body bottom. Every feature mirrored from both sides.
- Livery: the sweep from the diagram's colours, checked at two heights on
  two photos (within 15 cm); orange lines and door surrounds from the diagram,
  the arch over each door from the photos.
- Colours balanced against the white wordmark (p864, sun) and averaged with
  the close-up (pwm) for the red.
- Wordmark: traced from pwm into `logo/SW-wordmark.svg` (21 shapes, aspect
  8.4), placed from p864 and pvx (3.0 m long, centred 10.0 m, 1.49 m up).

## What the old model got wrong

| | old (electric.ts class455) | measured |
|---|---|---|
| cab door | x 2.09, w 0.80 | x 1.69, w 0.905 (+ a fixed cab window ahead of it at 0.77..1.17) |
| doors | 6.84 / 13.69, w 1.20 | 6.46 / 13.41 from the face (6.76 / 13.71 from the frame front), w 1.52 |
| bogies | 2.47 / 16.64 | 2.00 / 16.18 from the face |
| heights | bottom 1.0, cantrail 3.43, window 2.05..3.05 | 0.897, 3.55, 2.088..3.047 |
| nose | undercut lower face, all-yellow front, flush gangway | upright face, blue above / yellow / red band, bare steel gangway frame proud of the face, recessed door |
| screens | black frames, wipers up the outer edge | blue moulded frames with destination displays, wipers pivoted at the top hanging outwards |
| lamps | one generic housing | a recessed yellow box each side: headlamp outboard, LED marker/tail inboard |
| livery | red, blue doors, no sweep, no surrounds, no branding | blue cab end + orange sweep, yellow surrounds (on the body, over the top), orange cantrail and waist lines, SWR wordmark both cars |

## Open questions

1. Gangway frame depth: the drawing's 0.30 m is kept; p861's head-on shift
   says 0.14-0.21, the second reader 0.3-0.6 from p920/p701. A side view of
   an uncoupled front would settle it.
2. The orange line near the top: 3.44 m along the bodyside on the drawing,
   but 3.13 m at the face corners (p861) and at about window-top height on the
   cab side (p701, p920). It probably steps down over the cab; only the
   face stubs are at the photo height.
3. The fixed cab window is drawn at the saloon windows' heights (2.09..3.05);
   it is 2.24..3.0.
4. Colours: the p864 neutral is partly clipped, so the blue (#325BC9) may be
   a little light. The face's samples are in shade.
5. Horns (two on the roof, either side of the dome) have no RoofItem kind.

## Pipeline options needed

- A gangway door with its own window and colours (blue upper with a window,
  yellow lower, red strip), and set back inside its frame: today the door is
  one colour, flush at the frame's front.
- Per-window heights in CarSpec (the fixed cab window).
- Roof horns.
- `logos/SW-wordmark.svg`: the traced file is in `classes/455/logo/`; it
  needs moving to `logos/` (with a row in logos/SOURCES.md: traced from
  "Class 455 December 25 cf 01.jpg", Secretlondon, CC BY 4.0). `logos/SW.svg`
  is SWR's stacked logo on white, which these cars don't carry.

## Next steps

1. Move the wordmark to `logos/`, point fleet.ts '455' at a `fromSpec`
   build (bremu.ts) and liveries/SW.ts '455' at `liveryOf(spec455, 'SW')`.
2. Render elevation, hero, close, corner; elevation.py and compare.py with a
   corner-door pair from p864.
3. Camera-match p864 (cab car and MSO bodyside, 46 mm APS-C, focalPx 7921 at
   3840 wide) and p861 (93 mm APS-C, focalPx 16014 at 3840): held-out 6 cm.
4. Settle the frame depth and the cab-side line height with the match.

## Camera match (2026-10-06, not yet passing)

Picks: `match/p864.json` (22 points: three saloon windows' glass corners,
four lamps, display corners). The bodyside alone fits to 2.3 px (free focal
7149 px, EXIF 7550-7921) and the face alone to 2 px, but together no camera
fits better than 18 px. The same happens on p701 (rough picks): 24 px joint,
4.5 px side alone. Freeing model parameters, both photos ask for the face's
features about 0.24-0.32 m higher relative to the windows (p864 0.27 with the
face 7 % smaller about its foot, p701 0.32). The horizons agree: on p864 the
windows put the camera 2.47 m above the rail, the face's lamps and displays
2.2 m. The leading wheel (about 2395, 2050) sits where the "face too low"
reading puts it, not "windows too high". This matches open questions 2 and 3
(face-corner orange line 3.13 vs 3.44 on the side; fixed cab window higher
than drawn). Likely cause: p861's face scale was anchored on the red band's
foot as the body bottom (0.897); with y' = 1.167 + 0.93 (y - 0.897) the roof
ridge reads 3.78 against the published 3.77. Not applied: even with it the
joint fit stays at 5-6 px, and the window verticals lean more than the
model's tumblehome predicts on all three photos (window tops want about 4-5 cm
less inboard). A clean re-pick of p861 (face scale from the lamp spacing,
heights from the rail) is the next step.

### Applied 2026-10-06 (later)

Face heights moved y' = 1.167 + 0.93 (y - 0.897) (trace face.heights), with
a dark headstock shape from 0.85 to the red band's foot. Re-solved with the
window tops dropped (the hopper vents' dark glass reads 12-14 cm under the
drawing's glass top on both photos): p864 held-out 3.1 cm, rms 9.7 px;
p701 held-out 2.6 cm, rms 15 px (rough picks). Still above 5-6 px: the
leftover is the window lean (tumblehome) and the face's width.
