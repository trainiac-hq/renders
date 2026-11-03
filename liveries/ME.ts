import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import { liveryOf } from '../classes/bremu';
import spec507 from '../classes/507/spec.json';
import spec508 from '../classes/508/spec.json';

// Merseyrail
export const ME: Record<string, Livery> = {
  default: {
    body: '#F2C100',
    roof: '#8E9297',
    bands: [{ lo: 0.32, hi: 0.88, color: '#2A2B2E' }],
    doors: '#2A2B2E',
    face: '#1E1F22',
    panel: 'none',
  },
  other: {
    body: '#C3C6CA',
    roof: '#8E9297',
    windowBand: '#2A2B2E',
    doors: '#F2C100',
    panel: YELLOW,
  },
  // The 507 and 508 as measured (classes/507, 508 spec.json, liveries.ME): the grey scheme they ended in.
  '507': liveryOf(spec507, 'ME'),
  '508': liveryOf(spec508, 'ME'),
};
