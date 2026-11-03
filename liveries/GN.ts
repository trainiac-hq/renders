import type { Livery } from '../model/types';
import { fracOf } from '../model/spec';
import spec717 from '../classes/717/spec.json';
import { YELLOW } from './shared';
import spec379 from '../classes/379/spec.json';
import { electrostarLivery, type SpecLivery } from './electrostar';
import spec387 from '../classes/387/spec.json';

/**
 * Great Northern on the 717 as measured (classes/717/spec.json, livery):
 * white, the door leaves white with sky-blue edges, an orange line at the
 * cantrail, a white face with no yellow.
 */
function greatNorthern717(): Livery {
  const l = spec717.model.livery;
  const h = spec717.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const door = spec717.model.cab.doors[1];
  return {
    body: l.white,
    roof: l.roof,
    doors: l.doors,
    doorStripes: [
      { from: door.w / 2 - 0.1, to: door.w / 2, lo: h.bottom, hi: 3.41, color: l.blue },
      { from: 0, to: 0.06, lo: h.bottom, hi: 3.41, color: l.blue },
    ],
    face: l.white,
    panel: l.white,
    surround: l.black,
    glass: l.glass,
    // The Great Northern label, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    bands: [{ lo: f(3.555), hi: f(3.58), color: l.orange }],
  };
}

export const GN: Record<string, Livery> = {
  '717': greatNorthern717(),
  default: {
    body: '#F0F1F2',
    roof: '#8E9297',
    windowBand: '#25292E',
    bands: [{ lo: 0, hi: 0.15, color: '#6B7077' }, { lo: 0.95, hi: 0.965, color: '#F08A24' }],
    doors: '#C3C7CB',
    face: '#14171A',
    panel: YELLOW,
  },
  'desiro-city': {
    body: '#E9EBED',
    roof: '#7E838A',
    bands: [{ lo: 0, hi: 0.12, color: '#5E6268' }, { lo: 0.95, hi: 0.965, color: '#F08A24' }],
    doors: '#4EA6DD',
    panel: YELLOW,
    swooshes: [{ points: [[3.0, 0.12], [4.8, 0.12], [8.3, 1], [6.5, 1]], color: '#D6D9DC' }],
  },
  // The 379 as carried since 2025, unrepainted from Greater Anglia: white, near-black doors, the yellow first-class strip.
  '379': electrostarLivery(spec379.liveries.GN as SpecLivery, spec379.model.heights),
  // The 387 in GTR white (classes/387/spec.json, liveries.GN).
  '387': electrostarLivery(spec387.liveries.GN as SpecLivery, spec387.model.heights),
};
