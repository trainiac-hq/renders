# Class 769 Flex: measurement notes

A 319 converted to bi-mode: diesel engines on rafts under both driving cars.
Rendered liveries: Northern (current, unit 769458), Transport for Wales
(withdrawn 2023-05-19) and GWR 769/9 (returned 2023-04), each as carried at
the end. Two cars: the driving trailer and the motor car (MSO) behind it,
with its pantograph. The car behind the other driving trailer is the TSO, a
plain trailer: not rendered.

## Same as the 319

Body, doors, windows, heights, bogies and face are the 319's, measured
together: the body calibration was fitted on the GWR 769946 side-on photo
(p946) and 319366, and the face solves on 769458 and 769006 agree with
319386 within 2.5 cm. Numbers and their trace: ../319/spec.json.

## 769-only

- **Engine raft** 4.11-14.68 m under the driving car (diaN calibrated on its
  doors; p946 puts the cooler fan box at 13.3-14.3 m). The old model's two
  boxes reached over the rear bogie.
- **No roof exhaust**: none on any photo; the old model's stack at 13 m is
  removed.
- **Gangway door frame**: a ~4 cm black frame on Northern and GWR 769s (the
  319 has a thin seam). TfW's look like thin seams (second reader).
- **No "raised front" was found**: the Northern and TfW 769s keep the 319's
  face, lamp housings and lamp order (marker, headlamp, red tail). The new
  light arrangement is on GWR's 769/9s only: two round lamps per housing
  (clear headlamp + white LED cluster), no marker, no separate tail.

## Liveries

- **NT**: as the 319's (same paint), but the discs differ: small lilac,
  teal, pink from the front, each with a navy "n" (cut-out).
- **AW**: silver body, black window band 1.97-3.26 m stopping 0.21 m short
  of each door, red doors, red cantrail band 3.39-3.54 m, yellow face with a
  red frame that wraps 0.47 m onto the side at the top and fades out by 1.4 m.
  TfW logo behind the cab door.
- **GW**: dark green, light grey doors, orange cantrail line, a pale line at
  1.67 m interrupted by GWR logos (4.35 m and 16.1 m), yellow first-class
  strip over windows A-B.

## Camera matches (2026-10-06)

match/p006.json (TfW, near side, 5440 px from EXIF, rms 10.3 px, worst
held-out 3.3 cm) and match/p434w.json (Northern, near side, 3084 px from the
10.6 mm focal length on the RX100 VII's sensor: its EXIF 28 mm equivalent is
rounded and stretched the far windows 0.1-0.27 m; rms 9.1 px, worst held-out
5.8 cm). With 319366 and 319386 they moved three things in both specs: the face
is raked 0.07 m/m, the gangway door window is +-0.24 m, and the saloon glass
top is 3.05 (details in ../319/notes.md and trace). p006's doors are open: its
apertures' centres match the spec's door centres within 3 cm.

## Open questions

- Door colour width per livery: Northern's navy covers the leaves (1.33 m on
  p366/p434w), GWR's grey the leaves and frame (1.60 m on p946); the spec
  draws 1.5 m for both.
- Which roof the TfW render should have: TfW 769/0s have an empty pantograph
  well (p006pw). The spec cannot vary roof items per livery.
- GWR lamp order within a housing (second reader: headlamp outboard on one
  side, inboard on the other; perspective may mislead): check on a head-on
  GWR photo (pLM26 and p930 are three-quarter and 1024 px).
- GWR logo height (0.48 from its width at the SVG aspect vs 0.54 read at
  1366 px), first-class strip extent, GWR roof colour (sky-lit sample).
- 769 NT dots on the far side are unphotographed: same x assumed, as on the
  319.

## Needs (outside classes/769)

- `logos/NT-n.svg` (NT.svg's roundel path alone, filled by `color`).
- `logos/AW-wales-borders.svg` ("Cymru a'r Gororau / Wales and Borders",
  traced from p006) for the sub-brand beside the TfW logo.
- Pipeline options: per-livery face variants (GWR two-lamp housings and "1"
  box, TfW thin door seams and light grey lower band) and per-livery roof
  items (no pantograph for TfW). Or split 769/9 into its own fleet entry.
- The face number is model-level: 769458 is drawn on every livery.

## Next steps

1. fleet.ts: `fromSpec(spec769.model)`; liveries NT/AW/GW `'769'` keys from
   `liveryOf(spec769, op)`; create the logos above.
2. Render and compare against p458, p434w, p006, p946, pLM26.
3. Camera match p006 (51 mm equiv., focalPx 5440) and p458 (focalPx 3470).
