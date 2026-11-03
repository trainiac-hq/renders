import type { ClassArt, Face, LampSpot, Nose, Pt } from '../model/types';
import { box, gangwayLines, lamps, pair, panes, peanut, rrect, saloon } from '../model/shapes';
import { carOf, faceU, mirror, type CarSpec } from '../model/spec';
import { defaultForm, noseHalfWidth } from '../pipeline/shell';
import spec357 from './357/spec.json';
import spec375 from './375/spec.json';
import spec376 from './376/spec.json';
import spec378 from './378/spec.json';
import spec379 from './379/spec.json';
import spec387 from './387/spec.json';
import spec377 from './377/spec.json';

// The Bombardier Electrostar family: 357, 375, 376, 377, 378, 379, 387.

const coupler = box(0.41, 0.45, 0.59, 0.85, 0.03);

// --- Electrostar ------------------------------------------------------------

/** The gangwayed Electrostar: a yellow door in a black mask, lamps in pods. */
const electrostarGangway: Nose = {
  profile: [[0.45, 0.45, 1], [0.44, 1.0], [0.05, 1.15], [0.0, 1.3], [0.0, 3.2], [0.3, 3.45], [0.6, 3.6], [1.0, 3.78, 1]],
  face: {
    depth: 1.7,
    bottom: 0.9,
    panel: box(0, 0.9, 1, 1.92),
    dark: [...pair(0.02, 1.9, 0.43, 3.28, 0.12), ...pair(0.03, 1.02, 0.32, 1.55, 0.1), coupler],
    gangway: box(0.38, 0.95, 0.62, 3.42, 0.08),
    lines: gangwayLines(0.38, 0.62, 0.95, 3.42),
    screens: pair(0.06, 1.98, 0.37, 3.2, 0.08),
    lights: pair(0.06, 1.12, 0.26, 1.42, 0.045),
  },
};

const electrostarCab = (length: number, doors: [number, number], bogies: number[]) => ({
  length,
  doors: [{ x: 1.9, w: 0.75, cab: true }, { x: doors[0], w: 1.4, leaves: 2 as const }, { x: doors[1], w: 1.4, leaves: 2 as const }],
  windows: panes([2.45, 3.16], [3.37, 5.0], [7.04, 8.67], [8.87, 10.46], [10.66, 12.24], [12.44, 14.08], [16.17, 17.75], [17.95, 19.58]),
  bogies,
  roof: [{ kind: 'pod' as const, x: doors[0] - 1.1, w: 2.2 }, { kind: 'pod' as const, x: doors[1] - 1.1, w: 2.2 }],
  under: [[5.0, 15.8] as const],
});

/**
 * The 377/4 as measured (classes/377/spec.json): the gangway standing out
 * ahead of a flat face in a dark frame, a yellow cap over the screens with
 * the orange line under it, yellow under each screen with the number and a
 * figure-of-eight lamp bezel, the headlamp outboard and higher.
 */
function electrostar377(): ClassArt {
  const m = spec377.model;
  const f = m.face;
  const u = faceU(f.halfWidth);
  const both = (pts: Pt[]) => [u(pts), u(mirror(pts))];
  const sc = f.screen;
  const surround = rrect(sc.inner, sc.lo, sc.outer, sc.hi, [sc.rBottom, sc.rTop * 0.6, sc.rTop, sc.rBottom]);
  const glass = rrect(sc.inner + sc.frame, sc.lo + sc.frame, sc.outer - sc.frame, sc.hi - sc.frame, [0.02, sc.rTop * 0.5, sc.rTop * 0.8, 0.02]);
  const pn = f.panel;
  const panel = rrect(pn.inner, pn.lo, pn.outer, pn.hi, [0, 0, 0, pn.rOuterBottom]);
  const cap: Pt[] = [
    [-1.36, f.cap.lo, 1], [1.36, f.cap.lo, 1], [1.34, f.cap.hiSide - 0.03], [1.24, f.cap.hiSide + 0.05], [1.0, f.cap.hiSide + 0.12],
    [0.55, f.cap.hiCentre - 0.03], [0, f.cap.hiCentre], [-0.55, f.cap.hiCentre - 0.03], [-1.0, f.cap.hiSide + 0.12], [-1.24, f.cap.hiSide + 0.05], [-1.34, f.cap.hiSide - 0.03],
  ];
  const { head, tail, rim } = f.lamps;
  const bezel = peanut([tail.m, tail.y, tail.r + rim], [head.m, head.y, head.r + rim], 0.025);
  const gf = f.gangwayFrame;
  const gd = f.gangwayDoor;
  const w = f.wiper;
  const face: Face = {
    depth: 1.7,
    bottom: 0.4,
    panels: [...both(panel), u(cap)],
    dark: [...both(surround), box(0.38, 0.45, 0.62, 0.86, 0.03)],
    gangway: u(rrect(-gd.half, gd.lo, gd.half, gd.hi, [0.03, 0.06, 0.06, 0.03])),
    gangwayFrame: { outline: u(rrect(-gf.half, gf.lo, gf.half, gf.hi, [0.04, gf.r, gf.r, 0.04])), depth: gf.depth, seams: gd.seams, color: gf.color },
    screens: both(glass),
    lights: both(bezel),
    shapes: [{ pts: u(rrect(-1.36, f.capLine.lo, 1.36, f.capLine.hi, [0, 0, 0, 0])), color: spec377.model.livery.orange }],
    wipers: [
      { pivot: u([[w.pivot[0], w.pivot[1]]])[0] as [number, number], tip: u([[w.tip[0], w.tip[1]]])[0] as [number, number] },
      { pivot: u([[-w.pivot[0], w.pivot[1]]])[0] as [number, number], tip: u([[-w.tip[0], w.tip[1]]])[0] as [number, number] },
    ],
    number: { text: f.number.text, at: u([[f.number.m, f.number.y]])[0] as [number, number], height: f.number.height, color: '#1A1A1A', both: true },
    lampRim: 'black',
    tailLens: 'clear',
  };
  const cab = carOf(m.cab as unknown as CarSpec);
  const [x0, x1, y0, y1] = m.cab.panes[0];
  return {
    family: 'electrostar',
    nose: { profile: m.nose.profile as unknown as Pt[], glazing: [box(x0, y0, x1, y1, 0.06)], face },
    heights: { ...m.heights, window: m.heights.window as [number, number] },
    windowRadius: m.windowRadius,
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: { ...cab, under: [[4.6, 15.6]] },
    next: { ...carOf(m.next as unknown as CarSpec), under: [[4.6, 15.4]] },
  };
}

export const class377: ClassArt = electrostar377();

// --- Built from a measured spec ---------------------------------------------

/**
 * A face feature in a spec (classes/<code>/spec.json `face`), in metres:
 * m across from the centre line (positive to the right as seen head-on,
 * the near side), y up from the rail. A polygon, a rounded rectangle
 * [m0, lo, m1, hi, radii bottom-left, bottom-right, top-right, top-left],
 * or a figure-of-eight bezel round two lamps [m, y, r]; `mirror` repeats it
 * on the other side of the centre line.
 */
type SpecShape = {
  poly?: number[][];
  rrect?: [number, number, number, number, number[]];
  peanut?: number[][];
  mirror?: boolean;
  colour?: string;
  /** Corner rounding in metres, for a small shape (the default would blunt it). */
  radius?: number;
};
// A marker or spot is a small clear lamp, drawn as a headlamp is.
type SpecLamp = { kind: 'head' | 'tail' | 'marker' | 'spot'; m: number; y: number; r: number };
type SpecScreen = { m0: number; m1: number; lo: number; hi: number; r: number[]; frame: number };
type SpecFace = {
  halfWidth: number;
  kind: 'gangway' | 'door' | 'plain';
  gangwayFrame?: { half: number; lo: number; hi: number; r: number; depth: number; color: string; bellows?: string };
  gangwayDoor?: { half: number; lo: number; hi: number; seams: number[] };
  frontDoor?: { half: number; lo: number; hi: number; r: number; upperDark?: number; seal?: number; handle?: SpecShape };
  screens: SpecScreen[];
  darks?: SpecShape[];
  panels?: SpecShape[];
  shapes?: SpecShape[];
  lamps?: { housing: SpecShape; units: SpecLamp[]; mirror?: boolean }[];
  number?: { text: string; m: number; y: number; height: number; colour?: string; both?: boolean };
  wipers?: { pivot: number[]; tip: number[] }[];
  tailLens?: 'red' | 'clear';
  /** The recessed lamp housing's back, a livery colour name (the 375's yellow plate). */
  lampBack?: string;
};
export type ElectrostarSpec = {
  model: {
    heights: { bottom: number; cantrail: number; roof: number; window: number[] };
    wheel: number;
    wheelbase: number;
    windowRadius?: number;
    cab: CarSpec & { panes?: number[][] };
    next: CarSpec;
    nose: { profile: number[][] };
    face: SpecFace;
  };
};

/** A face shape's colour: a name from the livery's colours, or a hex as given. */
function colourOf(colours: Record<string, unknown>, name: string | undefined): string {
  const c = name === undefined ? undefined : colours[name];
  if (typeof c === 'string') return c;
  if (name?.startsWith('#')) return name;
  throw new Error(`no livery colour named ${name}`);
}

const toPt = (p: number[]): Pt => (p[2] === 1 ? [p[0], p[1], 1] : [p[0], p[1]]);

/** A spec shape as outlines in metres, one per side it's on. */
function outlines(sh: SpecShape): Pt[][] {
  let pts: Pt[];
  if (sh.poly) pts = sh.poly.map(toPt);
  else if (sh.rrect) {
    const [m0, lo, m1, hi, r] = sh.rrect;
    const [bl, br, tr, tl] = r;
    pts = rrect(m0, lo, m1, hi, [bl, tl, tr, br]);
  } else if (sh.peanut) {
    const [a, b] = sh.peanut;
    pts = peanut([a[0], a[1], a[2]], [b[0], b[1], b[2]], 0.025);
  } else throw new Error('a face shape needs poly, rrect or peanut');
  return sh.mirror ? [pts, mirror(pts)] : [pts];
}

/**
 * An Electrostar built from its measured spec: the body, doors and windows
 * of `model.cab` and `model.next`, the nose profile, and the face drawn
 * from `model.face` (a standing-out gangway, a door set in the face, or
 * screens alone). `colours` names the livery colours the face's painted
 * shapes use.
 */
export function electrostarFromSpec(spec: ElectrostarSpec, colours: Record<string, unknown>): ClassArt {
  const m = spec.model;
  const cab = carOf(m.cab);
  const body = (face: Face): ClassArt => ({
    family: 'electrostar',
    nose: {
      profile: m.nose.profile.map(toPt),
      ...(m.cab.panes?.length ? { glazing: m.cab.panes.map(([x0, x1, y0, y1]) => box(x0, y0, x1, y1, 0.06)) } : {}),
      face,
    },
    heights: { ...m.heights, window: [m.heights.window[0], m.heights.window[1]] },
    ...(m.windowRadius !== undefined ? { windowRadius: m.windowRadius } : {}),
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: { ...cab, under: cab.under ?? [[4.6, 15.6]] },
    next: { ...carOf(m.next), under: m.next.under ?? [[4.6, 15.4]] },
  });
  // Placed first with the face's nominal width, then again in true metres
  // across the body as built at each height (see acrossFace).
  const draft = body(faceOf(spec, colours, (pts) => faceU(m.face.halfWidth)(pts.map((p) => (p.length === 3 ? [-p[0], p[1], 1] : [-p[0], p[1]]) as Pt))));
  return body(faceOf(spec, colours, acrossFace(draft)));
}

/**
 * Metres across a face as u across it: u is taken over the body's width
 * at each height (the pipeline's `faceWidth`: the section, narrower above
 * the waist with the tumblehome, held at the cantrail above it), so a
 * point measured m metres from the centre line lands m metres out. A
 * spec's m is positive to the right as seen head-on, the train's left
 * looking forward: the near side, the hero view's, which the scene puts at
 * negative z, at u below 0.5.
 */
function acrossFace(art: ClassArt): (pts: Pt[]) => Pt[] {
  const hw = noseHalfWidth(art, art.form ?? defaultForm);
  const top = art.heights.cantrail;
  return (pts) =>
    pts.map((p) => {
      // Past the body's edge is the edge: the pipeline runs shapes at u 0 or 1 on round the corner.
      const u = Math.min(1, Math.max(0, 0.5 - p[0] / (2 * hw(Math.min(p[1], top)))));
      return (p.length === 3 ? [u, p[1], 1] : [u, p[1]]) as Pt;
    });
}

/** The face of a spec, its metres turned into u across the face by `u`. */
function faceOf(spec: ElectrostarSpec, colours: Record<string, unknown>, u: (pts: Pt[]) => Pt[]): Face {
  const f = spec.model.face;
  const all = (shapes: SpecShape[] | undefined) => (shapes ?? []).flatMap(outlines).map(u);
  const surrounds: Pt[][] = [];
  const glass: Pt[][] = [];
  for (const sc of f.screens) {
    const [bl, br, tr, tl] = sc.r;
    surrounds.push(u(rrect(sc.m0, sc.lo, sc.m1, sc.hi, [bl, tl, tr, br])));
    const k = sc.frame;
    const inner = (r: number) => Math.max(0.02, r - k);
    glass.push(u(rrect(sc.m0 + k, sc.lo + k, sc.m1 - k, sc.hi - k, [inner(bl), inner(tl), inner(tr), inner(br)])));
  }
  const lights: Pt[][] = [];
  const lampUnits: LampSpot[][] = [];
  for (const l of f.lamps ?? []) {
    const sides = l.mirror ? [1, -1] : [1];
    for (const s of sides) {
      const housing = outlines({ ...l.housing, mirror: false })[0];
      lights.push(u(s > 0 ? housing : mirror(housing)));
      lampUnits.push(l.units.map((x) => ({ kind: x.kind === 'tail' ? ('tail' as const) : ('head' as const), at: u([[s * x.m, x.y]])[0] as [number, number], r: x.r })));
    }
  }
  const at = (p: number[]) => u([[p[0], p[1]]])[0] as [number, number];
  const face: Face = {
    depth: 1.7,
    bottom: 0.4,
    panels: all(f.panels),
    dark: [...surrounds, ...all(f.darks)],
    screens: glass,
    lights,
    lampUnits,
    shapes: (f.shapes ?? []).flatMap((sh) => outlines(sh).map((pts) => ({ pts: u(pts), color: colourOf(colours, sh.colour), ...(sh.radius !== undefined ? { radius: sh.radius } : {}) }))),
    ...(f.wipers ? { wipers: f.wipers.map((w) => ({ pivot: at(w.pivot), tip: at(w.tip) })) } : {}),
    ...(f.number
      ? { number: { text: f.number.text, at: at([f.number.m, f.number.y]), height: f.number.height, color: f.number.colour ? colourOf(colours, f.number.colour) : '#1A1A1A', both: !!f.number.both } }
      : {}),
    lampRim: 'black',
    tailLens: f.tailLens ?? 'clear',
    ...(f.lampBack ? { lampBack: colourOf(colours, f.lampBack) } : {}),
  };
  if (f.kind === 'gangway' && f.gangwayFrame && f.gangwayDoor) {
    const gf = f.gangwayFrame;
    const gd = f.gangwayDoor;
    face.gangway = u(rrect(-gd.half, gd.lo, gd.half, gd.hi, [0.03, 0.06, 0.06, 0.03]));
    face.gangwayFrame = { outline: u(rrect(-gf.half, gf.lo, gf.half, gf.hi, [0.04, gf.r, gf.r, 0.04])), depth: gf.depth, seams: gd.seams, color: gf.color, ...(gf.bellows ? { bellows: gf.bellows } : {}) };
  }
  if (f.kind === 'door' && f.frontDoor) {
    // A door in the face, flush (the 378's detrainment door): its seal as
    // a line round it, its handle recess dark; its colours are the face's
    // own (the spec's darks give a black upper half).
    const d = f.frontDoor;
    const outline = u(rrect(-d.half, d.lo, d.half, d.hi, [d.r, d.r, d.r, d.r]));
    face.lines = [[...outline, outline[0]]];
    if (d.handle) face.dark = [...(face.dark ?? []), ...outlines(d.handle).map(u)];
  }
  return face;
}

/**
 * The face as one operator paints it differently (spec `liveries.<key>.faceShapes`):
 * the class's face with those shapes added, for `byOperator`.
 */
function faceFor(art: ClassArt, spec: ElectrostarSpec, shapes: SpecShape[], colours: Record<string, unknown>): Partial<ClassArt> {
  const u = acrossFace(art);
  const face = art.nose.face!;
  const extra = shapes.flatMap((sh) => outlines(sh).map((pts) => ({ pts: u(pts), color: colourOf(colours, sh.colour), ...(sh.radius !== undefined ? { radius: sh.radius } : {}) })));
  return { nose: { ...art.nose, face: { ...face, shapes: [...(face.shapes ?? []), ...extra] } } };
}

/** The Electrostar as first drawn, before the 377 was measured: the 375, 379 and 387 still use it. */
const electrostarBase: ClassArt = {
  family: 'electrostar',
  nose: electrostarGangway,
  heights: { bottom: 0.9, cantrail: 3.43, roof: 3.78, window: [1.95, 2.95] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: electrostarCab(20.4, [6.02, 15.15], [3.37, 17.54]),
  next: {
    ...saloon(19.99, [4.9, 15.0], [2.9, 17.1], 1.4, 1.65),
    roof: [{ kind: 'pod', x: 3.8, w: 2.2 }, { kind: 'pod', x: 13.9, w: 2.2 }],
    under: [[5.0, 15.0]],
  },
};

export const class375: ClassArt = electrostarFromSpec(spec375 as unknown as ElectrostarSpec, spec375.liveries.SE);

/**
 * The 357 as measured (classes/357/spec.json): no gangway, two panes
 * behind a central pillar in one black opening, magenta beside it, the
 * yellow a shield under it with the lamps, a separate red tail inboard.
 */
export const class357: ClassArt = electrostarFromSpec(spec357 as unknown as ElectrostarSpec, spec357.liveries.CC);

/**
 * The 379 as measured (classes/379/spec.json): the 377/4's face on a white
 * body, lower face white, a warning triangle on the left panel; doors
 * 1.63 m wide at 5.49 and 14.80 m.
 */
export const class379: ClassArt = electrostarFromSpec(spec379 as unknown as ElectrostarSpec, spec379.liveries.GN);

/**
 * The 387 as measured (classes/387/spec.json): the 377/4's face and body,
 * a narrow and a wide window ahead of the first door. GWR paints a green
 * plate on the dome; Heathrow Express the gangway door black above 2.06 m.
 */
const spec387Built = spec387 as unknown as ElectrostarSpec;
const colours387 = { ...spec387.liveries.GW, destScreen: '#E8792A' };
const base387 = electrostarFromSpec(spec387Built, colours387);
// Heathrow Express: the gangway door black above 2.06 m, yellow below (f-gangway-133); the
// black comes from the livery's gangway colour, the yellow is painted over the door's lower part.
function hxFace(): Partial<ClassArt> {
  const own = faceFor(base387, spec387Built, spec387.liveries.HX.faceShapes.filter((sh) => 'rrect' in sh) as SpecShape[], spec387.liveries.HX);
  const face = own.nose!.face!;
  const split = (spec387.liveries.HX.faceShapes[0] as { rrect: number[] }).rrect[1];
  return { nose: { ...own.nose!, face: { ...face, gangwayFrame: { ...face.gangwayFrame!, lower: { to: split, color: spec387.liveries.HX.yellow } } } } };
}
export const class387: ClassArt = {
  ...base387,
  byOperator: {
    GW: faceFor(base387, spec387Built, spec387.liveries.GW.faceShapes as SpecShape[], spec387.liveries.GW),
    HX: hxFace(),
  },
};

/**
 * The 378 as measured (classes/378/spec.json): a flush detrainment door in
 * the middle of the face, black above 1.89 m, between two screens; lamp
 * clusters in black bezels with a round lamp over the left one; yellow
 * above an orange waist line and a blue band; doors 1.55 m wide.
 */
export const class378: ClassArt = electrostarFromSpec(spec378 as unknown as ElectrostarSpec, spec378.liveries.LO);

/**
 * The 376 as measured (classes/376/spec.json): no gangway, three equal
 * panes in one black band with three wipers, one yellow band with the
 * lamps, navy above and below; doors 1.50 m wide at 5.72 and 14.32 m.
 */
export const class376: ClassArt = electrostarFromSpec(spec376 as unknown as ElectrostarSpec, spec376.liveries.SE);
