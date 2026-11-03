import type { Band, Branding, Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import { YELLOW } from './shared';

// The Electrostar family's liveries as measured: each class's spec.json
// `liveries.<key>` gives sampled colours and its shapes in metres (x back
// from the nose tip, y above the rail), turned here into a Livery.

type Heights = { bottom: number; cantrail: number };
type Shape = { car?: string; poly: number[][]; colour: string };

/** A spec livery entry: colours by name, and where the lines and shapes go. */
export type SpecLivery = {
  body: string;
  roof: string;
  face?: string;
  doors?: string;
  glass?: string;
  /** The window band's colour, when the windows sit in one. */
  windowBandColour?: string | null;
  orange?: string;
  orangeLine?: number[];
  /** A line along the bodyside: its colour is `line`, unless `lineColour` names another. */
  line?: string;
  lineY?: number[];
  lowerBand?: number[] | null;
  lower?: string;
  firstStrip?: string;
  firstStripY?: number[];
  firstStripX?: (number[] | { x: number[] })[];
  shapes?: Shape[];
  logos?: SpecLogo[];
  [colour: string]: unknown;
};

type Extent = { x0?: number; x1?: number; y0?: number; y1?: number };

/**
 * A logo or wordmark as measured on a bodyside (spec `liveries.<key>.logos`):
 * its extent in metres on that car (x from the car's front end, y above the
 * rail), the side it is on looking forward from the cab, and `svg`, the name
 * of the artwork; `parts` where pieces of it are measured apart.
 */
export type SpecLogo = Extent & {
  svg: string;
  /** On the front: m across from the centre line, y up. */
  m0?: number;
  m1?: number;
  car?: string;
  side?: string;
  face?: boolean;
  colour?: string;
  parts?: Record<string, Extent>;
};

/** `within`: the piece fills only this part of the measured box, as fractions [x0, x1, y0, y1]. */
type Art = { logo: string; color?: string | 'measured'; within?: readonly [number, number, number, number] };

// The giant GX less the window band laid over it (es-tools gxbig.ts: logos/GX.svg fitted to the
// measured 3.40 x 1.94 m box, the band 1.73-2.90 m cut out): the tops above it and the feet below.
const GX_BIG: Art[] = [
  { logo: 'GX-big-top', within: [0.0518, 1, 0.8299, 1] },
  { logo: 'GX-big-foot', within: [0.0338, 0.9984, 0, 0.2268] },
];

/**
 * The file in logos/ that draws each measured piece, and its colour where the
 * file's own is not the train's (most there are white for the app's badges):
 * 'measured' takes the spec's sampled colour. A piece mapped to null has no
 * artwork yet and is left off (each class's notes.md lists them).
 */
const ART: Record<string, Art | Record<string, Art | Art[] | null> | null> = {
  'southeastern-wordmark': { logo: 'SE-wordmark' },
  // The c2c magenta as the 357's doors and wordmark measure it.
  'c2c-wordmark': { logo: 'CC', color: '#CA348C' },
  'overground-roundel': { logo: 'LO' },
  'great-northern-logo': { logo: 'GN' },
  'first-class-box': { logo: 'first-class' },
  'greater-anglia-wordmark': { logo: 'LE-wordmark' },
  'gwr-logo': { logo: 'GW', color: 'measured' },
  'great-western-railway-text': { logo: 'GW-text', color: 'measured' },
  'gatwick-express-text': { logo: 'GX-text', color: '#F0F0F0' },
  'gx-logo-small': { gx: { logo: 'GX', color: '#F0F0F0' }, text: { logo: 'GX-text', color: '#F0F0F0' } },
  // The giant letters run under the window band: only their tops and feet show.
  'gx-letters': { gx: GX_BIG, text: { logo: 'GX-text', color: '#F0F0F0' } },
  'heathrow-express-logo': { logo: 'HX-logo' },
  // On door leaves or glass, which the branding check keeps logos off; one unit's own; or too small to read.
  'quiet-zone-quiet': null,
  'quiet-zone-zone': null,
  'heathrow-express-roundel-text': null,
  'business-first-text': null,
  'heathrow-express-aircraft': null,
  'heathrow-express-city-tokyo': null,
  'heathrow-express-roundel': { logo: 'HX-roundel', color: '#F0F0F0' },
  'trenitalia-endorsement': null,
  'wheelchair-sign': null,
};

/** A livery's measured logos as Branding: filling the measured box. */
export function electrostarBranding(logos: SpecLogo[] | undefined): Branding[] {
  const out: Branding[] = [];
  for (const g of logos ?? []) {
    if (!(g.svg in ART)) throw new Error(`no artwork entry for the measured logo ${g.svg}`);
    const art = ART[g.svg];
    if (!art) continue;
    if (g.face) {
      // On the front: m across from the centre line (positive the train's left, which is
      // the viewer's right head-on), as u across the 2.80 m body.
      const a = art as Art;
      const [m0, m1, y0, y1] = [g.m0!, g.m1!, g.y0!, g.y1!];
      out.push({ logo: a.logo, on: 'front', at: [0.5 - (m0 + m1) / 2 / 1.4 / 2, (y0 + y1) / 2], height: y1 - y0, ...(a.color ? { color: a.color === 'measured' ? g.colour! : a.color } : {}) });
      continue;
    }
    // A piece measured in parts places each; measured whole, it is its first part.
    const parts = 'logo' in art ? null : Object.entries(art as Record<string, Art | Art[] | null>);
    const each = (a: Art | Art[] | null, e: Extent): [Art, Extent][] => (a ? (Array.isArray(a) ? a : [a]).map((p) => [p, e]) : []);
    const pieces: [Art, Extent][] = !parts
      ? [[art as Art, g]]
      : g.parts
        ? parts.flatMap(([k, a]) => (g.parts?.[k] ? each(a, { ...g, ...g.parts[k] }) : []))
        : each(parts[0][1], g);
    for (const [a, e] of pieces) {
      if (e.x0 === undefined || e.x1 === undefined || e.y0 === undefined || e.y1 === undefined) throw new Error(`${g.svg}: incomplete extent`);
      const [fx0, fx1, fy0, fy1] = a.within ?? [0, 1, 0, 1];
      const along = (f: number) => e.x0! + f * (e.x1! - e.x0!);
      const up = (f: number) => e.y0! + f * (e.y1! - e.y0!);
      const [x0, x1, y0, y1] = [along(fx0), along(fx1), up(fy0), up(fy1)];
      const color = a.color === 'measured' ? g.colour : a.color;
      out.push({
        logo: a.logo,
        at: [(x0 + x1) / 2, (y0 + y1) / 2],
        height: y1 - y0,
        // The measured width: several vinyls are drawn narrower or wider than the operator's file
        // (Southeastern's 23% narrower on both 375 and 376, GWR's 40% wider on the 387).
        width: x1 - x0,
        ...(g.car === 'next' ? { car: 'next' as const } : {}),
        ...(color ? { color } : {}),
        // Looking forward from the cab, the left side is the near one.
        ...(g.side === 'left' ? { sides: 'near' as const } : g.side === 'right' ? { sides: 'far' as const } : {}),
      });
    }
  }
  return out;
}

/**
 * A measured Electrostar livery. The warning yellow is the shared one: a
 * face has no white patch to balance a sample against (the 377's reason).
 */
export function electrostarLivery(l: SpecLivery, h: Heights): Livery {
  const f = fracOf(h.bottom, h.cantrail);
  const at = (pts: number[][]): Pt[] => pts.map(([x, y, c]) => (c ? [x, f(y), 1] : [x, f(y)]) as Pt);
  const colour = (name: string): string => {
    const c = l[name];
    if (typeof c === 'string') return c;
    if (name.startsWith('#')) return name;
    throw new Error(`no livery colour named ${name}`);
  };
  const bands: Band[] = [];
  if (l.lowerBand && l.lower) bands.push({ lo: f(l.lowerBand[0]), hi: f(l.lowerBand[1]), color: l.lower });
  if (l.lineY && l.line) bands.push({ lo: f(l.lineY[0]), hi: f(l.lineY[1]), color: l.line });
  if (l.orangeLine && l.orange) bands.push({ lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange });
  const swooshes: Swoosh[] = (l.shapes ?? []).map((sh) => ({
    points: at(sh.poly),
    color: colour(sh.colour),
    ...(sh.car === 'next' ? { car: 'next' as const } : {}),
  }));
  if (l.firstStrip && l.firstStripY && l.firstStripX) {
    const [y0, y1] = l.firstStripY;
    for (const seg of l.firstStripX) {
      const [x0, x1] = Array.isArray(seg) ? seg : seg.x;
      swooshes.push({ points: at([[x0, y0, 1], [x0, y1, 1], [x1, y1, 1], [x1, y0, 1]]), color: l.firstStrip });
    }
  }
  return {
    body: l.body,
    roof: l.roof,
    face: l.face ?? l.body,
    ...(l.doors ? { doors: l.doors } : {}),
    ...(l.glass ? { glass: l.glass } : {}),
    ...(l.windowBandColour ? { windowBand: l.windowBandColour } : {}),
    panel: YELLOW,
    bands,
    swooshes,
    branding: electrostarBranding(l.logos),
  };
}
