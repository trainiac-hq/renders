import type { Livery, Pt, Swoosh } from '../model/types';
import { fracOf } from '../model/spec';
import { rrect } from '../model/shapes';
import { kiss } from '../classes/electric';

// Caltrain: white, a red cab and roof, a slate band low along the cars with
// a red line over it. Colours from the line scan of 321-322, normalised
// against its white (classes/KISS/SOURCES.md); the red is clipped there, so
// it is set by eye from private photos.

const RED = '#E3141B';
const WHITE = '#EEF0F2';
const SLATE = '#56656C';
const BLACK = '#15181C';
const f = fracOf(kiss.heights.bottom, kiss.heights.cantrail);
/** A shape drawn in metres up from the rail, as a livery's fractions of the side. */
const shape = (pts: Pt[], color: string, car?: 'next'): Swoosh => ({ points: pts.map((p) => (p.length === 3 ? [p[0], f(p[1]), 1] : [p[0], f(p[1])]) as Pt), color, ...(car ? { car } : {}) });
/** The black glazing bands the windows are set in, both decks: x along the car, heights from the rail. */
const band = (x0: number, x1: number, y0: number, y1: number, car?: 'next') => shape(rrect(x0, y0, x1, y1, [0.12, 0.12, 0.12, 0.12]), BLACK, car);

const top = { lo: f(4.0), hi: 1, color: RED };
const slate = { lo: 0, hi: f(1.29), color: SLATE };
const line = { lo: f(1.29), hi: f(1.44), color: RED };

export const CT: Record<string, Livery> = {
  kiss: {
    body: WHITE,
    roof: RED,
    face: RED,
    panel: 'none',
    doors: WHITE,
    under: '#1E2124',
    roofKit: '#8E9297',
    bands: [top, { ...slate, car: 'next' }, { ...line, car: 'next' }],
    swooshes: [
      // The cab's red, sweeping up from the skirt to the roof band behind the first door.
      // Straight along the bottom to 2.6 m, then one curve into the 45° sweep (no wobble).
      shape([[-1, 1.41, 1], [2.6, 1.41], [2.81, 1.448], [3.05, 1.56], [3.31, 1.748], [3.6, 2.01], [3.8, 2.2], [4.55, 2.96], [5.3, 3.71], [5.55, 3.87], [5.8, 3.965], [6.1, 4.0], [7.2, 4.0, 1], [7.2, 4.9, 1], [-1, 4.9, 1]], RED),
      // The grey carried on over the cab's crown, from the top of the face to where the roof drops into the well.
      shape([[-1, 4.735, 1], [3.6, 4.735, 1], [3.6, 4.9, 1], [-1, 4.9, 1]], '#6A7076'),
      // The red line, then the slate band under it, rising from the skirt in front of the first low door.
      shape([[6.92, 0.6, 1], [7.25, 0.92], [7.6, 1.18], [8.0, 1.38], [8.5, 1.44], [9.5, 1.44], [27.8, 1.44, 1], [27.8, 0.6, 1]], RED),
      shape([[7.12, 0.6, 1], [7.45, 0.92], [7.8, 1.12], [8.2, 1.26], [8.6, 1.29], [9.6, 1.29], [27.8, 1.29, 1], [27.8, 0.6, 1]], SLATE),
      band(8.74, 21.39, 3.6, 4.42),
      band(10.92, 19.32, 1.38, 2.23),
      band(6.2, 18.82, 3.6, 4.42, 'next'),
      band(8.4, 12.88, 1.38, 2.23, 'next'),
    ],
    branding: [
      { logo: 'CT', at: [7.98, 2.74], height: 0.66 },
      { logo: 'CT', at: [26.65, 2.74], height: 0.66 },
      { logo: 'CT', car: 'next', at: [1.04, 2.745], height: 0.66 },
      { logo: 'CT', on: 'front', at: [0.5, 1.8], height: 0.32 },
      // The LED destination sign across the top of the windscreen (logos/CT-dest.svg, 5x7 dots).
      { logo: 'CT-dest', on: 'front', at: [0.5, 3.53], height: 0.21 },
      // The unit's number under the cab window, and again low at the cab car's far end.
      { logo: 'CT-308', at: [1.63, 2.205], height: 0.23 },
      { logo: 'CT-308-grey', at: [26.95, 1.06], height: 0.22 },
      // The builder's wordmark on the white skirt behind the nose.
      { logo: 'Stadler', at: [2.34, 0.83], height: 0.055 },
    ],
  },
  default: { body: WHITE, roof: RED, roofKit: '#8E9297', panel: 'none', doors: WHITE, bands: [top, slate, line] },
};
