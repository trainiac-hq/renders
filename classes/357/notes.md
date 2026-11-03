# Class 357: evidence notes

Evidence, crops, samples, spec and two camera-match pick files are done
(`evidence.json`, `samples.json`, `spec.json`, `match/p045.json`,
`match/p012.json`). Nothing has been rendered.

## Livery decision (with the counts behind it)

- **CC (default): the current magenta c2c scheme.** White body, black dome,
  orange line along the screen top and the cantrail, a magenta band each
  side of the screen that wraps the corner onto the cab side, yellow only
  under the screen (a shield with a curved lower edge), magenta door leaves,
  one magenta swoosh by door 1 of each driving car, magenta "c2c" logo.
  Seen on 13 units in 2025-26 Commons photos: 357001, 010, 012, 013, 019,
  024, 029, 033, 040, 042, 043, 045, 207. Most are kitmasterbloke's set of
  17 June 2026 (CC BY 4.0), plus 357033 (Feb 2026) and 357024 (June 2026).
- **CC-old: the older white scheme**, with a yellow cap over the screen, the
  same yellow shield under it, no magenta, and dark navy/charcoal doors. It
  is still on a minority: 357201, 204, 205, 315, 321 and 032, photographed
  between Oct 2025 and June 2026. Its colours and the cap shape are in
  `liveries.CC-old`, from p205 only. The cap shape is an estimate from
  proportions, not a measurement. It is not rendered as its
  own train.
- **GBR:** 357008 and 357020 have been in GBR livery since July 2026
  (FLEET.md), but Commons has no photo of either (searched by unit numbers,
  "GBR livery" and "Great British Railways"). There is no evidence for a
  CC-GBR entry yet.
- The 357/0 and 357/2 look the same from outside (p207 vs p012/p045), so one
  spec covers both.

## Diagram

`Class 357 c2c Diagram.PNG` (Unisouth) is the 377 drawing recoloured. Row
150 gives car-1 doors at 442-586 / 1198-1341 px, every window edge and the
car-2 layout, all identical to the pixel to `classes/377`. Only the nose
was redrawn. The face is at 42 px against the 377's 58 px, so it stands
0.196 m further forward, and 42 to 1708 px is 20.39 m, which matches the
published DMSO length of 20.40 m. Published dimensions, from the Wikipedia
"British Rail Class 357" infobox: DMSO 20.40 m, MSO/PTSO 19.99 m, width
2.80 m, height 3.78 m. The diagram supplies the nose profile and the scale
only. `C2c Class 357 w-pantograph.png` (180 px tall) was fetched but not
used.

## What differs from the 377 body

- **Nose:** no gangway. One raked face runs from 1.0 to 3.3 m, rising
  0.56 m from the lower face to the orange line, under a black dome. The
  cab is 0.20 m longer (20.40 m). The valance halves sit either side of an
  open coupler recess (±0.535 m wide).
- **Doors and windows:** these are the 377's positions plus 0.196 m. Two 1D
  projective fits accept them:
  - **p045:** cab door 1.17-1.98 and door 1 at 4.92-6.59, against the
    hypothesis 1.16-1.98 and 4.89-6.66. The first window runs 2.12-4.84
    with its mullion at 2.94 (hypothesis 2.93).
  - **p042:** door 1 at 4.93-6.65.
  - **Residuals:** within 0.03-0.07 m near the cab, and up to 0.3 m at the
    far car end, where 1 px is 3-4 cm.
- **First door distance from the cab:** door 1's front edge is 2.91 m behind
  the cab door's rear edge, the same as on the 377.
- **Cab door droplight:** taller than the 377's, at 1.70-3.05 m, with a
  transom at about 2.33 m (p042 and p045).
- **Door leaf windows:** 0.19-0.68 m from the door centre, at the same
  height as the saloon glass. There is no yellow stripe as on the 377.
- **Heights:** the same as the 377 (band 1.80-2.87; p045 and p042 agree
  within 0.02 m).

## What the current model (`classes/electrostar.ts` `class357`, `liveries/CC.ts`) gets wrong

1. **Cab door, doors and windows:** `electrostarCab(20.4, [6.16, 15.05])`
   puts the cab door at 1.9 m, 0.75 wide. It is at 1.57 m, 0.82 wide.
   Passenger doors are 1.4 wide at 6.16 / 15.05; they are 1.76 wide at
   5.78 / 15.03. The window list is the guessed 2.45-... layout.
2. **Face colours:** the yellow panel covers 0.4-1.95 m across the whole
   face. It is only a shield under the screen (1.30-1.95 m, ±0.98 m at the
   top, curving in).
3. **Magenta bands:** missing beside the screen and wrapped round the cab
   corner.
4. **Dome:** grey/yellow in the render. It is black, with the orange line at
   3.30 m along the screen top.
5. **Lamps:** each side has a body-colour peanut bezel with the headlamp
   outboard and higher (1.08 m, 1.61 m, r 0.085) and a small clear marker
   inboard and lower (0.925 m, 1.51 m, r 0.052). There is a separate red
   tail on the yellow further inboard (0.69 m, 1.48 m, r 0.05). The render
   has two small housings on the yellow.
6. **Screen:** one deep pane in the render. The real screen has two panes
   behind a central pillar (glass 2.09-3.27 m, ±0.99 m), an LED
   destination display at the top left, wipers in an inverted V meeting at
   the pillar, and a black sill.
7. **Doors (CC.ts `electrostar` livery):** navy (#1E2A3A) in the render,
   magenta (#D2609E) on the train. The `default` livery has magenta doors
   but a misplaced swoosh.
8. **Lower body band:** the grey lower band (0-0.18) is on no 2026 photo.
9. **Swoosh:** missing. It is a tapering diagonal from (3.45-4.25 m, 0.94 m)
   to (7.55-9.15 m, 3.30 m), behind door 1 and the glazing, on the driving
   car only.
10. **Nose profile:** close to the diagram's, but the current model's
    valance is 0.25 m forward at 0.45 m, where the diagram sets it back.
    The photos suggest it is near flush; this is still open.

## Doubts

- **Valance setback:** the diagram puts it 0.13-0.20 m behind the face, but
  the photos look nearly flush (s-nose-042). No true side-on photo of the
  nose exists to settle it.
- **Face heights:** these rest on two anchors: the orange line at 3.30 (side
  photos) and the valance bottom at 0.28 (diagram). Without the second
  anchor, a rake-corrected scale moves everything by up to 0.03 m.
- **Dome marker:** the height (3.68) is an estimate, ±0.05.
- **Yellow colour:** not balanced, since there is no usable neutral patch on
  the face. It is taken from the raw medians of the overcast head-ons
  (#F2BE34, golden). The shared warning yellow would also do.
- **Lamp unit kinds:** the schema has no "marker" kind. I used
  `"kind": "marker"` for the small clear lamp. The builder should draw it
  white and unlit, like a headlamp. The p012 match file names it
  `lamp0-marker`.
- **Tiny red dot (p001):** p001 shows one just inboard of the left tail.
  Other units don't have it, so it is ignored.

## Camera-match photos

- **p045 `357 045 Woodgrange Park.jpg`** (3840×1871): leading car, straight
  track, sun, from the train's left. Face and near bodyside to door 2. Its
  15 picks include 4 lamps and the yellow's top corners off the bodyside
  plane, plus axle0. Held out: the near tail, door 1's rear bottom and door
  2's rear top.
- **p012 `357 012 barking.jpg`** (3840×2412): from the train's right,
  sharp, sunlit face. Its 12 picks include 6 lamp units, the yellow corners
  and the bottom centre. Held out: the near tail, door 1's rear top and the
  yellow's bottom centre.
- **p042 `357 042 Shadwell.jpg`** (3840×1787): nearly side-on, with the
  whole leading car. Good for the bodyside, but the face is small and an
  OLE pole crosses window 2. Not picked.
- **Head-ons:** p033 (2289×1732) is heavily processed with tilt-shift blur,
  so use it for geometry only. p001 (1494×1052) is the cleaner second
  head-on.

## Logos

Measured into `liveries.CC.logos` (CC-old is not rendered, so not measured). Ruler: 1D
projective fits along one row through the door edges of the same car side; heights per
column between the window band bottom (1.80) and the body bottom (0.94) or the crease
(1.254), or for the door panels between the leaf window bottom (1.886) and the door bottom
(1.17). Crops `logo-*`.

- **c2c wordmark, cab car**: 10.03-10.84 m, 1.36-1.71 m, both sides, same place, reads
  normally. p045 and p013 (left side) agree within 0.03 m; p042 (right side, the weakest
  fit) reads 0.2 m further back, taken as the same place. Sampled #CA348C on the solid
  foot of the 2 (the door magenta, #D2609E, within lighting). Supersedes the estimated
  `logo` (10.5 m, 1.45-1.70).
- **c2c wordmark, next car**: 9.6-10.4 m, 1.37-1.70 m, mid-panel between its doors. p042
  and p045 bracket the panel centre (9.94-10.79 / 9.57-10.30).
- **Quiet Zone door panels**: white panels under each leaf window, teal text, 0.41 m wide,
  1.66-1.86 m, centred on each leaf of both cab doors. Reordered, not mirrored: the pair
  always reads "Quiet | Zone" left to right, so "Quiet" is on the front leaf on the left
  side and on the rear leaf on the right. Only on one driving car per unit (357012, 013,
  042 have them; 357045's leading car does not, `logo-noqz-045`), so the renderer must
  choose: they belong on the cab car only when it is the Quiet Zone end.
- **Face**: nothing beyond the unit number. No First Class (c2c has none).
- Not a logo, not measured: a light-blue wheelchair pictogram above the front door of the
  car behind 357045's cab (left side), on the accessible car only.

Art needed: `c2c-wordmark`, `quiet-zone-quiet`, `quiet-zone-zone`.

## Elevation and pairs

Judged on the 357-CC renders of 5 Oct 2026 (before the shared paint-edge
merge and the logo meshes). `elevation.py`: 26/27. All doors and windows
within 0.03 m, the band, droplight, swoosh and car-end checks pass. Pair
judgements are in checklist.md.

- **No window band (livery error, needs liveries/CC.ts).** p045, p024 and
  p013 show the windows as dark glass in thin black frames on white: white
  between the cab door and the first window, between window and door, and
  at the car end. The render paints a continuous black band 1.80-2.87 m
  (`windowBand` in `c2c357()`). A check at 2.115 m, 2.33 m expects white
  and fails (#24282B) until `windowBand` is dropped from the 357 livery.
  Once it goes, the first window needs a look: on p045 it is one glazed
  unit 2.12-4.84 with a thin dark mullion at 2.94, where the spec has two
  panes with a 6 cm white pillar between them, and the mullion check
  (which now reads the band) must be rewritten to the frame.
- **Pair boxes were on the far side.** Every one-sided pair had z flipped
  for its camera (012, 024 at +z; 013, 045 at -z). Fixed. `car-end` moved
  to the elevation, because ref-013 stops at about 18 m.
- **Model differences seen in the pairs, not yet fixed:** black lamp bezels
  (the photos show body-colour ones); unlit tails with a thick ring; no
  dome marker housing; no LED destination display or sill slots; no
  transom in the cab door droplight; straight door leaves (the photo's flare
  at the bottom); a soft, near-vertical rear edge on the corner magenta
  where the photo has a sharp slant; and the lower face, where the valance
  renders with crumpled shading, a black bar and a box coupler.
