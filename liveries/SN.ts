import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec377 from '../classes/377/spec.json';
import { YELLOW, cabEnd } from './shared';
import spec387 from '../classes/387/spec.json';
import { electrostarLivery, type SpecLivery } from './electrostar';
import { liveryFromSpec, type DmuSpec } from '../classes/dmu-spec';
import spec171 from '../classes/171/spec.json';

// Govia Thameslink: Southern green, Thameslink and Great Northern white

/**
 * Southern on the 377 as measured (classes/377/spec.json, livery): a white
 * body with a light grey skirt; the cab car green back past the first door,
 * ending in a convex arc, and a green arc at each inner car end; a black
 * window band that turns dark green in a D round the cab side window and
 * at the car ends; dark green doors with a yellow stripe on each leaf by
 * the centre; a yellow first-class strip under the orange cantrail line.
 */
function southern377(): Livery {
  const l = spec377.model.livery;
  const h = spec377.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const at = (pts: number[][], dx = 0, sx = 1): Pt[] => pts.map(([x, y, c]) => (c ? [dx + sx * x, f(y), 1] : [dx + sx * x, f(y)]) as Pt);
  const [blo, bhi] = l.windowBand;
  const top = 1.25;
  // Down past the skirt: the cab end's valance comes down to 0.3 m.
  const bottom = -0.4;
  // The cab end's arc and the car ends' arcs: from the top of the body down
  // and back round to the skirt, filled to the end of the car.
  const cabEndShape: Pt[] = [[-2, bottom, 1], [-2, top, 1], [l.cabEnd[0][0], top, 1], ...at(l.cabEnd), [l.cabEnd[l.cabEnd.length - 1][0], bottom, 1]];
  const length = spec377.model.cab.length;
  const rearEnd: Pt[] = [[length + 0.5, top, 1], [length - l.carEnd[0][0], top, 1], ...at(l.carEnd, length, -1), [length - l.carEnd[l.carEnd.length - 1][0], bottom, 1], [length + 0.5, bottom, 1]];
  const frontEnd: Pt[] = [[-0.5, bottom, 1], [-0.5, top, 1], [l.carEnd[0][0], top, 1], ...at(l.carEnd), [l.carEnd[l.carEnd.length - 1][0], bottom, 1]];
  const bandEnd = (from: number, to: number, car: 'cab' | 'next'): Swoosh => ({
    points: [[from, f(blo), 1], [from, f(bhi), 1], [to, f(bhi), 1], [to, f(blo), 1]],
    color: l.darkGreen,
    car,
  });
  return {
    body: l.body,
    roof: l.roof,
    bands: [
      { lo: l.lowerBand[0], hi: l.lowerBand[1], color: l.lower },
    ],
    windowBand: l.windowBandColour,
    windowBandFrom: 1.7,
    doors: l.doors,
    doorStripes: [{ from: 0.061, to: 0.257, lo: blo, hi: bhi, color: l.stripe }],
    face: l.cabGreen,
    panel: YELLOW,
    glass: l.glass,
    swooshes: [
      { points: cabEndShape, color: l.cabGreen, layer: 'under' },
      { points: rearEnd, color: l.cabGreen, layer: 'under' },
      { points: frontEnd, color: l.cabGreen, layer: 'under', car: 'next' },
      { points: at(l.d), color: l.darkGreen },
      // The first-class strip, over the cab end's green.
      { points: [[l.firstStripX[0], l.firstStripY[0], 1], [l.firstStripX[0], l.firstStripY[1], 1], [l.firstStripX[1], l.firstStripY[1], 1], [l.firstStripX[1], l.firstStripY[0], 1]], color: l.firstStrip },
      bandEnd(length - l.carEndBand, length + 0.5, 'cab'),
      bandEnd(-0.5, l.carEndBand, 'next'),
      // The orange line at the cantrail, over everything on both cars.
      ...(['cab', 'next'] as const).map((car): Swoosh => ({
        points: [[-2, l.orangeLine[0], 1], [-2, l.orangeLine[1], 1], [length + 2, l.orangeLine[1], 1], [length + 2, l.orangeLine[0], 1]],
        color: l.orange,
        car,
      })),
    ],
  };
}

export const SN: Record<string, Livery> = {
  // The 171 as measured (classes/171/spec.json, liveries.SN).
  '171': liveryFromSpec(spec171 as unknown as DmuSpec, 'SN'),
  default: {
    body: '#F1F2F2',
    roof: '#8E9297',
    windowBand: '#25292E',
    bands: [{ lo: 0, hi: 0.2, color: '#4E9F3D' }],
    doors: '#2D6B35',
    face: '#5BAF3C',
    panel: YELLOW,
    swooshes: [cabEnd(1.4, '#5BAF3C')],
  },
  '377': southern377(),
  // Southern's 387s in 2026 mostly carry the debranded Gatwick Express red (classes/387/notes.md: the count); decided from that, overrulable.
  '387': electrostarLivery(spec387.liveries.SN as SpecLivery, spec387.model.heights),
};
