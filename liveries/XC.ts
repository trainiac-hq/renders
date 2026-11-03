import type { Livery } from '../model/types';
import { YELLOW, cabEnd } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec170 from '../classes/170/spec.json';
import { liveryOf } from '../classes/bremu';
import spec220 from '../classes/220/spec.json';
import spec221 from '../classes/221/spec.json';

// CrossCountry: silver and maroon; the 170s in the newer red
export const XC: Record<string, Livery> = {
  // The 170 as measured (classes/170/spec.json, liveries.XC).
  '170': liveryFromSpec(spec170 as unknown as DmuSpec, 'XC'),
  default: {
    body: '#C9CDD1',
    roof: '#7F858B',
    bands: [{ lo: 0, hi: 0.15, color: '#4A3540' }],
    windowBand: '#1A1A1A',
    panel: YELLOW,
    // The maroon-grey cab side with its pale curved X.
    swooshes: [
      cabEnd(3.4, '#3F3640'),
      { points: [[1.6, 0.15], [2.0, 0.15], [3.2, 0.95], [2.8, 0.95]], color: '#CFC6CB' },
      { points: [[2.8, 0.15], [3.2, 0.15], [2.0, 0.95], [1.6, 0.95]], color: '#CFC6CB' },
      { points: [[7.0, 0.05], [7.12, 0.05], [7.12, 0.95], [7.0, 0.95]], color: '#A0234B' },
      { points: [[7.9, 0.05], [8.02, 0.05], [8.02, 0.95], [7.9, 0.95]], color: '#A0234B' },
    ],
  },
  turbostar: {
    body: '#E31E2D',
    roof: '#B5B8BA',
    doors: '#F0EEE8',
    panel: YELLOW,
    swooshes: [
      { points: [[2.0, 0], [3.0, 0], [6.5, 1], [5.5, 1]], color: '#F3E9D6' },
      { points: [[6.5, 0], [7.5, 0], [4.0, 1], [3.0, 1]], color: '#F3E9D6' },
    ],
  },
  // The 220 as measured (classes/220/spec.json, liveries.XC): the 2026 refresh.
  '220': liveryOf(spec220, 'XC'),
  // The 221 as measured (classes/221/spec.json, liveries.XC).
  '221': liveryOf(spec221, 'XC'),
};
