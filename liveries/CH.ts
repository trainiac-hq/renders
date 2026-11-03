import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec168 from '../classes/168/spec.json';

// Chiltern
export const CH: Record<string, Livery> = {
  // The 168 as measured (classes/168/spec.json, liveries.CH).
  '168': liveryFromSpec(spec168 as unknown as DmuSpec, 'CH'),
  default: {
    body: '#B9BDC1',
    roof: '#8E9296',
    windowBand: '#1E2226',
    bands: [{ lo: 0.4, hi: 0.43, color: '#1F2F6B' }, { lo: 0.88, hi: 0.93, color: '#5FA8D3' }],
    panel: YELLOW,
  },
  networker: {
    body: '#E6E8EC',
    roof: '#A9ADB2',
    windowBand: '#2C3E8C',
    windowBandFrom: 2.0,
    doors: '#2C3E8C',
    panel: YELLOW,
  },
  loco: {
    body: '#6E747A',
    roof: '#4A4F55',
    bands: [{ lo: 0.96, hi: 0.985, color: '#C8463A', car: 'cab' }],
    panel: '#E8B10E',
    coach: {
      body: '#9EA3A9',
      roof: '#6C7177',
      windowBand: '#2B2D33',
      bands: [{ lo: 0.3, hi: 0.33, color: '#3B3A7A' }, { lo: 0.84, hi: 0.88, color: '#6FB3D6' }],
    },
  },
};
