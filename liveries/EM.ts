import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec360 from '../classes/360/spec.json';
import { YELLOW } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec158 from '../classes/158/spec.json';
import spec170 from '../classes/170/spec.json';
import { liveryOf } from '../classes/bremu';
import spec222 from '../classes/222/spec.json';

/**
 * EMR Connect on the 360 as measured (classes/360/spec.json, livery):
 * purple with grey doors, a black band round the windows between the
 * doors, a lighter purple band low on the side between white pinstripes
 * that start as one white line from the nose and open into the band
 * ahead of the first window; the yellow face, an orange line over it.
 */
function emr360(): Livery {
  const l = spec360.model.livery;
  const h = spec360.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const [lo, hi] = l.lowerBand;
  const [t0, t1] = l.taper;
  const w = l.lineW;
  const end = spec360.model.cab.length + 1;
  const shape = (pts: [number, number][], color: string, car: 'cab' | 'next' = 'cab'): Swoosh => ({ points: pts.map(([x, y]) => [x, f(y), 1] as Pt), color, car, radius: 0.01 });
  return {
    // Logos and wordmarks, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    body: l.body,
    roof: l.roof,
    doors: l.doors,
    windowBand: l.black,
    windowBandFrom: l.windowBandFrom,
    face: l.roof,
    panel: l.yellow,
    surround: l.black,
    glass: l.glass,
    under: l.under,
    swooshes: [
      shape([[-1, l.lineY - w / 2], [-1, l.lineY + w / 2], [t0, l.lineY + w / 2], [t0, l.lineY - w / 2]], l.line),
      shape([[t0 - 0.03, l.lineY], [t1, hi + w], [end, hi + w], [end, lo - w], [t1, lo - w]], l.line),
      shape([[t0 + 0.04, l.lineY], [t1, hi], [end, hi], [end, lo], [t1, lo]], l.band),
      shape([[-1, hi + w], [end, hi + w], [end, lo - w], [-1, lo - w]], l.line, 'next'),
      shape([[-1, hi], [end, hi], [end, lo], [-1, lo]], l.band, 'next'),
    ],
  };
}

// East Midlands Railway
export const EM: Record<string, Livery> = {
  '360': emr360(),
  // The 170 as measured (classes/170/spec.json, liveries.EM).
  '170': liveryFromSpec(spec170 as unknown as DmuSpec, 'EM'),
  // The 158 as measured (classes/158/spec.json, liveries.EM).
  '158': liveryFromSpec(spec158 as unknown as DmuSpec, 'EM'),
  default: {
    body: '#4A1D3F',
    roof: '#3A1832',
    bands: [{ lo: 0.95, hi: 0.97, color: '#D9822B' }],
    panel: '#9A9282',
  },
  voyager: { body: '#4B1F3E', roof: '#3E1A34', bands: [{ lo: 0.95, hi: 0.97, color: '#C9772C' }], panel: YELLOW },
  sprinter: {
    body: '#5A1F4B',
    roof: '#B7BBBF',
    bands: [{ lo: 0.2, hi: 0.215, color: '#F2F2F2' }, { lo: 0.97, hi: 1.0, color: '#C8463A' }],
    doors: '#C9CCCF',
    panel: YELLOW,
  },
  turbostar: { body: '#5E2257', roof: '#A9ACAE', panel: YELLOW },
  desiro: { body: '#4A1D3F', roof: '#3A1832', doors: '#4A1D3F', bands: [{ lo: 0.95, hi: 0.97, color: '#D9822B' }], panel: YELLOW },
  // The 222 as measured (classes/222/spec.json, liveries.EM).
  '222': liveryOf(spec222, 'EM'),
};
