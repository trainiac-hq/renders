import type { Livery, Pt } from '../model/types';
import { fracOf } from '../model/spec';
import spec357 from '../classes/357/spec.json';
import { YELLOW } from './shared';
import spec387 from '../classes/387/spec.json';
import { electrostarBranding, electrostarLivery, type SpecLivery, type SpecLogo } from './electrostar';
import { aventra720 } from './aventra720';

/**
 * c2c on the 357 as measured (classes/357/spec.json, liveries.CC): the
 * 2024 scheme. White, windows in their own black frames, magenta door leaves, a magenta
 * swoosh leaning back from the skirt ahead of the first door to the
 * cantrail over the second window, under the glazing, the face's magenta
 * carried round the cab corner, the orange line at the cantrail.
 */
function c2c357(): Livery {
  const l = spec357.liveries.CC;
  const h = spec357.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const at = (pts: number[][]): Pt[] => pts.map(([x, y, c]) => (c ? [x, f(y), 1] : [x, f(y)]) as Pt);
  const [, top, foot] = l.cabBand.poly;
  return {
    body: l.body,
    roof: l.roof,
    // No band: each window is its own dark glass in a thin black frame on the white (p013, p024, p045).
    doors: l.doors,
    panel: YELLOW,
    face: l.body,
    glass: l.glass,
    bands: [{ lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange }],
    swooshes: [
      { points: at(l.swoosh.poly), color: l.magenta, layer: 'under' },
      // The dark mullion of the first window, one glazed unit (spec: liveries.CC.mullion).
      { points: at(l.mullion.poly), color: l.windowBand },
      // The face's band round the corner: its front edge is the corner itself, so it runs on ahead of it.
      { points: at([[-1, top[1], 1], [top[0], top[1], 1], [foot[0], foot[1], 1], [-1, foot[1], 1]]), color: l.magenta },
    ],
    branding: electrostarBranding(l.logos as SpecLogo[]),
  };
}

// c2c: white, magenta at the cab and the doors
export const CC: Record<string, Livery> = {
  // The 720 as measured (classes/720/spec.json); colours from the photos by eye: no clean neutral patch
  '720': aventra720({ body: '#F0F1F3', accent: '#D6318F', roof: '#4A4D54', yellow: '#F2C318', band: '#17191C', branded: 'CC' }),
  default: {
    body: '#F0F1F3',
    roof: '#8E9297',
    windowBand: '#2A2E33',
    bands: [{ lo: 0, hi: 0.18, color: '#4A4F56' }],
    doors: '#E23F9A',
    panel: YELLOW,
    swooshes: [{ points: [[1.15, -0.1], [1.4, -0.1], [1.4, 1.2], [1.15, 1.2]], color: '#D6007E' }],
  },
  electrostar: {
    body: '#F0F1F3',
    roof: '#8E9297',
    windowBand: '#2A2E33',
    bands: [{ lo: 0, hi: 0.18, color: '#4A4F56' }, { lo: 0.94, hi: 0.96, color: '#E8742A' }],
    doors: '#1E2A3A',
    panel: YELLOW,
  },
  '357': c2c357(),
  // The 387 as measured (classes/387/spec.json, liveries.CC): c2c white (2016-22), the 387/3s.
  '387': electrostarLivery(spec387.liveries.CC as SpecLivery, spec387.model.heights),
};
