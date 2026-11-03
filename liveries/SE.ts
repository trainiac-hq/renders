import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec375 from '../classes/375/spec.json';
import spec376 from '../classes/376/spec.json';
import spec707 from '../classes/707/spec.json';
import { YELLOW } from './shared';
import { electrostarBranding, type SpecLogo } from './electrostar';
import { liveryOf } from '../classes/bremu';
import spec465 from '../classes/465/spec.json';
import spec466 from '../classes/466/spec.json';

/**
 * Southeastern on the 375 as measured (classes/375/spec.json, liveries.SE):
 * navy body, roof and face, cyan door leaves, the orange line at the
 * cantrail, black panes in black frames on the navy (no window band), and
 * the maroon frame round the first bay of the car behind the cab.
 */
function southeastern375(): Livery {
  const l = spec375.liveries.SE;
  const h = spec375.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const at = (pts: number[][]): Pt[] => pts.map(([x, y, c]) => (c ? [x, f(y), 1] : [x, f(y)]) as Pt);
  const colours: Record<string, string> = { maroon: l.maroon };
  return {
    body: l.body,
    roof: l.roof,
    face: l.face,
    doors: l.doors,
    panel: YELLOW,
    gangway: l.gangwayDoor,
    glass: l.glass,
    bands: [{ lo: f(l.orangeLineY[0]), hi: f(l.orangeLineY[1]), color: l.orange }],
    swooshes: l.shapes.map((sh) => ({ points: at(sh.poly), color: colours[sh.colour], car: sh.car as 'cab' | 'next', ...('layer' in sh && sh.layer === 'doors' ? { layer: 'doors' as const } : {}) })),
    branding: electrostarBranding(l.logos as SpecLogo[]),
  };
}

/**
 * Southeastern navy on the 376 as measured (classes/376/spec.json,
 * liveries.SE; the white livery is now on a minority): navy body and face,
 * light grey roof, light blue doors, each window in its own black frame,
 * the orange line at the cantrail, and on the cab car an orange ring round
 * the first saloon window and an orange head over the first door.
 */
function southeastern376(): Livery {
  const l = spec376.liveries.SE;
  const h = spec376.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const rect = (x0: number, y0: number, x1: number, y1: number): Swoosh => ({
    points: [[x0, f(y0), 1], [x0, f(y1), 1], [x1, f(y1), 1], [x1, f(y0), 1]],
    color: l.orange,
  });
  const r = l.ring;
  const head = l.doorHeads[0];
  return {
    body: l.body,
    roof: l.roof,
    face: l.face,
    doors: l.doors,
    panel: YELLOW,
    glass: l.glass,
    bands: [{ lo: f(l.cantrailLine.y[0]), hi: f(l.cantrailLine.y[1]), color: l.orange }],
    swooshes: [
      rect(r.panel[0][0], r.panel[0][1], r.panel[1][0], r.panel[1][1]),
      ...r.bars.map(([[x0, y0], [x1, y1]]) => rect(x0, y0, x1, y1)),
      rect(r.bottom[0][0], r.bottom[0][1], r.bottom[1][0], r.bottom[1][1]),
      rect(head.x[0], head.y[0], head.x[1], head.y[1]),
    ],
    branding: electrostarBranding(l.logos as SpecLogo[]),
  };
}

// Southeastern: navy with light blue doors; the Networkers still white
/**
 * Southeastern on the 707 as measured (classes/707/spec.json, livery):
 * navy with sky-blue doors, an orange line at the cantrail, the yellow
 * across the lower front.
 */
function southeastern707(): Livery {
  const l = spec707.model.livery;
  const h = spec707.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  return {
    // Logos and wordmarks, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    body: l.navy,
    roof: l.roof,
    doors: l.doors,
    face: l.navy,
    panel: l.yellow,
    surround: l.black,
    glass: l.glass,
    bands: [{ lo: f(3.555), hi: f(3.58), color: l.orange }],
  };
}

export const SE: Record<string, Livery> = {
  '707': southeastern707(),
  default: {
    body: '#1E2A5A',
    roof: '#1E2A5A',
    windowBand: '#1A1A1A',
    bands: [{ lo: 0.96, hi: 0.98, color: '#E8742A' }],
    doors: '#3CB4E5',
    face: '#1E2A5A',
    panel: YELLOW,
  },
  // The Networkers are still in the older white, an ochre cab.
  networker: {
    body: '#E9E9E7',
    roof: '#D9D9D7',
    windowBand: '#1A1A1A',
    bands: [{ lo: 0, hi: 0.1, color: '#1E2A5A' }, { lo: 0.97, hi: 0.99, color: '#E8742A' }],
    doors: '#C9CBCC',
    panel: '#F2B419',
  },
  '375': southeastern375(),
  '376': southeastern376(),
  javelin: { body: '#1E2A5A', roof: '#3A3E44', bands: [{ lo: 0.9, hi: 0.92, color: '#E8742A' }], doors: '#E9E9E7', panel: YELLOW },
  // The Networkers as measured (classes/465, 466 spec.json, liveries.SE): still the older white.
  '465': liveryOf(spec465, 'SE'),
  '466': liveryOf(spec466, 'SE'),
};
