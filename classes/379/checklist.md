# Class 379 Electrostar, Greater Anglia: detail checklist

From Commons photos: 379 017 at Bishops Stortford, July 2021 (front, close;
read for the lamps), 379 008 on a Stansted Express (front three-quarter).
Compared against out/renders/379-LE-hero.png, -plate.png and -ids.png
(re-rendered 2026-10-04 23:20). Ticked only when a crop of the render beside
the same area of a photo matches in shape, position, size and material.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

Status: `todo`, `partial` (present, not yet matching), `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Gangwayed Electrostar: upright face, lower body stepping forward, rounded roof edge into a light grey dome with a marker light | partial (upright face, forward step and rounded roof edge right; dome rendered yellow, no marker light) |
| 2 | Nose plan | Flat face, rounded corners, central gangway | done |
| 3 | Gangway | Yellow door with panel seams in a dark grey/black surround from the dome to the coupler | partial (surround present; door drawn in the face colour with no seams, reads yellow only in a narrow strip at this angle) |
| 4 | Windscreens | One each side of the gangway, black frames, destination display top of the left one, wiper parked up the inner edge | partial (screens right; wipers parked up the outer edges, no destination display) |
| 5 | Cab side window | Cab door with droplight right behind the corner | done |
| 6 | Warning panel | Yellow band above the screens (orange line along its top), yellow panel under each windscreen with rounded lower corners; black triangle on the left panel | partial (yellow band over the screens and yellow panels under them present; yellow also runs down the lower face to the coupler where the photo is white, no orange line, no triangle) |
| 7 | Lamp layout | Each side: one figure-of-eight black bezel low on the yellow, a large round headlamp and a smaller round lamp side by side | partial (two separate rounded-square housings per side on one line; not one figure-of-eight bezel) |
| 8 | Lamp order | Each bezel: headlamp outboard, smaller marker/tail lamp inboard (379 017 at Bishops Stortford, unmirrored) | todo (two head+tail housings per side give two headlamps a side, head above tail in each) |
| 9 | Lower front | Light grey valance either side of a black coupler recess | todo (yellow and red lower face, small coupler block) |
| 10 | Livery colours | White/light grey body, dark grey door surrounds, thin red line at the cantrail, light grey roof | todo (render carries a large red swoosh over the cab side and red doors, a later Greater Anglia scheme; 379 008 and 379 017 have plain white sides with dark grey doors) |
| 11 | Number | "379 017" in black on the right yellow panel | todo |
| 12 | Corners | No sharp vertex on any outline | done |

## Elevation and pairs: 379-GN (renders of 2026-10-05 19:35-19:52, 64 samples)

These renders predate the operator logos (now meshes) and the shared paint-edge merge, so no
logo or First Class vinyl appears in any pair below; that is not counted against them.

`elevation.py 379 <lo>/379-GN --livery GN`: 29/29 (was 26/29; the three failures were
wrong checks, see notes).

379-LE (elevation render of 2026-10-05 21:11, 16 samples, with the logos as meshes):
`elevation.py 379 <lo>/379-LE --livery LE` 29/29, was 27/29. Both failures were the strip runs'
row (a wrong check, see notes). Its pairs are judged below against LE renders.

LE pairs (`compare.py 379 <lo>/379-LE --only lamps-le,face-le,cab-end-le`, ref-l017 and ref-l029
rendered with the logos as meshes), judged 2026-10-06. Boxes: z signs were already right (ref-l029
sees the right side, +z); `cab-end-le` reached only z 1.3-1.46 so its crop stopped at the corner
while the photo's runs to the panel and lamps: now z 0.4-1.46.

| Pair | Judgement |
|------|-----------|
| lamps-le | matches: one figure-of-eight bezel, headlamp outboard, smaller lamp inboard, triangle above-inboard; render bezel slightly narrow at the waist |
| face-le | partial: screens, yellow cap with orange line, panels, triangle, number and lamp order right; gangway frame too wide and tall and grey-brown not near-black; door three seams vs centre split; no destination display; white dome with marker not visible (render crop's top is the frame); coupler a block vs Dellner head |
| cab-end-le | matches layout: door 1 near-black, bay 1 pair with the yellow strip ending above it, cab door, plain white corner (no cab side window, as photo), yellow panel with triangle and bezel; cab-door window narrower than the photo's droplight; render camera further out |

Logos (ref-l029 whole view against l029): the greateranglia wordmark ("greater" red, "anglia" grey)
and the First Class box sit together under windows 3-4 behind door 1 in both, box on the nose side
of the wordmark, sizes alike. Look right.

Pairs (`compare.py 379 <lo>/379-GN`), each judged on its own, reference | render. Every pair
box had its z on the wrong side (the side photos show the train's right = +z here, and m < 0
on the face is +z): the crops had landed on the far side and on the gangway. Flipped; the
corner-door box was cut to x -0.1..1.25 to match its crop (it reached 2.0, past the cab door).
The ref-018/ref-002 cameras sit ~0.2 m off along the side, so side crops are shifted a little.

| Pair | Judgement |
|------|-----------|
| corner-door | matches: plain white panel from the cab door seal to the corner, orange cantrail line sweeping up round it; render lacks the low footstep and filler flap |
| lamps | matches: one figure-of-eight bezel, head outboard and upper, tail inboard and lower; render bezel slightly narrower at the waist |
| lamps-head-on | matches order and bezel shape (head outboard, tail inboard) |
| lamps-far-head-on | matches order and bezel shape (mirror of the near side) |
| lamps-le | matches order and bezel shape |
| panel | partial: yellow panel and bezel placement right; photo's outer bottom corner sweeps much wider; triangle drawn as a rounded drop |
| triangle | does not match: a rounded teardrop, the photo has a sharp-cornered equilateral triangle |
| screen | partial: frame and size right, wiper parked up the inner side as photo; no destination display |
| screen-far | matches: screen beside the gangway frame, wiper parked low |
| cap | partial: yellow cap with orange line under it right; gangway frame top stands higher than the photo's (photo: frame top just above the cap, dome above it) |
| dome | does not match: the crop is all gangway frame, no white dome or marker light visible above it |
| gangway | partial: proud frame and yellow door present; frame grey-brown (#5A5555) where photo is near-black; door has three seams and handles at its edge, photo a centre split with two handles mid-door |
| gangway-34 | partial: bellows ribs and proud frame right; same frame colour and handle differences |
| lower | partial: white valance and dark recess right; recess edge and coupler detail simplified |
| coupler | partial: recess shape and rounded bottom corners right; coupler is a plain block, photo a Dellner head |
| cab-door | partial: door outline and grab rails right; the door's window is narrower than the photo's, which has a horizontal bar (droplight) |
| first | partial: window sizes and yellow strip right; photo frames read darker between the two panes than the render's white pillar |
| door | matches shape (two leaves, tall narrow window each); photo leaves read dark navy against the render's dark grey |
| bay2 | partial: four panes, strip and cantrail line right; pillars read darker in the photo |
| car-end | not judged: ref-018 does not reach the car end (crop is off the frame) |
| cab-end-le | partial (LE photo against GN render; same paint): cab door, corner panel, bay 1 and door 1 right; cab door window narrower than photo |
| side-003 | partial: door, window and strip layout right; render crop offset by the camera |
| face-head-on | partial: screens, panels, lamps, number right; gangway frame too wide and too tall (top reaches nearly the roof), grey not near-black; no dome marker |
| face-le | partial: same as face-head-on |
