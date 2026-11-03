import type { Livery } from '../model/types';
import spec800 from '../classes/800/spec.json';
import { YELLOW } from './shared';
import spec387 from '../classes/387/spec.json';
import { electrostarLivery, type SpecLivery } from './electrostar';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec158 from '../classes/158/spec.json';
import spec150 from '../classes/150/spec.json';
import { liveryOf } from '../classes/bremu';
import spec769 from '../classes/769/spec.json';

// Great Western Railway: dark green; a pale green line under the windows
// of its diesel units, a gold one at the cantrail of its electrics
export const GW: Record<string, Livery> = {
  // The 150 as measured (classes/150/spec.json, liveries.GW).
  '150': liveryFromSpec(spec150 as unknown as DmuSpec, 'GW'),
  // The 158 as measured (classes/158/spec.json, liveries.GW).
  '158': liveryFromSpec(spec158 as unknown as DmuSpec, 'GW'),
  default: {
    body: '#0B3D2E',
    roof: '#A3A8A6',
    bands: [{ lo: 0.37, hi: 0.395, color: '#6FA287' }],
    panel: YELLOW,
  },
  iet: {
    body: '#0B3D2E',
    roof: '#5F6B68',
    bands: [{ lo: 0.97, hi: 0.985, color: '#E07A2C' }],
    doors: '#B9BEC4',
    under: '#4A5054',
    surround: '#33383C',
    panel: YELLOW,
  },
  // The 800 as measured (classes/800/spec.json, livery): green doors, a
  // light grey line under the standard-class windows of both cars, and the
  // GWR logo on the cab side and the yellow.
  '800': {
    branding: spec800.model.livery.branding as unknown as Livery['branding'],
    body: '#0B3D2E',
    roof: '#5F6B68',
    bands: [{ lo: 0.97, hi: 0.985, color: '#E07A2C' }],
    under: '#4A5054',
    surround: '#33383C',
    panel: YELLOW,
    swooshes: [
      { points: [[spec800.model.livery.lineCab[0], spec800.model.livery.lineY[0], 1], [spec800.model.livery.lineCab[0], spec800.model.livery.lineY[1], 1], [spec800.model.livery.lineCab[1], spec800.model.livery.lineY[1], 1], [spec800.model.livery.lineCab[1], spec800.model.livery.lineY[0], 1]], color: spec800.model.livery.line },
      { points: [[spec800.model.livery.lineNext[0], spec800.model.livery.lineY[0], 1], [spec800.model.livery.lineNext[0], spec800.model.livery.lineY[1], 1], [spec800.model.livery.lineNext[1], spec800.model.livery.lineY[1], 1], [spec800.model.livery.lineNext[1], spec800.model.livery.lineY[0], 1]], color: spec800.model.livery.line, car: 'next' },
    ],
  },
  electrostar: {
    body: '#10302B',
    roof: '#A3A8A6',
    bands: [{ lo: 0.965, hi: 0.985, color: '#D69A3A' }, { lo: 0.4, hi: 0.412, color: '#C9D1CD' }],
    doors: '#4E5B57',
    panel: YELLOW,
    swooshes: [{ points: [[7.6, 0], [10.8, 0], [13.9, 1], [10.7, 1]], color: '#3E5A52' }],
  },
  // GWR green on the 387 (classes/387/spec.json, liveries.GW): grey door leaves with a lime line across them, a lighter green band leaning back behind the cab door and at the car's far end.
  '387': {
    ...electrostarLivery(spec387.liveries.GW as SpecLivery, spec387.model.heights),
    doorStripes: [{ from: 0, to: 0.9, lo: spec387.liveries.GW.doorLineY[0], hi: spec387.liveries.GW.doorLineY[1], color: spec387.liveries.GW.doorLine }],
  },
  // The 769 as measured (classes/769/spec.json, liveries.GW).
  '769': liveryOf(spec769, 'GW'),
};
