import type { Livery, Pt, Swoosh } from '../model/types';
import { frontAt, sample } from '../model/curve';
import { fracOf } from '../model/spec';
import spec444 from '../classes/444/spec.json';
import spec450 from '../classes/450/spec.json';
import spec701 from '../classes/701/spec.json';
import { YELLOW } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec158 from '../classes/158/spec.json';
import spec159 from '../classes/159/spec.json';
import { liveryOf } from '../classes/bremu';
import spec455 from '../classes/455/spec.json';
import spec456 from '../classes/456/spec.json';

type DesiroSpec = typeof spec450 | typeof spec444;

/**
 * SWR's painted livery on a Desiro, as measured (classes/<code>/spec.json,
 * livery): white with a navy lower band over a yellow line along the
 * bottom; the cab car navy back to a straight diagonal leaning back,
 * rounded where it meets the white roof; the warning yellow wrapping the
 * cab corner as a crescent; first class marked by a yellow line at the
 * cantrail running into an outline over the top of its door; that door
 * pale grey, every other door navy, all with a sky-blue band on top.
 */
export function swrDesiro(spec: DesiroSpec): Livery {
  const l = spec.model.livery;
  const h = spec.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const box = (x0: number, y0: number, x1: number, y1: number, color: string, car: 'cab' | 'next' = 'cab'): Swoosh => ({
    points: [[x0, f(y0), 1], [x0, f(y1), 1], [x1, f(y1), 1], [x1, f(y0), 1]],
    color,
    car,
  });
  const [[xt, yt], [xb, yb]] = l.diagonal;
  const along = (y: number) => xb + ((y - yb) * (xt - xb)) / (yt - yb);
  const top = h.cantrail;
  const r = l.diagonalRadius;
  const navy: Pt[] = [
    [-2, f(l.bottomLine[1]), 1],
    [-2, f(top), 1],
    [along(top) - r, f(top)],
    [along(top - r * 0.3) - r * 0.25, f(top - r * 0.12)],
    [along(top - r * 0.4), f(top - r * 0.4)],
    [along(l.bottomLine[1]), f(l.bottomLine[1]), 1],
  ];
  // The crescent is the yellow's side half. On the cab corner the face's
  // own strip is the yellow (the renderer blends the front and side views
  // there, so only one may draw it), so the crescent starts where the
  // corner has turned to face sideways: 0.9 of the setback behind the
  // nose's front at each height, as the shell builds it.
  const profile = spec.model.nose.profile as unknown as Pt[];
  const sampled = sample(profile, 64);
  const ys = sampled.map((p) => p[1]);
  const [pLo, pHi] = [Math.min(...ys), Math.max(...ys)];
  const noseFront = (y: number) => frontAt(sampled, Math.min(pHi - 1e-4, Math.max(pLo + 1e-4, y)), profile[profile.length - 1][0]);
  const setback = Math.max(...spec.model.form.setback.map(([, q]) => q));
  const sideways = (y: number) => noseFront(y) + 0.9 * setback;
  const c = l.crescent;
  // The curve over the crescent's top (c[0] to c[2]), as a height for each place along.
  const overTop = (x: number) => {
    const [a, b, d] = [c[0], c[1], c[2]];
    return x <= b[0] ? a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]) : b[1] + ((d[1] - b[1]) * (x - b[0])) / (d[0] - b[0]);
  };
  const lowest = c.filter(([x, y]) => x > sideways(y) + 0.05).at(-1)![1];
  // The front edge rises up the corner to where it meets that curve,
  let peak = lowest;
  while (peak < c[1][1] && peak + 0.01 < overTop(sideways(peak + 0.01))) peak += 0.01;
  // its last few centimetres rounding back onto the side, so the tip has
  // no corner where the face's strip ends below it.
  const R = 0.12;
  const leading = (y: number) => sideways(y) + (y > peak - R ? R - Math.sqrt(Math.max(0, R * R - (y - (peak - R)) ** 2)) : 0);
  const rearEdge = c.slice(1).filter(([x, y]) => x > leading(Math.min(y, peak)) + 0.05);
  const frontEdge: Pt[] = [];
  for (let y = lowest; y < peak; y += 0.02) frontEdge.push([leading(y), f(y), 1]);
  const crescent: Pt[] = [...frontEdge, [leading(peak), f(peak), 1], ...rearEdge.map(([x, y], i) => (i === rearEdge.length - 1 ? [x, f(y), 1] : [x, f(y)]) as Pt)];
  // The cab's dome over the face is navy back to where the roof starts; the bodyside's white would show through it.
  const domeTo = profile[profile.length - 1][0];
  const dome: Pt[] = [[-2, f(h.cantrail - 0.05), 1], [-2, f(h.roof + 0.1), 1], [domeTo, f(h.roof + 0.1), 1], [domeTo, f(h.cantrail - 0.05), 1]];
  // Below the bodyside the nose's lower front is dark (skirts, coupler), not body colour.
  const chin: Pt[] = [[-2, f(0.2), 1], [-2, f(h.bottom), 1], [4, f(h.bottom), 1], [4, f(0.2), 1]];
  const cab = spec.model.cab;
  const first = cab.doors[1];
  const [d0, d1] = [first.x - first.w / 2, first.x + first.w / 2];
  const doorTop = first.span[1];
  const { front, rear, w, flag } = l.door1Outline;
  // The first-class line at the cantrail: spans along the car, an open end meeting door 1's outline.
  const spans = l.firstLineSpans.map(([a, b]) => [a ?? d1 + w, b ?? d0 - w] as const);
  return {
    // The roundel and the wordmark, measured: spec model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    body: l.white,
    roof: l.roof,
    bands: [
      { lo: f(l.lowerBand[0]), hi: f(l.lowerBand[1]), color: l.navy },
      { lo: 0, hi: f(l.bottomLine[1]), color: l.yellow },
    ],
    doorStripes: [{ from: 0, to: first.w / 2, lo: l.doorTopBand[0], hi: l.doorTopBand[1], color: l.blue }],
    face: l.navy,
    panel: l.yellow,
    gangway: l.black,
    surround: l.black,
    glass: l.glass,
    swooshes: [
      { points: navy, color: l.navy },
      { points: dome, color: l.navy },
      { points: crescent, color: l.yellow },
      { points: chin, color: l.black, layer: 'under' },
      ...spans.map(([a, b]) => box(a, l.firstLine[0], b, l.firstLine[1], l.yellow)),
      box(d0 - w, l.firstLine[0], d1 + w, l.firstLine[1], l.yellow),
      box(d0 - w, front, d0, l.firstLine[1], l.yellow),
      box(d1, rear, d1 + w, l.firstLine[1], l.yellow),
      box(d1, flag.down, d1 + flag.w, l.firstLine[1], l.yellow),
      box(d0, h.bottom, d1, doorTop, l.firstDoor),
      ...cab.doors.slice(2).map((d) => box(d.x - d.w / 2, h.bottom, d.x + d.w / 2, doorTop, l.navy)),
      ...spec.model.next.doors.map((d) => box(d.x - d.w / 2, h.bottom, d.x + d.w / 2, doorTop, l.navy, 'next')),
    ],
  };
}

/**
 * SWR on the 701 as measured (classes/701/spec.json, livery): the cab car
 * navy back to a diagonal leaning back, white behind it; the first double
 * door white, the others navy; the second car white with navy doors; a
 * thin yellow line along the foot; the face navy with the yellow round the
 * screen and across the lower face (the face's own panel).
 */
function swr701(): Livery {
  const l = spec701.model.livery;
  const h = spec701.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const [[xb, yb], [xt, yt]] = l.diagonal;
  const d1 = spec701.model.cab.doors[1];
  // Doors take the colour painted under them (the doors' own colour would cover door 1's white).
  const box = (x0: number, x1: number, color: string, car: 'cab' | 'next' = 'cab') => ({ points: [[x0, -0.3, 1], [x0, 1.0, 1], [x1, 1.0, 1], [x1, -0.3, 1]] as Pt[], color, car });
  const navyDoors = [
    ...spec701.model.cab.doors.slice(2).map((d) => box(d.x - d.w / 2, d.x + d.w / 2, l.navy)),
    ...spec701.model.next.doors.map((d) => box(d.x - d.w / 2, d.x + d.w / 2, l.navy, 'next')),
  ];
  return {
    body: l.white,
    roof: l.roof,
    under: l.under,
    face: l.navy,
    panel: l.yellow,
    surround: l.black,
    bands: [{ lo: f(l.yellowLine[0]), hi: f(l.yellowLine[1]), color: l.yellow }],
    // The roundel, Arterio and the wordmark, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    swooshes: [
      { points: [[-2, -0.3, 1], [-2, 1.3, 1], [xt + ((1.3 - f(yt)) * (xt - xb)) / (f(yt) - f(yb)), 1.3, 1], [xb + ((-0.3 - f(yb)) * (xt - xb)) / (f(yt) - f(yb)), -0.3, 1]] as Pt[], color: l.navy },
      box(d1.x - d1.w / 2, d1.x + d1.w / 2, l.door1),
      ...navyDoors,
      { points: [[-2, f(l.yellowLine[0]), 1], [-2, f(l.yellowLine[1]), 1], [30, f(l.yellowLine[1]), 1], [30, f(l.yellowLine[0]), 1]] as Pt[], color: l.yellow },
    ],
  };
}

// South Western Railway: white with a navy cab
export const SW: Record<string, Livery> = {
  // The 158 as measured (classes/158/spec.json, liveries.SW).
  '158': liveryFromSpec(spec158 as unknown as DmuSpec, 'SW'),
  // The 159 as measured (classes/159/spec.json, liveries.SW).
  '159': liveryFromSpec(spec159 as unknown as DmuSpec, 'SW'),
  default: {
    body: '#ECEEF1',
    roof: '#8E9297',
    windowBand: '#2A2E36',
    bands: [{ lo: 0, hi: 0.2, color: '#1F2E4F' }, { lo: 0.02, hi: 0.05, color: '#F2C318' }],
    doors: '#E9EAEA',
    face: '#1F2E4F',
    panel: YELLOW,
    swooshes: [{ points: [[-1, -0.2, 1], [-1, 1.2, 1], [1.6, 1.2], [3.4, -0.2]], color: '#1F2E4F' }],
  },
  // The 455 and 456 as measured (classes/455, 456 spec.json, liveries.SW): South West Trains red as SWR ran them.
  '455': liveryOf(spec455, 'SW'),
  '456': liveryOf(spec456, 'SW'),
  sprinter: {
    body: '#BCC2C9',
    roof: '#4E555E',
    windowBand: '#2A2E36',
    bands: [{ lo: 0.06, hi: 0.085, color: '#F2C318' }, { lo: 0.03, hi: 0.05, color: '#C8102E' }],
    doors: '#D2D6DB',
    panel: YELLOW,
    swooshes: [{ points: [[-2, -0.2, 1], [-2, 1.2, 1], [4.5, 1.2], [3.6, 0.5], [2.6, -0.2]], color: '#1F2E4F' }],
  },
  '444': swrDesiro(spec444),
  '450': swrDesiro(spec450),
  '701': swr701(),
  aventra: {
    body: '#1D2B4F',
    roof: '#6E7379',
    doors: '#C9CDD2',
    windowBand: '#121826',
    panel: YELLOW,
    bands: [{ lo: 0.94, hi: 0.96, color: '#F2C500' }],
  },
};
