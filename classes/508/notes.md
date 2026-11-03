# Class 508: measurement notes

Rendered: 508108, Merseyrail "Good Communications" livery on the grey background
(December 2022), as the 508/1s ran until withdrawal on 2024-01-16. Other units ran
the yellow-background version (508112, 508138 by 2022, 508141) or a blue one (508111).

## The 508 against the 507

The old data drew the 508 as a 507 (`fleet.ts` maps both to `class507`). That
turns out to be right in shape. The two classes share the BREL PEP-derived body,
and both got the same Alstom (Eastleigh, 2002-05) refurbished front: one
LED roof lamp, two markers, a black band with two gasket screens and the gangway
window, black teardrop pods. I found no measurable difference:

- Front: 508141, 508120, 508108 and 508138 show the 507's layout feature for
  feature. 508141 gives marker spacing 0.355 m against 0.336 on 507014, and
  band-to-valance 1.31 m against 1.25 on 507009 (same photographer, same day,
  same kind of view). Both are within the camera error, so the face is shared.
- Side: the BR 508 diagram (`Class_508_BR_Corporate_Diagram.png`, 4-car 508/0)
  puts the cab window and cab door at the 507 diagram's distances from the front
  (within 0.04 m). Every saloon feature is at the same pixel. It draws the DM
  0.63 m short; the published lengths are identical (19.80 / 19.92 m).
- Lamp order is the same: headlamp outboard and higher, LED tail inboard and lower.

No Merseyrail-livery 508 diagram exists on Commons (only BR, Connex, South Eastern,
Silverlink strips).

So `spec.json` has the 507's model, re-checked on 508 photos, with the number 508108.
The two specs can stay separate files, because the fleet gives each class its own
entry.

## Camera matches

Three of the five matches are 508s (p108, p112, p138w; table in classes/507/notes.md). They and
the two 507009 matches agree within 0.1 m on door 1 (7.05), the door width (1.72) and the seal
across the door tops, so the change went into both specs. The face fits every solve to 1-4 cm.

## Face handedness (2026-10-06)

The first close renders put the number left and the roundel right as seen; every photo has them
the other way. The face had been measured with m positive to the right as seen, while the
pipeline's m is +Y (the train's right, left as seen). Fixed in both specs: the non-mirrored dark
parts, shapes (box and destination display), number and wiper negated, the roundel at u 0.796.
The gangway door is now yellow only up to the band (1.949); above that it is black round its
window, part of the band, as on p014.

## Pairs on the match views (2026-10-06, 07:4x renders)

Judged one at a time. Fixed in the spec: saloon glass 1.70-2.70 (was 1.82-2.655; the windows
pair showed the photo's glass far taller, and the p112 camera puts three bottoms at 1.69-1.75);
marker lenses r 0.075 (they read small); the dark strips beside the gangway door narrowed to
0.05 m (they read as a heavy frame). The 508108 face is amber (#CC8701, samples.json yellow-108), not the 507s' yellow; doors stay yellow. Left open: the box and the destination display in `shapes` don't
show through the dark band; the roof lamp renders as a small notched disc where the photos show
a 0.18 m black disc of LEDs; the roundel's disc renders darker than the photos' grey (its colour
is in logos/ME-roundel.svg, outside this class).

## Open questions

The open questions are the 507's (classes/507/notes.md): the cab-end positions,
the face-height anchor, the cab window height, the dome, and the line-art.
508120 has a yellow wave with dotted black edges on the cab side; this unit's
artwork is not modelled.

## Logos

These are as on the 507: the M roundel on the front only. It needs `logos/ME-roundel.svg`.

## Next steps

1. Wire up `class508 = fromSpec(spec508.model)`, give 508 its own `fleet.ts` entry,
   and add `liveries/ME.ts` `'508'`.
2. Render, compare with p141 / p108 / p120o, and update checklist.md.
