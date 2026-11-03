import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec185 from '../classes/185/spec.json';
import spec397 from '../classes/397/spec.json';
import { YELLOW } from './shared';

/**
 * TransPennine on the 185 as measured (classes/185/spec.json, livery):
 * silver, the cab end in blues with navy rays to door 1, purple low on
 * the nose and on car 2, an orange line at the cantrail; the face yellow
 * under a black screen band. Shapes traced from the diagram.
 */
function tpe185(): Livery {
  const l = spec185.model.livery;
  const h = spec185.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const colour = l as unknown as Record<string, string>;
  const shapes = (car: 'cab' | 'next') =>
    l.shapes[car].map((s): Swoosh => ({ points: s.pts.map((p) => (p.length === 3 ? [p[0], f(p[1]), 1] : [p[0], f(p[1])]) as Pt), color: colour[s.colour], car, radius: 0.02 }));
  return {
    // Logos and wordmarks, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    body: l.body,
    roof: l.roof,
    doors: l.doors,
    face: l.roof,
    panel: l.yellow,
    surround: l.black,
    glass: l.glass,
    bands: [{ lo: f(3.38), hi: f(3.41), color: l.orange }],
    swooshes: [...shapes('cab'), ...shapes('next')],
  };
}

/**
 * TransPennine on the 397 as measured (classes/397/spec.json, livery):
 * silver; the leading car's front in blues with navy rays and a purple
 * foot, re-traced from the diagram; an orange line at the cantrail.
 */
function tpe397(): Livery {
  const l = spec397.model.livery;
  const h = spec397.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const colour = l as unknown as Record<string, string>;
  const shapes = (car: 'cab' | 'next') =>
    l.shapes[car].map((s): Swoosh => ({ points: s.pts.map((p) => (p.length === 3 ? [p[0], f(p[1]), 1] : [p[0], f(p[1])]) as Pt), color: colour[s.colour], car, radius: 0.02 }));
  return {
    body: l.body,
    roof: l.roof,
    under: l.under,
    doors: '#3A3E44',
    // The nose's cap blue all over (397107, Nova 2 photos), the screen in its dark surround.
    face: l.blue,
    panel: l.yellow,
    surround: '#16181C',
    bands: [{ lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange }],
    swooshes: [...shapes('cab'), ...shapes('next')],
  };
}

// TransPennine Express: teal, a navy nose
export const TP: Record<string, Livery> = {
  '185': tpe185(),
  '397': tpe397(),
  // Silver, the front of the leading car a blue wedge with navy rays.
  default: {
    body: '#B5B9BD',
    roof: '#3A3E42',
    windowBand: '#1A1A1A',
    bands: [{ lo: 0.9, hi: 0.92, color: '#E25822' }],
    doors: '#3A3E42',
    panel: '#2A2F35',
    surround: '#101827',
    swooshes: [
      { points: [[-1, -0.2, 1], [-1, 1.2, 1], [4.0, 1.2], [11.5, 0.55, 1], [5.0, -0.2]], color: '#1EA5D8' },
      { points: [[0.5, 0.2], [6.5, 0.5, 1], [0.8, 0.35]], color: '#1E2A5A' },
      { points: [[1.0, 0.6], [7.5, 0.58, 1], [1.2, 0.72]], color: '#1E2A5A' },
      { points: [[-1, -0.2, 1], [-1, 0.15], [3.0, -0.2, 1]], color: '#7B2D7F' },
    ],
  },
  desiro: {
    body: '#B5B9BD',
    roof: '#3A3E42',
    windowBand: '#1A1A1A',
    doors: '#3A3E42',
    panel: YELLOW,
    swooshes: [
      { points: [[-1, -0.2, 1], [-1, 1.2, 1], [3.5, 1.2], [6.0, -0.2]], color: '#4FC3F7' },
      { points: [[0.5, 0.15], [5.0, 0.6, 1], [0.8, 0.3]], color: '#1E2A5A' },
      { points: [[-1, -0.2, 1], [-1, 0.15], [2.5, -0.2, 1]], color: '#7B2D7F' },
    ],
  },
};
