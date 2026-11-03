import type { ClassArt, Face, Form, Nose, Pt } from '../model/types';
import { box, gangwayLines, lamps, pair, panes, peanut, rrect, saloon, wrap } from '../model/shapes';
import { carOf, faceU, mirror, type CarSpec } from '../model/spec';
import spec323 from './323/spec.json';

// Electric multiple units and the electric locomotive.

const coupler = box(0.41, 0.45, 0.59, 0.85, 0.03);

/** The full yellow front of older stock: a gangway door between two windscreens. */
const gangwayFace = (dark: Pt[][], screens: Pt[][], lights: Pt[][], door = true): Face => ({
  depth: 1.7,
  panel: box(0, 0.4, 1, 4.2),
  dark: [...dark, coupler],
  ...(door ? { gangway: box(0.39, 0.95, 0.61, 3.25, 0.03), lines: gangwayLines(0.39, 0.61, 0.95, 3.25) } : {}),
  screens: door ? [...screens, box(0.44, 2.2, 0.56, 2.95, 0.03)] : screens,
  lights,
});

// --- BR-era: 318, 320, 323, 455, 465, 466, 507, 508 -------------------------

const class320Nose: Nose = {
  profile: [[0.25, 0.55, 1], [0.03, 0.85], [0.0, 1.0], [0.04, 1.5], [0.09, 1.8], [0.15, 2.1], [0.24, 2.7], [0.3, 3.0], [0.39, 3.4], [0.5, 3.6], [0.8, 3.775, 1]],
  // The three-pane screen and yellow lower half of the 317/318/320/321 cab.
  face: {
    depth: 1.7,
    panel: box(0, 0.4, 1, 1.92),
    dark: [box(0.02, 1.9, 0.98, 3.12, 0.04), coupler],
    screens: [box(0.05, 1.97, 0.33, 3.05, 0.02), box(0.36, 1.97, 0.64, 3.05, 0.02), box(0.67, 1.97, 0.95, 3.05, 0.02)],
    lights: lamps(1.2, 1.4),
  },
};

export const class320: ClassArt = {
  family: 'other',
  nose: class320Nose,
  heights: { bottom: 1.0, cantrail: 3.43, roof: 3.775, window: [1.95, 2.95] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 19.95,
    doors: [{ x: 1.6, w: 0.75, cab: true }, { x: 7.2, w: 1.25, leaves: 2 }, { x: 14.0, w: 1.25, leaves: 2 }],
    windows: panes([2.3, 3.7], [4.4, 5.7], [8.7, 10.4], [10.8, 12.5], [15.5, 17.2], [17.5, 19.2]),
    bogies: [2.9, 17.07],
    under: [[4.5, 15.5]],
  },
  next: { ...saloon(19.92, [6.2, 13.7], [2.9, 17.0], 1.25, 1.7), roof: [{ kind: 'pantograph', x: 10 }], under: [[4.5, 15.5]] },
};

export const class318: ClassArt = class320;

/**
 * The 323 as measured (classes/323/spec.json): an all-yellow face with
 * one black band round both screens, split by a yellow divider, a wiper
 * bar across it and a strip of lower glass; a yellow box each side with
 * the headlamp outboard of the tail, the same size; a dark valance.
 */
function hunslet323(): ClassArt {
  const m = spec323.model;
  const f = m.face;
  const u = faceU(f.halfWidth);
  const both = (pts: Pt[]) => [u(pts), u(mirror(pts))];
  const s = f.surround;
  const g = f.glass;
  const lg = f.lowerGlass;
  const lb = f.lampBox;
  const { head, tail } = f.lamps;
  // Each lamp in its own black ring, the two rings just touching.
  const lamp = peanut([tail.m, tail.y, tail.r + 0.02], [head.m, head.y, head.r + 0.02], 0.06);
  const outline = (pts: Pt[]) => [...pts, pts[0]];
  const h = f.hatch;
  const w = f.wiper;
  const face: Face = {
    depth: 1.7,
    panel: box(0, f.valanceTop, 1, 4.2),
    dark: both(rrect(s.inner, s.lo, s.outer, s.hi, [0.02, 0.02, s.rOuterTop, s.rOuterBottom])),
    screens: [
      ...both(rrect(g.inner, g.lo, g.outer, g.hi, [0.02, 0.02, g.rOuterTop, 0.03])),
      ...both(rrect(lg.inner, lg.lo, lg.outer, lg.hi, [0.02, 0.02, 0.02, 0.1])),
    ],
    lights: both(lamp),
    lines: [...both(outline(rrect(lb.inner, lb.lo, lb.outer, lb.hi, [0.04, 0.04, 0.04, 0.04]))), ...both(outline(rrect(h.inner, h.lo, h.outer, h.hi, [0.02, 0.02, 0.02, 0.02])))],
    shapes: [{ pts: u(rrect(-1.5, 0.2, 1.5, f.valanceTop, [0, 0, 0, 0])), color: spec323.model.livery.valance, wraps: true }],
    wipers: [
      { pivot: u([[w.pivot[0], w.pivot[1]]])[0] as [number, number], tip: u([[w.tip[0], w.tip[1]]])[0] as [number, number] },
      { pivot: u([[-w.pivot[0], w.pivot[1]]])[0] as [number, number], tip: u([[-w.tip[0], w.tip[1]]])[0] as [number, number] },
    ],
    number: { text: f.number.text, at: u([[f.number.m, f.number.y]])[0] as [number, number], height: f.number.height, color: '#1A1A1A' },
    lampRim: 'black',
  };
  return {
    family: 'other',
    nose: { profile: m.nose.profile as unknown as Pt[], face },
    form: m.form as unknown as Form,
    heights: { ...m.heights, window: m.heights.window as [number, number] },
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: { ...carOf(m.cab as unknown as CarSpec), under: [[5.4, 17.4]] },
    next: { ...carOf(m.next as unknown as CarSpec), roof: [{ kind: 'pantograph', x: m.next.pantograph }], under: [[5.4, 17.4]] },
  };
}

export const class323: ClassArt = hunslet323();

export const class455: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.33, 0.55, 1], [0.33, 0.85, 1], [0.0, 1.0, 1], [0.0, 3.2], [0.31, 3.45], [0.6, 3.65], [1.0, 3.77, 1]],
    face: gangwayFace(pair(0.04, 2.0, 0.36, 3.0, 0.03), pair(0.06, 2.06, 0.34, 2.94, 0.02), lamps(1.15, 1.35)),
  },
  heights: { bottom: 1.0, cantrail: 3.43, roof: 3.77, window: [2.05, 3.05] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 19.83,
    doors: [{ x: 2.09, w: 0.8, cab: true }, { x: 6.84, w: 1.2, leaves: 2 }, { x: 13.69, w: 1.2, leaves: 2 }],
    windows: panes([3.52, 5.28], [8.3, 10.07], [10.47, 12.18], [15.3, 17.01], [17.41, 19.13]),
    bogies: [2.47, 16.64],
    under: [[4.2, 15.0]],
  },
  next: { ...saloon(19.92, [6.3, 13.6], [2.5, 17.4], 1.2, 1.75), under: [[4.2, 15.0]] },
};

/** The 456: the 455's body behind a front with no gangway, two screens. */
export const class456: ClassArt = {
  ...class455,
  nose: {
    ...class455.nose,
    face: gangwayFace(pair(0.04, 2.0, 0.48, 3.0, 0.03), pair(0.06, 2.06, 0.46, 2.94, 0.02), lamps(1.15, 1.35), false),
  },
};

/** The 319: a flat gangwayed front on the 317 family's body. */
export const class319: ClassArt = {
  ...class320,
  nose: {
    profile: [[0.25, 0.55, 1], [0.03, 0.85], [0.0, 1.0], [0.0, 3.3], [0.2, 3.6], [0.5, 3.775, 1]],
    face: gangwayFace(pair(0.03, 1.95, 0.37, 3.05, 0.03), pair(0.05, 2.02, 0.35, 2.98, 0.02), lamps(1.15, 1.35)),
  },
  next: { ...class320.next, roof: [{ kind: 'pantograph', x: 10 }] },
};

/** The 769: a 319 carrying diesel engines under its driving cars. */
export const class769: ClassArt = {
  ...class319,
  cab: { ...class319.cab, under: [[4.0, 9.5], [10.0, 16.0]], roof: [{ kind: 'exhaust', x: 13, w: 0.5 }] },
};

/** Networker: full yellow, a protruding lower nose and a central door. */
export const class465: ClassArt = {
  family: 'networker',
  nose: {
    profile: [[0.66, 0.45, 1], [0.0, 0.8, 1], [0.0, 1.0], [0.06, 1.2], [0.28, 1.5, 1], [0.28, 2.1], [0.31, 2.4], [0.35, 2.7], [0.44, 3.0], [0.5, 3.2], [0.6, 3.4], [0.85, 3.6], [1.2, 3.77, 1]],
    // No gangway: two screens in one black band.
    face: { ...gangwayFace([box(0.02, 1.9, 0.98, 3.12, 0.06)], pair(0.05, 1.98, 0.48, 3.05, 0.04), lamps(1.02, 1.22), false), bottom: 0.8 },
  },
  heights: { bottom: 0.9, cantrail: 3.42, roof: 3.77, window: [1.95, 2.9] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 20.89,
    doors: [{ x: 1.64, w: 0.7, cab: true }, { x: 6.27, w: 1.3, leaves: 2 }, { x: 16.08, w: 1.3, leaves: 2 }],
    windows: panes([2.63, 3.03], [3.19, 4.6], [7.18, 8.5], [8.8, 10.22], [10.47, 11.84], [12.09, 13.51], [13.76, 15.17], [17.0, 18.36], [18.61, 20.03]),
    bogies: [4.05, 18.05],
    under: [[5.8, 16.3]],
  },
  next: { ...saloon(20.06, [5.4, 15.2], [3.6, 17.6], 1.3, 1.4), under: [[5.4, 15.4]] },
};

export const class507: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.2, 0.55, 1], [0.0, 1.0], [0.0, 3.2], [0.25, 3.45], [0.5, 3.582, 1]],
    face: gangwayFace(pair(0.03, 1.95, 0.37, 3.02, 0.04), pair(0.05, 2.02, 0.35, 2.95, 0.03), lamps(1.15, 1.35)),
  },
  heights: { bottom: 1.0, cantrail: 3.27, roof: 3.582, window: [2.0, 3.0] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 19.8,
    doors: [{ x: 1.7, w: 0.8, cab: true }, { x: 7.0, w: 1.3, leaves: 2 }, { x: 13.85, w: 1.3, leaves: 2 }],
    windows: panes([3.8, 5.45], [8.5, 10.2], [10.6, 12.25], [15.4, 17.0], [17.4, 19.1]),
    bogies: [2.3, 16.47],
    under: [[4.0, 14.8]],
  },
  next: { ...saloon(19.92, [6.2, 13.7], [2.5, 17.4], 1.3, 1.7), under: [[4.2, 15.0]] },
};

/** Island Line's ex-Underground D78s: a flat end, single doors all along. */
export const class484: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.0, 0.55, 1], [0.0, 3.45, 1], [0.05, 3.58], [0.12, 3.63, 1]],
    face: {
      depth: 1.7,
      panel: box(0, 0.4, 1, 1.9),
      screens: [box(0.06, 1.95, 0.36, 2.95, 0.02), box(0.64, 1.95, 0.94, 2.95, 0.02), box(0.43, 1.95, 0.57, 2.95, 0.02)],
      lines: gangwayLines(0.4, 0.6, 0.6, 3.3),
      lights: lamps(1.1, 1.3),
      dark: [coupler],
    },
  },
  heights: { bottom: 0.55, cantrail: 3.3, roof: 3.63, window: [2.0, 2.85] },
  wheel: 0.79,
  wheelbase: 2.2,
  cab: {
    length: 18.1,
    doors: [{ x: 0.9, w: 0.55, cab: true }, { x: 3.1, w: 1.15, leaves: 2 }, { x: 7.0, w: 1.15, leaves: 2 }, { x: 11.3, w: 1.15, leaves: 2 }, { x: 15.15, w: 1.15, leaves: 2 }],
    windows: panes([4.15, 6.0], [8.2, 10.0], [12.25, 14.15], [16.2, 17.45]),
    bogies: [3.35, 15.23],
  },
  next: {
    length: 18.1,
    doors: [{ x: 2.95, w: 1.15, leaves: 2 }, { x: 6.8, w: 1.15, leaves: 2 }, { x: 11.1, w: 1.15, leaves: 2 }, { x: 15.0, w: 1.15, leaves: 2 }],
    windows: panes([0.65, 1.9], [4.1, 5.85], [8.0, 9.9], [12.1, 13.95]),
    bogies: [2.87, 14.75],
  },
};

// The Electrostars live in their own family file.
export { class357, class375, class376, class377, class378, class379, class387 } from './electrostar';

// --- Siemens Desiro -----------------------------------------------------------

/** The gangwayed Desiro: a black frame round a yellow door, yellow below. */
const desiroGangwayFace: Face = {
  depth: 1.7,
  bottom: 0.9,
  panel: box(0, 0.4, 1, 1.55),
  dark: [box(0, 1.5, 1, 3.42, 0.1), coupler],
  gangway: box(0.37, 0.95, 0.63, 3.36, 0.06),
  lines: gangwayLines(0.37, 0.63, 0.95, 3.36),
  screens: pair(0.05, 1.98, 0.34, 3.18, 0.06),
  lights: lamps(1.12, 1.38),
};

/** The Desiro body as first drawn by eye: still the base of the classes below not yet measured. */
const desiroBase: ClassArt = {
  family: 'desiro',
  nose: {
    profile: [[0.3, 0.45, 1], [0.2, 1.0, 1], [0.3, 1.2, 1], [0.0, 1.5, 1], [0.0, 3.4], [0.55, 3.62], [1.0, 3.78, 1]],
    face: desiroGangwayFace,
  },
  heights: { bottom: 0.9, cantrail: 3.43, roof: 3.78, window: [1.95, 2.9] },
  wheel: 0.85,
  wheelbase: 2.6,
  cab: {
    length: 20.34,
    doors: [{ x: 1.85, w: 0.5, cab: true }, { x: 5.75, w: 1.3, leaves: 2 }, { x: 14.95, w: 1.3, leaves: 2 }],
    windows: panes([3.45, 4.55], [7.0, 8.3], [8.7, 10.15], [10.55, 12.05], [12.4, 13.7], [16.3, 17.6], [17.9, 19.2]),
    bogies: [3.2, 17.65],
    roof: [{ kind: 'pod', x: 8.5, w: 3.0 }],
    under: [[5.0, 15.6]],
  },
  next: { ...saloon(20.34, [5.2, 15.1], [3.0, 17.3], 1.3, 1.5), roof: [{ kind: 'pod', x: 8.6, w: 3.0 }], under: [[5.0, 15.0]] },
};

/** The Desiro without a gangway: a smooth, rounded face. */
const desiroFace: Face = {
  depth: 1.6,
  panel: box(0, 0.4, 1, 2.0),
  dark: [box(0.02, 1.95, 0.98, 3.32, 0.16), coupler],
  screens: [box(0.05, 2.03, 0.95, 3.22, 0.13)],
  lights: lamps(1.15, 1.42),
};

export const class333: ClassArt = {
  ...desiroBase,
  nose: {
    profile: [[0.3, 0.45, 1], [0.0, 0.8, 1], [0.27, 1.0, 1], [0.25, 1.5], [0.27, 2.1], [0.33, 2.4], [0.47, 3.0], [0.57, 3.2], [0.77, 3.6], [1.15, 3.78, 1]],
    face: { ...desiroFace, bottom: 0.9 },
  },
  cab: {
    length: 23.74,
    doors: [{ x: 2.05, w: 0.7, cab: true }, { x: 6.72, w: 1.3, leaves: 2 }, { x: 17.42, w: 1.3, leaves: 2 }],
    windows: panes([2.7, 4.18], [8.46, 9.88], [10.39, 11.82], [12.33, 13.86], [14.37, 15.79], [19.46, 21.19], [21.7, 23.23]),
    bogies: [3.26, 20.16],
    roof: [{ kind: 'pod', x: 11, w: 3.0 }],
    under: [[5.0, 18.4]],
  },
  next: { ...saloon(23.35, [6.4, 17.1], [3.3, 20.1], 1.3, 1.6), roof: [{ kind: 'pantograph', x: 11.7 }] },
};

export { class350, class360, class380, class444, class450, class700, class707, class717 } from './desiro';

// --- Siemens Desiro City: classes/desiro.ts ---------------------------------

// --- Bombardier / Alstom Aventra ---------------------------------------------

// The measured classes live in classes/aventra.ts.
export { class345, class701, class710, class720, class730 } from './aventra';
export { class331, class397 } from './civity';

/** The Aventra wedge: black bumper band, then one big raked screen. */
const aventraFace: Face = {
  depth: 1.5,
  panel: box(0, 1.2, 1, 1.92),
  dark: [box(0.02, 1.88, 0.98, 3.5, 0.2), box(0, 0.45, 1, 1.22, 0.06)],
  screens: [box(0.05, 1.96, 0.95, 3.4, 0.17)],
  lights: pair(0.07, 1.42, 0.27, 1.7, 0.045),
};

const aventraProfile: Pt[] = [[0.25, 0.5, 1], [0.0, 0.9], [0.0, 1.25], [0.06, 1.5], [0.15, 1.8], [0.31, 2.1], [0.46, 2.4], [0.65, 2.7], [0.83, 3.0], [1.02, 3.2], [1.17, 3.4], [1.36, 3.6], [1.5, 3.76, 1]];




/** South Western's Arterio: a shorter rake behind a yellow-edged black mask. */

/** West Midlands' 730: a gangway standing proud of the raked Aventra face. */

// --- Hitachi AT200, Alstom Juniper -------------------------------------------

export const class385: ClassArt = {
  family: 'at200',
  nose: {
    profile: [[0.3, 0.45, 1], [0.0, 0.6], [0.0, 3.3], [0.25, 3.6], [0.6, 3.78, 1]],
    face: desiroGangwayFace,
  },
  heights: { bottom: 0.85, cantrail: 3.43, roof: 3.78, window: [1.95, 2.9] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 23.639,
    doors: [{ x: 2.12, w: 0.55, cab: true }, { x: 6.75, w: 1.3, leaves: 2 }, { x: 18.15, w: 1.3, leaves: 2 }],
    windows: panes([3.65, 5.15], [8.7, 10.2], [10.7, 12.2], [12.75, 14.2], [14.75, 16.2], [19.75, 20.45], [20.95, 22.45]),
    bogies: [4.35, 20.45],
    roof: [{ kind: 'pod', x: 10, w: 2.5 }],
    under: [[6.4, 18.4]],
  },
  next: { ...saloon(23.0, [5.6, 17.4], [3.8, 19.6], 1.3, 1.8), roof: [{ kind: 'pantograph', x: 11.5 }] },
};

/** Alstom Juniper: upright face curving hard back into the roof. */
export const class334: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.25, 0.5, 1], [0.0, 0.75], [0.0, 1.0], [0.04, 1.5], [0.06, 2.1], [0.13, 2.4], [0.22, 2.7], [0.41, 3.0], [0.51, 3.2], [0.63, 3.4], [0.79, 3.6], [0.95, 3.77, 1]],
    face: {
      depth: 1.6,
      panel: box(0, 0.4, 1, 2.0),
      dark: [box(0.03, 1.95, 0.97, 3.2, 0.16), coupler],
      screens: pair(0.06, 2.03, 0.49, 3.12, 0.1),
      lights: lamps(1.2, 1.45),
    },
  },
  heights: { bottom: 0.9, cantrail: 3.42, roof: 3.77, window: [1.95, 2.9] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 21.01,
    doors: [{ x: 2.27, w: 0.45, cab: true }, { x: 6.21, w: 1.3, leaves: 2 }, { x: 16.15, w: 1.3, leaves: 2 }],
    windows: panes([2.79, 3.42], [3.73, 4.86], [7.45, 8.59], [9.0, 10.19], [10.56, 11.75], [12.11, 13.25], [13.66, 14.8], [17.39, 18.58], [18.94, 20.08]),
    bogies: [3.98, 17.98],
    roof: [{ kind: 'pod', x: 7.5, w: 7.0 }],
    under: [[5.6, 16.2]],
  },
  next: { ...saloon(19.94, [5.2, 14.9], [3.5, 16.5], 1.3, 1.45), roof: [{ kind: 'pantograph', x: 10 }] },
};

/** The rebuilt 458/5: a gangway face with bellows, rounded top. */
export const class458: ClassArt = {
  ...class334,
  nose: {
    profile: [[0.4, 0.55, 1], [0.4, 0.8, 1], [0.0, 1.0, 1], [0.0, 3.2], [0.5, 3.4], [0.9, 3.6], [1.2, 3.77, 1]],
    face: { ...gangwayFace([box(0.02, 1.9, 0.98, 3.12, 0.1)], pair(0.05, 1.98, 0.36, 3.05, 0.06), lamps(1.12, 1.36)), bottom: 0.8 },
  },
  cab: {
    ...class334.cab,
    doors: [{ x: 2.22, w: 0.75, cab: true }, { x: 6.6, w: 1.3, leaves: 2 }, { x: 16.2, w: 1.3, leaves: 2 }],
    windows: panes([3.25, 3.9], [4.2, 5.3], [7.8, 8.95], [9.35, 10.5], [10.85, 11.95], [12.35, 13.45], [13.8, 14.95], [17.5, 18.6], [18.95, 20.1]),
    bogies: [4.45, 18.6],
  },
  next: { ...class334.next, roof: [{ kind: 'pod', x: 6, w: 7 }] },
};

// --- CAF Civity EMU ---------------------------------------------------------



// --- Stadler FLIRT and METRO -------------------------------------------------

/** Greater Anglia's electric FLIRT: one long articulated set. */
export const class745: ClassArt = {
  family: 'flirt',
  nose: {
    profile: [[0.3, 0.45, 1], [0.0, 0.6], [0.0, 1.3], [0.15, 1.7], [0.45, 2.2], [0.8, 2.7], [1.2, 3.2], [1.7, 3.6], [2.2, 3.915, 1]],
    face: {
      depth: 1.3,
      panel: box(0, 0.4, 1, 1.95),
      dark: [box(0.02, 1.9, 0.98, 3.6, 0.2), coupler],
      screens: [box(0.06, 1.98, 0.94, 3.5, 0.17)],
      lights: lamps(1.15, 1.42),
    },
    ...wrap(1.98, 3.5, 1.7),
  },
  heights: { bottom: 0.75, cantrail: 3.55, roof: 3.915, window: [1.75, 2.75] },
  wheel: 0.87,
  wheelbase: 2.7,
  articulated: true,
  cab: {
    length: 23.0,
    doors: [{ x: 2.9, w: 0.6, cab: true }, { x: 8.0, w: 1.3, leaves: 2 }],
    windows: panes([4.0, 5.3], [5.6, 6.9], [9.3, 10.6], [11.0, 12.3], [12.7, 14.0], [14.4, 15.7], [16.1, 17.4], [17.8, 19.1], [19.5, 20.8]),
    bogies: [3.6],
    roof: [{ kind: 'pod', x: 4, w: 3 }],
  },
  next: {
    length: 19.0,
    doors: [{ x: 9.5, w: 1.3, leaves: 2 }],
    windows: panes([0.8, 2.1], [2.5, 3.8], [4.2, 5.5], [5.9, 7.2], [7.6, 8.4]),
    bogies: [0, 19.0],
    roof: [{ kind: 'pod', x: 2.5, w: 3 }],
  },
};

/** Merseyrail's 777: an upright, all-yellow face; low floor. */
export const class777: ClassArt = {
  family: 'flirt',
  nose: {
    profile: [[0.6, 0.4, 1], [0.19, 0.6], [0.0, 0.8], [0.0, 1.2], [0.06, 1.5], [0.1, 2.1], [0.16, 2.4], [0.23, 2.7], [0.32, 3.0], [0.39, 3.2], [0.45, 3.4], [0.52, 3.6], [0.75, 3.828, 1]],
    face: {
      depth: 1.7,
      bottom: 0.6,
      panel: box(0, 0.4, 1, 4.2),
      dark: [box(0, 1.75, 1, 3.3, 0.06), box(0.4, 0.45, 0.6, 0.75, 0.03)],
      screens: [box(0.04, 1.82, 0.96, 3.22, 0.06)],
      lights: lamps(1.1, 1.35),
    },
  },
  heights: { bottom: 0.6, cantrail: 3.48, roof: 3.828, window: [1.7, 2.85] },
  wheel: 0.76,
  wheelbase: 2.4,
  articulated: true,
  cab: {
    length: 18.05,
    doors: [{ x: 1.7, w: 0.6, cab: true }, { x: 9.6, w: 1.3, leaves: 2 }],
    windows: panes([2.75, 4.05], [4.55, 5.9], [6.4, 8.25], [11.2, 13.05], [13.55, 14.85], [15.35, 17.2]),
    bogies: [3.5],
    roof: [{ kind: 'pod', x: 3, w: 4 }, { kind: 'pod', x: 11.5, w: 4 }],
  },
  next: {
    length: 14.5,
    doors: [{ x: 7.25, w: 1.3, leaves: 2 }],
    windows: panes([0.7, 2.5], [3.0, 4.3], [4.8, 6.1], [8.4, 9.7], [10.2, 11.5], [12.0, 13.8]),
    bogies: [0, 14.5],
    roof: [{ kind: 'pod', x: 2, w: 4 }],
  },
};

// --- Intercity electrics ------------------------------------------------------

/** Pendolino: the long tapered wedge, shallow windows, doors at the ends. */
export const class390: ClassArt = {
  family: 'pendolino',
  nose: {
    profile: [[0.3, 0.5, 1], [0.05, 0.65], [0.0, 0.85], [0.0, 1.27], [0.25, 1.66], [0.5, 1.99], [0.75, 2.23], [1.0, 2.41], [1.5, 2.75], [2.0, 3.05], [2.5, 3.29], [3.0, 3.44], [3.5, 3.53], [4.0, 3.56, 1]],
    surround: [[0.55, 1.98], [1.0, 2.33], [1.5, 2.67], [2.0, 2.96], [2.5, 3.2], [3.1, 3.3, 1], [3.05, 2.35], [2.3, 2.3], [1.4, 2.15], [0.8, 1.9]],
    windscreen: [[0.75, 2.12], [1.2, 2.45], [1.7, 2.78], [2.15, 2.98], [2.15, 2.6], [1.5, 2.45], [1.0, 2.15]],
    glazing: [[[3.2, 2.42], [3.18, 2.8], [3.27, 2.98], [3.44, 3.03], [3.62, 2.98], [3.7, 2.8], [3.68, 2.42]]],
    panel: [[0.0, 0.85], [0.0, 1.27], [0.25, 1.66], [0.5, 1.95], [0.55, 1.4], [0.4, 0.8, 1]],
    lights: [[[0.15, 1.15], [0.35, 1.45], [0.75, 1.5], [0.6, 1.15]]],
  },
  heights: { bottom: 0.8, cantrail: 3.2, roof: 3.56, window: [1.95, 2.55] },
  wheel: 0.92,
  wheelbase: 2.7,
  form: {
    width: 2.73,
    // The body narrows sharply to the roof so it can tilt within the gauge.
    tumblehome: 0.22,
    setback: [[0.5, 1.3], [1.0, 1.9], [1.6, 2.1], [2.2, 1.9], [2.8, 1.3], [3.2, 0.6], [3.56, 0.0]],
    squareness: 1.6,
    // The yellow chin sweeping up both sides of the black upper nose to
    // the windscreen's corners, the lamp pods set in its outer edges; two
    // perforated vents in the black; an orange line over the screen.
    front: {
      depth: 0,
      // The yellow runs on under the black and the screen, so their edges are the only boundaries.
      panel: [
        [0.25, 0.62, 1], [0.15, 0.85], [0.07, 1.25], [0.06, 1.6], [0.09, 1.95], [0.14, 2.25], [0.18, 2.45],
        [0.82, 2.45], [0.86, 2.25], [0.91, 1.95], [0.94, 1.6], [0.93, 1.25], [0.85, 0.85], [0.75, 0.62, 1],
      ],
      dark: [
        [[0.5, 1.56], [0.74, 1.62], [0.78, 1.85], [0.785, 2.46], [0.215, 2.46], [0.22, 1.85], [0.26, 1.62]],
        // The cover's latch slot, low on the chin.
        [[0.41, 0.7], [0.45, 0.7], [0.45, 0.8], [0.41, 0.8]],
      ],
      grilles: [
        [[0.25, 1.98], [0.35, 1.95], [0.37, 2.13], [0.27, 2.18]],
        [[0.75, 1.98], [0.65, 1.95], [0.63, 2.13], [0.73, 2.18]],
      ],
      screens: [[[0.22, 2.4], [0.5, 2.36], [0.78, 2.4], [0.75, 3.1], [0.5, 3.21], [0.25, 3.1]]],
      cantrailLine: [[0.0, 3.1], [0.12, 3.14], [0.24, 3.2], [0.5, 3.31], [0.76, 3.2], [0.88, 3.14], [1.0, 3.1]],
      // Teardrop pods on the corners, the point running up and back; the
      // clear headlamp on the inboard side of each, the red tail lamp outboard.
      headlamps: 'inboard',
      lights: [
        [[0.035, 1.48], [0.08, 1.38], [0.17, 1.37], [0.2, 1.5], [0.18, 1.68], [0.11, 1.88], [0.05, 1.96], [0.035, 1.78]],
        [[0.965, 1.48], [0.92, 1.38], [0.83, 1.37], [0.8, 1.5], [0.82, 1.68], [0.89, 1.88], [0.95, 1.96], [0.965, 1.78]],
      ],
      wipers: [
        { pivot: [0.47, 2.44], tip: [0.21, 2.56] },
        { pivot: [0.79, 2.44], tip: [0.53, 2.56] },
      ],
      // The coupler cover's joints, curving down either side of the chin.
      lines: [
        [[0.23, 1.5], [0.2, 1.2], [0.21, 0.9], [0.27, 0.68]],
        [[0.77, 1.5], [0.8, 1.2], [0.79, 0.9], [0.73, 0.68]],
      ],
    },
    // The cab window's vertical bar.
    side: { bars: [[[3.44, 2.43], [3.44, 3.0]]] },
    antenna: 3.0,
  },
  cab: {
    length: 25.1,
    doors: [{ x: 4.35, w: 0.62, cab: true }, { x: 9.0, w: 0.85 }, { x: 24.09, w: 0.85 }],
    windows: panes([10.36, 11.77], [12.47, 13.88], [14.59, 16.05], [16.7, 18.16], [18.86, 20.32], [20.9, 22.3]),
    bogies: [4.63, 21.78],
    roof: [{ kind: 'pod', x: 4.0, w: 5.0 }],
    under: [[6.6, 19.8]],
  },
  next: {
    length: 23.9,
    doors: [{ x: 1.0, w: 0.85 }, { x: 22.9, w: 0.85 }],
    windows: [[2.4, 21.4, 9]],
    bogies: [3.7, 20.2],
    under: [[5.6, 18.3]],
  },
};

/** Javelin: the bullet nose, pantograph on the driving car. */
export const class395: ClassArt = {
  family: 'javelin',
  nose: {
    profile: [[0.4, 0.5, 1], [0.1, 0.7], [0.0, 1.0], [0.0, 1.12], [0.25, 1.76], [0.5, 2.05], [0.75, 2.26], [1.0, 2.49], [1.5, 2.8], [2.0, 3.08], [2.5, 3.3], [3.0, 3.47], [3.5, 3.59], [4.0, 3.69], [4.5, 3.75], [5.0, 3.78], [5.5, 3.817, 1]],
    surround: [[0.5, 2.1], [1.0, 2.55], [1.6, 2.92], [2.3, 3.22], [2.6, 3.32, 1], [2.55, 2.55], [1.8, 2.35], [1.0, 2.05]],
    windscreen: [[0.65, 2.18], [1.1, 2.55], [1.65, 2.86], [2.3, 3.1], [2.35, 2.65], [1.7, 2.45], [1.05, 2.15]],
    glazing: [[[2.75, 2.35, 1], [2.75, 2.9], [3.15, 3.0, 1], [3.15, 2.35, 1]]],
    panel: [[0.0, 1.0], [0.0, 1.12], [0.25, 1.76], [0.5, 2.05], [0.85, 1.9], [0.6, 1.0, 1]],
    lights: [[[0.2, 1.4], [0.45, 1.75], [0.9, 1.75], [0.65, 1.42]]],
  },
  heights: { bottom: 0.8, cantrail: 3.45, roof: 3.817, window: [2.0, 2.85] },
  wheel: 0.86,
  wheelbase: 2.6,
  cab: {
    length: 20.88,
    doors: [{ x: 3.45, w: 0.5, cab: true }, { x: 5.6, w: 0.95 }, { x: 16.0, w: 0.95 }],
    windows: panes([6.5, 7.95], [8.35, 9.7], [10.15, 11.5], [11.9, 13.3], [13.7, 15.1], [17.5, 18.7], [19.1, 19.75]),
    bogies: [3.3, 18.2],
    roof: [{ kind: 'pantograph', x: 18.0 }],
    under: [[5.0, 16.4]],
  },
  next: {
    length: 20.0,
    doors: [{ x: 1.2, w: 0.95 }, { x: 18.8, w: 0.95 }],
    windows: [[2.5, 17.5, 7]],
    bogies: [3.0, 17.0],
    under: [[4.8, 15.2]],
  },
};

// --- Class 92 and the Caledonian Sleeper's Mk5 --------------------------------

export const class92: ClassArt = {
  family: 'loco',
  nose: {
    profile: [[0.35, 0.85, 1], [0.3, 1.1, 1], [0.3, 2.2, 1], [0.45, 2.6], [0.65, 3.3], [0.8, 3.7], [0.95, 3.96, 1]],
    buffers: 1.07,
    face: {
      depth: 1.6,
      bottom: 1.1,
      panel: box(0, 1.0, 1, 2.45),
      dark: [box(0.03, 2.45, 0.97, 3.5, 0.04)],
      screens: pair(0.05, 2.52, 0.48, 3.42, 0.03),
      lights: lamps(1.6, 1.85),
    },
    glazing: [box(1.1, 2.55, 1.6, 3.2), box(1.7, 2.55, 2.2, 3.2)],
  },
  heights: { bottom: 1.1, cantrail: 3.6, roof: 3.96, window: [1.9, 2.6] },
  wheel: 1.14,
  wheelbase: 4.29,
  cab: {
    length: 21.34,
    doors: [{ x: 2.75, w: 0.7, cab: true }, { x: 18.6, w: 0.7, cab: true }],
    windows: [],
    louvres: [[6.5, 9.5], [12.5, 15.5]],
    bogies: [4.2, 17.13],
    roof: [{ kind: 'pantograph', x: 8.5 }, { kind: 'pantograph', x: 13 }],
    under: [[7.0, 14.4]],
  },
  next: {
    length: 22.2,
    window: [2.0, 2.55],
    doors: [{ x: 1.2, w: 0.85 }],
    windows: [[3.0, 20.5, 8]],
    bogies: [3.4, 18.8],
    under: [[5.4, 16.8]],
  },
};

// --- Stadler KISS (Caltrain) -------------------------------------------------

// Measured off a line-scan photo of set 321-322 (classes/KISS/SOURCES.md),
// a true side elevation: the Caltrain logo's circle comes out round, so its
// two axes share one scale, set by the 157.1 m length of a six-car set.
// Heights are from the rail; the front is read from private photos.

const kissHigh = (x: number, lo: number) => ({ x, w: 1.64, span: [lo, 3.65] as const, window: [2.28, 3.09] as const, panes: [-0.47, 0.47] as const, paneRadius: 0.1 });
const kissLow = (x: number) => ({ x, w: 1.62, leaves: 2 as const, span: [0.79, 2.91] as const, window: [1.4, 2.62] as const, panes: [0.205, 0.615] as const, paneRadius: 0.07 });
/** The upper deck's panes, each set in the black band the livery paints round them. */
const upper = (...spans: (readonly [number, number])[]) => spans.map(([a, b]) => [a, b, 1, [3.64, 4.37]] as const);
const white = '#EEF0F2';
/** The lamp housings: black wedges whose tops follow the white's V. */
const kissLamps: Pt[][] = [
  [[0.035, 1.5, 1], [0.035, 1.93, 1], [0.27, 1.74, 1], [0.27, 1.47, 1]],
  [[0.73, 1.47, 1], [0.73, 1.74, 1], [0.965, 1.93, 1], [0.965, 1.5, 1]],
];

/**
 * Caltrain's double-deck EMU: a raked FLIRT-like cab over a high-floor end,
 * the double deck slung between the bogies. Inactive high-level doors (for
 * future high platforms) stand at each end, the low doors open onto the
 * lower deck.
 */
export const kiss: ClassArt = {
  family: 'kiss',
  nose: {
    // Traced row by row off the line scan of 321 (454 px/m), smoothed by a quartic:
    // upright to the lamps, then one curve whose slope only grows, over into the roof.
    profile: [[0.48, 0.53, 1], [0.2, 0.58], [0.04, 0.75], [0.0, 1.0], [0.0, 1.35], [0.0, 1.6], [0.01, 1.75], [0.07, 2.0], [0.17, 2.25], [0.28, 2.5], [0.42, 2.75], [0.58, 3.0], [0.76, 3.25], [0.96, 3.5], [1.2, 3.75], [1.47, 4.0], [1.73, 4.2], [2.03, 4.4], [2.28, 4.55], [2.49, 4.66], [2.7, 4.74], [2.95, 4.8, 1]],
    // The cab side window and the droplight behind it, in one black band.
    glazing: [[[1.02, 2.4, 1], [1.6, 3.26, 1], [3.52, 3.26, 1], [3.52, 2.4, 1]]],
    // The automatic coupler out ahead of the skirt, between the anticlimbers.
    coupler: { x: 0.0, y: 0.88 },
  },
  // Bottom at the paint's edge over the bogies; the drop centre below it is dark (`under`).
  // The roof drops into a well over each high-floor end (the line scan: 4.52 m), the pods down in it.
  heights: { bottom: 0.75, cantrail: 4.45, roof: 4.8, well: 4.52, window: [1.42, 2.2] },
  wheel: 0.92,
  wheelbase: 2.8,
  cab: {
    length: 27.7,
    doors: [kissHigh(6.305, 1.33), kissLow(9.68), kissLow(20.555), kissHigh(23.925, 1.45)],
    windows: [...panes([10.99, 12.32], [12.75, 14.03], [14.46, 15.77], [16.22, 17.5], [17.93, 19.25]), ...upper([9.29, 10.07], [10.99, 12.32], [12.75, 14.03], [14.46, 15.77], [16.22, 17.5], [17.93, 19.22], [20.17, 20.96])],
    bogies: [5.26, 24.53],
    roof: [{ kind: 'pod', x: 5.4, w: 1.4 }, { kind: 'pod', x: 23.7, w: 0.8 }, { kind: 'pod', x: 25.0, w: 1.5 }],
    // The scan's ramp starts at 3.4 m; here at 3.6, once the nose has reached the crown across its width.
    wells: [[4.1, 6.3], [23.9, 27.7]],
    under: [[7.3, 22.4]],
  },
  next: {
    length: 25.13,
    doors: [kissHigh(3.775, 1.45), kissLow(7.145), kissLow(17.985), kissHigh(21.36, 1.45)],
    windows: [...panes([8.46, 9.74], [10.17, 11.48], [11.93, 12.82]), ...upper([6.73, 7.54], [8.46, 9.74], [10.2, 11.46], [11.93, 13.21], [13.66, 14.94], [15.38, 16.66], [17.6, 18.4])],
    bogies: [2.92, 22.12],
    roof: [{ kind: 'pod', x: 1.0, w: 2.8 }, { kind: 'pod', x: 21.4, w: 3.0 }],
    wells: [[0, 4.0], [21.5, 25.13]],
    under: [[5.5, 19.6]],
  },
  form: {
    width: 3.0,
    tumblehome: 0.15,
    setback: [[0.5, 0.3], [2.0, 0.4], [3.5, 0.55], [4.6, 0.7]],
    squareness: 4,
    // Flat on top with tight shoulders: the cab's face stays broad to the crown (a private head-on photo).
    roofSquareness: 4,
    glazing: 'bonded',
    // Laid on as a long nose's are, so the white round the screen keeps a
    // crisp edge over the nose's curved top rather than blending with the side's red.
    front: {
      depth: 0,
      // Off a private head-on photo: the screen's black ±0.98 m, its lip chamfered in to ±0.66 m at the
      // bottom; the top light's black a trapezoid standing on it (±0.5 m at its foot, ±0.24 m at its top).
      dark: [
        [[0.277, 2.1, 1], [0.155, 2.45, 1], [0.155, 3.63, 1], [0.166, 3.708], [0.195, 3.74, 1], [0.805, 3.74, 1], [0.834, 3.708], [0.845, 3.63, 1], [0.845, 2.45, 1], [0.723, 2.1, 1]],
        [[0.32, 3.7, 1], [0.41, 4.19, 1], [0.59, 4.19, 1], [0.68, 3.7, 1]],
      ],
      // Bonded flush, the glass stopping above the black lip.
      screens: [
        [[0.165, 2.47, 1], [0.165, 3.63, 1], [0.174, 3.695], [0.2, 3.715, 1], [0.8, 3.715, 1], [0.826, 3.695], [0.835, 3.63, 1], [0.835, 2.47, 1]],
        [[0.345, 3.78, 1], [0.42, 4.16, 1], [0.58, 4.16, 1], [0.655, 3.78, 1]],
      ],
      lights: kissLamps,
      lampStyle: 'glazed',
      lampRim: 'black',
      // White up both sides of the screen to the top (±1.08 m at the V, ±1.27 m by the top, the photo's),
      // down to a V under the logo; red outside it, the white skirt below.
      shapes: [
        { pts: [[0.5, 1.53], [0.42, 1.58], [0.137, 2.0, 1], [0.109, 2.5], [0.095, 3.0], [0.064, 3.74], [0.035, 4.3], [0.04, 4.6], [0.07, 4.69], [0.095, 4.74, 1], [0.905, 4.74, 1], [0.93, 4.69], [0.96, 4.6], [0.965, 4.3], [0.936, 3.74], [0.905, 3.0], [0.891, 2.5], [0.863, 2.0, 1], [0.58, 1.58]], color: white },
        { pts: [[0, 0.54, 1], [0, 1.0], [0, 1.41, 1], [1, 1.41, 1], [1, 1.0], [1, 0.54, 1]], color: white },
        // Grey the screen's width (±0.98 m) from it up to the crown (the livery greys the crown); its foot under the black.
        { pts: [[0.157, 3.5, 1], [0.15, 3.9], [0.145, 4.2], [0.137, 4.45], [0.14, 4.6], [0.15, 4.69], [0.17, 4.74, 1], [0.83, 4.74, 1], [0.85, 4.69], [0.86, 4.6], [0.863, 4.45], [0.855, 4.2], [0.85, 3.9], [0.843, 3.5, 1]], color: '#6A7076' },
      ],
      // The coupler's opening in the skirt, and the ribbed anticlimbers either side of it.
      pockets: [{ outline: box(0.39, 0.6, 0.61, 1.12, 0.04), depth: 0.3 }],
      blocks: [{ outline: box(0.16, 0.74, 0.33, 1.26, 0.04), depth: 0.3, ribs: 6 }, { outline: box(0.67, 0.74, 0.84, 1.26, 0.04), depth: 0.3, ribs: 6 }],
      // The unit's number, small, in the red under the V.
      number: { text: '308', at: [0.34, 1.55], height: 0.085, color: '#A3171D' },
    },
  },
  gear: { coupler: 'scharfenberg' },
};
