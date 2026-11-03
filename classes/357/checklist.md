# Class 357 Electrostar, c2c: detail checklist

From Commons photos: 357 024 at Fenchurch Street, June 2026 (front
three-quarter, very close, tail lamps lit), 357 205 near Limehouse, June
2025 (front three-quarter). Both in the current c2c white with magenta.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

Status: `todo`, `partial`, `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile | Rounded lower face, deep screen raked back, black dome over it | done |
| 2 | Nose plan | Rounded face and corners | done |
| 3 | Windscreen | Two panes behind a central pillar, black frame, wipers in an inverted V meeting at the pillar, black sill with three slots, LED destination top left | partial (panes, pillar, wipers right; no destination display, sill has no slots) |
| 4 | Dome | Black cap over the screen, a thin orange line along its lower edge, a small D-shaped marker housing at the top centre | partial (cap and line right; no marker housing) |
| 5 | Magenta band | Magenta from the orange line down each side of the screen, wrapping the cab corner as a triangle widest at the top | partial (present and wraps; its rear edge on the cab side is soft and near vertical, the photo's is a sharp slant down-forward) |
| 6 | Yellow panel | Yellow only under the screen, curved lower edge, tails inside its lower corners, number upper right | done |
| 7 | Lower face | White valance halves with black rubber pads either side of a deep coupler recess (Dellner) | todo (render valance shows crumpled shading artefacts, a black bar above the recess, a box for a coupler) |
| 8 | Lamp clusters | Body-colour (white) peanut bezel with a thin rim, large lens outboard and higher, small inboard and lower | partial (layout and sizes right; bezel black in the render) |
| 9 | Tail lamps | Separate red tail on the yellow, inboard of each cluster, thin dark ring | partial (place right; unlit dark red with a thick black ring) |
| 10 | Cab side window | Cab door with tall droplight right behind the corner | done (droplight 1.72-3.06 m measured, photo 1.70-3.05) |
| 11 | Bodyside | White, orange cantrail line, windows as dark glass in thin black frames on white, no window band | todo (the render paints a continuous black window band 1.80-2.87 m, liveries/CC.ts `windowBand`; the photos have none) |
| 12 | Doors | Magenta door leaves, full height, narrow leaf windows | done (positions within 0.03 m) |
| 13 | Swoosh | Magenta diagonal from the skirt ahead of door 1 to the cantrail over window 2, behind door and glazing | done (both rows within 0.04 m) |
| 14 | Corners | No sharp vertex on any outline | done |

## Elevation (`elevation.py`, render of 20:44, 5 Oct 2026)

26/27 within tolerance. Every door and window of both cars lands within
0.03 m of the spec; the band, droplight, swoosh and car-end checks pass.
The one failure is a real livery error, kept as a check: white between the
cab door and the first window at 2.115 m, where the render has the black
window band (#24282B) that no photo shows. No check row crosses a logo
(door rows at 1.42 m are under the Quiet Zone panels, 1.66-1.86; the door 1
column at 5.0 m is ahead of the "Quiet" panel at 5.13).

## Pairs (`compare.py`, each judged on its own)

Every one-sided pair box had its z on the wrong side and cropped the far
side of the train: 012 and 024 look from +z, 013 and 045 from -z (head-on,
the viewer's right is -z). Flipped. ref-013 does not frame the cab car
past about 18 m, so `car-end` is judged on the elevation.

- corner-door (ref-024, not camera-matched, more head-on than the photo):
  band wraps the corner, plain white cab door with its droplight, magenta
  door 1 and the low swoosh beyond, all as the photo. The render has the
  black window band behind the cab door where the photo is white; valance
  artefacts.
- lamps: layout, sizes and order match; the bezel is black, the photo's is
  white body colour with a thin rim.
- tail: on the yellow just inside its curved edge, as the photo; unlit dark
  red with a thicker black ring (photo lit, thin ring).
- lamps-033: same as lamps, mirrored correctly; tail inboard on the yellow.
- screen: two panes, central pillar, inverted-V wipers, black frame match;
  no LED destination display, sill without its three slots.
- yellow: shape, curved lower edge and tail places match; number upper
  right as the photo.
- band: magenta beside the screen under the orange line matches; on the
  corner its rear edge is soft and nearly vertical where the photo's is a
  sharp straight slant, widest at the top.
- dome: black cap and orange line match; the D-shaped marker housing is
  missing.
- lower: does not match: crumpled shading on the valance halves, a black
  bar above the recess and a box coupler; the photo has smooth white
  valance halves with black rubber pads and a Dellner coupler.
- cab-door: white door, tall dark droplight, grab rails match; the
  droplight's transom (about 40% down) is missing.
- door: magenta leaves, dark seam, narrow leaf windows, proportions match;
  the photo's leaves flare out at the bottom with the tumblehome, the
  render's are straight.
- swoosh: lower part ahead of door 1 down to the skirt, upper part over
  window 2 to the orange line, both behind the door: matches. Render has
  the black window band, photo none.
- cab-band-side: the wrap onto the cab side is there and tapers downwards;
  its rear edge is blurred in the render.
- car-end (elevation): no livery shape at the end, as the photo; the black
  window band runs on to the car end in the render, the photo is white.
