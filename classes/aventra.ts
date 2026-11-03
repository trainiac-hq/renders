import type { ClassArt, Face, Form, Pt } from '../model/types';
import { rrect } from '../model/shapes';
import { carOf, faceU, mirror, type CarSpec } from '../model/spec';
import spec345 from './345/spec.json';
import spec710 from './710/spec.json';
import spec701 from './701/spec.json';
import spec720 from './720/spec.json';
import spec730 from './730/spec.json';

// Bombardier / Alstom Aventra: 345, 701, 710, 720, 730, each built from its
// measured spec (classes/<code>/spec.json, every number's source in its
// `trace`). The family shares a cab structure and a raked flat face, but
// every customer's face is its own: the spec describes it in metres
// across the face (m, 0 on the centre line, the right half given and
// mirrored) and up from the rail (y).

/** A rounded rectangle as the spec gives it: half its width about the centre line, or inner and outer edges. */
type Box = {
  half?: number;
  /** With `half`: the half width at the top, the sides straight between (a windscreen narrower at its foot). */
  halfTop?: number;
  inner?: number;
  outer?: number;
  lo: number;
  hi: number;
  r?: [number, number, number, number] | number;
};

type FaceSpec = {
  halfWidth: number;
  /** The black mask, right half: from the centre line at its top round to the centre line at its bottom. */
  mask?: Pt[];
  /** More dark areas, right half, mirrored: a bumper, a gangway surround. */
  dark?: Box[];
  /** Dark areas across the centre line, drawn as given. */
  darkCentre?: Box[];
  /** Warning panels, right half, mirrored, and across the centre line. */
  panels?: Box[];
  panelPaths?: Pt[][];
  panelCentre?: Box[];
  /** The windscreen across the centre line (a gangwayed cab has only its side screens). */
  screen?: Box;
  /** Extra glass, mirrored (side screens of a gangwayed cab). */
  screens?: Box[];
  pods: Box[];
  /** Pods as measured outlines instead (right half, mirrored; third element 1 = sharp corner). */
  podPaths?: Pt[][];
  headlamps?: Face['headlamps'];
  lampRim?: Face['lampRim'];
  lampStyle?: Face['lampStyle'];
  glazedTail?: 'red';
  /** Measured lamps, right half (mirrored): kind, [m, y], radius. */
  lampUnits?: { kind: 'head' | 'tail'; m: number; y: number; r: number }[];
  tailLens?: Face['tailLens'];
  grilles?: Box[];
  /** Panel seams and mouldings, right half, mirrored (open paths). */
  lines?: Pt[][];
  /** Seams across the centre line (closed boxes). */
  lineBoxes?: Box[];
  /** Painted areas: full outlines in metres, or a right half mirrored into one shape. */
  shapes?: { pts: Pt[]; color: string; half?: boolean; wraps?: boolean }[];
  wipers?: { pivot: [number, number]; tip: [number, number] }[];
  number?: { text: string; m: number; y: number; height: number; color?: string; both?: boolean };
  gangwayDoor?: Box;
  gangwayFrame?: { box: Box; depth: number; seams?: number[]; color?: string };
  /** Openings cut back into the face (the coupler's recess), with their depth. */
  recesses?: (Box & { depth: number })[];
};

export type AventraSpec = {
  heights: { bottom: number; cantrail: number; roof: number; window: number[] };
  wheel: number;
  wheelbase: number;
  windowRadius?: number;
  cab: CarSpec & { under?: number[][]; glazing?: Pt[][] };
  next: CarSpec & { under?: number[][] };
  nose: { profile: Pt[] };
  form: Form;
  face: FaceSpec;
};

const corners = (r: Box['r']): [number, number, number, number] => (Array.isArray(r) ? r : [r ?? 0, r ?? 0, r ?? 0, r ?? 0]);
const boxPts = (b: Box): Pt[] => {
  const [x0, x1] = b.half !== undefined ? [-b.half, b.half] : [b.inner ?? 0, b.outer ?? 0];
  const pts = rrect(x0, b.lo, x1, b.hi, corners(b.r));
  if (b.half === undefined || b.halfTop === undefined) return pts;
  // Widened (or narrowed) towards the top, straight sides between.
  const k = b.halfTop / b.half - 1;
  return pts.map((p) => {
    const s = 1 + (k * (p[1] - b.lo)) / (b.hi - b.lo);
    return (p.length === 3 ? [p[0] * s, p[1], 1] : [p[0] * s, p[1]]) as Pt;
  });
};

/** A right half outline from the centre line round to it again, closed through its mirror. */
const symmetric = (half: Pt[]): Pt[] => [...half, ...mirror(half).slice(1, -1)];

export function aventraFace(f: FaceSpec): Face {
  const u = faceU(f.halfWidth);
  const both = (pts: Pt[]) => [u(pts), u(mirror(pts))];
  const pt = (m: number, y: number) => u([[m, y]])[0] as [number, number];
  const open = (pts: Pt[]) => pts.map((p) => [p[0], p[1]] as Pt);
  const face: Face = {
    depth: 1.5,
    bottom: 0.4,
    panels: [
      ...(f.panels ?? []).flatMap((b) => both(boxPts(b))),
      ...(f.panelPaths ?? []).flatMap((p) => both(p)),
      ...(f.panelCentre ?? []).map((b) => u(boxPts(b))),
    ],
    dark: [
      ...(f.mask ? [u(symmetric(f.mask))] : []),
      ...(f.dark ?? []).flatMap((b) => both(boxPts(b))),
      ...(f.darkCentre ?? []).map((b) => u(boxPts(b))),
    ],
    screens: [...(f.screen ? [u(boxPts(f.screen))] : []), ...(f.screens ?? []).flatMap((b) => both(boxPts(b)))],
    lights: [...f.pods.flatMap((b) => both(boxPts(b))), ...(f.podPaths ?? []).flatMap((p) => both(p))],
    grilles: (f.grilles ?? []).map((b) => u(boxPts(b))),
    lines: [
      ...(f.lines ?? []).flatMap((l) => [u(open(l)), u(open(l).map((p) => [-p[0], p[1]] as Pt))]),
      ...(f.lineBoxes ?? []).map((b) => {
        const pts = boxPts(b);
        return u([...pts, pts[0]]);
      }),
    ],
    shapes: (f.shapes ?? []).map((s) => ({ pts: u(s.half ? symmetric(s.pts) : s.pts), color: s.color, ...(s.wraps ? { wraps: true } : {}) })),
    ...(f.wipers ? { wipers: f.wipers.map((w) => ({ pivot: pt(...w.pivot), tip: pt(...w.tip) })) } : {}),
    ...(f.number
      ? { number: { text: f.number.text, at: pt(f.number.m, f.number.y), height: f.number.height, ...(f.number.color ? { color: f.number.color } : {}), ...(f.number.both ? { both: true } : {}) } }
      : {}),
    ...(f.headlamps ? { headlamps: f.headlamps } : {}),
    ...(f.lampRim ? { lampRim: f.lampRim } : {}),
    ...(f.lampStyle ? { lampStyle: f.lampStyle } : {}),
    ...(f.glazedTail ? { glazedTail: f.glazedTail } : {}),
    ...(f.lampUnits ? { lampUnits: f.lampUnits.flatMap((l) => [{ kind: l.kind, at: pt(l.m, l.y), r: l.r }, { kind: l.kind, at: pt(-l.m, l.y), r: l.r }]) } : {}),
    ...(f.tailLens ? { tailLens: f.tailLens } : {}),
  };
  if (f.gangwayDoor) face.gangway = u(boxPts(f.gangwayDoor));
  if (f.recesses) face.recesses = f.recesses.map((r) => ({ outline: u(boxPts(r)), depth: r.depth }));
  if (f.gangwayFrame) {
    const g = f.gangwayFrame;
    face.gangwayFrame = { outline: u(boxPts(g.box)), depth: g.depth, ...(g.seams ? { seams: g.seams } : {}), ...(g.color ? { color: g.color } : {}) };
  }
  return face;
}

/** A class built from its measured spec. */
export function aventra(m: AventraSpec, family: ClassArt['family'] = 'aventra'): ClassArt {
  const under = (c: { under?: number[][] }) => (c.under ? { under: c.under.map(([a, b]) => [a, b] as const) } : {});
  return {
    family,
    nose: {
      profile: m.nose.profile,
      face: aventraFace(m.face),
      ...(m.cab.glazing ? { glazing: m.cab.glazing, glazingOnNose: true } : {}),
    },
    form: m.form,
    heights: { ...m.heights, window: m.heights.window as unknown as [number, number] },
    ...(m.windowRadius !== undefined ? { windowRadius: m.windowRadius } : {}),
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: { ...carOf(m.cab), ...under(m.cab) },
    next: { ...carOf(m.next), ...under(m.next) },
  };
}

/** The Elizabeth line's 345 as measured (classes/345/spec.json). */
export const class345: ClassArt = aventra(spec345.model as unknown as AventraSpec);

/** London Overground's 710 as measured (classes/710/spec.json). */
export const class710: ClassArt = aventra(spec710.model as unknown as AventraSpec);

/** South Western Railway's 701 as measured (classes/701/spec.json). */
export const class701: ClassArt = aventra(spec701.model as unknown as AventraSpec);

/** Greater Anglia's and c2c's 720 as measured (classes/720/spec.json). */
export const class720: ClassArt = aventra(spec720.model as unknown as AventraSpec);

/** London Northwestern's 730/2 as measured (classes/730/spec.json). */
export const class730: ClassArt = aventra(spec730.model as unknown as AventraSpec);
