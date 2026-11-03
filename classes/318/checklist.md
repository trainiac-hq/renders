# Class 318, ScotRail: detail checklist

From Commons photos: 318 250 departing Balloch, May 2025 (head-on, slightly
three-quarter, lamps lit), 318 257 + 318 269 at Dalmuir, August 2026 (front
three-quarter). Both in Saltire livery.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

The 318 is now built from classes/318/spec.json (classes/bremu.ts). Rows
below were last compared on 2026-10-06 against 64-sample renders (made from the spec before that day's changes;
see notes.md for what still needs a re-render).

Status: `todo`, `partial`, `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Near-flat face, slight rake over the windows, rounded dome above | done |
| 2 | Nose plan | Flat face, rounded vertical corners | done |
| 3 | Front windows | Three: a windscreen either side (small upper pane over the main one) and the gangway door's window between, black surrounds | partial (face-254/face-265 pairs: three panes in the right places; the render's screens are one pane each and the centre glass was 4 cm short and narrow, now 0.87 m wide, top 3.32 m; heights rescaled, re-render) |
| 4 | Gangway door | Flush centre door in the yellow, its seams only, no surround | partial (face-254 pair: the render draws a 0.2 m studded rubber surround the real door has none of; `gangway` dropped from the spec so only the seam remains; re-render) |
| 5 | Cab side window | Tall fixed cab side window (0.84-1.34 m, 1.72-3.08 m) ahead of a narrow cab door (1.56-2.19 m) | todo (corner-door and cab-side pairs, p258: the render has no cab window and a 0.88 m cab door over its place; spec now has both, the window needs bremu.ts to pass `nose.glazing`) |
| 6 | Yellow panel | Yellow lower half of the face only, from just under the windows to the valance, square top edge | partial (render's lower yellow is right, but yellow also runs up the corners to the roof; photo's corners above the window line are blue) |
| 7 | Dome and line | Blue roof dome over the face, thin orange line along its lower edge above the windows | todo (render dome is grey/yellow, no orange line) |
| 8 | Lamp clusters | One black rounded rectangle per side, low on the yellow, either side of the gangway door | partial (lamps pair, p258: housing shape and lamp sizes match; the render sits ~0.17 m low, face heights rescaled, re-render) |
| 9 | Lamp order | Each box: red tail inboard, white headlamp outboard (p254, p258, p265 unmirrored) | done (lamps and face-254 pairs: same order both sides) |
| 10 | Number | "318 / 2xx" in black on the yellow, near-side half (image right on p254/p258/p265) above the lamp box | partial (face-254/265 pairs: the render put it on the far half; moved to m -0.92, re-render) |
| 11 | Valance | Black valance and coupler with hoses below the yellow | partial (coupler present; valance blends into the yellow) |
| 12 | Body colour | Saltire dark blue over body, roof edge and cab sides | done |
| 13 | Saltire dots | White dots wrap the cab corner and run down behind it; a band of blue dots rising towards door 1 | partial (corner-door pair: white column right; the blue dots are a level 3-step block where the photo has a diagonal band fading back) |
| 14 | Doors | Passenger doors silver-grey, 1.30 m opening, leaf windows narrow and tall | partial (door1 and corner-door pairs: the render's doors are 1.77 m, too wide; spec now 1.30 m, re-render) |
| 15 | Corners | No sharp vertex on any outline | done |
| 16 | ScotRail logo | White "X ScotRail / Scotland's Railway" between doors 1 and 2 under the windows, both cars | partial (placed from p258, 8.96-11.25 m; not yet rendered) |
