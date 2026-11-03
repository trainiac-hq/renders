# Class 319 (Northern): measurement notes

Rendered: Northern Trains, the livery the last units carried (white, navy cab
ends sweeping back to door 1, uppercase "n NORTHERN" logo, three coloured "n"
discs), unit 319367. Two cars: driving trailer (DTSO) and the motor car with
the pantograph (MSO) behind it.

## What was found

- **Diagram.** Only Feathers44's Northern series (Unisouth template) exists.
  Its saloon is accurate (window/door edges fit two photos with rms 1.5-1.7 px
  through a 1D projective map), but its cab is drawn about 0.6 m too long and
  its car 2 is compressed (1376 px for 19.92 m, bogies 898 px apart against
  1018 on car 1). Calibrated on the photos: face at diagram px 102, 71.8 px/m,
  which also gives the published 14.17 m bogie centres on car 1.
- **Heights from photos**, anchored on the 318's door leaves (1.15-3.25 m):
  window frames 2.05-3.15 (two photos agree to 1 cm), body bottom 1.08,
  cantrail 3.52.
- **Face** solved on three head-on photos (319386, 769458, 769006) with a
  pinhole camera and mirrored pairs; they agree within 2.5 cm. Lamps sit at
  1.70 m (marker, headlamp, red tail, outboard to inboard), screens 2.26-3.28 m,
  the yellow runs 1.405-3.50 m with a navy band below to ~1.24 m. The face is
  vertical (p366: corner within 7 cm over 1.5 m), not raked as the diagram has it.
- **Plan corner** is deep: 0.4-0.46 m along the car (p366, and TfW's red wrap
  on the 769), though the flat face runs out to m 1.30.

## What the old model got wrong

- Side copied from the 320 (different cab, door widths, window layout, no cab
  door window), pantograph at 10 m on car 2 (measured 17.83 m).
- Face: generic gangway face, lamps at 1.15-1.35 m (measured 1.57-1.83 m
  housing), two lamps per side with no marker, equal screens, thick black frame
  round the gangway door (the 319 has only thin seams), no number, no orange
  line, yellow to the bottom of the face (it stops at 1.405 m over a navy band).
- Nose profile raked 0.25 m at the bottom; the real face is vertical.

## Camera matches (2026-10-06)

Four solves on the same body (match/p366.json, p386w.json here; ../769/match/
p006.json, p434w.json), points fitted as lines along scanlines, not eyeballed:

| photo | camera | rms | worst held-out |
|---|---|---|---|
| p366 (far side, 44 mm APS-C, ~25 m) | focal searched, 8427 px | 7.0 px | 2.9 cm |
| p386w (near side, 24 mm equiv.) | 2676 px (EXIF) | 8.2 px | 4.2 cm |
| 769 p006 (near, 51 mm equiv.) | 5440 px (EXIF) | 10.3 px | 3.3 cm |
| 769 p434w (near, 28.9 mm equiv.) | 3084 px (sensor) | 9.1 px | 5.8 cm |

What they changed in the spec:

- **The face is raked**, 0.07 m per metre from 1.2 m (its top 0.149 m behind
  its bottom). With a vertical face every solve left the face and the side
  10-13 px apart; a free rake came out 0.057-0.086 on each of the four, and
  0.07 minimises all four (0.05 and 0.09 are worse on every one).
- **Gangway door window +-0.24 m**, not +-0.265: the face's homography from the
  screens and lamps (1-2 px) puts its edges at -0.238/+0.225 (p366),
  -0.235/+0.244 (p386w), -0.233/+0.250 (p006), -0.227/+0.252 (p434w).
- **Saloon glass top 3.05**, not 3.09: the frame's top band is thicker than its
  bottom one (0.098 against 0.059 m from the lip, p366 profile).

What they found and did not change:

- **Door leaves read 1.33 m wide**, the spec's door 1.5 m: p366's navy leaves
  1.32 m through the solve, p946 (GWR) light grey 1.60 m with its frame. The
  paint covers the leaves on Northern and the leaves plus frame on GWR, so the
  door's coloured width depends on the livery; the spec has one width. The
  matches use the door's centre (d1c-top) for that reason.
- The glass bottom may sit higher (2.14-2.22 with the heights free) and the
  face's fore-aft place against the side is loose (x0 -0.03 to -0.20): no two
  photos agree well enough to move them.
- Residuals stay 7-10 px after the rake: something else in the face-to-side
  geometry (plan corner? body width at the windows?) is still off by 2-3 cm.

## Open questions

- Door leaf heights (1.15-3.25) come from the 318's photos. The camera matches
  put the door tops at 3.23-3.25 (d1c-top within 2 cm on all four), so they
  hold.
- Door colour width per livery (see above).
- Cab door top (3.25 on p366, 3.39 on p006): 3.30 used.
- Car 2's dots and the logo on car 2 come from the diagram (old lowercase
  logo) plus one distant view; sizes are copied from car 1.
- Navy colour: balanced samples range #3C445F (p366) to #545974 (p367).

## Needs (outside classes/319)

- `logos/NT-n-orange.svg`, `NT-n-teal.svg`, `NT-n-purple.svg`: NT.svg's
  roundel (its first path) as a coloured disc with a white "n" (colours in
  trace). The branding check fails until they exist.
- A traced Northern wordmark: NT.svg's lettering is smaller relative to its
  disc (aspect 3.37) than the vinyl (3.97); the spec gives `width` 2.46 m.
- The marker light is a small upright rectangle (0.06 x 0.145 m); `lampUnits`
  only draws round lamps, so it is a 0.03 m round lamp.

## Next steps

1. Point fleet.ts at `fromSpec(spec319.model)` and add `'319'` to
   liveries/NT.ts from `liveryOf(spec319, 'NT')`; create the NT-n logos.
2. Render elevation, hero, close, corner; compare against p366, p367, p386w
   (include a corner-door pair from p366).
3. Camera match p366 (EXIF 44 mm on APS-C) and p386w (4.3 mm, focalPx 2676).
4. Update checklist.md from the renders.
