# Class 507: measurement notes

Rendered: 507009, Merseyrail "Good Communications" livery (2014 onwards) on
the grey background, as the class ran until withdrawal on 2024-11-28. Both 507
and 508 also ran yellow-background versions of the same scheme (507029,
508112, 508138, 508141); the grey one is what 507009/507010/507033 and 508108/508120
carried in December 2022.

## Sources

- Side: `Class_507_Merseyrail_New_Diagram.png` (Unisouth 313 template). Its livery
  is the 2000s yellow swirl, not the final one; only its geometry is used.
- Face: 507014 at Hoylake (3840 px, head-on, low camera), checked on 507009
  Orrell Park and 508141 Aughton Park.
- Door positions: camera matches on 507009 (two), 508108, 508112 and 508138 (below).
  There is no side-on Commons photo of either class.
- Published: 19.80 m DM / 19.92 m trailer, 2.82 m wide, 3.582 m high, floor
  1.146 m, door opening 1.288 m, bogie centres 14.170 m (Wikipedia 507/508).

## What the old model (`electric.class507`) got wrong

| | old | measured |
|---|---|---|
| bodyside bottom | 1.00 | 0.857 (face valance 0.78) |
| cantrail | 3.27 | 3.26 (side upright to ~3.26; orange line at 2.97-3.0) |
| window glass | 2.0-3.0 | 1.82-2.655 |
| cab window | none | fixed window 0.78-1.18 ahead of the cab door |
| doors | x 7.0 / 13.85, w 1.30 | 7.05 / 13.81, w 1.72 inside the orange seals |
| DM bogies | 2.30 / 16.47 | 2.288 / 16.458 (published 14.17 centres) |
| TS doors / bogies | 6.2 / 13.7; 2.5 / 17.4 | 6.55 / 13.37; 2.875 / 17.045 |
| front | gangway face, square white lamps, gangway rubber surround | black band (screens, displays, gangway window), LED roof lamp, two markers, black teardrop pods (head outboard and higher, red LED tail inboard and lower), roundel left, number right, one wiper, dark slots and yellow valance |
| livery | yellow body, black band (ME `default`) | grey body, yellow face and doors, orange door seals, orange cantrail line, thin low yellow line |

## Camera matches (2026-10-06)

Five solved cameras, door 1's seal corners held out in each (`match/*.json`):

| photo | unit | side | rms | worst held-out | door-1 seal centre |
|---|---|---|---|---|---|
| p009a | 507009 Aintree, long lens | near | 2.0 px | 4.1 cm | 7.06 |
| p009t | 507009 Town Green | far | 2.9 px | 4.7 cm | 7.01 |
| p108 (508) | 508108 Meols | near | 2.3 px | 2.8 cm | 7.08 |
| p112 (508) | 508112 Bromborough, 3840 px | near | 3.4 px | 2.3 cm | 7.11 |
| p138w (508) | 508138 Walton, from above | far | 5.0 px | 5.6 cm | 7.02 |

What they changed (both classes; the trailer only where it shares the door):

- **Door 1** (was 6.989, the diagram): 7.05. The two 1D fits' disagreement (6.56 / 7.02)
  is settled; 6.56 was wrong. Door 2 reads 13.77-13.85, so the diagram's 13.808 stays.
- **Door width** (was 1.54): 1.72. Every orange seal reads 1.74-1.89 m across its outer
  edges (mean 1.82), less 0.05 m of seal each side; the diagram's leaf is 1.71.
- **Seal across the top**: the seal's outer top corners read 2.91-2.99 (mean 2.96) against
  the opening top 2.891; the livery now carries a 0.05-0.065 m orange strip over each door
  (to 2.956), under the orange cantrail line (2.97).
- **Window 1** front edge 3.799 -> 3.95: its front edge reads 0.26-0.35 m behind the diagram on
  p108/p112 where the other windows' read 0.01-0.19 (the dark glass sits ~0.1 m inside each frame).

Not changed: the dark glass of every saloon window is ~1.3-1.5 m wide against the 1.64 m
glass+frame; the axle-end covers (p112) read 0.3 m behind the generic bogie's axles and were
left out of the fit; the cab fixed window's front edge reads 0.23-0.26 m behind 0.779 on p112
and the cab door's rear seam 2.47 (spec 2.117) on p138w, both soft picks in a dark recess,
not acted on.

## Face handedness (2026-10-06)

The first close renders put the number left and the roundel right as seen; every photo has them
the other way. The face had been measured with m positive to the right as seen, while the
pipeline's m is +Y (the train's right, left as seen). Fixed in both specs: the non-mirrored dark
parts, shapes (box and destination display), number and wiper negated, the roundel at u 0.796.
The gangway door is now yellow only up to the band (1.949); above that it is black round its
window, part of the band, as on p014.

## Pairs on the match views (2026-10-06, 07:4x renders)

Judged one at a time. Fixed in the spec: saloon glass 1.70-2.70 (was 1.82-2.655; the windows
pair showed the photo's glass far taller, and the p112 camera puts three bottoms at 1.69-1.75);
marker lenses r 0.075 (they read small); the dark strips beside the gangway door narrowed to
0.05 m (they read as a heavy frame). Left open: the box and the destination display in `shapes` don't
show through the dark band; the roof lamp renders as a small notched disc where the photos show
a 0.18 m black disc of LEDs; the roundel's disc renders darker than the photos' grey (its colour
is in logos/ME-roundel.svg, outside this class).

## Open questions

- The cab end: the fixed window and cab door may sit 0.2-0.3 m further back than the diagram
  (two soft picks, above). A tight crop on a 3840 px photo of the cab side would settle it.
- Absolute face heights rest on the valance bottom being 0.78 m. The matches agree with the face
  as modelled: lamp centres within 1-4 cm on every solve where the face was scored.
- The cab fixed window is shorter than the bodyside windows (diagram 1.95-2.61 m);
  `windows` share one height, so it draws at the saloon height.
- The dome profile above 3.26 m is estimated, not measured.
- The Good Communications line-art (unit-specific Liverpool scenes and slogans)
  is not modelled.

## Logos

The front carries the Merseyrail M roundel only (dark grey disc, orange-yellow M,
no wordmark, no ring); no bodyside logos. `logos/ME.svg` is the full wordmark.
The spec names `ME-roundel`, which **needs `logos/ME-roundel.svg`**: the disc and
M paths of `ME.svg` (`viewBox="21.7 0 39 39"`), recoloured to the train's
#4D5B58 disc (507009, balanced; #828380 in sun) and #F9BF56 M. Until it exists,
drop `branding` when wiring the livery or the branding check fails.

## Next steps

1. Render the match views (`match-p009a`, `match-p009t`) and run compare.py on the `pairs`;
   judge each pair on its own and update checklist.md.
2. A tight cab-side crop on a 3840 px photo for the cab door and fixed window.
