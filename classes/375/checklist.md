# Class 375 Electrostar, Southeastern: detail checklist

From Commons photos: 375 814 at New Cross, February 2024 (front three-quarter,
close), a 375 at Southeastern Railways, August 2025 (front three-quarter).
Both in the current navy livery with light blue doors. Compared against
out/renders/375-SE-hero.png and -plate.png. Ticked only when a crop of the
render beside the same area of a photo matches in shape, position, size and
material.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

Status: `todo`, `partial` (present, not yet matching), `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Upright face, slight forward-leaning chin with the lamp pods, rounded roof shoulder | done |
| 2 | Nose plan | Flat face, rounded corners into the bodyside | done |
| 3 | Gangway | Full-height yellow door in a proud black/grey frame standing ahead of the face | done |
| 4 | Windscreens | Two, either side of the gangway, tall, in a black mask that runs up to the roof | done |
| 5 | Wipers | One per screen, parked diagonally from a pivot at the inboard bottom corner | partial (not distinguishable in the hero/plate view) |
| 6 | Warning panel shape | Two yellow areas each side: a panel below the screen carrying the unit number and lamp pod, and a yellow strip above the screen under the roof edge | partial (lower panel present; the yellow strip above the screen is missing, and the render's yellow carries on below the lamp pod as a lip at coupler height where the photo is navy) |
| 7 | Lamp layout | One lamp pod per side in the lower yellow panel, two round lamps side by side under a clear cover | partial (pod position right; individual lamps not resolvable in the plate view) |
| 8 | Lamp order | Each pod: white headlamp outboard, red tail lamp inboard (375 814 at New Cross, unmirrored) | done (data default: headlamp outboard) |
| 9 | Unit number | Black number on the yellow above each lamp pod | todo |
| 10 | Livery colours | Navy body and cab, light blue (cyan) doors, thin orange cantrail line | done |
| 11 | Window band | Separate black-framed windows on navy, no continuous band | partial (render shows a continuous black band between the windows) |
| 12 | Cab side window | Small drop light in the cab door, dark frame | done |
| 13 | Lower front | Navy valance below the pods, coupler with air pipes under the gangway | partial (coupler present; yellow lip, see 6) |
| 14 | Roof | Navy/dark grey, roof pods over the doorways | done |
| 15 | Corners | No sharp vertex on any outline | done |

## Measured comparison (375-SE, 2026-10-05)

Elevation check (`elevation.py 375 <lo>/375-SE --livery SE`): 25/27 on the
64-sample renders, which predate the operator logos and the shared
paint-edge merge. The two failures are the car 2 door-top maroon (the
pipeline paints door leaves over every livery shape) and the navy behind
car 2 door 1 (spec fixed, needs a re-render). Pairs from `compare.py`, each
judged on its own, reference | render:

- corner-door (f-corner-door-713, ref-713): face corner, small cab-side window, cab door droplight, one bay and the first cyan door in the right order and spacing; the photo's yellow reaches round the face corner further than the render's, and the render's white grab rails stand out where the photo's are dark.
- lamps (f-lamps-r-803): peanut outline and the two lamp positions match; the housing is drawn solid black where the photo has a yellow-painted plate inside a thin black line with 8 screws, and the tail is a dot cluster in the photo.
- lamps-far (f-lamps-l-803): same as lamps, mirrored correctly (head outboard); same housing difference.
- screen (f-screen-r-803): screen outline, rounded outer top corner, frame width and wiper parked up towards the gangway match; the photo's screen has a transom-like inner frame near the top that the render lacks.
- screen-far (f-screen-l-803): outline and wiper match; the amber destination display behind the glass (spec `dest`) does not show in the render.
- panel (f-panel-r-803): number "375 803" in blue on yellow, size and place match; the photo's yellow runs on below the lamp pod down the chin where the render turns navy at the panel bottom; housing as lamps.
- cap (f-cap-803): orange line and yellow cap above the screens present; the navy D-shaped dome carrying the marker light is missing from the render, and the gangway frame in the render rises into the yellow cap as a light grey block where the photo's frame is dark and stops at the dome.
- gangway (f-gangway-803): yellow door with three seams and the frame's outline match; the frame is light grey in the render and near black in the photo, and the render's handles sit on the door's right edge where the photo has two in the middle (spec handles m ±0.13 at 2.19 m).
- lower (f-lower-803): navy valance and dark recess match; the coupler is a small square box in the render, where the photo has a Dellner head with two round openings (spec `coupler.kind`) above a cylindrical body.
- cab-door (s-cabdoor-814): navy door, orange line over it, droplight in place; the render's droplight has no transom (photo: two panes, transom ~40% down), the handle recess is mid-height in the render and low in the photo, and the long white grab rails are not white in the photo.
- first-door (s-door1-814): two cyan leaves, full height, tall narrow windows, placement and width match; the photo's leaves curve in at the bottom with the tumblehome, the render's are straight.
- cab-end (s-corner-814; box moved from the bodyside, z 1.1-1.46, onto the near half of the face, z 0.45-1.46, which is what the crop shows): yellow cap, screen, number, peanut and navy corner in the right places; the photo's yellow panel goes further down under the lamps than the render's.
- car-end (s-carend-814): not judged. The ref-814 view ends at about x 14 m on the near side, so the car end (15-20.4 m) is outside the render; the view would need widening.
- door-colour (s-cyan-713): cyan leaves full height with tall windows, colour matches; leaf bottoms straight in the render, curved in the photo.
- cab-door-side (s-cabdoor-side, 2015 white livery, shapes only): door outline, seams and droplight place match; the photo's droplight has a transom at ~55% and two slots below, the render's droplight is one pane with neither.
- first-side (s-first-side, 2015 white livery, shapes only): one bay with a mullion ~30% from the front, the render's two panes in the right places; the photo's is one glazing unit with a thin common frame, the render's two separate rounded panes with a wider navy gap between them.
- maroon (s-maroon-802): band from the orange line to the window top, the strip under the bay and the pillar match in place; the render has door 1's leaves cyan to the top where the photo's are maroon above the windows, a navy sliver between the pillar and the door and a maroon tail behind the door (both fixed in spec, 2026-10-05, need a re-render).
