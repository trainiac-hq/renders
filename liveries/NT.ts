import type { Livery } from '../model/types';
import { YELLOW } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec158 from '../classes/158/spec.json';
import spec170 from '../classes/170/spec.json';
import spec156 from '../classes/156/spec.json';
import spec150 from '../classes/150/spec.json';
import spec155 from '../classes/155/spec.json';
import { liveryOf } from '../classes/bremu';
import spec319 from '../classes/319/spec.json';
import spec769 from '../classes/769/spec.json';
import spec331 from '../classes/331/spec.json';
import { fracOf } from '../model/spec';
import type { Pt } from '../model/types';
import spec323 from '../classes/323/spec.json';

// Northern: white, the cab end in a dusky purple
/**
 * Northern on the Civity (195, 331) as measured (classes/331/spec.json,
 * livery; one diagram for both): white, the cab end blue back to a curved
 * edge, blue doors, the face yellow round its black screen frame.
 */
function northernCivity(): Livery {
  const l = spec331.model.livery;
  const h = spec331.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const edge = l.cabBlue.map(([x, y]) => [x, f(y)] as Pt);
  return {
    body: l.white,
    roof: l.roof,
    under: l.under,
    doors: l.blue,
    face: l.yellow,
    panel: l.yellow,
    surround: l.band,
    // The Northern logo, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    swooshes: [{ points: [[-2, 1.3, 1], [edge[0][0], 1.3, 1], ...edge, [edge[edge.length - 1][0] - 0.2, -0.3, 1], [-2, -0.3, 1]], color: l.blue }],
  };
}

const NT_DEFAULT: Livery = {
  body: '#E6E8EC',
  roof: '#4C4F55',
  bands: [{ lo: 0.97, hi: 0.99, color: '#F28C28' }],
  swooshes: [{ points: [[-2, -0.2, 1], [-2, 1.2, 1], [7.0, 1.2, 1], [6.95, 0.9], [6.7, 0.5], [6.25, 0.15], [6.0, -0.2, 1]], color: '#47456F' }],
  doors: '#D3D6DB',
  panel: YELLOW,
};

/**
 * Northern's 323s: the default Northern dress, the 323's slate valance
 * carried round the cab's corners from its face (Face shape `wraps`), as
 * on the LM 323s.
 */
function northern323(): Livery {
  const d = NT_DEFAULT;
  const h = spec323.model.heights;
  const f = (y: number) => (y - h.bottom) / (h.cantrail - h.bottom);
  const top = spec323.model.face.valanceTop;
  return {
    ...d,
    swooshes: [
      ...(d.swooshes ?? []),
      { points: [[-2, f(-0.2), 1], [-2, f(top), 1], [1.0, f(top), 1], [1.4, f(h.bottom), 1], [2.0, f(h.bottom), 1], [2.0, f(-0.2), 1]], color: spec323.model.livery.valance, radius: 0.1 },
    ],
  };
}

export const NT: Record<string, Livery> = {
  // The 155 as measured (classes/155/spec.json, liveries.NT).
  '155': liveryFromSpec(spec155 as unknown as DmuSpec, 'NT'),
  // The 150 as measured (classes/150/spec.json, liveries.NT).
  '150': liveryFromSpec(spec150 as unknown as DmuSpec, 'NT'),
  // The 156 as measured (classes/156/spec.json, liveries.NT).
  '156': liveryFromSpec(spec156 as unknown as DmuSpec, 'NT'),
  // The 170 as measured (classes/170/spec.json, liveries.NT).
  '170': liveryFromSpec(spec170 as unknown as DmuSpec, 'NT'),
  // The 158 as measured (classes/158/spec.json, liveries.NT).
  '158': liveryFromSpec(spec158 as unknown as DmuSpec, 'NT'),
  // The cab end in purple back past the first door, ending in a curve
  // that leans forward from the cantrail to the solebar; white beyond.
  default: NT_DEFAULT,
  '323': northern323(),

  '195': northernCivity(),
  '331': northernCivity(),
  civity: {
    body: '#F4F4F4',
    roof: '#3A3A3A',
    windowBand: '#2E3036',
    bands: [{ lo: 0, hi: 0.42, color: '#1D2D7A' }],
    doors: '#1D2D7A',
    panel: YELLOW,
  },
  // The 319 as measured (classes/319/spec.json, liveries.NT).
  '319': liveryOf(spec319, 'NT'),
  // The 769 as measured (classes/769/spec.json, liveries.NT).
  '769': liveryOf(spec769, 'NT'),
};
