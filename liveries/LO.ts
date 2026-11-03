import type { Livery, Pt } from '../model/types';
import { fracOf } from '../model/spec';
import spec378 from '../classes/378/spec.json';
import spec710 from '../classes/710/spec.json';
import { YELLOW, cabEnd } from './shared';
import { electrostarBranding, type SpecLogo } from './electrostar';

/**
 * Overground on the 378 as measured (classes/378/spec.json, liveries.LO):
 * the original scheme, still on 46 of 57 units by their latest photos (the
 * refreshed navy-topped one is recorded there as LO-refreshed, not drawn).
 * Light grey body, a black window band, orange doors, a blue band under an
 * orange waist line, the orange line at the cantrail, the face's yellow
 * carried round onto the cab side.
 */
function overground378(): Livery {
  const l = spec378.liveries.LO;
  const h = spec378.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const at = (pts: number[][]): Pt[] => pts.map(([x, y, c]) => (c ? [x, f(y), 1] : [x, f(y)]) as Pt);
  const yellow = [[-1, f(1.27), 1], ...at(l.cabEnd.poly), [-1, f(3.7), 1]] as Pt[];
  return {
    body: l.body,
    roof: l.roof,
    windowBand: l.windowBand,
    glass: l.glass,
    doors: l.doors,
    // The yellow warning strip on each leaf's meeting edge (its black zigzag not drawn).
    doorStripes: [{ from: l.doorStripes.x[0], to: l.doorStripes.x[1], lo: l.doorStripes.y[0], hi: l.doorStripes.y[1], color: l.doorStripes.colour }],
    panel: YELLOW,
    face: l.body,
    bands: [
      { lo: f(l.blueBand[0]), hi: f(l.blueBand[1]), color: l.blue },
      { lo: f(l.waistLine[0]), hi: f(l.waistLine[1]), color: l.orange },
      { lo: f(l.cantrailLine[0]), hi: f(l.cantrailLine[1]), color: l.orange },
    ],
    swooshes: [
      { points: yellow, color: YELLOW, layer: 'under' },
      // The blue carried round the cab's lower corner, below the bodyside too.
      { points: at(l.cabLowerBlue.poly), color: l.blue, layer: 'under' },
    ],
    branding: electrostarBranding(l.logos as SpecLogo[]),
  };
}

/**
 * London Overground on the 710 as measured (classes/710/spec.json, livery):
 * white, the windows in a black band the length of each car, an orange
 * line over a blue skirt band, orange doors; the face orange with a black
 * mask from the dark roof cap round the screen, a blue bumper; the nose's
 * edge orange where it turns onto the side.
 */
function overground710(): Livery {
  const l = spec710.model.livery;
  const h = spec710.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const edge = l.nose.map(([x, y]) => [x, f(y)] as Pt);
  return {
    body: l.white,
    roof: l.roof,
    under: l.under,
    doors: l.orange,
    face: l.orange,
    panel: 'none',
    surround: l.band,
    bands: [
      { lo: 0, hi: f(l.blueTop), color: l.blue },
      { lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange },
      { lo: f(l.bandLo), hi: f(l.bandHi), color: l.band },
    ],
    // The roundel on the grille, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    swooshes: [
      // The orange of the face carried round the nose's edge onto the side.
      { points: [[-1, f(edge[edge.length - 1][1]) - 0.1, 1], [-1, 1.3, 1], [edge[0][0] + l.noseW, 1.3, 1], ...edge.map(([x, y]) => [x + l.noseW, y] as Pt), [edge[edge.length - 1][0] + l.noseW, f(edge[edge.length - 1][1]) - 0.1, 1]], color: l.orange },
    ],
  };
}

// London Overground
export const LO: Record<string, Livery> = {
  default: {
    body: '#E4E6EA',
    roof: '#A9ADB2',
    windowBand: '#2A2D35',
    bands: [{ lo: 0, hi: 0.15, color: '#1035A8' }, { lo: 0.15, hi: 0.18, color: '#EE7623' }],
    doors: '#EE7623',
    panel: YELLOW,
  },
  '378': overground378(),
  '710': overground710(),
  aventra: {
    body: '#F0F0F0',
    roof: '#B5B8BC',
    windowBand: '#1F2228',
    bands: [{ lo: 0, hi: 0.17, color: '#1035A8' }, { lo: 0.17, hi: 0.2, color: '#EE7623' }],
    doors: '#EE7623',
    panel: '#EE7623',
    face: '#EE7623',
    swooshes: [cabEnd(1.75, '#EE7623', 0.2)],
  },
};
