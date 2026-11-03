import type { Livery } from '../model/types';
import { liveryOf } from '../classes/bremu';
import spec222 from '../classes/222/spec.json';

export const LD: Record<string, Livery> = {
  default: {
    body: '#3A8EDC',
    roof: '#B5B9BE',
    bands: [{ lo: 0.95, hi: 0.97, color: '#F07A2E' }],
    doors: '#AEB2B6',
    panel: '#2F7FD0',
    under: '#8F8A80',
    swooshes: [
      { points: [[1.3, 0.25], [3.6, 0.72], [3.9, 0.66], [1.6, 0.2]], color: '#B03C9A' },
      { points: [[1.7, 0.18], [3.9, 0.62], [4.1, 0.57], [2.0, 0.13]], color: '#F07A2E' },
    ],
  },
  // The 222 as measured (classes/222/spec.json, liveries.LD).
  '222': liveryOf(spec222, 'LD'),
};
