import type { Livery } from '../model/types';
import { YELLOW } from './shared';

export const CS: Record<string, Livery> = {
  default: {
    body: '#173E4A',
    roof: '#2A3A44',
    bands: [{ lo: 0.96, hi: 0.98, color: '#E07A2E' }],
    panel: YELLOW,
    coach: {
      body: '#2E4D58',
      roof: '#2A3A44',
      doors: '#BFC3C6',
      // The crescent moons near the coach's end.
      swooshes: [
        { points: [[2.2, 1.0], [3.4, 1.0], [2.7, 0.55], [3.3, 0.0], [2.2, 0.0], [1.7, 0.5]], color: '#D9DEDF', car: 'next' },
        { points: [[3.8, 1.0], [4.3, 1.0], [3.95, 0.55], [4.25, 0.0], [3.75, 0.0], [3.5, 0.5]], color: '#D9DEDF', car: 'next' },
      ],
    },
  },
};
