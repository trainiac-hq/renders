# Class 387: notes

Evidence (`evidence.json`, 34 photos/diagrams, 59 crops, 22 samples),
`spec.json` (377 schema plus the new face schema, liveries GW GN GX HX SN CC,
`elevations.<ATOC>`, pairs, views) and two match files are written. Every
number has its source in `spec.json` `trace`. Second readings (`reading2`)
came from two sonnet subagents given only the crop path and feature name.

Sides: positive `m` on the face = right as seen head-on = the train's LEFT
bodyside. pldn and pkgx show the left side; p174, p133, p205, pvic the right.

## Decisions

- **Lamps: one figure-of-eight bezel per side, not two separate lamps.**
  The first reading ("two separate round lamps, head outboard") does not
  hold on the crops: f-lamps-r/l-164, f-lamps-205, -123, -133, -302 all
  show one black bolted peanut housing, headlamp outboard and higher, red
  LED tail inboard and lower; both readers agree on every crop. Same part as
  the 377/4, measured a little larger (head r 0.124, tail r 0.08 against
  0.105 and 0.065).
- **Panel lower edge** ("wave rising outboard"): settled on the yellow mask
  of p164, column by column. Level inboard (1.09-1.12 m), lowest (1.07)
  under the headlamp, then a large-radius corner rising to the outer edge at
  about 1.40 m. That is the dip and rise first described, not a
  sinusoidal wave. Shared by GW, GX, GN, HX and CC.
- **SN = GX red** (`liveries.SN.copyOf = "GX"`). 2026-dated Commons
  photos of 387s on Southern services, by unit:

  | Unit | Date (2026) | Livery | File |
  |---|---|---|---|
  | 387205 | 03-10, 06-07 | GX red (seen) | 387205, Swanwick...; 387 205 at Southampton Central.jpg |
  | 387220 | 03-10, 05-15 | red (seen) | 387220, Havant, May 15th 2026.jpg |
  | 387223 | 04-15, 05-15 | red (seen) | 387223, Lewes, April 15th 2026.jpg |
  | 387204 | 06-08 | GX red (category) | Train arriving at St. Leonards Warrior Square ... 8343753 |
  | 387201, 387206, 387207, 387211, 387212 | 03-05 | red by fleet number (387/2), not checked by eye | Southsea_Matt Swanwick/Lewes/Southampton set |
  | 387123 | 01-16, 05-15 | GTR white (seen) | Chichester Station ... 8235574.jpg; 387123, Brighton, May 15th 2026.jpg |
  | 387125 | 05-15 | GTR white (seen) | 387125 & 387211, Lewes, May 15th 2026.jpg |
  | 387117 | 06-08 | GTR white (category) | Two trains at Eastbourne ... 8343761.jpg |
  | 387301, 387302, 387305 | 03-17, 05-08, 05-29 | ex-c2c, Southern white (category) | 387 301 at Southampton Central.jpg; SN 387 302.jpg |
  | 387174 | 06-07 | GWR green, debranded | 387 174 at Southampton Central.jpg |
  | 387172 | 05-26 | GBR | GBR 387172 Victoria (1-9).jpg (also in the Lewes derailment, 2026-08) |

  Red is the majority: 9 units by fleet number, 4 seen. White comes to 6
  (3 GTR plus 3 ex-c2c). Counting only units seen or categorised, it is
  4 red against 4 white (387301 only by its category), so the call is
  close. The earlier note recommended GN white; the larger count favours
  red. For white, SN = GN.
- **CC** is the c2c livery as photographed on loan to GWR in 2021 (p302,
  p306r, p306t). No 2016-2020 c2c-service photo of a 387 on Commons: the
  livery matches the 2017 c2c diagram (navy-purple doors, Quiet/Zone labels).

## What differs from the 377 (body)

- Ahead of the first door: a narrow window (1.98-2.68 m) then a wide one
  (2.92-4.50 m), each in its own frame, where the 377/4 has one first-class
  glazed band (1.94-4.63 m). From the pldn and p174 fits; the diagrams'
  window layout agrees within 0.1 m.
- Windows are separate, each in a rounded black frame (radius about 0.08 m),
  and the glass reaches lower (1.76-2.79 m against 1.886-2.784 m). The 377
  has flush, near-square glazing.
- Door positions behind the first door are the 377's within 0.05 m
  (pldn: door 1 4.74-6.41 m, door 2 front 13.92 m, windows 3-6 within
  0.05 m; rms 4.2 px). First door is 4.74 m from the nose tip.
- Cab door: 0.785-1.685 m, ±0.15 m. This is the weakest number: it is
  extrapolated ahead of the fitted points. The 377 has 0.97-1.79 m.
- Car lengths: published 20.39 m (387) against 20.4 m (377), with the same
  width and a 3.77/3.78 m roof. The 377's 20.20 m (face to car end) and
  19.99 m are kept.
- Face: same gangway (door aspect 3.06 against 3.04), same cap and orange
  line. The screens have a deep black sill (0.23 m) under the glass. The
  lamps are slightly larger. GW alone has a mint D-plate on the dome
  (`faceShapes`). The HX gangway door is black above 2.06 m with a white
  ring logo (`faceShapes`).

## What the current model gets wrong (electrostar.ts `class387`, liveries)

1. `electrostarBase`: cantrail 3.43 m (should be 3.30), window 1.95-2.95 m
   (glass 1.76-2.79), wheelbase 2.6 m (2.33), cab 20.4 m with doors at
   6.02/15.15 m (5.575/14.83 m), cab door at 1.9 m, 0.75 m wide (1.235 m,
   0.90 m), saloon doors 1.4 m wide (1.76 m), window list shifted about
   0.4 m back.
2. Face `lights: pair(...)` draws two rounded boxes per side. It should be
   one peanut bezel with the tail inboard and lower.
3. Yellow `panels` include a strip over the screens drawn as a box. It is an
   arched cap (3.29 m rising to 3.575 m at the centre) with the orange line
   under it. The panel's outer bottom corner should be rounded and dip under
   the headlamp, not a square box. No marker, number, wipers or destination
   display are drawn.
4. GW `electrostar` livery: the doors are silver-grey (#838489), not
   #4E5B57, with a lime line on the leaves. The bodyside line is pale grey
   at 1.54-1.58 m, not at 0.40 of the side. The swoosh at 7.6-13.9 m does
   not match the diagram's band at 1.9-4.5 m. The body samples at #2E4754
   (raw), not #10302B (no neutral is available, see doubts).
5. GN: the doors are dark green, not #C3C7CB. The `face: '#14171A'` is
   wrong: the face is white with yellow panels.
6. GX: the white line is at 1.47-1.52 m (here 0.36 of the side), and the
   doors are grey.
7. HX: the 2019 purple-door layout is gone. The doors are grey, with a large
   purple panel from 2.3 to about 11 m between white crescents.
8. CC `electrostar`: the doors are navy-purple (#3E466F), not #1E2A3A.
   There is no lower grey band in photos.

## Doubts

- No rail is visible on p164 or pldn. Heights are anchored on the 377's
  orange line and door span, and the face scale on the 377's panel width,
  so those are confirmed as consistent, not measured independently.
- GW colours have no neutral (no white on the car). They are raw overcast
  values; the blue cast of #314B5A may be sky reflection.
- The GW diagonal band is from the diagram only; it is faint at best in
  photos.
- HX purple panel edges are ±0.3 m. The city wraps are not modelled.
- GX `red-vic` balances pinkish (#C22651). The face uses `red-coo`
  (#CC1608).
- Match picks are ±5-6 px, and pldn has only one off-plane point; axles
  were not picked. Re-pick on pick.py panels before solving.

## Camera-match photos

- `match/pldn.json`: At London 2025 838 (Mike Peel, 2025-11-25), fetched
  at 3840x2560 (original 6960x4640). Long left bodyside to door 2, tail lit.
- `match/p164.json`: 387164 at Didcot Parkway (2024-08-03), 2279x1520.
  Head-on, face points.
- Third candidate: 387 174 at Southampton Central (2026-06-07), 1920x2560.
  Close three-quarter of the right side with the corner and cab door. Not
  picked.

## Logos

Measured into `liveries.<key>.logos` (every number traced), against the cab car moved
back 0.20 m (door 1 4.875-6.505, door 2 14.185-15.815). Ruler: 1D projective fits along
one row through door, window and cab door edges, residual given per trace; heights per
column between window bottom 1.76 and body bottom 0.94 (or the orange line / crease).
Crops `logo-*`. New refs: pgxv (square-on GX bodyside, 2026-02), p169 (GW right side),
p201 and p222 (Southern-worked red units). Side check: pvic shows the LEFT side (nose
image-left; its match file agrees), not the right as the header above says.

- **GW**: grey GWR logo (W as a tall V plus a slash) 3.05-3.89 m, 1.25-1.58 m, both sides,
  reads normally; it breaks the bodyside line. Its grey is the line's (same raw reading
  beside it). Small "Great Western Railway" 6.75-7.56 m, 1.47-1.53 m under the line behind
  door 1 (left; right not seen). A second GWR logo behind door 2 at about 17.6-18.5 m
  (p151, +-0.25), and the same pair on the second car (3.04-3.86, about 18.1-18.9).
  Face: none.
- **GN**: Great Northern box-and-triangle (the 379's art), left 10.30-11.52 m, right
  9.71-11.00 m (0.08 m/px), box 1.46-1.73, triangle apex 1.24. Box #4C4164, triangle
  #8DBEF7. Second car about 10.0-11.2. No First Class box on either side
  (pkgx, pwel). Face: none.
- **GX**: the two sides differ. Left: huge white serif "GX" 7.81-11.21 m from 1.29 to
  3.23 m, under the black window band, then "GATWICK EXPRESS" 11.38-13.59 m at
  1.41-1.56 in a gap in the white line. Right (p227, and 387221 in 2025): the cab car has
  a small GX only below the windows (11.16-12.25, 1.34-1.75) with the text forward of it
  (8.54-11.31); the second car's right side has the huge GX (G at its rear). The white
  line reads 1.42-1.46 on pgxv, 0.05 under the spec's lineY. Face: none.
- **SN**: copied from GX. 2026 photos of red units on Southern services still carry the
  Gatwick Express marks (387220 2026-05-15, 387207 2026-05-08, 387223 2026-04-15, 387222
  2025-11-29). The exception is 387201 (Lewes, 2026-04-15): plain red with no GX, no
  white line and one small white wordmark ahead of door 2 (unreadable at 1600 px; likely
  Southern's). So a Southern-worked red 387 normally looks like a GX one; a debranded
  variant exists but is not the majority.
- **HX** (p133, right side only): each door leaf has the Heathrow Express ring and hourglass
  X with "Heathrow / Express" under it (1.30-1.69); a grey aircraft 9.14-10.60 m; a dark
  Heathrow Express logo behind door 2 (16.9-18.5, extrapolated); "BUSINESS FIRST" on the
  glass bottoms; and a per-unit city wrap (387133 TOKYO 3.03-4.23, 1.19-1.67; 387132 is
  NEW YORK). Face: white ring with an X on the gangway door, already drawn as a ring,
  without the X. 387132 (2024) seems to have a different panel layout; not chased.
- **CC** (2021 on GWR, as it ran for c2c): c2c wordmark between the doors, 9.70-10.39 left,
  9.95-10.75 right, 1.39-1.66. #94526F from thin strokes, so the paint is likely the
  357's #CA348C magenta. "Quiet | Zone" door panels on doors 1 and 2 of the Quiet Zone
  car only (left side 1.60-1.76, matching labelsY). A small Trenitalia endorsement
  after the wordmark (left 12.65-13.30, right 7.16-7.91), low confidence.

Art needed: `gwr-logo`, `great-western-railway-text`, `great-northern-logo`,
`gx-letters`, `gatwick-express-text`, `gx-logo-small`, `heathrow-express-roundel`,
`heathrow-express-roundel-text`, `heathrow-express-logo`, `heathrow-express-aircraft`,
`business-first-text`, `heathrow-express-city-tokyo`, `c2c-wordmark`, `quiet-zone-quiet`,
`quiet-zone-zone`, `trenitalia-endorsement`.

## Elevation and pairs

Elevation renders of 2026-10-05 21:17-21:56 (16 samples, logos as meshes, GX/SN window band
and broken line). `elevations.GN` untouched.

- **GW** 27/27 (was 24/26), two wrong checks. The door leaf column at 4.95 crossed the lime
  door line (1.54-1.58): split into 1.58-3.256 and 0.955-1.54. The "first door" run still had
  the pldn fit's 4.94-6.61 (4.74-6.41 plus the 0.20 face move), superseded by the camera fit
  4.875-6.505 (`cab.doors[1..2].fit`); also probed at the leaves' joint, now `leaves: 2`.
  Measured 4.882-6.482.
- **GX** 28/29 (was 7/23). The band's paint (windowFrame #111414) is 2 off the glass #0F1414,
  so at glass tolerance 10 every window run filled its whole bay's band (2.28-4.81,
  6.74-14.05, ...). The render's flat glass is #0F1414 +-1 and the band #111414 +-1, so glass
  and band tolerance 1 tells them apart (tighter, not looser). Added: band column at the a/b
  pillar (1.741-2.904 vs 1.73-2.90), band front ends 2.288 and 6.750, the white line from
  door 1 to the G (6.519-7.719 vs 6.505-7.73) and from after the text to door 2
  (13.795-14.157 vs 13.80-14.185). **Livery fixed**: the render ran the white line from the
  nose (0.125) across the cab corner; s-cab-205 (both readers) and pvic show it starting at
  the cab door's front edge and plain red ahead of it. `liveries.GX.shapes` (and SN's copy)
  cab line now starts at 0.985 (trace `liveries.GX.shapes.lineFront`). The check "no white
  line ahead of the cab door" fails on this GX render until it is re-rendered; SN, rendered
  after the change, passes it.
- **HX** 19/19 (was 17/18): the purple panel run (2.8-10.6, +-0.3) crossed door 1's grey
  leaves; now 2.51-4.875 and 6.505-11.38 (the shape's crescents at row 1.2), measured
  2.506-4.869 and 6.494-11.382.
- **CC** 21/22 (was 20/22): the door column at 5.1 had its middle in the leaf's pane
  (5.025-5.505); moved to 4.95, full height 0.979-3.241. The Quiet/Zone label check fails:
  `electrostarLivery` ignores `labels`/`labelsY`, and the `quiet-zone-*` logos map to null
  (kept off door leaves), so the photo's labels are not drawn. A model question, not changed.
- **SN** 29/29: `elevations.SN` was the string "same as GX (copyOf)", which elevation.py
  cannot read; now a copy of GX's block. Which livery SN renders is unchanged (still open).

Logos vs check rows: the elevation shows the left side (GX's big letters appear). No row
crosses a logo: GX rows at 1.495 stop at 7.73 / start at 13.80 around the letters and text;
HX's logos are right side only; CC's c2c wordmark (9.70-10.39) and GW's (3.05-3.89,
6.75-7.56) sit clear of every row.

Pairs (2026-10-06, ref-* renders for GW, GX, HX, CC; judgements in checklist.md). Boxes:
+z is the train's right side, so a head-on photo's right-hand panel is -z; every face pair
(`lamps`, `lamps-far`, `panel`, `screen`, `screen-dest`, `lamps-lit`, `panel-gx`) had the opposite
sign and `corner-door` was -z on a right-side photo: all flipped. pldn shows the LEFT side but
view `ref-ldn` (azimuth -35) renders the right: the ldn pairs now carry -z, and the view needs
azimuth +35 and a re-render (views are not edited here). `lines`/`cab-end-livery-gw` boxes now
match their crop (0.8-7.1 x 1.3-1.8), so `cab-end-livery-gw` duplicates `lines`. `door-cc` now
0.0-14.5 to match its crop. `cab-gx` and `car-end-gx` cannot be judged on ref-205 (too close; car
end out of view): car-end-gx needs a ref-227 view.

Found by the pairs (not changed):

- **Cab side window on the right side.** `cab.panes` (0.57-0.96, 2.23-2.84) is drawn on both
  sides. Right-side photos (p174, p133, p302) have plain bodyside between the cab door and the
  face; only left-side photos (pldn, p205, pkgx) show the window. Shows in corner-door,
  cab-end-hx and door-cc.
- **HX gangway door**: upper half near-black with the white roundel and X, lower half yellow
  (f-gangway-133); the render's door is all yellow and the faceShapes ring does not show.
- **HX crescents** are broad curved swooshes in p133; the render's are narrow strips.
- **GW body**: #2E4754 renders blue-teal; every photo reads near-black green (no neutral, the
  Doubts above already note a possible sky cast).
- **GX red**: the renders carry #C22651 (pink); the spec's GX body is now #CC1608, so a re-render
  is due before judging it.
- Gangway door seams/handles, frame colour and height (cap, dome, face-cc) and the missing
  destination display are the known gangway and screen questions. The face-ahead-of-doors
  offset does not show clearly in any of these pairs (corner-door is dominated by the extra
  window).

## Camera matches (2026-10-06 update)

pkgx and pvic, focal length fixed from the Commons originals' EXIF (pkgx 104 mm
equivalent, 11093 px; pvic 26 mm, 2884 px), principal point at the centre, no k1.

| Photo | Before (EXIF focal) | After |
|---|---|---|
| pkgx | rms 32.3 px over 14; held out 9.6 cm (face 11.4-11.6, not scored) | rms 4.65 px over 8; held out 0.6, 1.6, 2.1 cm |
| pvic | rms 35.5 px over 18; held out 12.7 cm (face 12.0, not scored) | rms 6.06 px over 13; held out 1.1, 2.0, 4.5 cm |

Neither solve scores the face: face 1 sigma 2.2 cm (pkgx) and 4.5 cm (pvic), with no
off-plane point the model has right (below). Both cameras agree with their EXIF: with the
focal length free the bodyside alone gives 10501 px (-5%) and 2771 px (-4%).

Picks fixed:

- pvic `win-a-front-bottom` model x was 2.18: the 0.20 m shift missed it (window a is
  2.40-2.88). Now 2.40; it measures 2.35.
- pvic `win-a-front-top` and `win3-front-top` are corners of GX's black band, which runs
  ahead of and above the rounded windows. Their model points are now the band's
  (`liveries.GX.shapes`: 2.28 and 6.75, top 2.90); they measure 2.28 and 6.78.
- pvic `win6-rear-top` dropped: it was door 2's front edge (1 px from `door2-front-top`).
- pkgx `door2-front-bottom` was the top of the yellow threshold, 0.08 m high. It is now the
  seal at the body's bottom edge, as door 1's are.
- Side, lamp0 and near/far conventions all hold. The visible side is the left (near,
  -y), lamp0 is the near (left) lamp, and pkgx's screen-d1 is the far screen.

The face picks are held out, not fitted. They are picked right but the model's face is
not where these photos put it (model errors, not moved):

- **Face vs bodyside.** Measured on the face plane with the bodyside cameras, every face
  point lands further towards the far side than the model has it. pkgx: +0.16-0.27 m
  (lamps +0.21/+0.18, near screen +0.27/+0.22, far screen +0.20/+0.16). pvic: +0.48-0.63 m
  (lamp head z -0.61 against -1.09, near screen edge -0.66/-0.79 against -1.28/-1.345).
  The face's own proportions match: lamp spacing and the screen-edge-to-lamp distance agree,
  and pkgx's face is 2.64 m between screen edges against 2.69. So this is where the face
  sits, not its shape.
  Along each view (17 and 32 deg off the axis) both readings mean the face is about
  0.6-0.8 m further ahead of the doors than the model has it. With the face also free to
  shrink, they mean about 0.3 m (pvic) or 0.6 m (pkgx) further ahead and 6-9% smaller.
  Fitting the face with the bodyside cannot get under rms 19 px for any focal length,
  k1 or principal point. That is what threw the earlier solves (the 3415, 612 principal
  point) and the "face too big and too far left" overlay.
  You can see it without a camera: the white (or red) wrap between the near screen's
  edge and the cab side window is 2.5-3 times the model's width on both photos (pkgx
  about 135 px against 47, pvic 220 against 90).
- **Car end.** On both cameras the cab car's rear end measures 19.97 (pkgx) and 20.03
  (pvic) against the model's 20.40, give or take 0.1. Taken with the face, the face-to-end
  length is about right (published 20.39 m), but every side feature sits about 0.4 m
  further from the face than modelled. `cab.faceAhead` moved them back 0.20 m; the photos
  ask for about 0.4 m more. That is still to settle (pldn's fit disagrees), and
  it needs an off-plane check before it is applied.
- **Cab side window** (`cab.panes`, 2.23-2.84 m): measured at 2.32-3.00 (pkgx) and
  2.33-3.00 (pvic). Its front edge is right (0.50-0.55 against 0.57).
- **Door 2's rear edge** measures 0.10-0.11 m ahead of 15.815 on both photos (leaves about
  1.53 m against 1.63). Door 1's edges are within 0.05 m. It stays in the fit;
  RANSAC flags it on pvic.
- **Running gear (pvic).** On the bodyside camera, the model's wheels and rails project
  about 0.3 m above the photo's wheels. The picks are not trustworthy: dark bogie, near
  rail behind the conductor-rail board. So the axleboxes are not used, and the rail
  height is worth checking on a cleaner side-on photo.

k1: `match.py` cannot fit k1 with a fixed focal length. The k1 step
(`with_distortion`) and the free principal point both run only when `focalPx` is unset,
and `with_distortion` also leaves the focal length free (no `CALIB_FIX_FOCAL_LENGTH`). To
support it, add a fixed-focal branch with `CALIB_FIX_FOCAL_LENGTH |
CALIB_FIX_PRINCIPAL_POINT` and k1 free, kept by the same held-out test. It is not needed
here. Fitted that way outside match.py, pvic's k1 comes out -0.15, the fit rms falls only
6.06 to 5.87 px, and the worst held-out point gets worse (4.5 to 5.4 cm). The 0.156 of the
free-focal solve was absorbing the face error.

The match renders and overlays are stale until `match-pkgx` and `match-pvic` are
re-rendered.
