import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import spec345 from '../classes/345/spec.json';

/**
 * The Elizabeth line on the 345 as measured (classes/345/spec.json,
 * livery): white with white doors, a blue band from the skirt to the
 * window bottoms, the windows in a black band whose ends lean back, a
 * purple sweep at each end of a car (on the cab car, round the cab door),
 * an orange line at the cantrail, a navy-black mask on the white face.
 */
function elizabeth345(): Livery {
  const l = spec345.model.livery;
  const h = spec345.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const len = spec345.model.cab.length;
  const at = (pts: number[][], sharp = false): Pt[] => pts.map(([x, y]) => (sharp ? [x, f(y), 1] : [x, f(y)]) as Pt);
  const [bf0, bf1] = l.cabBandFront;
  const [br0, br1] = l.cabBandRear;
  const [nb0, nb1] = l.nextBandFront;
  const below = f(l.skirtTop);
  // The window band as a parallelogram on each car, its ends leaning back.
  const cabBand: Swoosh = { points: [[bf0[0], f(bf0[1]), 1], [bf1[0], f(bf1[1]), 1], [br1[0], f(br1[1]), 1], [br0[0], f(br0[1]), 1]], color: l.band, radius: 0.02 };
  const nextLen = spec345.model.next.length;
  const nextBand: Swoosh = {
    points: [[nb0[0], f(nb0[1]), 1], [nb1[0], f(nb1[1]), 1], [nextLen - nb0[0], f(nb1[1]), 1], [nextLen - nb1[0], f(nb0[1]), 1]],
    color: l.band,
    car: 'next',
    radius: 0.02,
  };
  const pf = l.cabPurpleFront;
  return {
    body: l.white,
    roof: l.roof,
    under: l.under,
    bands: [
      { lo: f(l.skirtTop), hi: f(l.blueTop), color: l.blue, from: l.cabPurpleBlue, to: len + 1 },
      // The black skirt along the foot of every car.
      { lo: 0, hi: f(l.skirtTop), color: l.band },
      { lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: l.orange },
    ],
    panel: 'none',
    surround: l.mask,
    // The roundel on the grille, measured: the spec's model.livery.branding.
    branding: l.branding as unknown as Livery['branding'],
    doors: l.white,
    doorStripes: [{ from: 0, to: l.hazardHalf, lo: 1.2, hi: 3.2, color: l.hazard }],
    swooshes: [
      // The cab end's purple: a concave front edge sweeping down and forward, back to the cab door's rear edge.
      { points: [[pf[0][0], below, 1], ...at(pf.slice(0, -1)), [pf[pf.length - 1][0], f(l.purpleTop), 1], [l.cabPurpleBlue, f(l.purpleTop), 1], [l.cabPurpleBlue, below, 1]], color: l.purple },
      { points: [...at(l.rearPurple, true)], color: l.purple, radius: 0.02 },
      // The black bumper carried round the corners and back along the side as a skirt, over the purple's foot;
      // its top level to where it starts down (a sharp point there, filleted: a smooth point would bulge the level run up).
      { points: [[l.bumperSide[0][0], -0.6, 1], [l.bumperSide[0][0], f(l.bumperSide[0][1]), 1], [l.bumperSide[1][0], f(l.bumperSide[1][1]), 1], [l.bumperSide[2][0], f(l.bumperSide[2][1]), 1], [l.bumperSide[2][0], -0.6, 1]] as Pt[], color: l.band, radius: 0.3 },
      cabBand,
      nextBand,
      // The car behind starts white for a short way before its blue.
      { points: [[-0.1, below, 1], [-0.1, f(l.blueTop), 1], [l.nextWhiteFront, f(l.blueTop), 1], [l.nextWhiteFront, below, 1]], color: l.white, car: 'next' },
    ],
  };
}

// Elizabeth line
export const XR: Record<string, Livery> = {
  '345': elizabeth345(),
  default: {
    body: '#F2F2F2',
    roof: '#C8CACD',
    windowBand: '#2B2E3A',
    bands: [{ lo: 0, hi: 0.18, color: '#1D2A6B' }],
    doors: '#6950A1',
    panel: 'none',
    surround: '#14161B',
  },
};
