import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import spec387 from '../classes/387/spec.json';
import { electrostarLivery, type SpecLivery } from './electrostar';

// Gatwick and Heathrow Express
export const GX: Record<string, Livery> = {
  default: {
    body: '#D7141A',
    roof: '#6E7276',
    bands: [{ lo: 0.36, hi: 0.38, color: '#F2F2F2' }],
    doors: '#A8ACB1',
    face: '#D7141A',
    panel: YELLOW,
  },
  // The 387 as measured (classes/387/spec.json, liveries.GX): Gatwick Express red, grey doors, the white line.
  '387': electrostarLivery(spec387.liveries.GX as SpecLivery, spec387.model.heights),
};
