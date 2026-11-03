import type { Car, ClassArt, Face, Nose, Pt } from '../model/types';
import { box, gangwayLines, pair, wrap } from '../model/shapes';

// Diesel multiple units: Sprinters, Networker Turbos, Turbostars, Coradia,
// Adelante, Desiro, Civity, Voyager and Meridian, FLIRT.

// A flat front: vertical, its roof edge rounded by `round`. What makes
// each one itself is on its face.
const flatProfile = (roof: number, round: number): Pt[] => [
  [0.25, 0.55, 1], [0.04, 0.85], [0.0, 1.05], [0.0, roof - round, 1], [round * 0.3, roof - round * 0.3], [round, roof, 1],
];

const coupler = box(0.41, 0.5, 0.59, 0.9, 0.03);
const doorWindow = box(0.43, 2.25, 0.57, 2.95, 0.03);

/**
 * Sprinter fronts: yellow over a dark valance, a gangway door in a black
 * frame between two windscreens.
 */
const sprinterFace = (dark: Pt[][], screens: Pt[][], lights: Pt[][]): Face => ({
  depth: 1.7,
  // The panel runs on down under the valance, so the valance's edge is the only boundary.
  panel: box(0, 0.4, 1, 4.2),
  dark: [box(0, 0.4, 1, 0.98), ...dark, box(0.32, 0.9, 0.68, 3.48, 0.05), coupler],
  gangway: box(0.405, 1.0, 0.595, 3.25, 0.03),
  screens: [...screens, doorWindow],
  lights,
  lines: gangwayLines(0.405, 0.595, 1.0, 3.25),
});

// --- Sprinters --------------------------------------------------------------

export const class150: ClassArt = {
  family: 'sprinter',
  // A 150/2: separate windscreen surrounds, no black band.
  nose: {
    profile: flatProfile(3.774, 0.45),
    face: sprinterFace(pair(0.04, 2.05, 0.36, 3.1, 0.05), pair(0.07, 2.12, 0.33, 3.03, 0.03), pair(0.06, 1.18, 0.2, 1.36)),
  },
  heights: { bottom: 1.0, cantrail: 3.42, roof: 3.774, window: [1.95, 2.75] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 19.93,
    doors: [{ x: 1.6, w: 0.75, cab: true }, { x: 6.3, w: 1.25, leaves: 2 }, { x: 12.9, w: 1.25, leaves: 2 }],
    windows: [[3.0, 4.7, 1], [7.7, 11.5, 2], [14.4, 16.0, 1], [17.6, 18.1, 1]],
    bogies: [2.88, 17.05],
    under: [[4.6, 15.2]],
  },
  next: {
    length: 19.93,
    doors: [{ x: 7.0, w: 1.25, leaves: 2 }, { x: 13.6, w: 1.25, leaves: 2 }],
    windows: [[1.8, 2.3, 1], [3.9, 5.5, 1], [8.4, 12.2, 2], [15.2, 16.9, 1]],
    bogies: [2.88, 17.05],
    under: [[4.6, 15.2]],
  },
};

export const class155: ClassArt = {
  family: 'sprinter',
  // One black surround round both windscreens and the door between.
  nose: {
    profile: flatProfile(3.746, 0.4),
    face: sprinterFace([box(0.03, 1.95, 0.97, 3.18, 0.08)], pair(0.07, 2.05, 0.35, 3.08, 0.04), pair(0.06, 1.18, 0.2, 1.36)),
    glazing: [box(0.8, 2.3, 1.4, 2.9)],
  },
  heights: { bottom: 1.0, cantrail: 3.4, roof: 3.746, window: [1.95, 2.7] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 23.21,
    doors: [{ x: 2.3, w: 0.95 }, { x: 21.5, w: 0.95 }],
    windows: [[3.5, 20.4, 13]],
    bogies: [3.6, 19.6],
    under: [[5.5, 17.5]],
  },
  next: {
    length: 23.21,
    doors: [{ x: 1.7, w: 0.95 }],
    windows: [[2.8, 19.7, 13]],
    bogies: [3.6, 19.6],
    under: [[5.5, 17.5]],
  },
};

/** A 155 rebuilt as a single car: the original cab, a door just behind it. */
export const class153: ClassArt = {
  ...class155,
  nose: { ...class155.nose, glazing: [box(0.3, 2.3, 0.75, 2.9)] },
  cab: {
    ...class155.cab,
    doors: [{ x: 1.4, w: 0.9 }, { x: 19.7, w: 0.9 }],
    windows: [[2.1, 2.6, 1], [4.3, 17.9, 10]],
  },
};

export const class156: ClassArt = {
  family: 'sprinter',
  // The black mask runs edge to edge across the top half of the front.
  nose: {
    profile: flatProfile(3.805, 0.45),
    face: sprinterFace([box(0, 1.95, 1, 3.5)], pair(0.06, 2.05, 0.35, 3.05, 0.03), pair(0.05, 1.15, 0.22, 1.35)),
    glazing: [box(1.0, 2.3, 1.6, 2.9)],
  },
  heights: { bottom: 1.0, cantrail: 3.45, roof: 3.805, window: [1.95, 2.75] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 22.385,
    doors: [{ x: 2.35, w: 1.05 }, { x: 20.9, w: 1.05 }],
    windows: [[3.8, 4.4, 1], [5.2, 17.3, 6], [17.6, 18.1, 1], [18.8, 19.3, 1]],
    bogies: [3.19, 19.19],
    under: [[5.0, 17.4]],
  },
  next: {
    length: 22.385,
    doors: [{ x: 1.5, w: 1.05 }],
    windows: [[3.0, 3.5, 1], [4.2, 4.7, 1], [5.1, 17.2, 6]],
    bogies: [3.19, 19.19],
    under: [[5.0, 17.4]],
  },
};

/** 158 and 159: the slightly raked Express Sprinter, doors at the car ends. */
export const class158: ClassArt = {
  family: 'sprinter',
  nose: {
    profile: [[0.3, 0.55, 1], [0.05, 0.85], [0.0, 1.0], [0.0, 1.9], [0.05, 2.5], [0.15, 3.2], [0.35, 3.55], [0.7, 3.73, 1]],
    // Tall windscreens in black frames, a destination pane over each;
    // below them the number and lamps in a black box, and a black slot low down.
    face: {
      ...sprinterFace(
        [...pair(0.065, 1.97, 0.315, 3.19, 0.05), ...pair(0.08, 1.48, 0.3, 1.92, 0.04), ...pair(0.05, 1.05, 0.29, 1.24, 0.04)],
        [...pair(0.085, 2.03, 0.295, 2.82, 0.04), ...pair(0.085, 2.9, 0.295, 3.13, 0.03)],
        pair(0.1, 1.53, 0.28, 1.73, 0.04),
      ),
      number: { text: '158849', at: [0.19, 1.83], height: 0.065 },
    },
    glazing: [box(0.6, 2.3, 1.0, 2.9)],
  },
  heights: { bottom: 1.0, cantrail: 3.38, roof: 3.73, window: [2.05, 2.85] },
  wheel: 0.84,
  wheelbase: 2.6,
  form: { width: 2.7, tumblehome: 0.1, setback: [[0.5, 0.22]], squareness: 5, glazing: 'gasket' },
  cab: {
    length: 22.57,
    doors: [{ x: 1.95, w: 1.1, leaves: 2 }, { x: 19.35, w: 1.1, leaves: 2 }],
    windows: [[3.0, 17.7, 9]],
    bogies: [3.29, 19.29],
    roof: [{ kind: 'dome', x: 6.0, w: 1.2 }, { kind: 'dome', x: 14.0, w: 1.2 }],
    under: [[5.4, 17.2]],
  },
  next: {
    length: 22.57,
    doors: [{ x: 3.2, w: 1.1, leaves: 2 }],
    windows: [[4.85, 19.55, 9]],
    bogies: [3.29, 19.29],
    roof: [{ kind: 'dome', x: 8.0, w: 1.2 }],
    under: [[5.4, 17.2]],
  },
};

// --- Networker Turbo --------------------------------------------------------

export const class165: ClassArt = {
  family: 'networker',
  nose: {
    profile: [[0.3, 0.55, 1], [0.08, 0.9], [0.0, 1.2], [0.0, 2.9], [0.15, 3.35], [0.45, 3.65], [1.0, 3.79, 1]],
    // Networker: no gangway, a two-pane screen under the domed cab roof.
    face: {
      depth: 1.7,
      panel: box(0, 0.5, 1, 2.0),
      dark: [box(0.03, 1.96, 0.97, 3.1, 0.1), coupler],
      screens: pair(0.06, 2.04, 0.485, 3.02, 0.05),
      lights: pair(0.05, 1.25, 0.27, 1.43, 0.03),
    },
  },
  heights: { bottom: 1.0, cantrail: 3.45, roof: 3.79, window: [2.0, 2.8] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 23.5,
    doors: [{ x: 1.5, w: 0.6, cab: true }, { x: 6.5, w: 1.4, leaves: 2 }, { x: 16.2, w: 1.4, leaves: 2 }],
    windows: [[2.1, 3.5, 1], [3.6, 4.1, 1], [4.2, 5.6, 1], [7.4, 15.3, 5], [17.1, 23.0, 4]],
    bogies: [3.75, 19.75],
    under: [[5.6, 17.6]],
  },
  next: {
    length: 23.25,
    doors: [{ x: 7.0, w: 1.4, leaves: 2 }, { x: 16.7, w: 1.4, leaves: 2 }],
    windows: [[0.4, 6.1, 4], [7.9, 15.8, 5]],
    bogies: [3.75, 19.5],
    under: [[5.6, 17.6]],
  },
};

/** The 165 with air conditioning: pods on the roof. */
export const class166: ClassArt = {
  ...class165,
  cab: { ...class165.cab, roof: [{ kind: 'pod', x: 5.5, w: 2.0 }, { kind: 'pod', x: 15.2, w: 2.0 }] },
  next: { ...class165.next, roof: [{ kind: 'pod', x: 6.0, w: 2.0 }] },
};

// --- Turbostar --------------------------------------------------------------

// The rounded GRP cab: one big wraparound pane, a yellow panel below it
// with paired round lamps, the screen wrapping onto the side.
const turbostarNose: Nose = {
  profile: [[0.4, 0.55, 1], [0.08, 0.85], [0.0, 1.1], [0.0, 1.7], [0.1, 2.1], [0.25, 2.8], [0.4, 3.3], [0.6, 3.6], [0.95, 3.77, 1]],
  ...wrap(2.07, 3.06, 0.75),
  face: {
    depth: 1.5,
    panel: box(0, 0.5, 1, 2.0),
    dark: [box(0.02, 1.97, 0.98, 3.14, 0.14), coupler],
    screens: [box(0.05, 2.05, 0.95, 3.07, 0.1)],
    lights: pair(0.05, 1.22, 0.23, 1.4, 0.04),
  },
};

const turbostarCab: Car = {
  length: 23.62,
  doors: [{ x: 1.6, w: 0.65, cab: true }, { x: 6.5, w: 1.55, leaves: 2 }, { x: 17.4, w: 1.55, leaves: 2 }],
  windows: [[2.3, 5.4, 2], [7.6, 16.2, 4], [18.6, 22.3, 2]],
  bogies: [3.8, 19.8],
  roof: [{ kind: 'pod', x: 5.5, w: 2.4 }, { kind: 'pod', x: 16.4, w: 2.4 }],
  under: [[5.6, 18.0]],
};

export const class170: ClassArt = {
  family: 'turbostar',
  nose: turbostarNose,
  heights: { bottom: 1.0, cantrail: 3.42, roof: 3.77, window: [1.95, 2.9] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: turbostarCab,
  next: {
    length: 23.61,
    doors: [{ x: 6.2, w: 1.55, leaves: 2 }, { x: 17.4, w: 1.55, leaves: 2 }],
    windows: [[1.0, 5.1, 2], [7.4, 16.2, 4], [18.6, 22.6, 2]],
    bogies: [3.8, 19.8],
    roof: [{ kind: 'pod', x: 5.0, w: 2.4 }, { kind: 'pod', x: 16.2, w: 2.4 }],
    under: [[5.6, 18.0]],
  },
};

/** Southern's 171: a 170 with Dellner couplers under a deeper valance. */
export const class171: ClassArt = {
  ...class170,
  nose: { ...turbostarNose, profile: [[0.45, 0.45, 1], [0.08, 0.75], [0.0, 1.1], ...turbostarNose.profile.slice(3)] },
};

/** The upright Turbostar on inside-frame bogies. */
export const class172: ClassArt = {
  ...class170,
  nose: {
    ...turbostarNose,
    profile: [[0.3, 0.6, 1], [0.05, 0.85], [0.0, 1.0], [0.0, 2.6], [0.1, 3.2], [0.3, 3.55], [0.6, 3.77, 1]],
    surround: undefined,
    windscreen: undefined,
    // Flatter than the 170: a black band straight across, square screen.
    face: {
      depth: 1.7,
      panel: box(0, 0.5, 1, 2.0),
      dark: [box(0, 1.97, 1, 3.08), coupler],
      screens: [box(0.04, 2.04, 0.96, 3.0, 0.03)],
      lights: pair(0.05, 1.2, 0.23, 1.38, 0.04),
    },
  },
  wheel: 0.76,
  wheelbase: 2.0,
  cab: { ...turbostarCab, bogies: [3.95, 19.7] },
  next: { ...class170.next, length: 23.0, bogies: [3.95, 19.2] },
};

// --- Coradia, Adelante, Desiro ---------------------------------------------

export const class175: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.4, 0.5, 1], [0.05, 0.9], [0.0, 1.3], [0.12, 2.1], [0.45, 2.9], [0.9, 3.45], [1.6, 3.75, 1]],
    panel: [[0.0, 1.3], [0.12, 2.1], [0.3, 2.6], [0.6, 2.2, 1], [0.6, 1.3, 1]],
    ...wrap(2.2, 3.25, 1.15),
    // Coradia: a bulbous lower nose and one big wraparound screen.
    face: {
      depth: 1.4,
      panel: box(0, 0.5, 1, 2.15),
      dark: [box(0.03, 2.1, 0.97, 3.32, 0.2), coupler],
      screens: [box(0.06, 2.18, 0.94, 3.24, 0.16)],
      lights: pair(0.06, 1.1, 0.24, 1.32, 0.04),
      // The small marker outboard, the headlamp inboard.
      headlamps: 'inboard',
    },
  },
  heights: { bottom: 1.0, cantrail: 3.4, roof: 3.75, window: [2.0, 2.75] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 23.71,
    doors: [{ x: 1.35, w: 0.55, cab: true }, { x: 2.3, w: 0.95 }, { x: 21.9, w: 0.95 }],
    windows: [[3.3, 18.7, 8]],
    bogies: [3.8, 19.9],
    roof: [{ kind: 'pod', x: 7.0, w: 2.2 }],
    under: [[5.8, 17.8]],
  },
  next: {
    length: 23.03,
    doors: [{ x: 1.3, w: 0.95 }],
    windows: [[2.6, 20.0, 9]],
    bogies: [3.8, 19.2],
    under: [[5.8, 17.2]],
  },
};

export const class180: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.3, 0.6, 1], [0.0, 0.8], [0.0, 1.0], [0.3, 1.6], [0.8, 2.4], [1.5, 3.0], [2.2, 3.45], [2.9, 3.75, 1]],
    surround: [[0.75, 2.25], [1.5, 2.95], [2.2, 3.38], [2.95, 3.35, 1], [2.9, 2.6, 1], [1.8, 2.3], [1.0, 2.1]],
    windscreen: [[0.9, 2.32], [1.5, 2.9], [2.15, 3.27], [2.25, 2.95, 1], [1.4, 2.35, 1]],
    glazing: [[[2.35, 2.62, 1], [2.35, 3.15, 1], [2.85, 3.15, 1], [2.85, 2.62, 1]]],
    panel: [[0.0, 0.8], [0.0, 1.0], [0.3, 1.6], [0.62, 2.12], [0.85, 1.3, 1], [0.6, 0.8, 1]],
    lights: [[[0.08, 1.12], [0.2, 1.35], [0.45, 1.35, 1], [0.38, 1.12, 1]]],
  },
  heights: { bottom: 0.9, cantrail: 3.4, roof: 3.75, window: [1.95, 2.65] },
  wheel: 0.84,
  wheelbase: 2.7,
  cab: {
    length: 23.71,
    doors: [{ x: 3.15, w: 0.55, cab: true }, { x: 4.1, w: 0.9 }, { x: 21.6, w: 0.9 }],
    windows: [[6.3, 19.1, 7]],
    bogies: [3.8, 21.0],
    roof: [{ kind: 'pod', x: 5.5, w: 12 }],
    under: [[6.0, 18.8]],
  },
  next: {
    length: 23.03,
    doors: [{ x: 1.3, w: 0.9 }],
    windows: [[3.2, 19.8, 8]],
    bogies: [3.4, 20.3],
    under: [[5.6, 18.2]],
  },
};

export { class185 } from './desiro';

// --- CAF Civity -------------------------------------------------------------

export { class195, class196, class197 } from './civity';

// --- Bombardier Voyager and Meridian ---------------------------------------

const voyagerNose: Nose = {
  profile: [[0.35, 0.55, 1], [0.0, 0.7], [0.0, 1.0], [0.15, 1.6], [0.45, 2.2], [1.0, 2.75], [1.7, 3.25], [2.6, 3.6], [3.4, 3.75, 1]],
  surround: [[0.4, 2.15], [1.0, 2.72], [1.8, 3.27], [2.4, 3.42], [3.15, 3.38, 1], [3.1, 2.82], [2.4, 2.72], [1.5, 2.3], [0.75, 2.0]],
  windscreen: [[0.62, 2.38], [1.2, 2.88], [1.9, 3.27], [2.15, 3.2, 1], [2.0, 2.78], [1.35, 2.45], [0.85, 2.22]],
  glazing: [[[2.45, 2.92], [2.95, 3.28], [3.05, 2.95, 1]]],
  panel: [[0.02, 1.0], [0.15, 1.6], [0.45, 2.2], [0.75, 2.05], [0.5, 1.5], [0.4, 1.0, 1]],
  lights: [[[0.04, 1.2], [0.14, 1.5], [0.42, 1.55], [0.32, 1.22]]],
};

const voyagerCab: Car = {
  length: 23.85,
  doors: [{ x: 3.85, w: 0.6, cab: true }, { x: 7.45, w: 0.9 }, { x: 22.2, w: 0.9 }],
  windows: [[8.9, 19.4, 5]],
  bogies: [3.95, 21.05],
  roof: [{ kind: 'pod', x: 5.0, w: 14.0 }],
  under: [[5.6, 19.4]],
};

export const class220: ClassArt = {
  family: 'voyager',
  nose: voyagerNose,
  heights: { bottom: 1.0, cantrail: 3.4, roof: 3.75, window: [1.95, 2.65] },
  wheel: 0.78,
  wheelbase: 2.25,
  cab: voyagerCab,
  next: {
    length: 22.82,
    doors: [{ x: 1.2, w: 0.9 }],
    windows: [[2.7, 20.4, 7]],
    bogies: [3.0, 19.8],
    roof: [{ kind: 'pod', x: 2.6, w: 16 }],
    under: [[4.8, 18.0]],
  },
};

/** The tilting Super Voyager: same nose, longer-wheelbase bogies. */
export const class221: ClassArt = { ...class220, wheelbase: 2.7, next: { ...class220.next, length: 23.67 } };

/** Meridian: a longer, straighter wedge than the Voyager's. */
export const class222: ClassArt = {
  ...class220,
  nose: {
    profile: [[0.3, 0.5, 1], [0.0, 0.6], [0.0, 1.0], [0.15, 1.5], [0.6, 2.2], [1.3, 2.9], [2.0, 3.4], [2.6, 3.65], [3.0, 3.75, 1]],
    surround: [[0.85, 2.42], [1.6, 3.07], [2.3, 3.5], [3.1, 3.45, 1], [3.1, 2.68, 1], [2.3, 2.68], [1.5, 2.45], [1.0, 2.25]],
    windscreen: [[1.0, 2.5], [1.6, 3.0], [2.2, 3.4], [2.35, 3.22, 1], [1.8, 2.85], [1.25, 2.47]],
    glazing: [[[2.45, 2.76, 1], [2.45, 3.12, 1], [3.0, 3.25, 1], [3.0, 2.76, 1]]],
    panel: [[0.02, 1.0], [0.15, 1.5], [0.6, 2.2], [0.9, 2.1], [0.55, 1.4], [0.45, 1.0, 1]],
    lights: [[[0.12, 1.32], [0.25, 1.6], [0.55, 1.62], [0.4, 1.3]]],
  },
  cab: { ...voyagerCab, doors: [{ x: 3.75, w: 0.6, cab: true }, { x: 7.1, w: 0.9 }, { x: 21.7, w: 0.9 }], windows: [[8.6, 18.6, 5]], bogies: [3.6, 21.0] },
};

// --- Stadler FLIRT: articulated, low floor ---------------------------------

export const flirtCab: Car = {
  length: 20.9,
  doors: [{ x: 2.35, w: 0.7, cab: true }, { x: 8.45, w: 1.4, leaves: 2 }, { x: 12.7, w: 1.4, leaves: 2 }],
  windows: [[4.8, 7.5, 2], [9.4, 11.8, 2], [13.6, 20.3, 4]],
  bogies: [3.7],
  roof: [{ kind: 'pod', x: 4.0, w: 3.0 }],
};

export const class231: ClassArt = {
  family: 'flirt',
  nose: {
    profile: [[0.35, 0.5, 1], [0.0, 0.8], [0.0, 1.2], [0.15, 1.9], [0.55, 2.7], [0.95, 3.3], [1.3, 3.65], [1.8, 3.915, 1]],
    ...wrap(1.98, 3.45, 1.55),
    // The FLIRT 3 face: a bulging lower front, a tall raked screen.
    face: {
      depth: 1.4,
      panel: box(0, 0.5, 1, 1.95),
      dark: [box(0.02, 1.9, 0.98, 3.55, 0.2), box(0.38, 0.5, 0.62, 0.95, 0.04)],
      screens: [box(0.06, 1.98, 0.94, 3.45, 0.17)],
      lights: pair(0.05, 1.22, 0.25, 1.45, 0.045),
    },
  },
  heights: { bottom: 0.75, cantrail: 3.55, roof: 3.915, window: [1.76, 2.73] },
  wheel: 0.87,
  wheelbase: 2.7,
  articulated: true,
  cab: flirtCab,
  next: {
    length: 15.7,
    doors: [{ x: 5.5, w: 1.4, leaves: 2 }],
    windows: [[0.8, 4.4, 2], [6.6, 15.0, 4]],
    bogies: [0, 15.7],
    roof: [{ kind: 'pod', x: 7.0, w: 3.0 }],
  },
};

/** Greater Anglia's FLIRT: one door a side on the driving car, pantograph behind. */
export const class755: ClassArt = {
  ...class231,
  nose: {
    profile: [[0.3, 0.5, 1], [0.0, 0.85], [0.0, 1.6], [0.25, 2.3], [0.7, 3.1], [1.2, 3.6], [1.7, 3.915, 1]],
    ...wrap(2.25, 3.48, 1.5),
    // Blunter than the TfW FLIRT: yellow up to a black band under the screen.
    face: {
      depth: 1.4,
      panel: box(0, 0.5, 1, 2.0),
      dark: [box(0, 1.98, 1, 2.2), box(0.03, 2.15, 0.97, 3.58, 0.2), box(0.38, 0.5, 0.62, 0.95, 0.04)],
      screens: [box(0.06, 2.25, 0.94, 3.48, 0.17)],
      lights: pair(0.05, 1.25, 0.25, 1.48, 0.045),
    },
  },
  cab: {
    ...flirtCab,
    doors: [{ x: 2.5, w: 0.7, cab: true }, { x: 10.3, w: 1.4, leaves: 2 }],
    windows: [[5.9, 9.4, 2], [11.3, 20.4, 5]],
  },
  next: { ...class231.next, roof: [{ kind: 'pantograph', x: 9.5 }] },
};

/** TfW's tri-mode FLIRT: the 231's body with a pantograph on the trailer. */
export const class756: ClassArt = { ...class231, next: class755.next };
