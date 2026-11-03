import type { Livery } from '../model/types';

export const HT: Record<string, Livery> = {
  default: {
    body: '#2D4A8F',
    roof: '#2A3A6A',
    bands: [{ lo: 0.96, hi: 0.98, color: '#E8792B' }],
    panel: '#3A4556',
    swooshes: [{ points: [[-1, -0.2, 1], [-1, 1.2, 1], [1.8, 1.2], [3.4, 0.6], [3.9, -0.2, 1]], color: '#26407C' }],
  },
};
