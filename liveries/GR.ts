import type { Livery } from '../model/types';
import { YELLOW } from './shared';

// LNER: white, a red band sweeping up from the nose
export const GR: Record<string, Livery> = {
  default: {
    body: '#F2F2F2',
    roof: '#8A8F94',
    windowBand: '#7A0E1B',
    windowBandFrom: 7,
    swooshes: [{ points: [[-1, 0.1, 1], [0.6, 0.62], [3.5, 0.8], [7.0, 0.73, 1], [9.0, 0.37, 1], [4.0, 0.33], [1.5, 0.22]], color: '#C8102E' }],
    doors: '#3A3D40',
    under: '#55595E',
    panel: '#F2C500',
  },
  loco: {
    body: '#EDEDED',
    roof: '#6E7378',
    bands: [{ lo: 0.05, hi: 0.15, color: '#C8102E' }],
    panel: YELLOW,
    coach: { body: '#EDEDED', roof: '#8A8F94', windowBand: '#2A2D33', bands: [{ lo: 0, hi: 0.2, color: '#C8102E' }] },
  },
};
