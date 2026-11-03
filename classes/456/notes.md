# Class 456: notes (2026-10-06)

Rendered: South Western Railway, historical (withdrawn 2022-01-17). The units
kept the South West Trains red with the blue and orange cab-end sweep. SWR
replaced the SWT logo with its white wordmark (p004, the SWR-era drawing,
Kingston 2018). Photos are 2018-2019 SWR-era, plus two 2016 SWT-era close-ups
of the same paint for the front (p020c, p003).

## Diagram

`Class 456 swr.png` (Benspiersphotos, 2017, CC BY-SA 4.0) is the SWR-era
version of Unisouth's 456 drawing (`Class 456 Southern Diagram.PNG`, also
fetched as `dias`). Both are the same template as the 455/317/320 drawings:
the same door, window and wheel pixels from the cab door back. So the bodyside
uses the 455's calibration (71.84 / 81.4 px/m). x is from the foot of the nose
(58 px). The upper face leans back 0.40 m by 3.5 m.

## What was measured

- Bodyside windows and doors from the drawing, confirmed on 456004 (p004)
  by a 1D projective fit through six window edges (residuals at most 2.3 cm).
- Cab end from p004, where it disagrees with the drawing. The cab door is
  1.61..2.35 m (centre 1.98, w 0.74), 35-40 cm further back and 23 cm
  narrower than drawn. The short window behind it is 2.81..3.62 (frame), not
  2.42..3.72. The second reader agrees that this window is about half the
  next one's width. Extrapolated below the fit's range (held-out -9 cm at
  3.6 m), so it is less sure.
- Face from p004 (near head-on, 38 mm): one black surround with two panes;
  the display in the left pane; wipers parked flat from low central pivots;
  yellow panel, then a blue strip, an orange line and a deep red lower front
  with the coupler recess and white numbers. Lamp boxes have the headlamp
  outboard and the red LED cluster inboard.
- Sweep from the drawing, checked on p004 at about 2.6 m (blue edge 2.31 vs
  2.24 drawn).
- Colours balanced against the white wordmark (side) and the white number
  (front). The front red is deeper than the side's in this photo. The front
  yellow is clipped, so the door-surround yellow is used.
- Wordmark: the same artwork as the 455 (`classes/455/logo/SW-wordmark.svg`),
  3.0 m long, centred 10.9 m on the DMSO and 9.58 m on the DTSO.

## What the old model got wrong

The old class456 was the 455 body (`...class455`) with a gangway-less copy of
its face:

| | old | measured |
|---|---|---|
| length | 19.83 | 20.41 at the nose's foot, 19.99 at the face's top (published 19.95) |
| cab door | x 2.09, w 0.80 | x 1.98, w 0.74, with a narrow short window behind it |
| doors | 6.84 / 13.69 | 7.357 / 14.303 from the nose's foot |
| bogies | 2.47 / 16.64 | 2.909 / 17.079 |
| nose | the 455's undercut profile, upright | deep red skirt to 0.12 m, upright lower nose to 1.24 m, upper face leaning back 0.40 m |
| face | two separate screens, all yellow | one black surround with two panes, display, wipers flat; yellow / blue / orange / red bands; coupler recess |
| second car | 455 MSO saloon | DTSO: the cab car reversed (its far end is a cab) |
| livery | red, blue doors | sweep, yellow surrounds, orange lines, wordmark on both cars |

## Open questions

1. The cab door and short window positions rest on one extrapolated fit; a
   camera match (p004, focalPx 6543 at 3840 wide) should confirm them.
2. The yellow panel's middle section stands proud (p020c, p006, second
   reader). `Face.rise` lifts the whole panel; this needs a per-panel rise.
3. The lower edge of the blue on the cab side near the front is about 1.1 m
   on the drawing and 1.31 m on the face. It was left as drawn.
4. The waist line is about 1.46..1.50 m on p004. The drawing has 1.33..1.36
   (the 455 drawing 1.52..1.55).
5. There is no roof sample; the 455's roof grey is used.

## Pipeline options needed

- The second car is a driving trailer: its far end should be a cab (the 456
  ran as two-car units). Today the next car's far end is plain.
- A raised middle section on a flat face's panel.
- `logos/SW-wordmark.svg` (see classes/455/notes.md).

## Next steps

1. With the wordmark in `logos/`, point fleet.ts '456' at a fromSpec build
   and liveries/SW.ts '456' at `liveryOf(spec456, 'SW')`.
2. Render elevation, hero and corner; camera-match p004 (both cars' sides plus
   the face) to settle the cab end.

## Camera match and fixes (2026-10-06)

- The destination display was modelled in the near (train's left) pane. p004
  and p006 both show it in the left pane as seen from ahead, which is the
  train's right: screens and display mirrored to +z (trace face.screens).
- `match/p004.json`: 20 points (three bodyside windows, lamps, numbers, the
  yellow panel's top corners). The solve passes nominally (held-out 5.5 cm)
  but fits only to 10.8 px; the screens' glass edges can't be read against
  the black surround. Like the 455, the window verticals lean more than the
  model's tumblehome gives and the face wants to sit about 0.08 m higher
  relative to the windows. The cab door (open question 1) is not yet settled
  by this match.
