# Class 802 IET (bi-mode), Great Western Railway: detail checklist

From Commons photos: 802 014 at Bridgwater (front three-quarter, close,
headlamp lit), 802 001 at Oxford, 2026. The 802 shares the 800's body and
nose drawing (`hitachi.at300`) and GWR livery, so shape items follow
classes/800/checklist.md.

No 802-GW render exists yet: in the 2026-10-04 batch every AT300 render
(800, 801, 802, 803) failed in Blender on a missing `decals.r.bin`. Livery
items below are judged on the flat texture the pipeline wrote
(`out/renders/work/802-GW/side-albedo.png`) and must be rechecked on the
render. Ticked only when a crop of the render beside the same area of a
photo matches in shape, position, size and material.

Before a shape item is ticked, the render and the photo are compared from
the same view, side by side at the same scale, and the difference checked
is written down. Left and right are judged against the unmirrored photo.

Status: `todo`, `partial`, `done`.

| # | Detail | Where and what | Status |
|---|--------|----------------|--------|
| 1 | Nose profile and plan | AT300 long nose, as on the 800 | todo (no render; 800 checklist marks the yellow cone shape wrong) |
| 2 | Yellow nose | Yellow cone on the tip and a yellow band across the upper nose under the screen carrying the GWR logo; the yellow does not reach back along the flank | todo (no render; 800 checklist: ours runs back along the side) |
| 3 | Body colour | GWR dark green, satin, over the whole train including the nose cheeks | partial (texture right; not checked on a render) |
| 4 | Orange lines | Orange line over the windscreen continuing as the cantrail line; a second thin line over the cab door | partial (cantrail line in the texture; not checked on a render) |
| 5 | Windscreen | One tall rounded pane in a grey frame, wiper from the lower right, camera box above | todo (no render) |
| 6 | Lamp clusters | Slanted black recess under clear glass at each side of the yellow, just below the screen's lower corners | todo (no render) |
| 7 | Lamp order | Each cluster: small round lamp low and forward (the tail), lit headlamp high and behind it up the slant (802 014 at Bridgwater, unmirrored; same as 801 228 and 805 013). This is the reverse of classes/800/checklist.md item 20 | todo (no render; the at300 drawing puts the headlamp forward) |
| 8 | Branding | Large "GWR" on the cab side behind the cab door | todo (missing in the texture) |
| 9 | Doors | Silver-grey leaves | partial (texture right; not checked on a render) |
| 10 | Roof | Bi-mode: no pantograph on the 802's driving car in GWR use; exhaust grilles on the roof pods | todo (at300 cab car carries a pantograph) |
| 11 | Corners | No sharp vertex on any outline | todo (no render) |
