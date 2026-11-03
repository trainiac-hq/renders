import type { Car, ClassArt, Nose, Pt } from '../model/types';
import { carOf, type CarSpec } from '../model/spec';
import spec800 from './800/spec.json';


// Hitachi AT300: IET, Azuma, Nova 1, Paragon, Lumo, Evero, Aurora.

// The nose's centre line from the WestRail642fan 800/0 diagram (classes/800/
// spec.json trace `nose`): the same as before above about 2.7 m, but the
// face below it sits lower, the windscreen reaching down to about 2.0 m,
// the tip at 0.94 m and the nose's foot at 0.44 m, under the skirt. The
// face's other outlines moved down with it (heights mapped 0.85/0.92/2.13/
// 2.41/3.33 m to 0.44/0.52/1.65/2.0/3.33 m, each point kept as far behind
// the centre line as it was).
const atNose: Nose = {
  profile: [
    [1.95, 0.85, 1], [0.92, 0.56], [0.36, 0.44], [0.12, 0.56], [0.05, 0.68], [0.0, 0.94], [0.02, 1.09], [0.14, 1.24], [0.23, 1.39], [0.4, 1.55],
    [0.57, 1.7], [0.88, 1.94], [1.09, 2.15], [1.26, 2.3], [1.54, 2.45], [1.78, 2.6], [2.05, 2.75], [2.36, 2.9], [2.7, 3.06], [3.08, 3.21],
    [3.6, 3.36], [4.42, 3.51], [5.56, 3.6, 1],
  ],
  surround: [[0.554, 2.014], [1.608, 2.824], [3.143, 3.38], [3.87, 3.42], [3.309, 2.535], [2.514, 2.333], [1.437, 1.862]],
  windscreen: [[0.633, 2.13], [1.585, 2.766], [2.816, 3.243], [3.206, 3.287], [2.868, 2.969], [1.759, 2.535], [1.004, 2.014]],
  glazing: [[[3.62, 2.82], [3.85, 3.02], [4.05, 3.13], [4.2, 3.1], [4.24, 2.95], [4.16, 2.83], [3.95, 2.79]]],
  panel: [[-0.051, 0.641], [-0.026, 1.155], [0.228, 1.641], [0.679, 1.887], [0.734, 1.155], [0.292, 0.497, 1]],
  lights: [[[0.362, 1.23], [0.784, 1.547], [0.933, 1.398], [0.484, 1.155]]],
};

const atCab: Car = {
  length: 25.85,
  doors: [{ x: 4.6, w: 0.6, cab: true }, { x: 8.05, w: 0.9 }, { x: 23.0, w: 0.9 }],
  windows: [[9.9, 21.3, 6]],
  bogies: [5.0, 21.5],
  roof: [{ kind: 'pod', x: 5.4, w: 13.8 }, { kind: 'pantograph', x: 23.8 }],
  under: [[7.3, 19.3]],
};

/** The long Hitachi nose with its hood over the screen and teardrop cab window. */
export const at300: ClassArt = {
  family: 'iet',
  nose: atNose,
  heights: { bottom: 0.85, cantrail: 3.25, roof: 3.6, window: [1.97, 2.76] },
  wheel: 0.86,
  wheelbase: 2.7,
  form: {
    width: 2.7,
    tumblehome: 0.12,
    setback: [[0.85, 2.3], [1.4, 2.4], [2.0, 2.1], [2.5, 1.6], [2.9, 1.0], [3.3, 0.5], [3.6, 0.0]],
    squareness: 1.3,
    // The yellow nose cone below one tall rounded windscreen in a grey
    // frame, a camera box over the screen and the orange line over both;
    // lamp clusters in black recesses either side of the yellow's top; a
    // grey valance along the bottom.
    front: {
      depth: 0,
      // Up under the windscreen's frame, so the frame is the yellow's top edge.
      panel: [[0.2, 2.4], [0.5, 2.4], [0.8, 2.4], [0.81, 2.0], [0.8, 1.55], [0.75, 1.15], [0.64, 0.95], [0.5, 0.92], [0.36, 0.95], [0.25, 1.15], [0.2, 1.55], [0.19, 2.0]],
      rise: 0.03,
      // The grey valance under the yellow, at the nose's foot.
      shapes: [{ pts: [[0.1, 0.46], [0.5, 0.46], [0.9, 0.46], [0.88, 0.53], [0.5, 0.505], [0.12, 0.53]], color: 'under' }],
      dark: [[[0.39, 3.43, 1], [0.5, 3.42], [0.61, 3.43, 1], [0.61, 3.55, 1], [0.5, 3.56], [0.39, 3.55, 1]]],
      screens: [
        [[0.08, 2.275], [0.11, 2.072], [0.5, 2.0], [0.89, 2.072], [0.92, 2.275], [0.92, 2.824], [0.85, 3.113], [0.5, 3.33], [0.15, 3.113], [0.08, 2.824]],
        [[0.44, 3.465], [0.5, 3.46], [0.56, 3.465], [0.56, 3.515], [0.5, 3.52], [0.44, 3.515]],
      ],
      cantrailLine: [[0.0, 3.12], [0.06, 3.2], [0.16, 3.28], [0.32, 3.37], [0.5, 3.41], [0.68, 3.37], [0.84, 3.28], [0.94, 3.2], [1.0, 3.12]],
      wipers: [{ pivot: [0.78, 2.13], tip: [0.3, 3.03] }],
      // The joint up the middle of the cone, where the coupler cover parts.
      lines: [
        [[0.5, 2.36], [0.5, 0.95]],
        // The cone's own joint, where it meets the green cheek.
        [[0.805, 2.38], [0.815, 2.0], [0.805, 1.55], [0.755, 1.14], [0.645, 0.94], [0.5, 0.91], [0.355, 0.94], [0.245, 1.14], [0.195, 1.55], [0.185, 2.0], [0.195, 2.38]],
      ],
    },
    // The cab side window's grey surround, tapering forward and down.
    side: {
      // The cab window's grey surround, tapering forward and down to a point.
      dark: [[[2.7, 2.6], [3.25, 2.76], [3.6, 3.06], [3.95, 3.25], [4.28, 3.24], [4.37, 2.95], [4.28, 2.69], [3.8, 2.63], [3.05, 2.57]]],
      // Lamp clusters: long slanted housings running back under the
      // windscreen's lower corners: red tail low and forward, headlamp high
      // and behind it up the slant.
      lights: [[[1.42, 2.08], [1.52, 2.24], [1.78, 2.42], [2.1, 2.47], [2.16, 2.33], [1.88, 2.17], [1.55, 2.02], [1.46, 2.0]]],
      // An access hatch on the flank behind the lamp.
      lines: [[[2.58, 1.11, 1], [2.98, 1.11, 1], [2.91, 1.48, 1], [2.51, 1.48, 1]]],
    },
  },
  cab: atCab,
  next: {
    length: 26,
    doors: [{ x: 1.7, w: 0.9 }],
    windows: [[3.1, 23.4, 11]],
    bogies: [4.5, 21.5],
    roof: [{ kind: 'pod', x: 3.6, w: 18 }],
    under: [[6.6, 19.4]],
  },
};

/**
 * The GWR 800/0 as measured (classes/800/spec.json): its doors and windows
 * where the side drawing puts them along each car, the windows' heights
 * from a photograph, and the yellow as a near-rectangle from the screen
 * frame to the valance, the lamp covers outside it beside its top corners.
 */
function iet800(): ClassArt {
  const m = spec800.model;
  const front = at300.form!.front!;
  const seam = m.front.coneSeam as unknown as Pt[];
  return {
    ...at300,
    // The side view's lamp is the measured cover, so the side's paint and the modelled lamp agree.
    nose: { ...atNose, lights: [m.lamp.glazing as unknown as Pt[]] },
    heights: { ...at300.heights, window: m.heights.window as [number, number] },
    form: {
      ...at300.form!,
      // The plan carried down to the nose's foot (Evero and Aurora keep theirs).
      setback: [[0.44, 2.3], ...at300.form!.setback],
      side: {
        ...at300.form!.side!,
        // One flush clear cover per side, measured (spec lamp).
        lights: [m.lamp.glazing as unknown as Pt[]],
        lampUnits: m.lamp.units as { kind: 'head' | 'tail'; at: [number, number]; r: number }[],
      },
      front: {
        ...front,
        lampStyle: 'glazed',
        panel: m.front.panel as unknown as Pt[],
        // The cone's seam arching right across the yellow to its edges on
        // both sides (p311, p313, p002: it ends at the lamps' lower inner
        // corners), and the coupler cover's split from it down to the
        // cone's foot: the real joints. The yellow's edges are paint, with no line.
        lines: [],
        edgeLines: [seam, [[0.5, seam[2][1]], [0.5, 0.53]]],
      },
    },
    cab: { ...atCab, ...carOf(m.cab as unknown as CarSpec), roof: atCab.roof, under: atCab.under },
    next: { ...at300.next, ...carOf(m.next as unknown as CarSpec), roof: at300.next.roof, under: at300.next.under },
  };
}

export const class800: ClassArt = iet800();

/**
 * The 801, 802 and 803: the same AT300 cab end as the 800, so the same
 * measured lamps and joints, on the body as drawn before (their sides
 * aren't measured yet).
 */
export const at300Front: ClassArt = { ...at300, form: class800.form };

// The 800's head-on drawing and flank details are its own: these noses
// keep the body's section and draw their features from the side.
const { front: _front, side: _side, ...atForm } = at300.form!;

/** Avanti's Evero: the same body behind a shorter nose with a dark, rounded beak. */
export const evero: ClassArt = {
  ...at300,
  form: atForm,
  nose: {
    profile: [[0.4, 0.85, 1], [0.0, 1.1], [0.0, 1.45], [0.25, 1.85], [0.75, 2.2], [1.6, 2.75], [2.6, 3.25], [3.6, 3.52], [4.5, 3.6, 1]],
    surround: [[0.0, 1.1], [0.02, 1.5], [0.3, 1.9], [0.8, 2.25], [1.6, 2.8], [2.6, 3.3], [3.3, 3.48], [3.05, 2.9], [1.8, 2.35], [1.1, 1.95], [0.8, 1.2, 1], [0.4, 0.92, 1]],
    windscreen: [[0.95, 2.35], [1.8, 2.85], [2.7, 3.28], [3.2, 3.42], [3.0, 3.0], [1.9, 2.5], [1.2, 2.2]],
    glazing: [[[2.6, 2.75], [3.55, 3.25], [3.85, 3.2], [3.7, 2.72]]],
    glazingOnNose: true,
    lights: [[[1.25, 2.02], [1.9, 2.2], [1.95, 2.02], [1.35, 1.88]]],
  },
};

/** EMR's Aurora: 24 m cars and a shorter, steeper nose. */
export const aurora: ClassArt = {
  ...at300,
  form: atForm,
  nose: {
    profile: [[0.3, 0.85, 1], [0.0, 1.0], [0.0, 1.35], [0.07, 1.83], [0.24, 2.16], [1.2, 2.97], [2.3, 3.58], [3.25, 3.75, 1]],
    surround: [[0.2, 2.12], [1.2, 2.93], [1.55, 3.12], [1.55, 2.6], [0.6, 2.0]],
    windscreen: [[0.26, 2.17], [1.2, 2.94], [1.45, 3.05], [1.42, 2.66], [0.6, 2.05]],
    glazing: [[[2.25, 2.95], [2.5, 3.35], [3.3, 3.35], [3.3, 2.75], [2.6, 2.75]]],
    // The nose cone below the screen, in front of the panel joint.
    panel: [[0.0, 0.95], [0.0, 1.35], [0.07, 1.83], [0.24, 2.16], [0.8, 2.6], [1.62, 2.75, 1], [1.52, 0.95, 1]],
    lights: [[[0.45, 1.62], [1.0, 1.95], [1.1, 1.75], [0.6, 1.5]]],
    // The cone's joint runs with the yellow's edge: the paint edge shows it, no line (pipeline/frontface.ts).
    lines: [[[1.62, 2.75], [1.7, 3.15]]],
  },
  heights: { bottom: 0.85, cantrail: 3.38, roof: 3.75, window: [1.95, 2.75] },
  cab: {
    ...atCab,
    length: 24,
    doors: [{ x: 4.1, w: 0.6, cab: true }, { x: 6.9, w: 0.9 }, { x: 21.2, w: 0.9 }],
    windows: [[8.5, 19.7, 6]],
    bogies: [3.75, 20.0],
    roof: [{ kind: 'pod', x: 4.6, w: 13 }, { kind: 'pantograph', x: 22 }],
    under: [[6.0, 17.8]],
  },
  next: { ...at300.next, length: 24, windows: [[3.1, 21.6, 10]], bogies: [4.0, 20.0] },
};
