import type { Car, ClassArt } from '../model/types';

// Locomotives and power cars, each with the coach behind it.

export const mk3: Car = {
  length: 23,
  doors: [{ x: 0.8, w: 0.75 }],
  windows: [[2.3, 20.6, 8]],
  bogies: [3.5, 19.5],
  under: [[6.5, 16.5]],
};

/** HST power car: the wedge nose with its knife-edge tip and no buffers. */
export const class43: ClassArt = {
  family: 'hst',
  nose: {
    profile: [[1.15, 0.45, 1], [0.0, 1.4, 1], [0.95, 2.7], [1.6, 3.4], [2.3, 3.8], [3.3, 3.88, 1]],
    surround: [[0.72, 2.38, 1], [1.4, 3.36, 1], [2.85, 3.36, 1], [2.85, 2.38, 1]],
    windscreen: [[0.82, 2.46, 1], [1.42, 3.27, 1], [1.95, 3.27, 1], [1.95, 2.46, 1]],
    glazing: [[[2.15, 2.55, 1], [2.15, 3.2, 1], [2.75, 3.2, 1], [2.75, 2.55, 1]]],
    panel: [[1.15, 0.47, 1], [0.02, 1.4, 1], [0.76, 2.4, 1], [1.7, 2.4, 1], [1.45, 0.47, 1]],
    lights: [[[0.1, 1.53, 1], [0.32, 1.53, 1], [0.4, 1.68, 1], [0.18, 1.68, 1]]],
  },
  heights: { bottom: 0.95, cantrail: 3.48, roof: 3.88, window: [1.95, 2.8] },
  wheel: 0.96,
  wheelbase: 2.6,
  cab: {
    length: 17.79,
    doors: [{ x: 3.15, w: 0.7, cab: true }, { x: 16.4, w: 0.75, cab: true }],
    windows: [[16.85, 17.3, 1]],
    louvres: [[11.6, 14.6]],
    bogies: [3.9, 14.16],
    under: [[6.2, 11.4]],
  },
  next: mk3,
};

/** Class 91, No. 1 end leading, with a Mk4. */
export const class91: ClassArt = {
  family: 'loco',
  nose: {
    profile: [[0.25, 0.4, 1], [0.0, 0.62], [0.0, 1.7, 1], [0.5, 2.35], [1.11, 2.86], [1.85, 3.51], [2.66, 3.73], [3.0, 3.76, 1]],
    surround: [[0.85, 2.48, 1], [1.55, 3.38, 1], [2.25, 3.38, 1], [2.25, 2.48, 1]],
    windscreen: [[0.95, 2.56, 1], [1.55, 3.3, 1], [2.12, 3.3, 1], [2.12, 2.56, 1]],
    glazing: [[[2.55, 2.55, 1], [2.55, 3.1, 1], [2.95, 3.1, 1], [2.95, 2.55, 1]]],
    panel: [[0.02, 0.62, 1], [0.02, 1.7, 1], [0.66, 2.48, 1], [0.95, 2.48, 1], [0.45, 1.6, 1], [0.4, 0.62, 1]],
    lights: [[[0.0, 1.1, 1], [0.0, 1.3, 1], [0.2, 1.3, 1], [0.2, 1.1, 1]]],
  },
  heights: { bottom: 0.74, cantrail: 3.4, roof: 3.76, window: [1.85, 2.65] },
  wheel: 0.94,
  wheelbase: 3.35,
  cab: {
    length: 19.4,
    doors: [{ x: 3.45, w: 0.75, cab: true }, { x: 17.7, w: 0.75, cab: true }],
    windows: [[18.65, 19.0, 1]],
    bogies: [4.9, 15.44],
    roof: [{ kind: 'pantograph', x: 13.5 }],
    under: [[6.6, 13.6]],
  },
  next: { ...mk3, doors: [{ x: 0.9, w: 0.75 }], windows: [[2.6, 20.4, 9]] },
};

/** Class 68 on Chiltern's Mk3 sets: buffers, raked screen, slab sides. */
export const class68: ClassArt = {
  family: 'loco',
  nose: {
    profile: [[0.4, 0.75, 1], [0.3, 1.15, 1], [0.3, 2.3, 1], [0.45, 2.75], [0.9, 3.55], [1.3, 3.8], [1.6, 3.86, 1]],
    surround: [[0.38, 2.68, 1], [0.86, 3.6, 1], [1.38, 3.6, 1], [1.2, 2.68, 1]],
    windscreen: [[0.47, 2.78, 1], [0.92, 3.52, 1], [1.28, 3.52, 1], [1.1, 2.78, 1]],
    glazing: [[[1.45, 2.6, 1], [1.45, 3.3, 1], [1.95, 3.3, 1], [1.95, 2.6, 1]]],
    panel: [[0.3, 1.2, 1], [0.3, 2.3, 1], [0.48, 2.3, 1], [0.48, 1.2, 1]],
    lights: [[[0.3, 1.55, 1], [0.3, 1.75, 1], [0.42, 1.75, 1], [0.42, 1.55, 1]]],
    buffers: 1.07,
  },
  heights: { bottom: 1.05, cantrail: 3.45, roof: 3.86, window: [1.95, 2.8] },
  wheel: 1.0,
  wheelbase: 2.7,
  cab: {
    length: 20.5,
    doors: [{ x: 2.3, w: 0.65, cab: true }, { x: 18.2, w: 0.65, cab: true }],
    windows: [],
    louvres: [[5.0, 7.0], [11.5, 16.0]],
    bogies: [4.6, 15.9],
    roof: [{ kind: 'exhaust', x: 9.0, w: 0.7 }],
    under: [[7.0, 13.0]],
  },
  next: { ...mk3, doors: [{ x: 0.9, w: 0.75 }] },
};
