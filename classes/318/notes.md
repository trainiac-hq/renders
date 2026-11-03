# Class 318: notes

Worked on 2026-10-06 for 318-SR (Saltire). The body comes from the Class 317 BR
diagram (no 318 diagram on Commons); the face from p254. Every number is in
`spec.json` with its source in `trace`.

## What changed

- **Cab door and cab side window** (p258, read through a bodyside homography
  fitted on the 12 window-frame corners in `match/p258.json`, rms 3 px). The cab
  door is 1.56-2.19 m (x 1.875, w 0.63); the 317 template drew it 1.30-2.18 m,
  over the place of a tall fixed cab side window, 0.84-1.34 m by 1.72-3.08 m.
  The window is in the spec as `nose.glazing` (a side-metres face shape), but
  `fromSpec` in classes/bremu.ts does not pass `nose.glazing` through yet: it
  needs `glazing: m.nose.glazing.flatMap(metres)` (or the like) in the nose.
- **Passenger doors** 1.30 m (drawn 1.768; published clear opening 1.010), the
  hole in the bodyside from the front jamb to the rear jamb's outer edge, and
  0.12 m ahead of the template on both cab-car doors (6.45, 13.51). Car 2's
  doors take the width, not a new position.
- **Face heights** scaled by 0.92 about 3.40 m: p254 is taken from well left of
  the axis, so its horizontal scale (which the face was drawn at) is about 8%
  smaller than its vertical. Lamp centres move from 1.33 to 1.50 m, the yellow
  to 1.11-2.24 m, the gangway door glass widens to 0.87 m and rises to 3.32 m.
- **Gangway door**: no `gangway` shape any more, because the pipeline draws it
  with a 0.2 m studded rubber surround that the 318 does not have.
- **Number** moved to the near half of the face (it was drawn on the far half).
- **Logo**: logos/SR.svg on both cars between doors 1 and 2 (see trace).

## Camera matches: not passing

| Photo | Before | After |
|-------|--------|-------|
| p258 | 8.6 cm (face scored by the old rule) | 9.1 cm (wf-rear-bottom); door1-rear-top 5.3 |
| p265 | 14.6 cm | 19.5 cm (wf-rear-bottom) |

p258 now has 28 points (12 windscreen corners, 4 lamps, 4 door corners
added); p265 was re-picked (whole windscreen glass, lamps, window-frame and
cab-window corners) and its EXIF focal (35 mm on a 22.3 mm sensor) confirmed:
a free focal only fits by pushing the principal point off the frame.

Both photos agree that the face and the side do not fit one camera. Fitting
model corrections with the camera gives:

- a face-height shift of about +0.18 m (applied, as the 0.92 scale);
- a side shift back of 0.34 m (p258) or 0.59 m (p265) against the face: the
  bodyside features sit further from the face than the 317 diagram puts
  them. The two photos disagree on how far, so the model was not moved. The
  p258 homography puts the front corner's silhouette at x -0.2 m, which a
  rounder corner than `setback` 0.12 would explain in part.

Settling this needs a side-on photo of a 318 cab car (none on Commons) or a
318 diagram.

## Elevation (render made before these changes)

12/19 checks pass. The 7 failures are the features changed here: the four
passenger doors (measured where the old spec put them, to 1 cm), the two
cab-side-window checks (no glazing drawn), and the door-1 leaf column (the
old leaf window covers it). Re-render 318-SR: elevation, close,
match-p258, match-p265, hero.
