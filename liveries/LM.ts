import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec323 from '../classes/323/spec.json';
import spec350 from '../classes/350/spec.json';
import { BLACK, YELLOW, cabEnd } from './shared';
import spec730 from '../classes/730/spec.json';
import spec196 from '../classes/196/spec.json';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec150 from '../classes/150/spec.json';
import spec172 from '../classes/172/spec.json';

/**
 * West Midlands Railway on the 323 as measured (classes/323/spec.json,
 * livery): a silver body with a dark panel round the saloon windows; the
 * cab end in WMR gold back to a band of silver shards with gold diamonds
 * ahead of the first door; gold doors; the yellow face wrapping a little
 * onto the side; a dark slate valance; an orange line at the cantrail.
 * (London Midland's grey, green and black is not used: West Midlands
 * Trains took over in December 2017.)
 */
function wmr323(): Livery {
  const l = spec323.model.livery;
  const h = spec323.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  // The shards' edges and diamonds are drawn with sharp points.
  const sharp = (pts: number[][]): Pt[] => pts.map(([x, y]) => [x, f(y), 1] as Pt);
  const top = 1.3;
  const zone = l.shardZone;
  const rect = (x0: number, y0: number, x1: number, y1: number, color: string, car: 'cab' | 'next' = 'cab', layer?: 'under'): Swoosh => ({
    points: [[x0, f(y0), 1], [x0, f(y1), 1], [x1, f(y1), 1], [x1, f(y0), 1]],
    color,
    car,
    ...(layer ? { layer } : {}),
  });
  const length = spec323.model.cab.length;
  return {
    body: l.silver,
    roof: l.roof,
    bands: [{ lo: f(l.panelBand[0]), hi: f(l.panelBand[1]), color: l.panel, from: l.windowBandFrom, to: length + 1 }],
    doors: l.doors,
    face: l.face,
    panel: l.face,
    glass: l.glass,
    swooshes: [
      // The cab end's gold, its back edge the shards' zigzag.
      { points: [[-2, -0.4, 1], [-2, top, 1], [zone[0][0], top, 1], ...sharp(zone), [zone[zone.length - 1][0], -0.4, 1]], color: l.gold, layer: 'under', radius: 0.02 },
      { points: [[zone[0][0], top, 1], ...sharp(zone), [zone[zone.length - 1][0], -0.4, 1], [l.shardRight, -0.4, 1], [l.shardRight, top, 1]], color: l.shard, layer: 'under', radius: 0.02 },
      ...l.diamonds.map((d): Swoosh => ({ points: sharp(d), color: l.gold, layer: 'under', radius: 0.015 })),
      // The yellow face wraps onto the side; the valance runs back under the cab.
      rect(-2, 0.2, spec323.model.face.wrap, 4.0, l.face, 'cab', 'under'),
      // Round the corner at the face's own height (Face shape `wraps`), dropping to the skirt about a metre back (323210: the slate band runs on round the corner before falling to the solebar).
      { points: [[-2, f(-0.2), 1], [-2, f(spec323.model.face.valanceTop), 1], [1.0, f(spec323.model.face.valanceTop), 1], [1.4, f(h.bottom), 1], [2.0, f(h.bottom), 1], [2.0, f(-0.2), 1]], color: l.valance, car: 'cab', layer: 'under', radius: 0.1 },
      ...(['cab', 'next'] as const).map((car) => rect(-2, l.orangeLine[0], length + 2, l.orangeLine[1], l.orange, car)),
    ],
  };
}

// West Midlands Trains: WMR gold or purple-and-orange, LNR green
/**
 * London Northwestern on the 350 as measured (classes/350/spec.json,
 * livery): a grey body; the cab end, the doors and the car ends in LNR
 * green; green and pale-green stripes leaning back across the side;
 * black bands round the windows; an orange line at the cantrail. The
 * shapes are traced from the diagram, in metres along each car.
 */
function lnr350(): Livery {
  const l = spec350.model.livery;
  const h = spec350.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const colour = { darkGreen: l.darkGreen, green: l.green, pale: l.pale, black: l.black } as Record<string, string>;
  const shapes = (car: 'cab' | 'next') =>
    l.shapes[car].map((s): Swoosh => ({ points: s.pts.map(([x, y]) => [x, f(y), 1] as Pt), color: colour[s.colour], car, radius: 0.02 }));
  return {
    body: l.body,
    roof: l.roof,
    doors: l.darkGreen,
    face: l.faceUpper,
    panel: l.darkGreen,
    gangway: l.yellow,
    surround: l.black,
    glass: l.glass,
    // The LNR W, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    bands: [{ lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange }],
    swooshes: [...shapes('cab'), ...shapes('next')],
  };
}

/**
 * London Northwestern on the 730/2 as measured (classes/730/spec.json,
 * livery): white, the windows in a black band, green doors; the cab end
 * green back to an edge leaning back; at each car end the green with a
 * leaning green stripe and a pale sliver before it; the face green under a
 * black mask round the side screens, the gangway black.
 */
function lnr730(): Livery {
  const l = spec730.model.livery;
  const h = spec730.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  // A band between two edges, each given at the top and the bottom: [[x0, x1, y], [x0, x1, y]].
  const lean = (e: number[][], color: string, car: 'cab' | 'next' = 'cab') => {
    const [[a0, a1, yt], [b0, b1, yb]] = e;
    const ext = (xt: number, xb: number, y: number) => xt + ((xb - xt) * (y - f(yt))) / (f(yb) - f(yt));
    return { points: [[ext(a0, b0, 1.3), 1.3, 1], [ext(a1, b1, 1.3), 1.3, 1], [ext(a1, b1, -0.3), -0.3, 1], [ext(a0, b0, -0.3), -0.3, 1]] as Pt[], color, car };
  };
  const edge = (e: number[][], color: string, car: 'cab' | 'next', side: 'front' | 'rear') => {
    const [[xt, yt], [xb, yb]] = e;
    const ext = (y: number) => xt + ((xb - xt) * (y - f(yt))) / (f(yb) - f(yt));
    const far = side === 'front' ? -2 : 40;
    return { points: [[far, 1.3, 1], [ext(1.3), 1.3, 1], [ext(-0.3), -0.3, 1], [far, -0.3, 1]] as Pt[], color, car };
  };
  const r = l.cabRear;
  const n = l.nextFront;
  return {
    body: l.white,
    roof: l.roof,
    under: l.under,
    doors: l.green,
    face: l.green,
    panel: 'none',
    surround: l.band,
    gangway: '#151618',
    bands: [
      { lo: f(l.bandLo), hi: f(l.bandHi), color: l.band },
      { lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange },
    ],
    // The LNR W, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    swooshes: [
      edge(l.cabGreen, l.green, 'cab', 'front'),
      lean(r.stripe, l.stripe),
      lean(r.pale, l.pale),
      edge(r.green, l.green, 'cab', 'rear'),
      edge(n.green, l.green, 'next', 'front'),
      lean(n.pale, l.pale, 'next'),
      lean(n.stripe, l.stripe, 'next'),
    ],
  };
}

/**
 * West Midlands Railway on the 196 (classes/196/spec.json, livery): the
 * body dark plum, the cab end and the car ends orange (the cab end's edge
 * leaning back), orange doors, the windows plain black.
 */
function wmr196(): Livery {
  const l = spec196.model.livery;
  const h = spec196.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const block = (e: number[][], side: 'front' | 'rear', car: 'cab' | 'next'): Swoosh => {
    const [[xt, yt], [xb, yb]] = e;
    const ext = (y: number) => xt + ((xb - xt) * (y - f(yt))) / (f(yb) - f(yt));
    const far = side === 'front' ? -2 : 40;
    return { points: [[far, 1.3, 1], [ext(1.3), 1.3, 1], [ext(-0.3), -0.3, 1], [far, -0.3, 1]] as Pt[], color: l.orange, car };
  };
  return {
    body: l.body, roof: l.roof, under: l.under, doors: l.orange, face: l.orange, panel: 'none', surround: l.band, gangway: '#1E1F21',
    swooshes: [block(l.cabEnd, 'front', 'cab'), block(l.cabRear, 'rear', 'cab'), block(l.nextFront, 'front', 'next'), block(l.nextRear, 'rear', 'next')],
  };
}

export const LM: Record<string, Livery> = {
  // The 172 as measured (classes/172/spec.json, liveries.LM).
  '172': liveryFromSpec(spec172 as unknown as DmuSpec, 'LM'),
  // The 150 as measured (classes/150/spec.json, liveries.LM).
  '150': liveryFromSpec(spec150 as unknown as DmuSpec, 'LM'),
  '323': wmr323(),
  '730': lnr730(),
  '196': wmr196(),
  default: {
    body: '#C8902E',
    roof: '#8E8A82',
    windowBand: '#2A2622',
    panel: YELLOW,
  },
  // WMR's newest: purple, an orange cab back past the cab door.
  civity: {
    body: '#4A1F4C',
    roof: '#6E7176',
    doors: '#F26B1F',
    face: '#F26B1F',
    panel: 'none',
    gangway: BLACK,
    swooshes: [
      cabEnd(2.5, '#F26B1F'),
      { points: [[2.5, 0], [2.5, 1], [3.3, 1], [3.3, 0]], color: '#F26B1F', dots: 0.07 },
    ],
  },
  // LNR: white, dark green cab and doors flanked by lime.
  aventra: {
    body: '#ECEDEE',
    roof: '#B5B8BC',
    windowBand: '#1F2228',
    bands: [{ lo: 0, hi: 0.12, color: '#1F5A52' }],
    doors: '#1F5A52',
    face: '#1F5A52',
    panel: 'none',
    gangway: BLACK,
    swooshes: [
      cabEnd(3.3, '#1F5A52'),
      { points: [[6.75, 0.12], [6.85, 0.12], [6.85, 0.95], [6.75, 0.95]], color: '#7AC143' },
      { points: [[8.55, 0.12], [8.65, 0.12], [8.65, 0.95], [8.55, 0.95]], color: '#7AC143' },
    ],
  },
  // London Northwestern: dark green all over, only the gangway door yellow.
  '350': lnr350(),
  desiro: {
    body: '#1F4A3B',
    roof: '#3B4441',
    windowBand: '#1A1F1D',
    doors: '#1F4A3B',
    face: '#1F4A3B',
    panel: 'none',
    gangway: YELLOW,
  },
  other: { body: '#B3B0AA', roof: '#8E9297', windowBand: '#3A3C42', doors: '#C8822E', panel: '#E0A030' },
};
