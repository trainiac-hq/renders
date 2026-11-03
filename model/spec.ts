import type { Car, Door, Pt, RoofItem } from './types';

// A class's measured spec (classes/<code>/spec.json): every number taken
// from a side diagram or a photo, with where it came from in its `trace`.
// The class's geometry is built from these rather than typed in by hand.

export type CarSpec = {
  length: number;
  doors: Door[];
  /** Window glass, [from, to] along the car. */
  windows: (readonly [number, number])[];
  bogies: number[];
  roof?: RoofItem[];
  under?: (readonly [number, number])[];
};

/** A car of the spec as the class data's Car: each window its own pane. */
export const carOf = (c: CarSpec): Car => ({
  length: c.length,
  doors: c.doors,
  windows: c.windows.map(([a, b]) => [a, b, 1] as const),
  bogies: c.bogies,
  ...(c.roof ? { roof: c.roof } : {}),
  ...(c.under ? { under: c.under } : {}),
});

/** Points measured in metres across a flat face (0 on its centre line) as u across it, 0 to 1. */
export const faceU = (halfWidth: number) => (pts: Pt[]): Pt[] =>
  pts.map((p) => (p.length === 3 ? [0.5 + p[0] / (2 * halfWidth), p[1], 1] : [0.5 + p[0] / (2 * halfWidth), p[1]]) as Pt);

/** The same outline on the other side of the centre line. */
export const mirror = (pts: Pt[]): Pt[] => pts.map((p) => (p.length === 3 ? [-p[0], p[1], 1] : [-p[0], p[1]]) as Pt).reverse();

/** Heights in metres as fractions of the bodyside, skirt (0) to cantrail (1), for a livery. */
export const fracOf = (bottom: number, cantrail: number) => (y: number) => (y - bottom) / (cantrail - bottom);
