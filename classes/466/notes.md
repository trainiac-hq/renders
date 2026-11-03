# Class 466 Networker: notes

Measured 2026-10-06 for 466-SE (Southeastern white; 16 left, scrapping since early 2025).

## The two cars

The 466 is a two-car unit, **DMSO + DTSOL**, both 20.80 m (published). It runs coupled
to 465s, and either car can lead in the photos; the leading car in p007 is DMSO 64866,
and on p040s the second car's far end is a cab coupled to the 465. Rendered: the DMSO
(cab) and the DTSOL behind it.

- **DMSO** (cab car): the same body as the 465's DMSO. The 466 diagram's right car has
  exactly the 465 DMSO's pixels (cab door, oval/big/oval, door 1, five windows, door 2,
  big, big, small). Spec numbers are the 465's, with the length 20.80 m (the 465 DMSO
  is published 20.89; the diagram draws both 664 px, so the 9 cm is not located).
- **DTSOL** (second car): a driving trailer with a toilet. From its coupled (front) end:
  two small toilet-side windows, big, small, door 2, five big, door 1, small/big/small,
  its cab door and a **full cab at its rear end** (yellow face, screens, lamps, bumper,
  coupler), mirrored from the front. Its doors are at 4.95 and 14.63 m from the coupled
  end (the DMSO's are 6.20 and 15.92 from its nose).
- **What differs from the 465 as rendered:** the second car is a 20.80 m DTSOL instead
  of a 20.06 m TSO, with different window rows at the coupled end and a cab at the
  back; the face is the same except the **number sits on the left** of the band
  (466009/466040/466007: -0.93 m) where the 465's is on the right (+0.75 m).

## Pipeline need

The next car's far end is drawn as a gangway end; the DTSOL needs a rear cab (the same
face and nose profile mirrored onto the car's far end): a `next.rearCab` option, additive.
Recorded in spec.json `pipelineNeeds`. Until it exists the 466's car 2 ends wrongly.

## What the old model got wrong

fleet.ts draws the 466 with `class465`: a 20.06 m TSO as car 2 (no toilet windows, no
rear cab), the number on the wrong side, and everything listed in classes/465/notes.md
(lamp order, lamp boxes, bumper, number band, livery).

## Open questions

- Same as the 465: tumblehome, face plan, roof colour unmeasured; SE.svg colours.
- The DTSOL's cab door and rear-cab windows are mirrored from the DMSO's photo-corrected
  numbers, not measured on a DTSOL photo (p040s sees them edge-on).
- Camera matches (2026-10-06): p040 (466040, rms 8.3 px, worst held-out 5.6 cm) and p009
  (rms 11.9 px, 1.5 cm; face not scored, its depth unpinned). They moved: doors 1.45 ->
  1.53 m wide (p040; the 465's photos 1.56-1.69); cab door 1.30-2.20 (0.90 wide; the
  DTSOL's mirrored); cab door window 1.77-3.02 (the outer frame; p040s's reading was the
  glass); door leaf windows 1.73-2.95. The white strip between the band and the cab door
  (band from 2.68) is real on the 466 and absent on the 465.
- Same lower tumblehome as the 465 (door bottoms in by ~6 cm): a pipeline need.

## Next steps

1. Own fleet entry: `fromSpec(spec466.model, 'networker')`, `liveryOf(spec466, 'SE')`.
2. The rear-cab pipeline option, then render and compare the DTSOL end against p040s/p007.
3. Camera-match p040s and p009.
