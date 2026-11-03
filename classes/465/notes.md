# Class 465 Networker: notes

Measured 2026-10-06 for 465-SE (Southeastern white, the livery every 465 in service still
carries; 465908's Network SouthEast heritage livery is not rendered). Rendered cars: DMSO
(cab) and the TSO behind it. Everything is in `spec.json` with its source in `trace`.

## What was measured

- **Side:** the WestRail642fan diagram (`dia`) is not stretched: 31.79 px/m along the
  DMSO (664 px = 20.89 m), 31.4 px/m up (rail to roof 3.77 m). One pixel is 3.2 cm.
  Checked with 1D projective fits on p173 (rms 3.5 px) and the 466's long-lens p040s
  (rms 1.4 px; same DMSO body). The photo moved the cab door's rear edge back 0.14 m
  (door 1.20-2.20 m, the diagram 1.21-2.06) and the window band's start to 2.68 m.
- **Heights:** the p035 door-1 column, fitted to the cantrail line, band edges and door
  bottom: navy lower band top 1.49 m (diagram 1.385: photo wins), door windows 1.77-2.73
  m (diagram 1.83-2.95), leaf top 3.25 m.
- **Face:** head-on p014 with a pinhole fit using the EXIF focal length (yaw 28 deg,
  11 m), anchored on the far silhouette at +-1.405 m; p033v (camera on the other side)
  and the 466's p009 agree within 2-4 cm on every lamp edge. Camera height fitted from
  five heights the diagram also gives (3 cm spread).
- **Colours:** samples.json. White is the neutral; the roof samples clip, so the roof is
  unmeasured (a shade greyer than the body).

## What the old model got wrong (electric.ts `class465`)

- Lamp order: the lamps are mirrored (headlamp outboard, red tail inboard on both
  sides, with a small amber-cream marker strip outboard of the headlamp). The old
  checklist said "not mirrored"; every photo (p014, p033v, p048, 466009, 466008 lit)
  shows mirrored.
- Lamp boxes were short: they are 0.82 m long (0.52-1.34 m from the centre), 0.34 m tall.
- Lower front: a bumper standing 0.29 m proud of the face (1.36 down to 0.68 m) made of
  two blocks with a lower beam between and a coupler recess under it, not a smooth bulge.
- No black band under the screens (2.08-1.73 m, full width), no number (white, right).
- Yellow too far onto the cab side and over the roof: it stops at an arch (3.37 m at the
  centre, 3.21 m at the corners) under a white dome, with a thin orange line on the edge.
- Livery: navy lower band 1.00-1.49 m (the old had a navy solebar band at 0-10% and no
  dot fade), the halftone fade at the cab end, the wordmark, orange (not red) cantrail
  line at 3.29-3.32 m; doors light blue (#7792C4), not grey.
- Geometry: cab door 1.0 m wide at 1.70 (old 0.7 at 1.64); door 1 at 6.20 m (old 6.27),
  door 2 at 15.92 (old 16.08); windows are oval/big/oval ahead of door 1 and 5 big
  between doors (old 2+5 at different places); bogies 3.98/18.04 m (old 4.05/18.05);
  cantrail 3.36 (old 3.42); body bottom 1.00 (old 0.90); window glass 1.90-2.85 (old
  1.95-2.90).

## Open questions

- Tumblehome (0.1 m) and the plan of the face corners (setback 0.15 m) are not measured.
  The doors visibly curve out low (s-door1-035), so the real tumblehome is pronounced.
- The TSO's door pitch (9.92 m) comes from a diagram that repeats one car module; not
  checked on a photo. Its wordmark is inferred from the 466's second car.
- The windscreen pillar measured 4.5 cm left of the fitted centre on p014; drawn centred.
- SE.svg's "eastern" is cyan #00afe8; on the train it is a pale periwinkle with a full
  stop ("southeastern."). Needs either a `color` per part or an SE-wordmark file.
- 465/2 and 465/9 (Metro-Cammell built) differ in detail from the BREL 465/0-/1 measured
  here; not checked.
- Camera matches (2026-10-06): p035 (rms 9.1 px, worst held-out 5.1 cm) and p173 (rms
  7.0 px, 5.5 cm). Neither pins the face's depth (no axlebox or far-side points visible),
  so face points are not scored. They moved: doors 1/2 1.45 -> 1.60 m wide; cab door
  1.20-2.20 -> 1.30-2.20 (0.90 wide, same on the 466); cab door window 1.77-3.02, toward
  the leaf's front; door leaf windows 1.77-2.73 -> 1.73-2.95; window band from 2.68 ->
  2.20 (on the 465 it runs to the cab door; the 466 has a white strip).
- Lower tumblehome: door 1's bottom corners solve to half-width 1.21-1.24 m at 1.0 m on
  both photos (the shell has 1.305): the body turns in below the waist, which
  `pipeline/shell.ts` cannot draw (its tumblehome is above the waist only). Pipeline need.
- The yellow at the cab corner reaches ~0.15 m further back than the model's corner
  silhouette on p035 and p040 (overlay): the corner plan (setback) is unmeasured.

## Next steps

1. Give fleet.ts its own 465 entry built with `fromSpec(spec465.model, 'networker')` and
   a `liveries/SE.ts` '465' key from `liveryOf(spec465, 'SE')` (not done here: this task
   writes only classes/465/).
2. Render elevation/hero/close/corner; compare with p014, p035, p173; corner-door pair
   from p173.
3. Camera-match p035 (cab door, door 1, lamps) and p173; hold out 2-3 points.
