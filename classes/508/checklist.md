# Class 508, Merseyrail: detail checklist

From Commons photos: 508108 at Meols (p108), 508112 at Bromborough (p112), 508138 at Walton (p138w); face also from 507014 (p014). Compared with our renders 508-ME (elevation, close,
hero, 2026-10-06) and with five solved cameras (classes/507/notes.md). Ticked only when a
crop of the render beside the same area of a photo matches in shape, position, size and
material.

Before a shape item is ticked, the render and the photo are compared from the same view,
side by side at the same scale, and the difference checked is written down. Left and right
are judged against the unmirrored photo.

Status: `todo`, `partial`, `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Flat, near-vertical face; roof dome; small radius at the side corners | partial (close render matches the photos' outline; dome above 3.26 m estimated) |
| 2 | Yellow front | Yellow face ending at the corner, grey cab side | done (elevation colour check at 0.4 m grey; close render) |
| 3 | Window band | Black band 1.949-3.264 across the top: two screens, door window, box left, destination display right (as seen) | partial (band and screens match the band pair; the box and the orange display are in `shapes` but do not show on the render: the dark band covers them) |
| 4 | Windscreens | Two near-square screens, rounded corners; wiper on the right screen as seen | partial (screens line up in the match overlays; wiper side fixed after the renders) |
| 5 | Gangway door | Flush yellow door below the band, black round its window above, thin dark strips each side | partial (07:4x renders: yellow below the band now right, side strips read as a heavy black frame; strips narrowed to 0.05 m after, re-render) |
| 6 | Roof lamp and markers | LED roof lamp on the dome, two white markers under the orange line | partial (positions within 1-4 cm on every match; dome pair: markers drawn small (lens now r 0.075), roof lamp renders as a small notched disc against the photo's 0.18 m black disc with LEDs) |
| 7 | Lamp pods | Black teardrop pods, head lamp outboard and higher, red LED tail inboard and lower | done (pods fit to 1-4 cm on five matches; close render) |
| 8 | Roundel and number | M roundel left as seen (train's right), number right | done (face, face-far, panel pairs after the handedness fix; roundel disc renders darker green-grey than the photos' grey: colour lives in logos/ME-roundel.svg) |
| 9 | Orange cantrail line | 2.97-3.0 along both cars and round the face top | done (elevation 2.978-3.003 / trailer 2.978-2.991) |
| 10 | Low yellow line | 1.115-1.165 along the bodyside | done (elevation 1.129-1.166) |
| 11 | Doors | Yellow double doors, orange seal both sides and across the top, door 1 at 7.05, w 1.72 | done (elevation runs within 3 cm on all four doors; door 1 held out on five matches, 0.3-5.6 cm) |
| 12 | Windows | Black-framed saloon windows; window 1 narrower | partial (windows pair: the photo's glass far taller; glass now 1.70-2.70 from the p112 camera, re-render) |
| 13 | Cab side | Fixed window, then the cab door with droplight, under one rain strip | partial (order right; positions from the diagram, two soft picks read them 0.2-0.35 m further back) |
| 14 | Corners | No sharp vertex on any outline | done (validate) |
| 15 | Pairs | compare.py pairs on the match views | partial (judged 2026-10-06 on the 07:4x renders: face, lamps, dome, band, panel, logo, corner-door, cab-door, doors, windows, livery; items 3, 5, 6, 12 above) |
| 16 | Face colour | 508108's face amber (#CC8701), doors yellow | partial (render used the 507s' yellow; set from samples.json yellow-108, re-render) |
