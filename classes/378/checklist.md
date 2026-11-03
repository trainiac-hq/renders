# Class 378 Capitalstar, London Overground: detail checklist

Table rows updated 2026-10-05 from the pairs below (renders of 2026-10-05
19:56, which predate the shared paint-edge merge and the logo meshes). Ticked only when a
crop of the render beside the same area of a photo matches in shape,
position, size and material.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

Status: `todo`, `partial` (present, not yet matching), `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Upright face, rounded roof edge into a yellow dome with a large marker light housing on top | partial (upright face and yellow dome right, pair `dome`; the D-shaped marker housing on the dome is missing from the render although `face.marker` is in the spec) |
| 2 | Nose plan | Flat face, rounded corners, no gangway | done (pairs `yellow`, `corner-door`) |
| 3 | Front door | Flush detrainment door outlined by a thick dark-grey seal from above the cap line to the blue band: black above, yellow below with a handle recess | partial (pair `door-front`: door, black upper and recess placed right; the seal renders as a faint darker yellow line, not dark grey, and the recess is a black slot where the photo has a yellow recessed handle) |
| 4 | Windscreens | One each side of the door, black frames, destination display top of the left one, wiper parked up the inner edge | partial (pairs `screen-l`/`screen-r`: two screens, frames, cap line turning down at the outer corner and wipers right; no destination display) |
| 5 | Cab side window | Cab door with droplight close behind the corner | done |
| 6 | Warning panel | Face yellow from the dome to the waist; orange line over the screens and over the blue band | done (pair `yellow`) |
| 7 | Lamp layout | Each side an angular black bezel with two round lamps; a small round lamp above the left cluster on its inboard side | done (pairs `lamps-l`/`lamps-r`: bezel shape, lamp sizes and the round lamp match; the photo's bezel rim screws are not drawn) |
| 8 | Lamp order | Headlamp outboard and higher, red tail lamp inboard | partial (order and heights right; the tail lens renders pale pink, the photo's is red) |
| 9 | Lower front | Blue band below an orange line, blue skirt either side of a coupler recess | partial (pair `lower`: bands, shadow gap and recess shape right; the coupler is a plain box where the photo has a Dellner head) |
| 10 | Number | "378 2xx" in dark blue on the yellow above the right cluster | done (pair `lamps-r`) |
| 11 | Livery colours | Light silver-white bodyside, solid orange doors, black window band, blue band under an orange waist line, light grey roof | partial (pairs `door1`, `door-close`: colours right; the doors lack the yellow/black zigzag strips and the cream surround) |
| 12 | Corners | No sharp vertex on any outline | done |

## Elevation and pairs (2026-10-05)

`elevation.py 378 <prefix> --livery LO`: 29/30 on the existing render (was
7/30). The one failure, the window band at a pillar (1.67-2.97 against
1.75-2.865), is the model fix to `heights.window` and needs a re-render.

`compare.py 378`, each pair judged on its own (reference | render):

- corner-door (match-p208): yellow wrap ending at a seam ahead of the cab door, cab door behind it, cantrail line over both: match. Differs: the render puts a light grey grab rail on the yellow just ahead of the seam, where the photo has only the black seam; the waist orange line slopes down onto the yellow in the photo and runs straight in the render.
- lamps-l (ref-224): bezel shape, headlamp outboard and higher, round lamp above inboard: match. Tail lens pale pink, not red; no rim screws.
- lamps-r (ref-224): bezel, lamp order, number above: match. Same tail lens colour.
- screen-l (ref-224): screen, frame, cap line curving down at the outer corner: match. No destination display.
- screen-r (ref-224): screen and corner: match. Black frame below the glass a little shallower in the render.
- yellow (ref-208): yellow face to the waist, cap and waist lines, blue band and skirt, door black upper: match. Coupler head plain.
- door-front (ref-224): door and its black upper half placed right. The seal is faint darker yellow, not dark grey; the handle is a black slot, not a yellow recess.
- lower (ref-224): orange line, blue band, shadow gap, skirt, recess with rounded lower corners: match. Coupler a plain box.
- dome (ref-224): dome shape and cap line: match. D-shaped marker housing missing.
- cab-door (match-p208): white door, full-height outline, tall window: match. The photo's window has a mid-bar; the render adds a grey grab rail behind the door the crop does not show clearly.
- door1 (match-p208): orange leaves, one window each, door position: match. No zigzag strips, no cream surround, no tumblehome curve at the bottom.
- door-close (elevation, square-on): leaf colour, window size and place: match. Same missing strips and surround.
- cab-end (match-p208): as corner-door.
- car-end (match-p208): band, orange and blue lines run to the end: match at this size; the crop is too small to judge the band's 0.20 m stop.
- refreshed-face, refreshed-corner, refreshed-lower, refreshed-side: not judged. Their views ask for `LO-refreshed`, which `liveries/LO.ts` does not draw, so the render shows the original livery.

Pair boxes fixed: lamps-l/r and screen-l/r had the face sides swapped
(each cropped the other side's feature) and too tall a box; the p208 pairs
used `ref-208`, which looks at the other bodyside, so they now use the
photo's solved camera `match-p208` (with the box on +z, the side that view
sees); door-close used `ref-tmd07`, framed on the cab end with door 1 out
of frame, so it now uses `elevation`, square-on like the photo.

