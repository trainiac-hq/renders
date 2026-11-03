import type { Livery } from '../model/types';

// Avanti West Coast: dark slate, a yellow nose
import spec390 from '../classes/390/spec.json';

const VTDEFAULT: Livery = {
  body: '#21404C',
  roof: '#1E262E',
  bands: [{ lo: 0.965, hi: 0.98, color: '#E05A28' }],
  panel: '#F2C200',
  surround: '#11161B',
};

export const VT: Record<string, Livery> = {
  default: VTDEFAULT,
  voyager: {
    body: '#3A4146',
    roof: '#2E3336',
    windowBand: '#1A1A1A',
    doors: '#1E5266',
    panel: '#F2C200',
  },
  // Evero: white, a teal field over the front of the leading car.
  iet: {
    body: '#EDEDEB',
    roof: '#8A9095',
    bands: [{ lo: 0.82, hi: 0.84, color: '#E25822' }],
    doors: '#EDEDEB',
    surround: '#1A2A35',
    panel: 'none',
    swooshes: [{ points: [[-1, -0.2, 1], [-1, 1.2, 1], [5.5, 1.2], [8.5, -0.2]], color: '#1F5066' }],
  },
  // The 390: the default livery with its measured bodyside graphic (classes/390/spec.json, liveries.VT).
  '390': { ...VTDEFAULT, branding: spec390.liveries.VT.branding as unknown as Livery['branding'] },
};
