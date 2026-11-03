# Class 320: notes

Worked on 2026-10-06 for 320-SR (Saltire, 320/3 spec, common face). Every
number is in `spec.json` with its source in `trace`.

## What changed

- **Passenger doors** 1.40 m (drawn 1.703; published clear opening 1.20 m). On
  p304, a 1D projective fit along the window frames' bottom row reads the door
  as 1.32 m centred on 7.19 m (spec centre 7.20). The view is heavily
  foreshortened (+-0.15 m), and on the 318 the opening in the bodyside measured
  0.29 m more than its published figure. Leaf windows scaled with the leaf.
- **Number** moved to the near half of the face (p404 and p304 both show it
  there; the render had it on the far half).
- **Logo**: logos/SR.svg on both cars between doors 1 and 2, the size measured
  on the 318 (see trace).

## Camera matches

| Photo | Before | After |
|-------|--------|-------|
| p304 | 10.7 cm, FAIL | 5.0 cm, ok (side scored); lamp0-tail 10.7, tongue 10.5 not scored |
| p316 | 3.6 cm | 2.1 cm |

p304 was not changed. Its 10.7 cm point is the near-side LED tail, and that
pick is right: it sits where the model's tail is along the housing. The current
solver leaves it unscored because the face's depth is not pinned by this
long-lens view (focal 23215 px). The door width does not enter p304 (no door
points). Eight windscreen corners added as off-plane points made it worse
(10.6 cm, wb-rear-bottom), and the camera fits found no face shift (fy +0.01 m),
so those picks were dropped. The dark glass is hard to read on this photo.

## Elevation (render made before these changes)

14/19 checks pass. The 5 failures are the four passenger doors (measured where
the old spec put them, 1.70 m) and the body run up to door 1's new front edge.
Re-render 320-SR: elevation, close, match-p304, match-p316, hero.
