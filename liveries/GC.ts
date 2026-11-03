import type { Livery } from '../model/types';
import { liveryOf } from '../classes/bremu';
import spec221 from '../classes/221/spec.json';
import spec180 from '../classes/180/spec.json';

// Open access
export const GC: Record<string, Livery> = {
  // Black, with the orange band sweeping up into an orange nose.
  default: {
    body: '#1C1C1E',
    roof: '#2A2A2C',
    bands: [{ lo: 0.15, hi: 0.27, color: '#F08A1C' }],
    panel: '#F2A51C',
    swooshes: [{ points: [[-1, -0.2, 1], [-1, 0.72], [0.9, 0.88], [2.4, 1.05], [3.6, 0.7], [5.4, 0.27], [7.5, 0.27, 1], [7.5, 0.15, 1], [4.6, 0.15], [3.2, -0.2]], color: '#F2A51C' }],
  },
  other: {
    body: '#1C1C1E',
    roof: '#2A2A2C',
    bands: [{ lo: 0.3, hi: 0.37, color: '#F08A1C' }, { lo: 0.97, hi: 0.99, color: '#F08A1C' }],
    panel: '#F5D514',
  },
  // The 221 as measured (classes/221/spec.json, liveries.GC).
  '221': liveryOf(spec221, 'GC'),
  // The 180 as measured (classes/180/spec.json, liveries.GC).
  '180': liveryOf(spec180, 'GC'),
};
