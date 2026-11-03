import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import spec387 from '../classes/387/spec.json';
import { electrostarLivery, type SpecLivery } from './electrostar';

export const HX: Record<string, Livery> = {
  default: {
    body: '#8E9195',
    roof: '#6A6D71',
    bands: [{ lo: 0.96, hi: 0.98, color: '#E5772C' }],
    doors: '#4B2A5E',
    panel: YELLOW,
    // Purple panels round the doors, each edged by a white crescent.
    swooshes: [
      { points: [[4.4, 0], [4.6, 0.7], [5.6, 1.0], [7.2, 1.0], [8.3, 0.55], [7.8, 0]], color: '#F4F4F4' },
      { points: [[4.7, 0], [4.85, 0.65], [5.7, 0.93], [7.1, 0.93], [8.0, 0.5], [7.5, 0]], color: '#4B2A5E' },
      { points: [[13.5, 0], [13.7, 0.7], [14.7, 1.0], [16.3, 1.0], [17.4, 0.55], [16.9, 0]], color: '#F4F4F4' },
      { points: [[13.8, 0], [13.95, 0.65], [14.8, 0.93], [16.2, 0.93], [17.1, 0.5], [16.6, 0]], color: '#4B2A5E' },
    ],
  },
  // The 387 as measured (classes/387/spec.json, liveries.HX): Heathrow Express grey with the purple panel.
  // The gangway door is black above 2.06 m (its yellow lower part is the class's byOperator face).
  '387': { ...electrostarLivery(spec387.liveries.HX as SpecLivery, spec387.model.heights), gangway: spec387.liveries.HX.doorTop },
};
