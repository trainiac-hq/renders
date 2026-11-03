# Stadler KISS (Caltrain): references

Not a TOPS class: keyed `KISS`, operator `CT` (Caltrain), as the Bay Area
region names it.

| Reference | Author | Licence | Used for |
|------|--------|---------|------|
| [Caltrain Stadler KISS EMU line scan photo dllu.jpg](https://commons.wikimedia.org/wiki/File:Caltrain_Stadler_KISS_EMU_line_scan_photo_dllu.jpg) | Daniel Lu | CC BY-SA 4.0 | side elevation of set 321-322: every door, window, livery edge, bogie and roof item, measured off the full 36056 px scan; colours |
| [KISS datasheet](https://stadlerrail.com/api/docs/x/3297d4f3aa/kiss_en.pdf) | Stadler | datasheet | wheel 0.92 m, floor heights |
| Private photos, not stored here | unknown | not for refs/ | the front: windscreen, white V, lamps, logo; three-quarter shape |
| [Caltrain logo.svg](https://commons.wikimedia.org/wiki/File:Caltrain_logo.svg) | Caltrain | public domain (text logo) | `logos/CT.svg`, recoloured to the photos: the cab's red circle, near-black "Cal" |

Scale: the line scan's horizontal scale depends on the train's speed, so
each axis was checked separately. The logo's circle measures round (46.4 by
45.8 px), so both axes share one scale; it is set at 70 px/m on the 2000 px
crop, which makes the cab car 27.7 m and the coach 25.1 m (two cab cars and
four coaches: 155.8 m against the published 157.1 m for a six-car set).
Width (3.0 m) is not published for Caltrain's cars: estimated.

The roof's dip over each high-floor end (the equipment wells) is traced off
the scan: 4.52 m against 4.8 m, `wells` in `classes/electric.ts`.

Not modelled: the drop centre's skirt below 0.75 m (dark `under`
instead), so the low doors stop at 0.79 m rather than 0.54 m.
