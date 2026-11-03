import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import spec379 from '../classes/379/spec.json';
import { electrostarLivery, type SpecLivery } from './electrostar';
import { aventra720 } from './aventra720';

// Greater Anglia: white, red doors
export const LE: Record<string, Livery> = {
  // The 720 as measured (classes/720/spec.json); colours from the photos by eye: no clean neutral patch
  '720': aventra720({ body: '#EDEFF2', accent: '#C8102E', lower: '#8E949E', roof: '#4A4D54', yellow: '#F2C318', band: '#17191C', branded: 'LE' }),
  default: {
    body: '#EEF0F2',
    roof: '#8E9297',
    windowBand: '#2A2E33',
    bands: [{ lo: 0, hi: 0.2, color: '#5E6670' }],
    doors: '#D52B1E',
    panel: YELLOW,
    swooshes: [{ points: [[-1, -0.2, 1], [-1, 0.45], [1.0, 0.35], [3.2, -0.2, 1]], color: '#D52B1E' }],
  },
  flirt: {
    body: '#EEF0F2',
    roof: '#8E9297',
    windowBand: '#2A2E33',
    bands: [{ lo: 0, hi: 0.22, color: '#D7192A' }],
    doors: '#D7192A',
    panel: YELLOW,
  },
  // The 379 as Greater Anglia last ran it (2019-21): the same paint as GN carries now.
  '379': electrostarLivery(spec379.liveries.LE as SpecLivery, spec379.model.heights),
};
