import type { Livery, Swoosh } from '../model/types';

// What the operators' liveries share: the neutral fallback, the warning
// panel's yellows and the shapes several liveries are built from. Each
// operator has its own file; index.ts gathers them.

/** No operator: plain grey with a dark window band. */
export const neutral: Livery = { body: '#D5D9DF', roof: '#8C929B', windowBand: '#3A4048', panel: '#F7D117' };

export const YELLOW = '#F5C400';
export const BLACK = '#17191C';

/** A column of white dots rising across the side: ScotRail's saltire. */
export const saltire = (x: number, car: 'cab' | 'next' = 'cab', rising = 1): Swoosh => ({
  points: rising > 0 ? [[x, 0.04], [x + 1.3, 0.04], [x + 3.6, 0.97], [x + 2.3, 0.97]] : [[x + 2.3, 0.04], [x + 3.6, 0.04], [x + 1.3, 0.97], [x, 0.97]],
  color: '#FFFFFF',
  car,
  dots: 0.055,
});

/** The cab end painted in another colour back to `to` metres. */
export const cabEnd = (to: number, color: string, from = 0): Swoosh => ({
  points: [[-2, from, 1], [-2, 1.2, 1], [to, 1.2, 1], [to, from, 1]],
  color,
});
