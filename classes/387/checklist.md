# Class 387 Electrostar, GWR: detail checklist

From Commons photos: 387 159 at Didcot (front three-quarter, close), 387 174
at Southampton Central (front three-quarter, close), 387 149 and 387 163 at
Ealing Broadway (front three-quarter, lamps lit; read for the lamps), plus
387s at Hanwell, Maidenhead, Newbury and Thatcham in refs/. Compared against
out/renders/387-GW-hero.png, -plate.png and -ids.png as rendered 2026-10-04
23:27. That render predates the change to the 387 data (classes/electric.ts,
23:40) and the GWR livery (liveries/GW.ts, 23:34); a re-render is due after
the current batch, so items those changes touch are marked `partial
(re-render pending)` with what the old render showed. Ticked only when a
crop of the render beside the same area of a photo matches in shape,
position, size and material.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

Status: `todo`, `partial` (present, not yet matching), `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Gangwayed Electrostar: upright face, lower body stepping forward, rounded roof edge into a dark green dome with a white marker light | partial (upright face, forward step and rounded roof edge right in the 23:27 render; no marker light on the dome) |
| 2 | Nose plan | Flat face, rounded corners, central gangway standing proud | done |
| 3 | Gangway | Yellow door full height in a grey/black ribbed surround (rubber bellows sides) | partial (re-render pending; 23:27 render: black surround, door drawn in the face's green with no seams, no bellows) |
| 4 | Windscreens | One each side of the gangway in black surrounds, destination display top of the left one, wiper parked up the inner edge | partial (screens and black surrounds right; wipers parked up the outer edges, no destination display) |
| 5 | Cab side window | Cab door with droplight right behind the corner | done |
| 6 | Warning panel shape | Yellow panel under each windscreen holding the lamp cluster and unit number, rounded outer-bottom corner; a yellow strip over each windscreen at the top of the face; below the lamps the face is body-colour green, no yellow ledge over the coupler | partial (re-render pending; 23:27 render: square-cornered yellow panel under each screen, no strip over the screens, and a yellow ledge along the bottom edge over the coupler) |
| 7 | Lamp layout | One cluster per side: one figure-of-eight black bezel low on the yellow, a large round headlamp and a smaller round lamp side by side | partial (re-render pending; 23:27 render: two separate rounded-square housings per side on one line) |
| 8 | Lamp order | Each cluster: headlamp outboard, smaller lamp (red tail when lit) inboard (387 149 at Ealing Broadway, 387 159 at Didcot, unmirrored) | partial (re-render pending; 23:27 render: two head+tail housings per side, i.e. two headlamps a side, head above tail in each) |
| 9 | Lower front | Dark green valance either side of the coupler recess | partial (re-render pending; 23:27 render: green with a yellow strip along its bottom edge, small coupler block) |
| 10 | Body colour | Dark blue-ish green over the whole body, satin | partial (re-render pending; 23:27 render: a plainer, slightly lighter bottle green) |
| 11 | Diagonal band | A wide lighter grey-green diagonal band ("/") about two windows wide from cantrail to solebar, the GWR wordmark low on it | partial (re-render pending; absent in the 23:27 render) |
| 12 | Lines | Thin gold/orange line at the cantrail; thin light line along the bodyside at the foot of the windows | partial (re-render pending; 23:27 render: yellow-gold cantrail line only, no line at the window foot) |
| 13 | Doors | Grey-green doors with a light-green strip at the window-foot line height | partial (doors grey in the 23:27 render; the light-green strip on the doors is not modelled yet) |
| 14 | Roof | Light grey roof; pantograph on the intermediate car | partial (re-render pending; 23:27 render: roof dark green, pantograph present on the intermediate car) |
| 15 | Number | "387 159" in black on each yellow panel above the lamps | todo |
| 16 | Corners | No sharp vertex on any outline | done |

## Elevation: 387-GW, -GX, -HX, -CC, -SN (renders of 2026-10-05 21:17-21:56, 16 samples)

These renders carry the operator logos (meshes) and, for GX/SN, the black window band
1.73-2.90 and the broken white line. No ref-* render exists yet for these liveries, so only
the elevation was compared; pairs are listed with the views they need. 387-GN is done
separately and its checks were not touched.

| Train | `elevation.py 387 <lo>/387-XX --livery XX` | Before | Notes |
|-------|------------------------------------------|--------|-------|
| 387-GW | 27/27 | 24/26 | two wrong checks (door column across the lime line; door run on stale x) |
| 387-GX | 28/29 | 7/23 | glass/band merge fixed by a tighter glass tolerance; band and line checks added; the one failure is the line ahead of the cab door (livery fixed, needs a re-render) |
| 387-HX | 19/19 | 17/18 | purple panel run crossed door 1; split in two |
| 387-CC | 21/22 | 20/22 | door column was in the leaf's pane; the Quiet/Zone label check fails because the model draws no label |
| 387-SN | 29/29 | (no block) | `elevations.SN` was a string; now a copy of GX's. Rendered after the line fix: red ahead of the cab door |

Pairs judged 2026-10-06 on the ref-* renders now in `<lo>` (`compare.py 387 <lo>/387-XX --only ...`),
each on its own, reference | render. 387-GN's pairs were left as they were.

Boxes fixed first (z: +z is the train's right side, so a head-on photo's right-hand panel is -z):
`lamps`, `panel`, `screen`, `lamps-lit`, `panel-gx` were on +z and `lamps-far`, `screen-dest` on
-z, so every face pair had landed on the other panel or on the gangway: flipped. `corner-door`
(ref-174 sees the right side, p174 nose right) was -z: now +z. pldn shows the train's LEFT side
(nose to the left of the frame) but view `ref-ldn` (azimuth -35) renders the right side: the five
ldn pairs now use -z as their photo needs, and **ref-ldn wants azimuth +35 and a re-render**; their
lines below were judged against the right side with the photo mirrored (geometry only; the
small 'Great Western Railway' text is a left-side vinyl and cannot show). `lines` and
`cab-end-livery-gw` were boxed 2.0-7.0 x 0.9-3.35 against a crop that covers pldn u 1500-2800,
v 1380-1560: now 0.8-7.1 x 1.3-1.8 (calibration fit plus the 0.20 face move), which makes
`cab-end-livery-gw` a duplicate of `lines` (it needs its own crop or should go). `door-cc` was
2.0-9.0 against a crop reaching from the face to door 2: now 0.0-14.5.

| Livery | Pair | Judgement |
|--------|------|-----------|
| GW | corner-door | partial: cab door, orange cantrail sweeping round the corner, yellow panel right; **render has a cab side window between the cab door and the face, p174 has plain green there** (see notes, cab side window); render camera further out |
| GW | lamps | matches: figure-of-eight bezel, headlamp outboard and a touch higher, tail inboard; render bezel slightly small on the panel |
| GW | lamps-far | matches: mirror of `lamps`, head outboard |
| GW | panel | matches: number top, bezel low inboard, outer bottom corner swept round; number font's 1 is a bare I |
| GW | screen | partial: frame, size, orange line over it right; wiper drawn as a thin diagonal from the bottom middle, photo's arm parks up the inner edge |
| GW | screen-dest | does not match: photo has the destination display at the top of this screen, render none (known) |
| GW | cap | partial: yellow cap and orange line right; gangway frame top stands higher than the photo's and is flat dark grey where the photo's is black/bare metal |
| GW | gangway | partial: yellow door, dark frame; photo door is two leaves with a centre split and two handles mid-door, render three seams and handles at one edge (known gangway question) |
| GW | dome | partial: green D-shaped plate present; photo plate has a dark oval marker lamp in it, render none; the render's taller gangway frame hides half of it |
| GW | cab-door | partial (mirrored): grab rails and door outline right; photo's droplight is a two-pane window with a bar, render one pane; photo side window sits ahead of the door on this (left) side |
| GW | first-door | partial (mirrored): two leaves, leaf windows, lime line across the leaves right; photo leaves a darker champagne grey than the render's light grey |
| GW | windows | partial (mirrored): two saloon windows ahead of door 1 right in size and spacing; render body reads blue-teal where the photo is near-black green (spec body #2E4754, see notes) |
| GW | lines | matches (mirrored): grey bodyside line broken round the GWR logo, lime line only on the door leaves; logo place ahead of door 1 right |
| GW | cab-end-livery-gw | duplicate of `lines` after the box fix (same crop) |
| GX | lamps-lit | matches: tail inboard, headlamp outboard, bezel shape; render red lower edge under the panel right |
| GX | panel-gx | matches: panel shape and its curved lower edge into the red; number reads 387 164 (number not per livery); render red is pink-crimson (#C22651 at render time; spec now #CC1608, re-render due) |
| GX | cab-gx | not judged: ref-205's camera (x -2.05, z -1.6) is far closer and more head-on than p205, the crop is a sliver of the cab side |
| GX | car-end-gx | not judged: crops p227 but renders ref-205, which cannot see the car end; needs a ref-227 view |
| HX | cab-end-hx | partial: grey cab door with its droplight, white crescent behind it, purple from bay 1; **render has a cab side window ahead of the cab door, the photo none**; photo crescent is wider and curved, render a narrow straight strip |
| HX | purple-hx | partial: purple panel from bay 1 past door 1 with white ends right; photo crescents broad curved swooshes, render narrow; the photo's door roundels, aircraft, TOKYO wrap and BUSINESS FIRST vinyls are absent (mapped to null in `liveries/electrostar.ts`) |
| HX | gangway-hx | does not match: photo door is near-black on its upper half with the white roundel and X, yellow below; render all yellow, no roundel |
| CC | face-cc | partial: lamp order (head outboard, tail inboard), panels, screens right; no destination display; gangway frame dark brown-grey where the photo's is black with grey bellows |
| CC | door-cc | partial: purple door 1, bay 1, c2c wordmark under windows 3-4 behind door 1 right; **render has a cab side window ahead of the cab door, the photo none**; Trenitalia endorsement not drawn (null) |

Logos against the photos:
- GW: GWR logo right in shape (V with separate slash, tips at the line), size and place ahead of door 1,
  line broken round it (mirrored compare). 'Great Western Railway' (left side only) not yet seen in a render.
- GX: not judgeable here: ref-205 sees only the face; the big GX letters (left side) and small logo
  (right side) need a side view (ref-227, or pvic).
- HX: effectively no logos: only `heathrow-express-logo` behind door 2 is drawn and it is outside
  these crops; the gangway roundel (`faceShapes` ring) does not show on the face at all.
- CC: c2c wordmark right in place and colour; Trenitalia and Quiet Zone panels not drawn (null).

SN has no pairs of its own (p205/p227 are GX-liveried units, the same paint): render 387-SN ref-205
to judge the GX pairs against SN.
