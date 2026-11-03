# Fleet truth: who runs what, October 2026

An audit of `classes/fleet.ts` (class -> operator ATOC codes) against what is actually in
passenger service on the National Rail network.

- **Audit date:** 2026-10-05.
- **Method:** each class's English Wikipedia article (and the operator articles' fleet tables)
  fetched on the audit date, cross-checked against 2025-2026 news (RAIL, Rail Advent, Modern
  Railways, IanVisits, operator/GBR releases) found by web search. Wikipedia counts are as fetched
  and can lag; where sources disagree, or nothing dated 2026 confirms the status, the row says
  **unconfirmed**. Liveries are the operator's standard scheme unless a source is cited; "standard"
  liveries were not checked unit by unit.
- **Not covered as mainline:** Eurostar (373/374), Tyne and Wear Metro (555), Sheffield
  tram-train (399), TfW Citylink tram-train (398). Noted at the end.

## Electrostar liveries rendered (decided 2026-10-05 from dated Commons photos; overrulable)

The rule (2026-10-06): each class x operator renders the livery most units carry
today; on a near tie, the newer scheme. The choices below follow it (traces:
`liveries.<key>.choice` in each spec): 378 original, 387 Southern the red GX scheme, 357 new c2c.

Each was decided from photos counted per unit
(the class's `notes.md` has the tables, units, dates and files). Change the livery key in
`liveries/<ATOC>.ts` (and the spec's `liveries`) to overrule.

| Train | Rendered as | Evidence | Kept, not rendered |
| --- | --- | --- | --- |
| 357 CC | the 2024+ c2c scheme: white, magenta beside the screen and on the doors, magenta swoosh, yellow only under the screen | 13 units seen in it in 2025-26 photos against 6 in the older scheme | `liveries.CC-old` in classes/357/spec.json (white, yellow cap, dark doors); no Commons photo of the GBR 357008/020, so no GBR entry |
| 375 SE | Southeastern navy, cyan doors | every 2024-26 photo | |
| 376 SE | Southeastern navy, light blue doors, the orange ring round car 1's first window | 9 units navy (all Oct-Nov 2025 photos) against 8 still white, repaints continuing | `liveries.SE-white` in classes/376/spec.json (the old `SE['376']` white entry is replaced) |
| 378 LO | the original Overground scheme (yellow cab top) | latest photo of every unit: 46 original against 11 refreshed (31 to 11 counting 2022-26 photos only) | `liveries.LO-refreshed` in classes/378/spec.json (navy cab top, black upper body, orange corner stripe) |
| 379 GN | ex-Greater Anglia white, near-black doors, yellow first-class strip: not repainted | every 2025-26 GN photo | |
| 379 LE (historical) | the same paint as carried 2019-21 (no red doors or swoosh) | 379029, 379017, 379008 photos | |
| 387 SN | debranded Gatwick Express red, a copy of GX | 2026 photos of Southern-diagrammed 387s: 9 red 387/2s by fleet number against 3 GTR white, 3 ex-c2c white, 1 GWR green, 1 GBR; 4 to 4 counting only units seen in photos, so close | switch `SN['387']` to the GN entry to show white instead |

## Public ownership and branding (affects every row)

| Operator (ATOC) | Into DfT Operator | Source |
| --- | --- | --- |
| LNER (GR) | 2018-06-24 | [GBR, Wikipedia](https://en.wikipedia.org/wiki/Great_British_Railways) |
| Northern (NT) | 2020-03-01 | same |
| Southeastern (SE) | 2021-10-17 | same |
| TransPennine Express (TP) | 2023-05-28 | same |
| South Western Railway (SW, IL) | 2025-05-25 | same; [SWR, Wikipedia](https://en.wikipedia.org/wiki/South_Western_Railway) |
| c2c (CC) | 2025-07-20 | [c2c, Wikipedia](https://en.wikipedia.org/wiki/C2c) |
| Greater Anglia (LE) | 2025-10-12 | [GBR, Wikipedia](https://en.wikipedia.org/wiki/Great_British_Railways) |
| West Midlands Trains (LM: WMR + LNR) | 2026-02-01 | [WMT, Wikipedia](https://en.wikipedia.org/wiki/West_Midlands_Trains) |
| GTR (TL, SN, GN, GX), now "Greater Thameslink Railway" | 2026-05-31 | [GTR, Wikipedia](https://en.wikipedia.org/wiki/Govia_Thameslink_Railway); [IanVisits](https://www.ianvisits.co.uk/articles/government-takes-control-of-thameslink-southern-and-gatwick-express-operator-90117/) |
| Chiltern (CH) | 2026-09-20 | [Chiltern (2026), Wikipedia](https://en.wikipedia.org/wiki/Chiltern_Railways_(2026)); [railway.supply](https://www.railway.supply/chiltern-railways-enters-public-ownership-on-20-september-2026) |
| Great Western (GW) | planned 2026-12-13 | [IanVisits](https://www.ianvisits.co.uk/articles/chiltern-and-great-western-railways-to-be-nationalised-later-this-year-89561/) |
| EMR, Avanti, CrossCountry | private in Oct 2026 (EMR Dec 2026, Avanti 2027-03-07, XC by end 2027 per Wikipedia) | [GBR, Wikipedia](https://en.wikipedia.org/wiki/Great_British_Railways) |

- **GBR livery** (red/white/blue, double arrow) unveiled Dec 2025; rolled out gradually as units
  are repainted, not fleet-wide. Known examples: 387172 (GTR, unveiled Brighton 2026-05-21),
  701006 (SWR, GBR logos), 357008 + 357020 (c2c) and 720144 + 720501 (Greater Anglia) on
  2026-07-16. Sources: [Rail Advent May 2026](https://www.railadvent.co.uk/2026/05/first-great-british-railways-branded-train-unveiled.html),
  [Class 387, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_387),
  [Class 701, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_701),
  [IanVisits, GBR Anglia](https://www.ianvisits.co.uk/articles/first-gbr-anglia-trains-unveiled-as-greater-anglia-and-c2c-merge-91170/).
- **GBR Anglia**: Greater Anglia + c2c (+ NR Anglia) run as one unit since 2026; GA 720/1 and
  720/5 are cleared to run on c2c. Brands c2c and Greater Anglia still appear on services
  (source above). Treat LE and CC as still distinct codes.
- **ATOC/TOC codes:** no source found saying any code changed on transfer to DfTO
  (unconfirmed, but every operator article keeps its brand). Keep codes as they are.
- **Liveries:** in October 2026 every fleet is overwhelmingly in its pre-nationalisation livery;
  GBR livery is per-unit and should be a livery variant, not an operator change.

## The pilot classes

### Class 323 (Northern only)

- **West Midlands: gone.** West Midlands Trains withdrew its last 323s on **2024-09-29**
  (farewell tour that day), replaced by Class 730. The ex-WMT units moved to Northern between
  Oct 2023 and Jul 2024. Source: [Class 323, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_323).
- **Northern:** 34 in service (323202-203, 205-210, 212-213, 217-220, 223-239, 241-243), 9
  stored (323201, 204, 211, 214-216, 221-222, 240), per Wikipedia.
  The Northern Trains article lists only "17 transferred from WMT" and is less complete.
- **Livery:** the ex-WMR units ran at Northern in WMR (and some London Midland-era) colours;
  Northern tendered a refurb + repaint of 323202, 203, 205-210, 212, 213, 217-220, 241, 242
  with an April 2026 deadline; 323205 was the first ex-WMR unit outshopped in Northern livery.
  323239 carries a yellow Bee Network promotional livery (late 2025). There is also a Regional
  Railways heritage repaint. Whether every ex-WMR unit is repainted by Oct 2026 is
  **unconfirmed**. Sources: [RAIL, refurb tender](https://www.railmagazine.com/news/2025/05/08/northern-trains-publishes-tender-for-323s-refurb),
  [railforums thread](https://www.railforums.co.uk/threads/updates-on-the-ex-wm-323s-at-northern.275161/),
  [Modern Railways, Regional Railways repaint](https://www.modernrailways.com/article/regional-railways-repaint-323).
- **Future:** Northern to replace 323s with ex-LNR 350/2s by end 2027 (see 350).

### Class 377 (Southern, Southeastern; not Thameslink)

- **Southern (SN):** 377/1 (54), 377/2 (15), 377/3 (28), 377/4 (75), 377/6 (26), 377/7 (8).
- **Southeastern (SE):** 377/5 (23, from Thameslink 2016-17) and 377/1 (13, transferred from
  Southern from Jan 2025; 377121 + 377122 in service 2025-01-02, replacing 465s).
- **Thameslink:** no 377s (all-700 since 2017).
- Source: [Class 377, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_377).
  Exact SN 377/1 count after the SE transfers: Wikipedia numbers may double count (54 + 13 > 64
  built); **unconfirmed**.

### Class 800 (GWR and LNER, both still running them)

- **GWR (GW):** 800/0 (36 five-car, 800001-036), 800/3 (21 nine-car, 800301-321).
- **LNER (GR):** 800/1 (13 nine-car, 800101-113), 800/2 (10 five-car, 800201-210), alongside
  42 Class 801. No off-lease or transfer announced for 2025-2026.
- Source: [Class 800, Wikipedia](https://en.wikipedia.org/wiki/British_Rail_Class_800).

## Table, October 2026

Status column: **running** (in passenger service Oct 2026), **gone** (with date), **winding
down**, **unconfirmed**. Rows with ATOC codes not in `fleet.ts` are marked **NEW**.

| Class | Operator(s), Oct 2026 | Subclasses / units | Withdrawals, transfers, dates | Livery | Sources |
| --- | --- | --- | --- | --- | --- |
| 43 (HST) | SR ScotRail | 52 power cars, "Inter7City" 4/5-car | GWR Castle sets **gone** 2025-12-13 (replaced by 175). ScotRail to replace with 222s from late 2027 | ScotRail Inter7City | [43, WP](https://en.wikipedia.org/wiki/British_Rail_Class_43_(HST)), [ScotRail, WP](https://en.wikipedia.org/wiki/ScotRail) |
| 57 **NEW** | GW GWR | 57/6 x4, Night Riviera (Mk3 sleepers) | running | GWR green | [Night Riviera, WP](https://en.wikipedia.org/wiki/Night_Riviera) |
| 67 **NEW** | AW TfW | 12 locos + Mk4/DVT sets | running | TfW | [TfW Rail, WP](https://en.wikipedia.org/wiki/Transport_for_Wales_Rail) |
| 68 | CH Chiltern | ex-TPE 68s with Mk5A sets (in service from 2026-01-26) | TPE 68s gone Dec 2023; ScotRail 2020 | Chiltern | [68, WP](https://en.wikipedia.org/wiki/British_Rail_Class_68), [Chiltern (2026), WP](https://en.wikipedia.org/wiki/Chiltern_Railways_(2026)) |
| 73/9 **NEW** | CS Caledonian Sleeper | GBRf 73/9 on Highland portions | running | Caledonian Sleeper | [search: Caledonian Sleeper, WP](https://en.wikipedia.org/wiki/Caledonian_Sleeper) |
| 91 | GR LNER | ~12 active (IC225) | running; back to Newcastle Mar 2026; withdrawal by end 2028 (ETCS), replaced by 897 | LNER | [91, WP](https://en.wikipedia.org/wiki/British_Rail_Class_91), [RAIL](https://www.railmagazine.com/news/fleet/timetable-for-withdrawal-of-class-91s) |
| 92 | CS Caledonian Sleeper | GBRf 92s, electric legs | running (WP article stale; 2026 status from GBRf/Sleeper sources) | Caledonian Sleeper / GBRf | [GBRf](https://www.gbrailfreight.com/gbrfs-2-million-refurbished-class-92-to-enter-caledonian-sleeper-service/) |
| 139 **NEW** | LM WMR | 1 unit, Stourbridge Town shuttle | running | WMR | [WMT, WP](https://en.wikipedia.org/wiki/West_Midlands_Trains) |
| 150 | GW, NT, AW, **LM (NEW)** | GW 150/2 (~20); NT 150/0, /1, /2; AW 150/2 (31); LM (LNR) 2-3 x 150/1 on Marston Vale | running | GWR green; Northern; TfW; LNR | [150, WP](https://en.wikipedia.org/wiki/British_Rail_Class_150), [TfW, WP](https://en.wikipedia.org/wiki/Transport_for_Wales_Rail), [WMT, WP](https://en.wikipedia.org/wiki/West_Midlands_Trains) |
| 153 | AW, **SR (NEW)** | AW ~13-22 (153/5 "Active Travel" in service 2025); SR 5 "Highland Explorer" | running | TfW; ScotRail Highland Explorer | [153, WP](https://en.wikipedia.org/wiki/British_Rail_Class_153), [ScotRail, WP](https://en.wikipedia.org/wiki/ScotRail) |
| 155 | NT | 7 | running | Northern | [155, WP](https://en.wikipedia.org/wiki/British_Rail_Class_155) |
| 156 | NT, SR | NT 67; SR 42 | EMR's gone 2022 | Northern; ScotRail | [156, WP](https://en.wikipedia.org/wiki/British_Rail_Class_156) |
| 158 | GW, NT, EM, SR, AW, SW | GW 18; NT 43-53; EM 26; SR 40; AW 22-24; SW 8-10 | running | per operator | [158, WP](https://en.wikipedia.org/wiki/British_Rail_Class_158), [SWR, WP](https://en.wikipedia.org/wiki/South_Western_Railway) |
| 159 | SW | 29 | running | SWR | [159, WP](https://en.wikipedia.org/wiki/British_Rail_Class_159) |
| 165 | GW, CH | GW 165/1; CH 165/0 | running | GWR; Chiltern | [165, WP](https://en.wikipedia.org/wiki/British_Rail_Class_165) |
| 166 | GW | | running | GWR | [GWR, WP](https://en.wikipedia.org/wiki/Great_Western_Railway_(train_operating_company)) |
| 168 | CH | | running; refurb + new livery from Oct 2024 | Chiltern (refreshed) | [168, WP](https://en.wikipedia.org/wiki/British_Rail_Class_168) |
| 170 | XC, NT, EM, SR | XC 29; NT 16; EM 43 (incl. 170/4 ex-171); SR 34 | WMR's to EMR 2021-May 2023; TfW's to EMR, last 2024-01-29 | per operator | [170, WP](https://en.wikipedia.org/wiki/British_Rail_Class_170) |
| 171 | SN | 17 | running | Southern | [171, WP](https://en.wikipedia.org/wiki/British_Rail_Class_171) |
| 172 | LM | 39 (WMR; ex-LO 172/0 and ex-CH 172/1 included) | running | WMR | [172, WP](https://en.wikipedia.org/wiki/British_Rail_Class_172) |
| 175 | **GW (NEW)** | 26 of 27 leased | TfW withdrew all by end 2023; GWR passenger service from Dec 2025 (175001 Plymouth-Penzance); GWR cut timetable Sep 2026 over 175 reliability | GWR green (unconfirmed) | [175, WP](https://en.wikipedia.org/wiki/British_Rail_Class_175) |
| 180 | GC | 10 (180101-108/112/114) | running; to be replaced by Class 820 (~2028) | Grand Central black | [RAIL](https://www.railmagazine.com/news/grand-central-to-take-on-remaining-class-180s-depending-on-track-access-decision), [180, WP](https://en.wikipedia.org/wiki/British_Rail_Class_180) |
| 185 | TP | 51 | running | TPE | [185, WP](https://en.wikipedia.org/wiki/British_Rail_Class_185) |
| 195 | NT | | running | Northern | [Northern, WP](https://en.wikipedia.org/wiki/Northern_Trains) |
| 196 | LM | 26-30 (WMR) | running; 6 x 2-car earmarked for Chiltern East West Rail (delayed) | WMR | [196, WP](https://en.wikipedia.org/wiki/British_Rail_Class_196) |
| 197 | AW | 77 (51 two-car, 26 three-car) | running; Cambrian from Sep 2026 (ETCS) | TfW | [197, WP](https://en.wikipedia.org/wiki/British_Rail_Class_197) |
| 220 | XC | 34 | running; refurb from Feb 2026 | CrossCountry | [220, WP](https://en.wikipedia.org/wiki/British_Rail_Class_220) |
| 221 | XC, GC | XC 36; GC 2 (221142-143) | Avanti **gone** 2024-12-14; 221101-106 stored, lease to EMR reported Aug 2026, not in service (unconfirmed timing) | XC; Grand Central | [221, WP](https://en.wikipedia.org/wiki/British_Rail_Class_221), [RAIL](https://www.railmagazine.com/news/emr-looking-to-voyagers-and-extending-class-222-lease-as-more-services-are-restored) |
| 222 | EM, **LD (NEW)** | EM 222/0, /1; LD 5 x six-car 222/6 | EMR retaining 222s (810 reliability); Lumo Euston-Stirling from 2026-05-25; ScotRail to lease 22 from late 2027 | EMR; Lumo blue | [222, WP](https://en.wikipedia.org/wiki/British_Rail_Class_222), [Rail Advent](https://www.railadvent.co.uk/2026/04/first-refurbished-lumo-class-222-revealed.html), [Railcolor](https://railcolornews.com/2026/02/27/lumo-reveals-class-222-design-for-new-london-euston-stirling-services/) |
| 230 **NEW** | AW, GW | AW 5 (230006-010) Wrexham-Bidston; GW 230001 Greenford branch, Saturdays from 2026-01-31 | LNR Marston Vale gone 2022-12-01 | TfW; GWR (unconfirmed) | [230, WP](https://en.wikipedia.org/wiki/British_Rail_Class_230) |
| 231 | AW | 11 | running | TfW | [TfW, WP](https://en.wikipedia.org/wiki/Transport_for_Wales_Rail) |
| 318 | SR | 21 | running | ScotRail | [318, WP](https://en.wikipedia.org/wiki/British_Rail_Class_318) |
| 319 | none | | Northern **gone** 2024-01-02; LNR 2023-11-27 | n/a | [319, WP](https://en.wikipedia.org/wiki/British_Rail_Class_319) |
| 320 | SR | 34 (320/3, 320/4) | running | ScotRail | [320, WP](https://en.wikipedia.org/wiki/British_Rail_Class_320) |
| 323 | NT | see pilot | WMR **gone** 2024-09-29 | Northern (repaints), ex-WMR, Bee Network 323239 | [323, WP](https://en.wikipedia.org/wiki/British_Rail_Class_323) |
| 331 | NT | | running | Northern | [Northern, WP](https://en.wikipedia.org/wiki/Northern_Trains) |
| 333 | NT | | running | Northern | same |
| 334 | SR | 40 | running | ScotRail | [334, WP](https://en.wikipedia.org/wiki/British_Rail_Class_334) |
| 345 | XR | | running | Elizabeth line | (not re-checked; no change reported) |
| 350 | LM (LNR) | 350/1 (30), 350/3 (10), 350/4 (10) | 350/2 (37) **gone** from LNR Dec 2025; to Northern by end 2027 | LNR | [350, WP](https://en.wikipedia.org/wiki/British_Rail_Class_350) |
| 357 | CC | 74 | running; repaint/repair programme from 2024; 357008/020 in GBR livery Jul 2026 | c2c white/blue doors; GBR | [357, WP](https://en.wikipedia.org/wiki/British_Rail_Class_357), [IanVisits](https://www.ianvisits.co.uk/articles/first-gbr-anglia-trains-unveiled-as-greater-anglia-and-c2c-merge-91170/) |
| 360 | EM | 21 x 360/1 | running; refurb from Jun 2026 | EMR Connect | [360, WP](https://en.wikipedia.org/wiki/British_Rail_Class_360) |
| 375 | SE | | running | Southeastern | (not re-checked; no change reported) |
| 376 | SE | | running | Southeastern | (not re-checked) |
| 377 | SN, SE | see pilot | Thameslink gone 2017 | Southern; Southeastern | [377, WP](https://en.wikipedia.org/wiki/British_Rail_Class_377) |
| 378 | LO | | running | Overground | (not re-checked) |
| 379 | **GN (NEW)** | 30 | Greater Anglia **gone** Feb 2022; Great Northern from 2025-02-10 | GN (unconfirmed which scheme) | [379, WP](https://en.wikipedia.org/wiki/British_Rail_Class_379), [GTR, WP](https://en.wikipedia.org/wiki/Govia_Thameslink_Railway) |
| 380 | SR | 38 | running | ScotRail | [ScotRail, WP](https://en.wikipedia.org/wiki/ScotRail) |
| 385 | SR | 70 | running | ScotRail | same |
| 387 | GW, GN, GX, HX, **SN (NEW)** | GN 387/1 + 387304; GW 387142-171; HX 387130-141; GX 387/2; SN 387/1, /2, /3 | c2c's 387/3 **gone** 2022 (to GTR) | GWR; GN; GX; HEx; Southern; 387172 GBR | [387, WP](https://en.wikipedia.org/wiki/British_Rail_Class_387) |
| 390 | VT | 56 | running | Avanti | [390, WP](https://en.wikipedia.org/wiki/British_Rail_Class_390) |
| 395 | SE | | running | Southeastern Javelin | (not re-checked) |
| 397 | TP | 12 | running | TPE | [397, WP](https://en.wikipedia.org/wiki/British_Rail_Class_397) |
| 444 | SW | 45 | running | SWR | [SWR, WP](https://en.wikipedia.org/wiki/South_Western_Railway) |
| 450 | SW | 127 | running | SWR | same |
| 455 | none | | SWR **gone** 2026-03-20 (farewell 2025-12-21); Southern 2022-05-15 | n/a | [455, WP](https://en.wikipedia.org/wiki/British_Rail_Class_455) |
| 456 | none | | SWR **gone** 2022-01-17, scrapped | n/a | [456, WP](https://en.wikipedia.org/wiki/British_Rail_Class_456) |
| 458 | SW (**winding down**) | 458/4 (28) | 458/5 gone Mar 2026; SWR announced full withdrawal 2026-04-23; 458/4 pairs being stored from summer 2026; whether any run Oct 2026 **unconfirmed** | SWR | [458, WP](https://en.wikipedia.org/wiki/British_Rail_Class_458), [railforums](https://www.railforums.co.uk/threads/swr-class-458-4s-fleet-status-and-withdrawal-updates.300263/page-13) |
| 465 | SE | 465/0, /1, /9 | running; overhaul contract Dec 2025; some stored/scrapped | Southeastern | [465, WP](https://en.wikipedia.org/wiki/British_Rail_Class_465) |
| 466 | SE | 16 left | running, shrinking (scrapping from early 2025) | Southeastern | [466, WP](https://en.wikipedia.org/wiki/British_Rail_Class_466) |
| 484 | IL | 5 | running | Island Line | [SWR, WP](https://en.wikipedia.org/wiki/South_Western_Railway) |
| 507 | none | | Merseyrail **gone** 2024-11-28 | n/a | [507, WP](https://en.wikipedia.org/wiki/British_Rail_Class_507) |
| 508 | none | | Merseyrail **gone** 2024-01-16 | n/a | [508, WP](https://en.wikipedia.org/wiki/British_Rail_Class_508) |
| 700 | TL | 60 x 8-car, 55 x 12-car | running | Thameslink | [GTR, WP](https://en.wikipedia.org/wiki/Govia_Thameslink_Railway) |
| 701 | SW | 701/0 (60), 701/5 (30) | in service since 2024-01-09; 701006 GBR logos; 701060 Legoland | SWR Arterio | [701, WP](https://en.wikipedia.org/wiki/British_Rail_Class_701) |
| 707 | SE | 30 | SWR's last two to SE Sep 2024 | Southeastern | [707, WP](https://en.wikipedia.org/wiki/British_Rail_Class_707) |
| 710 | LO | | running | Overground | (not re-checked) |
| 717 | GN | 25 | running | Great Northern | [GTR, WP](https://en.wikipedia.org/wiki/Govia_Thameslink_Railway) |
| 720 | LE, CC | LE 720/1 (44), 720/5 (89); CC 720/6 (12) | running; LE units cleared on c2c 2026 | GA; c2c; 720144/501 GBR | [720, WP](https://en.wikipedia.org/wiki/British_Rail_Class_720) |
| 730 | LM | 730/0 (WMR + some LNR), 730/2 five-car (LNR, from 2025-06-09) | running | WMR; LNR | [730, WP](https://en.wikipedia.org/wiki/British_Rail_Class_730); subclass counts disagree between WP pages (**unconfirmed**) |
| 745 | LE | | running | Greater Anglia | (not re-checked) |
| 755 | LE | | running | Greater Anglia | [755, WP](https://en.wikipedia.org/wiki/British_Rail_Class_755) |
| 756 | AW | 24 | in service since 2024-11-18 | TfW | [756, WP](https://en.wikipedia.org/wiki/British_Rail_Class_756) |
| 769 | NT | ~8-9 (769/4), plus ex-TfW 769421/452 covering overhauls | TfW **gone** 2023-05-19; GWR never carried passengers (returned Apr 2023). Northern leases "expiring 2025"; Oct 2026 status **unconfirmed** | Northern | [769, WP](https://en.wikipedia.org/wiki/British_Rail_Class_769), [RAIL](https://www.railmagazine.com/news/ex-transport-for-wales-769s-helping-to-cover-northern-overhauls) |
| 777 | ME | | running (sole Merseyrail fleet) | Merseyrail | [507, WP](https://en.wikipedia.org/wiki/British_Rail_Class_507) |
| 800 | GW, GR | see pilot | running | GWR green; LNER Azuma | [800, WP](https://en.wikipedia.org/wiki/British_Rail_Class_800) |
| 801 | GR | 42 | running | LNER Azuma | (not re-checked) |
| 802 | GW, TP, HT | GW 802/0 (22), /1 (14); TP 802/2 (19, Nova 1); HT 802/3 (5, Paragon) | running | GWR; TPE; Hull Trains | [802, WP](https://en.wikipedia.org/wiki/British_Rail_Class_802) |
| 803 | LD | 5 | running | Lumo | [803, WP](https://en.wikipedia.org/wiki/British_Rail_Class_803) |
| 805 | VT | 13 | in service 2024-06-02 | Avanti | [805, WP](https://en.wikipedia.org/wiki/British_Rail_Class_805) |
| 807 | VT | 10 | in service 2024-11-11 | Avanti (Evero) | [807, WP](https://en.wikipedia.org/wiki/British_Rail_Class_807), [RAIL](https://www.railmagazine.com/news/2024/10/29/soft-launch-for-avanti-west-coast-class-807-as-it-runs-between-euston-and-birmingham) |
| 810 | EM | 33 | in service 2025-12-03; reduced timetable 2026; 810015 Bedford collision 2026-06-19 | EMR Aurora | [810, WP](https://en.wikipedia.org/wiki/British_Rail_Class_810) |

**Off-network notes (not proposed for `fleet.ts`):** 373/374 Eurostar; 398 TfW Citylink
tram-trains (36, South Wales Metro); 399 Sheffield Supertram tram-train; 555 Tyne and Wear
Metro. **Coming, not running Oct 2026:** 897 LNER "Serenza" (CAF, ~2027-28), 820 Grand Central
(~2028), 222 at ScotRail (late 2027), 221 at EMR (lease reported Aug 2026, no service date),
196 at Chiltern (EWR, delayed), 350/2 at Northern (by end 2027).

## Compared with `classes/fleet.ts`

### Stale pairs (in fleet.ts, not running Oct 2026)

| Pair | Reason | Source |
| --- | --- | --- |
| 43 GW | Castle HSTs last ran 2025-12-13 | [43, WP](https://en.wikipedia.org/wiki/British_Rail_Class_43_(HST)) |
| 170 AW | last TfW 170 to EMR 2024-01-29 | [170, WP](https://en.wikipedia.org/wiki/British_Rail_Class_170) |
| 170 LM | WMR 170s to EMR/XC, last May 2023 | same |
| 175 AW | TfW withdrew all by end 2023; now GWR | [175, WP](https://en.wikipedia.org/wiki/British_Rail_Class_175) |
| 221 VT | Avanti withdrew 2024-12-14 | [221, WP](https://en.wikipedia.org/wiki/British_Rail_Class_221) |
| 319 NT | Northern withdrew 2024-01-02; class has no passenger operator | [319, WP](https://en.wikipedia.org/wiki/British_Rail_Class_319) |
| 323 LM | WMR withdrew 2024-09-29, units to Northern | [323, WP](https://en.wikipedia.org/wiki/British_Rail_Class_323) |
| 379 LE | Greater Anglia withdrew Feb 2022; now Great Northern | [379, WP](https://en.wikipedia.org/wiki/British_Rail_Class_379) |
| 387 CC | c2c's six 387/3s went to GTR in 2022 | [387, WP](https://en.wikipedia.org/wiki/British_Rail_Class_387) |
| 455 SW | SWR last service 2026-03-20 | [455, WP](https://en.wikipedia.org/wiki/British_Rail_Class_455) |
| 456 SW | SWR withdrew 2022-01-17, scrapped | [456, WP](https://en.wikipedia.org/wiki/British_Rail_Class_456) |
| 507 ME | withdrawn 2024-11-28 | [507, WP](https://en.wikipedia.org/wiki/British_Rail_Class_507) |
| 508 ME | withdrawn 2024-01-16 | [508, WP](https://en.wikipedia.org/wiki/British_Rail_Class_508) |
| 769 AW | TfW withdrew 2023-05-19 | [769, WP](https://en.wikipedia.org/wiki/British_Rail_Class_769) |
| 769 GW | never in GWR passenger service; returned Apr 2023 | [769, WP](https://en.wikipedia.org/wiki/British_Rail_Class_769), [Modern Railways](https://www.modernrailways.com/article/tri-modes-returned-without-carrying-fare-paying-passenger) |

**Watch list (in fleet.ts, possibly stale by now, unconfirmed):** 458 SW (withdrawal
announced 2026-04-23, 458/4 being stored); 769 NT (leases said to expire 2025, still listed as
running); 466 SE (16 left, shrinking).

### Missing pairs (running, class in fleet.ts, operator not)

| Pair | Reason | Source |
| --- | --- | --- |
| 150 LM | LNR runs 2-3 x 150/1 on Marston Vale | [WMT, WP](https://en.wikipedia.org/wiki/West_Midlands_Trains), [150, WP](https://en.wikipedia.org/wiki/British_Rail_Class_150) |
| 153 SR | 5 Highland Explorer 153s on the West Highland | [ScotRail, WP](https://en.wikipedia.org/wiki/ScotRail) |
| 175 GW | GWR service since Dec 2025 | [175, WP](https://en.wikipedia.org/wiki/British_Rail_Class_175) |
| 222 LD | Lumo Euston-Stirling since 2026-05-25 | [222, WP](https://en.wikipedia.org/wiki/British_Rail_Class_222) |
| 379 GN | Great Northern since 2025-02-10 | [379, WP](https://en.wikipedia.org/wiki/British_Rail_Class_379) |
| 387 SN | Southern runs 387/1, /2, /3 (incl. GBR 387172) | [387, WP](https://en.wikipedia.org/wiki/British_Rail_Class_387) |

### Missing classes (running, no entry in fleet.ts; all need art)

| Class | Operator | Reason | Source |
| --- | --- | --- | --- |
| 57 | GW | Night Riviera, 4 x 57/6 | [Night Riviera, WP](https://en.wikipedia.org/wiki/Night_Riviera) |
| 67 | AW | TfW Mk4 sets (12 locos) | [TfW Rail, WP](https://en.wikipedia.org/wiki/Transport_for_Wales_Rail) |
| 73 | CS | 73/9 on Sleeper Highland portions | [Caledonian Sleeper, WP](https://en.wikipedia.org/wiki/Caledonian_Sleeper) |
| 139 | LM | Stourbridge shuttle (1 unit) | [WMT, WP](https://en.wikipedia.org/wiki/West_Midlands_Trains) |
| 230 | AW, GW | Wrexham-Bidston; Greenford (Saturdays) | [230, WP](https://en.wikipedia.org/wiki/British_Rail_Class_230) |

Optional, off-network: 398 (AW), 399, 373/374, 555.

## Applied (2026-10-05)

The diff below was applied to `classes/fleet.ts` with these changes: every withdrawn pair is kept, under `historical` with its last date in service (`resolve.combinations()` still renders it, `runsNow()` says it's not current); 458 SW and 769 NT stay current after a recheck (a handful of 458/4s were still in passenger service on 2026-08-20, [railforums](https://www.railforums.co.uk/threads/swr-class-458-4s-fleet-status-and-withdrawal-updates.300263/page-13), [RAIL](https://www.railmagazine.com/news/final-turns-for-south-western-railway-455s-approaching); eight Northern 769s in passenger work per [769, WP](https://en.wikipedia.org/wiki/British_Rail_Class_769)); 57, 67, 73, 139 and 230 are in the fleet with the generic unit standing in (`needsArt`) until they're measured and built. Historical dates given only to the month or year (170 LM 2023-05, 175 AW 2023-12, 379 LE 2022-02, 387 CC 2022, 769 GW 2023-04) are as precise as the sources go.

## Proposed diff (as reviewed)

```diff
 export const fleet: Record<string, ClassArt> = {
-  '43': runs(loco.class43, ['GW', 'SR']),
+  '43': runs(loco.class43, ['SR']),
+  // '57': runs(loco.class57, ['GW']),        // needs art
+  // '67': runs(loco.class67, ['AW']),        // needs art
   '68': runs(loco.class68, ['CH']),
+  // '73': runs(loco.class73, ['CS']),        // needs art
   '91': runs(loco.class91, ['GR']),
   '92': runs(electric.class92, ['CS']),

-  '150': runs(diesel.class150, ['GW', 'NT', 'AW']),
-  '153': runs(diesel.class153, ['AW']),
+  // '139': runs(diesel.class139, ['LM']),    // needs art
+  '150': runs(diesel.class150, ['GW', 'NT', 'AW', 'LM']),
+  '153': runs(diesel.class153, ['AW', 'SR']),
   '155': runs(diesel.class155, ['NT']),
   '156': runs(diesel.class156, ['NT', 'SR']),
   '158': runs(diesel.class158, ['GW', 'NT', 'EM', 'SR', 'AW', 'SW']),
   '159': runs(diesel.class158, ['SW']),
   '165': runs(diesel.class165, ['GW', 'CH']),
   '166': runs(diesel.class166, ['GW']),
   '168': runs(diesel.class170, ['CH']),
-  '170': runs(diesel.class170, ['XC', 'NT', 'EM', 'SR', 'AW', 'LM']),
+  '170': runs(diesel.class170, ['XC', 'NT', 'EM', 'SR']),
   '171': runs(diesel.class171, ['SN']),
   '172': runs(diesel.class172, ['LM']),
-  '175': runs(diesel.class175, ['AW']),
+  '175': runs(diesel.class175, ['GW']),
   '180': runs(diesel.class180, ['GC']),
   '185': runs(diesel.class185, ['TP']),
   '195': runs(diesel.class195, ['NT']),
   '196': runs(diesel.gangwayCivity, ['LM']),
   '197': runs(diesel.gangwayCivity, ['AW']),
   '220': runs(diesel.class220, ['XC']),
-  '221': runs(diesel.class221, ['XC', 'VT', 'GC']),
-  '222': runs(diesel.class222, ['EM']),
+  '221': runs(diesel.class221, ['XC', 'GC']),
+  '222': runs(diesel.class222, ['EM', 'LD']),
+  // '230': runs(diesel.class230, ['AW', 'GW']), // needs art
   '231': ...['AW'],
   '318': ...['SR'],
-  '319': ...['NT'],
   '320': ...['SR'],
-  '323': ...['NT', 'LM'],
+  '323': ...['NT'],
   ...
-  '379': ...['LE'],
+  '379': ...['GN'],
   ...
-  '387': ...['GW', 'GN', 'GX', 'HX', 'CC'],
+  '387': ...['GW', 'GN', 'GX', 'HX', 'SN'],
   ...
-  '455': ...['SW'],
-  '456': ...['SW'],
   '458': ...['SW'],            // winding down, re-check
   ...
-  '507': ...['ME'],
-  '508': ...['ME'],
   ...
-  '769': ...['AW', 'GW', 'NT'],
+  '769': ...['NT'],            // re-check, leases said to end 2025
 }
```

(`...` stands for the existing `runs(<art>, ...)` call, unchanged.)

### Withdrawn but recently run: remove or keep as "historical"?

The app shows past journeys (frozen for 60 days on the core side, longer in Postgres), so a
journey logged on a 455 in March 2026 or a WMR 323 in 2024 still needs a picture.

- **Remove:** `fleet` stays a simple "what runs now" truth; old journeys fall back to a generic
  render or nothing. Loses art that already exists and was correct when the trip happened.
- **Keep, flagged:** e.g. `runs(art, ops, { until: { AW: '2024-01-29' } })` or a separate
  `historical` map of `class -> { op: lastDate }`. Live/now features (identifying today's
  train, "what could this be") filter to current pairs; journey rendering may use either.
  Costs a small type change and a date per pair.

**Recommendation: keep, flagged with the last-service date** (the dates in the stale table
above), and make current-only the default for any lookup that is about today. The art already
exists, the dates are sourced, and the app's own data model is about past journeys. Drop a
pair only when no plausible logged journey could reference it (e.g. 456 SW, gone 2022, and
769 GW, which never carried passengers).

## Livery rule (2026-10-06)

Each class x operator renders the livery most units carry today; on a near tie, the newer
scheme. 220 XC: maroon and silver (2026 photos: 11 units vs 7 refreshed red; red kept as
`liveries.XC-red` in classes/220/spec.json). 221 XC: maroon and silver (none refreshed in photos).
