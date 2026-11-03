import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec700 from '../classes/700/spec.json';
import { YELLOW } from './shared';

/**
 * Thameslink on the 700 as measured (classes/700/spec.json, livery): a
 * light grey body with white slashes at the car ends, sky-blue doors, a
 * yellow first-class strip at the cantrail and an orange line over it;
 * the yellow face between black lamp pods.
 */
function thameslink700(): Livery {
  const l = spec700.model.livery;
  const h = spec700.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const colour = l as unknown as Record<string, string>;
  const shapes = (car: 'cab' | 'next') =>
    l.shapes[car].map((s): Swoosh => ({ points: s.pts.map(([x, y]) => [x, f(y), 1] as Pt), color: colour[s.colour], car, radius: 0.02 }));
  return {
    // Logos and wordmarks, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    body: l.grey,
    roof: l.roof,
    doors: l.doors,
    face: l.white,
    panel: l.yellow,
    surround: l.black,
    glass: l.glass,
    bands: [{ lo: f(3.555), hi: f(3.58), color: l.orange }],
    swooshes: [...shapes('cab'), ...shapes('next')],
  };
}

export const TL: Record<string, Livery> = {
  '700': thameslink700(),
  default: {
    body: '#EEEFF0',
    roof: '#6E7379',
    bands: [{ lo: 0, hi: 0.12, color: '#5E6268' }],
    doors: '#D4D7DA',
    panel: YELLOW,
    swooshes: [{ points: [[3.2, 0.12], [5.0, 0.12], [8.5, 1], [6.7, 1]], color: '#DDE0E3' }],
  },
};
