# Logos and wordmarks

The operators' own artwork, laid on the trains where the real ones carry
it (`Livery.branding`, `pipeline/branding.ts`). Each file is one piece of
artwork as an SVG; Blender builds it from the SVG's curves
(`pipeline/blender/branding.py`), so it stays sharp at any render size.

The first set (one per operator, named by ATOC code) was copied from the
Trainiac app (`apps/mobile/assets/operators/`, made by its
`scripts/fetch-operator-logos.ts`), which downloaded each file below and
optimised it with SVGO. Those were fitted to the app's dark badge tiles, so
most are recoloured white: a placement gives the colour the train wears
(`color`). Add others (a wordmark, a class's own emblem, "First class") as
`<ATOC>-<what>.svg`, listed here with their source and licence.

The logos are trademarks of their operators and are used only to depict
the real trains. Files marked "Fair use" are non-free on English
Wikipedia; files marked public domain are below the threshold of
originality there, which does not affect their trademark status.

| Code | File | Hosted on | Licence |
| ---- | ---- | --------- | ------- |
| GW | [Great Western Railway (2015) logo.svg](https://commons.wikimedia.org/wiki/File:Great_Western_Railway_(2015)_logo.svg) | Commons | Public domain |
| GR | [LNER Logo 2019.svg](https://commons.wikimedia.org/wiki/File:LNER_Logo_2019.svg) | Commons | CC BY-SA 4.0 |
| VT | [Avanti West Coast Logo.svg](https://en.wikipedia.org/wiki/File:Avanti_West_Coast_Logo.svg) | English Wikipedia | PD |
| XC | [CrossCountryTrains.svg](https://en.wikipedia.org/wiki/File:CrossCountryTrains.svg) | English Wikipedia | PD |
| TP | [TransPennineExpress.svg](https://en.wikipedia.org/wiki/File:TransPennineExpress.svg) | English Wikipedia | Fair use |
| NT | [Northern Trains.svg](https://en.wikipedia.org/wiki/File:Northern_Trains.svg) | English Wikipedia | PD |
| SN | [SouthernRailwayLogo.svg](https://en.wikipedia.org/wiki/File:SouthernRailwayLogo.svg) | English Wikipedia | Fair use |
| TL | [Thameslink-logo.svg](https://commons.wikimedia.org/wiki/File:Thameslink-logo.svg) | Commons | CC0 |
| SE | [Southeastern logo (2014–present).svg](https://commons.wikimedia.org/wiki/File:Southeastern_logo_(2014%E2%80%93present).svg) | Commons | Public domain |
| SW | [SouthWesternRailway.svg](https://en.wikipedia.org/wiki/File:SouthWesternRailway.svg) | English Wikipedia | Fair use |
| LE | [AbellioEastAnglia.svg](https://en.wikipedia.org/wiki/File:AbellioEastAnglia.svg) | English Wikipedia | PD |
| CC | [C2c logo.svg](https://commons.wikimedia.org/wiki/File:C2c_logo.svg) | Commons | Public domain |
| CH | [ChilternRailwaysLogo.svg](https://en.wikipedia.org/wiki/File:ChilternRailwaysLogo.svg) | English Wikipedia | PD |
| EM | [East Midlands Railway logo.svg](https://en.wikipedia.org/wiki/File:East_Midlands_Railway_logo.svg) | English Wikipedia | PD |
| XR | [Elizabeth line roundel.svg](https://commons.wikimedia.org/wiki/File:Elizabeth_line_roundel.svg) | Commons | Public domain |
| SR | [ScotRail logo.svg](https://en.wikipedia.org/wiki/File:ScotRail_logo.svg) | English Wikipedia | Fair use |
| AW | [Transport wales logo18.svg](https://commons.wikimedia.org/wiki/File:Transport_wales_logo18.svg) | Commons | Public domain |
| ME | [Merseyrail logo.svg](https://commons.wikimedia.org/wiki/File:Merseyrail_logo.svg) | Commons | Public domain |
| LO | [Overground roundel.svg](https://commons.wikimedia.org/wiki/File:Overground_roundel.svg) | Commons | Public domain |
| GX | [GatwickExpress2016.svg](https://en.wikipedia.org/wiki/File:GatwickExpress2016.svg) | English Wikipedia | PD |
| HX | [HeathrowExpress.svg](https://en.wikipedia.org/wiki/File:HeathrowExpress.svg) | English Wikipedia | Fair use |
| GC | [GrandCentralVector.svg](https://en.wikipedia.org/wiki/File:GrandCentralVector.svg) | English Wikipedia | Fair use |
| HT | [HullTrainsLogo.svg](https://en.wikipedia.org/wiki/File:HullTrainsLogo.svg) | English Wikipedia | PD |
| CS | [CaledonianSleeper.svg](https://en.wikipedia.org/wiki/File:CaledonianSleeper.svg) | English Wikipedia | Fair use |
| LM | [West Midlands Railway full logo.svg](https://en.wikipedia.org/wiki/File:West_Midlands_Railway_full_logo.svg) | English Wikipedia | Fair use |
| IL | [IslandLineFirst.svg](https://en.wikipedia.org/wiki/File:IslandLineFirst.svg) | English Wikipedia | PD |

Artwork no one publishes (a class's own lettering, "First class") is traced
off a reference photo with `scripts/accuracy/trace_logo.py` and listed here
with that photo, its author and licence.
### Added for the Electrostars

Made from the files above or drawn for the bodyside vinyls, text turned into
paths (Blender draws only paths). Generators are outside the repository; what
each does is below so it can be redone.

| File | Made from | Licence |
| ---- | --------- | ------- |
| GN.svg | [GreatNorthernLogo.svg](https://en.wikipedia.org/wiki/File:GreatNorthernLogo.svg), English Wikipedia, tidied (ids and Illustrator markup dropped) | PD (textlogo) |
| SE-wordmark.svg | SE.svg with "south" white (#F0F0F0), as carried on the navy trains | as SE |
| GX-big-top.svg, GX-big-foot.svg | GX.svg's letters fitted to the 387's measured 3.40 x 1.94 m "GX", less the window band (1.73-2.90 m) laid over their middle: the tops and the feet | as GX |
| GX-text.svg | traced (scripts/accuracy/trace_logo.py) off [Gatwick Express at Victoria, 21 February 2026.jpg](https://commons.wikimedia.org/wiki/File:Gatwick_Express_at_Victoria,_21_February_2026.jpg) (hugh llewelyn), 387 cab car left side, square on; quad 2136,1646 3244,1647 3244,1721 2136,1720 | photo CC BY-SA 4.0 (see classes/387/SOURCES.md) |
| GW-text.svg | "Great Western Railway", italic serif (Georgia) | drawn |
| first-class.svg | "First Class" in a white box with a black frame (Helvetica): the only photo of it (379018, g018) gives it 110 px wide, too coarse to trace | drawn |
| HX-door.svg, HX-logo.svg | the Heathrow Express roundel (ring and hourglass X) with "Heathrow Express" (Helvetica) | drawn |
| LE-wordmark.svg | LE.svg with its outlines flattened into simple polygons (Blender's importer leaves its self-crossing "g" unfilled) | as LE |

### Added for the Desiros

| File | Made from | Licence of the source |
| ---- | --------- | --------------------- |
| SW-roundel | traced (`trace_logo.py`, light ink, the arrow's paths then filled #4EC1FF as sampled on 450031) off [450028, Fratton Depot, May 20th 2026](https://commons.wikimedia.org/wiki/File:450028,_Fratton_Depot,_May_20th_2026.jpg) by Southsea_Matt | CC BY-SA 4.0 |
| SW-wordmark, SW-wordmark-navy | the glyphs of SW.svg (above) set on one line, arrow first, as the bodyside carries them; white for the cab car, navy (#1C273B) for car 2 | Fair use (SW.svg) |
| SE-light | SE.svg (above) with "south" white instead of navy, as the 707's navy bodyside carries it | Public domain (SE.svg) |
| EM-electrics, EM-front | lettering ("EMR ELECTRICS" on the 360's bodyside, "EMR" on its face) set in Inter SemiBold (SIL Open Font License, the copy Blender ships) to the proportions of the EMR 360 diagram and 360105 (Commons) | OFL (Inter) |
| GN-label | the 717's bodyside label: "Great Northern" set in Inter Bold (OFL) and squeezed across, in a dark purple box with a two-blue pennant, drawn to [Class 717 023 Great Northern at Finsbury Park](https://commons.wikimedia.org/wiki/File:Class_717_023_Great_Northern_at_Finsbury_Park.jpg) | OFL (Inter) |
| EM-luton | "LUTON AIRPORT EXPRESS" stacked, set in Inter Bold (OFL) as 360115 and 360105 (Commons) carry it by the cab door | OFL (Inter) |
| LM-W | the LNR "W" emblem, traced (`trace_logo.py`, light ink) off [350126 at Crewe](https://commons.wikimedia.org/wiki/File:350126_at_Crewe.jpg) | CC BY 4.0 |

### Added for the DMUs
| SW-oneline, SW-arrow | traced (wordmark and arrow separately) from [GBR London South Western Railway Class 159 159002 Vauxhall 2025-06-16](https://commons.wikimedia.org/wiki/File:%5BGBR%5D_London_South_Western_Railway_Class_159_159002_Vauxhall_2025-06-16.jpg) (classes/159/refs) with scripts/accuracy/trace_logo.py: the one-line arrow and wordmark on the 159 bodyside | Commons | photo CC BY-SA; the artwork is SWR's trademark |
| EM-regional | traced from the EMR Class 158 diagram (classes/158/refs/Class-158-East-Midlands-Railway-Diagram.png) | Commons | diagram CC BY-SA; lettering EMR's |
| LM-west, LM-railway | traced from the WMR Class 172 diagram (classes/172/refs) | Commons | diagram CC BY-SA; WMR's wordmark |
| SN-first | traced from the Southern Class 171 diagram (classes/171/refs) | Commons | diagram CC BY-SA |

### Added for the BR EMUs and Voyagers

| File | Made from | Licence |
| ---- | --------- | ------- |
| ME-roundel.svg | ME.svg's disc and M alone (paths 1 and 4), in the colours the 507/508 front carries (disc #4D5B58, M #F9BF56; classes/507 samples) | as ME |
| NT-n.svg | NT.svg's roundel alone (the disc with the n cut out), filled by a placement `color` (the 769's coloured discs) | as NT |
| NT-n-orange.svg | NT.svg's disc in orange (#FFC472, sampled on 319366, classes/319/samples.json) with the n in white, as on the 319s | as NT |
| NT-n-teal.svg | NT.svg's disc in teal (#2CBED0, sampled on 319366, classes/319/samples.json) with the n in white, as on the 319s | as NT |
| NT-n-purple.svg | NT.svg's disc in purple (#8B5477, sampled on 319366, classes/319/samples.json) with the n in white, as on the 319s | as NT |
| SW-wordmark-455.svg (the 455/456 trace; SW-wordmark.svg is the Desiros' set glyphs) | traced (scripts/accuracy/trace_logo.py) off [Class 455 December 25 cf 01.jpg](https://commons.wikimedia.org/wiki/File:Class_455_December_25_cf_01.jpg) (Secretlondon, CC BY 4.0): the one-line SWR wordmark the 455/456 bodysides carry (SW.svg is the stacked logo) | photo CC BY 4.0 |
| EM-letters.svg | 'E M R' spaced bold capitals as on the 222's cab car (p003, classes/222) | drawn |
| GC-bodyside.svg | traced (trace_logo.py) off [50901 Adelante of Grand CEntral at Maxey LC 111124.jpg](https://commons.wikimedia.org/wiki/File:50901_Adelante_of_Grand_CEntral_at_Maxey_LC_111124.jpg) (kitmasterbloke), quad 982,587 1095,587 1095,697 982,697: the stacked emblem and wordmark the 180s carry | photo CC BY 2.0 |

### Added for the Aventras and Civitys

| File | Made from | Licence |
| ---- | --------- | ------- |
| SW-arterio | traced (`trace_logo.py`, light ink, aspect 3.7) off [Reading - SWR 701008 Waterloo service](https://commons.wikimedia.org/wiki/File:Reading_-_SWR_701008_Waterloo_service.JPG); the A's fading left leg drawn as one stroke | see classes/701/SOURCES.md |
| XR-345-number | the 345's skirt number set in Inter SemiBold (OFL) to the proportions on Elizabeth-Line-Class-345-EMU (Commons) | OFL (Inter) |

### Added for the Caltrain KISS

| File | Made from | Licence |
| ---- | --------- | ------- |
| CT.svg | [Caltrain logo.svg](https://commons.wikimedia.org/wiki/File:Caltrain_logo.svg), recoloured to the photos: the cab's red circle, near-black "Cal" | Public domain (text logo); Caltrain's trademark |
| CT-308.svg, CT-308-grey.svg | the unit number, set in Seravek (macOS system font) as outlines, in the cab-side white and the far-end grey | outlines of a system font; check before relicensing |
| Stadler.svg | the builder's wordmark on the skirt, set in Helvetica Neue Bold (macOS system font) as outlines, Stadler blue | outlines of a system font; Stadler's trademark |
| CT-dest.svg | the LED destination sign at the top of the windscreen ("622 TAMIEN", as photographed on 330): a 5x7 dot matrix drawn here | drawn |
