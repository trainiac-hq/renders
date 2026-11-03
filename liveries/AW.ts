import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec158 from '../classes/158/spec.json';
import spec153 from '../classes/153/spec.json';
import spec150 from '../classes/150/spec.json';
import { liveryOf } from '../classes/bremu';
import spec769 from '../classes/769/spec.json';
import spec197 from '../classes/197/spec.json';
import { fracOf } from '../model/spec';

// Transport for Wales: grey, red doors, red roof on the new fleet
/**
 * Transport for Wales on the 197 as measured (classes/197/spec.json,
 * livery): light grey, red doors, the windows in a black band, the cab's
 * top red down to an orange line, the gangway door red.
 */
function tfw197(): Livery {
  const l = spec197.model.livery;
  const h = spec197.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  return {
    body: l.body,
    roof: l.roof,
    under: l.under,
    doors: l.red,
    face: l.body,
    panel: 'none',
    surround: l.band,
    gangway: l.red,
    windowBand: l.band,
    // The TfW logo, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    bands: [{ lo: f(l.redTop), hi: 1.3, color: l.red }, { lo: f(l.redTop) - 0.012, hi: f(l.redTop), color: l.orange }],
  };
}

export const AW: Record<string, Livery> = {
  // The 150 as measured (classes/150/spec.json, liveries.AW).
  '150': liveryFromSpec(spec150 as unknown as DmuSpec, 'AW'),
  // The 153 as measured (classes/153/spec.json, liveries.AW).
  '153': liveryFromSpec(spec153 as unknown as DmuSpec, 'AW'),
  // The 158 as measured (classes/158/spec.json, liveries.AW).
  '158': liveryFromSpec(spec158 as unknown as DmuSpec, 'AW'),
  default: {
    body: '#9B9EA1',
    roof: '#4A4D51',
    windowBand: '#1E2024',
    bands: [{ lo: 0.93, hi: 0.96, color: '#E1251B' }],
    doors: '#E1251B',
    panel: YELLOW,
  },
  '197': tfw197(),
  civity: {
    body: '#E3E4E6',
    roof: '#C9CBCE',
    windowBand: '#2A2C30',
    doors: '#E1251B',
    panel: 'none',
    gangway: '#E1251B',
    swooshes: [{ points: [[-2, 1.2, 1], [1.2, 1.2], [0.8, 0.95], [-2, 0.9, 1]], color: '#E1251B' }],
  },
  flirt: {
    body: '#D9DADC',
    roof: '#E1251B',
    windowBand: '#2A2C30',
    bands: [{ lo: 0.95, hi: 0.975, color: '#F08A24' }],
    doors: '#E1251B',
    panel: 'none',
    surround: '#E1251B',
    // The red mask: the roof's red runs down over the cab and forward to the nose.
    swooshes: [{ points: [[-1, 1.2, 1], [2.9, 1.2], [2.5, 1.0], [1.4, 0.55], [0.3, 0.1], [-1, 0.1, 1]], color: '#E1251B' }],
  },
  // The 769 as measured (classes/769/spec.json, liveries.AW).
  '769': liveryOf(spec769, 'AW'),
};
