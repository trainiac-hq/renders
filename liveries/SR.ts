import type { Livery, Pt } from '../model/types';
import { fracOf } from '../model/spec';
import spec380 from '../classes/380/spec.json';
import { BLACK, YELLOW, saltire } from './shared';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec158 from '../classes/158/spec.json';
import spec153 from '../classes/153/spec.json';
import spec156 from '../classes/156/spec.json';
import spec170 from '../classes/170/spec.json';
import { liveryOf } from '../classes/bremu';
import spec318 from '../classes/318/spec.json';
import spec320 from '../classes/320/spec.json';

/**
 * ScotRail on the 380 as measured (classes/380/spec.json, livery): navy
 * with light grey doors, an orange line at the cantrail, and the white
 * dot saltire behind the cab; the face navy with yellow only round the
 * screens and the lamps, the gangway door yellow.
 */
function scotrail380(): Livery {
  const l = spec380.model.livery;
  const h = spec380.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  return {
    body: l.navy,
    roof: l.roof,
    doors: l.doors,
    face: l.navy,
    panel: l.yellow,
    gangway: l.yellow,
    surround: l.black,
    glass: l.glass,
    bands: [{ lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange }],
    swooshes: [
      { points: l.saltire.map(([x, y]) => [x, f(y)] as Pt), color: l.white, dots: l.dot },
      // The same dot field flanks every gangway between cars, nearer the car's end by the nose it lacks.
      { points: l.saltire.map(([x, y]) => [spec380.model.cab.length - (x - l.endInset), f(y)] as Pt), color: l.white, dots: l.dot },
      { points: l.saltire.map(([x, y]) => [x - l.endInset, f(y)] as Pt), color: l.white, dots: l.dot, car: 'next' },
    ],
    // The ScotRail logo in white, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
  };
}

// ScotRail: blue with the dotted saltire at the car ends
export const SR: Record<string, Livery> = {
  '380': scotrail380(),
  // The 170 as measured (classes/170/spec.json, liveries.SR).
  '170': liveryFromSpec(spec170 as unknown as DmuSpec, 'SR'),
  // The 156 as measured (classes/156/spec.json, liveries.SR).
  '156': liveryFromSpec(spec156 as unknown as DmuSpec, 'SR'),
  // The 153 as measured (classes/153/spec.json, liveries.SR).
  '153': liveryFromSpec(spec153 as unknown as DmuSpec, 'SR'),
  // The 158 as measured (classes/158/spec.json, liveries.SR).
  '158': liveryFromSpec(spec158 as unknown as DmuSpec, 'SR'),
  // The 318 and 320 as measured (classes/<code>/spec.json).
  '318': liveryOf(spec318, 'SR'),
  '320': liveryOf(spec320, 'SR'),
  default: {
    body: '#26307E',
    roof: '#8E9399',
    doors: '#B9BCC1',
    panel: YELLOW,
    swooshes: [saltire(2.6), saltire(0.4, 'next', -1)],
  },
  sprinter: { body: '#2A2F8C', roof: '#4A4E57', panel: YELLOW, swooshes: [saltire(2.8), saltire(0.4, 'next', -1)] },
  turbostar: { body: '#2A2F8C', roof: '#7E838A', panel: YELLOW, swooshes: [saltire(2.4), saltire(0.4, 'next', -1)] },
  at200: {
    body: '#1E2A6E',
    roof: '#8A9097',
    doors: '#B9BCC1',
    panel: YELLOW,
    gangway: BLACK,
    swooshes: [saltire(2.8), saltire(0.4, 'next', -1)],
  },
  hst: {
    body: '#B5BCC6',
    roof: '#3A3F4A',
    bands: [{ lo: 0, hi: 0.45, color: '#1E2A5C' }],
    panel: YELLOW,
    coach: {
      body: '#BCC1C7',
      roof: '#8E949B',
      bands: [{ lo: 0, hi: 0.18, color: '#1E2A5C' }, { lo: 0.95, hi: 0.97, color: '#E07A2E' }],
      doors: '#1E2A5C',
    },
  },
};
