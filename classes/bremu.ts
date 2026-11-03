import type { Band, ClassArt, Face, Form, Livery, Pt, RoofItem, Swoosh } from '../model/types';
import { rrect } from '../model/shapes';
import { carOf, faceU, fracOf, mirror, type CarSpec } from '../model/spec';
import spec318 from './318/spec.json';
import spec320 from './320/spec.json';
import spec465 from './465/spec.json';
import spec466 from './466/spec.json';
import spec507 from './507/spec.json';
import spec508 from './508/spec.json';
import spec319 from './319/spec.json';
import spec455 from './455/spec.json';
import spec456 from './456/spec.json';
import spec769 from './769/spec.json';
import spec220 from './220/spec.json';
import spec222 from './222/spec.json';
import spec221 from './221/spec.json';
import spec180 from './180/spec.json';
import spec390 from './390/spec.json';
import { class390 as pilot390 } from './electric';

// BR second-generation EMUs (and the family's later classes) built from
// their measured specs, classes/<code>/spec.json. Every number lives in
// the spec with its source in `trace`; this file only turns the spec's
// shapes, in metres, into the class data and its liveries.

/**
 * A shape on a flat face in metres: m across from the centre line (the
 * side the spec draws it, mirrored with `mirror`), y up from the rail.
 * Either a rectangle with its corners rounded (bottom-left, top-left,
 * top-right, bottom-right) or a polygon, a third element of 1 a sharp corner.
 */
export type FaceShape = ({ rect: [number, number, number, number]; r?: [number, number, number, number] } | { poly: number[][] }) & {
  mirror?: boolean;
};

type LampSpec = { kind: 'head' | 'tail'; m: number; y: number; r: number };

export type FaceSpec = {
  halfWidth: number;
  depth?: number;
  bottom?: number;
  panel?: FaceShape;
  panels?: FaceShape[];
  dark?: FaceShape[];
  screens: FaceShape[];
  /** Lamp housings; `lampUnits` lists each one's lamps on the side drawn, mirrored with it. */
  lights?: FaceShape[];
  lampUnits?: LampSpec[][];
  gangway?: FaceShape;
  gangwayFrame?: { outline: FaceShape; depth: number; seams?: number[]; color?: string };
  lines?: FaceShape[];
  shapes?: { shape: FaceShape; color: string }[];
  number?: { text: string; m: number; y: number; height: number; color?: string; both?: boolean };
  wipers?: { pivot: [number, number]; tip: [number, number]; mirror?: boolean }[];
  lampRim?: 'chrome' | 'black';
  tailLens?: 'red' | 'clear';
  lampStyle?: 'recessed' | 'flush';
  headlamps?: 'outboard' | 'inboard';
  gangwayMount?: 'surround' | 'flush';
  /** Openings cut back into the face, `depth` metres deep. */
  pockets?: { shape: FaceShape; depth: number }[];
};

export type ModelSpec = {
  heights: { bottom: number; cantrail: number; roof: number; window: number[] };
  wheel: number;
  wheelbase: number;
  cab: CarSpec & { under?: number[][]; roof?: RoofItem[] };
  next: CarSpec & { under?: number[][]; roof?: RoofItem[]; pantograph?: number };
  /** `glazing`: windows on the nose's side ahead of the cab door (the 318's tall cab window), x along and y up in metres. */
  /**
   * A long nose (the Voyagers, 180, 390) gives its side-view outlines in
   * metres (x back from the tip, y up) and its head-on features in `form.front`
   * instead of a flat `face`.
   */
  nose: {
    profile: number[][];
    lines?: number[][][];
    glazing?: FaceShape[];
    windscreen?: number[][];
    surround?: number[][];
    panel?: number[][];
    lights?: number[][][];
    glazingOnNose?: boolean;
  };
  face?: FaceSpec;
  form: Form;
  windowRadius?: number;
  endRadius?: number;
};

const pt = (p: number[]): Pt => (p.length === 3 ? [p[0], p[1], 1] : [p[0], p[1]]);

/** A face shape as outlines in metres: one, or the shape and its mirror. */
function metres(s: FaceShape): Pt[][] {
  const pts = 'rect' in s ? rrect(s.rect[0], s.rect[1], s.rect[2], s.rect[3], s.r ?? [0.02, 0.02, 0.02, 0.02]) : s.poly.map(pt);
  return s.mirror ? [pts, mirror(pts)] : [pts];
}

/** A flat face from its spec: shapes in metres become u across the face. */
export function faceOf(f: FaceSpec): Face {
  const u = faceU(f.halfWidth);
  const all = (ss: FaceShape[] | undefined) => (ss ?? []).flatMap((s) => metres(s).map(u));
  const one = (s: FaceShape | undefined) => (s ? u(metres(s)[0]) : undefined);
  const outline = (pts: Pt[]) => [...pts, pts[0]];
  const at = (m: number, y: number) => u([[m, y]])[0] as [number, number];
  // Each housing's lamps, in the order the housings come out (the one drawn, then its mirror).
  const lampUnits = f.lampUnits
    ? (f.lights ?? []).flatMap((s, i) => {
        const units = f.lampUnits![i] ?? [];
        const drawn = units.map((l) => ({ kind: l.kind, at: at(l.m, l.y), r: l.r }));
        return s.mirror ? [drawn, units.map((l) => ({ kind: l.kind, at: at(-l.m, l.y), r: l.r }))] : [drawn];
      })
    : undefined;
  return {
    depth: f.depth ?? 1.7,
    ...(f.bottom !== undefined ? { bottom: f.bottom } : {}),
    ...(f.panel ? { panel: one(f.panel) } : {}),
    ...(f.panels ? { panels: all(f.panels) } : {}),
    dark: all(f.dark),
    screens: all(f.screens),
    lights: all(f.lights),
    ...(lampUnits ? { lampUnits } : {}),
    ...(f.gangway ? { gangway: one(f.gangway) } : {}),
    ...(f.gangwayFrame
      ? { gangwayFrame: { outline: one(f.gangwayFrame.outline)!, depth: f.gangwayFrame.depth, seams: f.gangwayFrame.seams, color: f.gangwayFrame.color } }
      : {}),
    lines: all(f.lines).map(outline),
    shapes: (f.shapes ?? []).flatMap((s) => metres(s.shape).map((p) => ({ pts: u(p), color: s.color }))),
    ...(f.wipers
      ? {
          wipers: f.wipers.flatMap((w) => {
            const one = { pivot: at(w.pivot[0], w.pivot[1]), tip: at(w.tip[0], w.tip[1]) };
            return w.mirror ? [one, { pivot: at(-w.pivot[0], w.pivot[1]), tip: at(-w.tip[0], w.tip[1]) }] : [one];
          }),
        }
      : {}),
    ...(f.number ? { number: { text: f.number.text, at: at(f.number.m, f.number.y), height: f.number.height, color: f.number.color, both: f.number.both } } : {}),
    ...(f.lampRim ? { lampRim: f.lampRim } : {}),
    ...(f.tailLens ? { tailLens: f.tailLens } : {}),
    ...(f.lampStyle ? { lampStyle: f.lampStyle } : {}),
    ...(f.headlamps ? { headlamps: f.headlamps } : {}),
    ...(f.gangwayMount ? { gangwayMount: f.gangwayMount } : {}),
    ...(f.pockets ? { pockets: f.pockets.flatMap((k) => metres(k.shape).map((pts) => ({ outline: u(pts), depth: k.depth }))) } : {}),
  };
}

/** A class from its measured spec. */
export function fromSpec(m: ModelSpec, family: ClassArt['family'] = 'other'): ClassArt {
  const under = (u?: number[][]) => (u ? { under: u.map(([a, b]) => [a, b] as const) } : {});
  const nextRoof: RoofItem[] = [...(m.next.roof ?? []), ...(m.next.pantograph !== undefined ? [{ kind: 'pantograph' as const, x: m.next.pantograph }] : [])];
  return {
    family,
    nose: {
      profile: m.nose.profile.map(pt),
      ...(m.face ? { face: faceOf(m.face) } : {}),
      ...(m.nose.lines ? { lines: m.nose.lines.map((l) => l.map(pt)) } : {}),
      ...(m.nose.glazing ? { glazing: m.nose.glazing.flatMap(metres) } : {}),
      ...(m.nose.windscreen ? { windscreen: m.nose.windscreen.map(pt) } : {}),
      ...(m.nose.surround ? { surround: m.nose.surround.map(pt) } : {}),
      ...(m.nose.panel ? { panel: m.nose.panel.map(pt) } : {}),
      ...(m.nose.lights ? { lights: m.nose.lights.map((l) => l.map(pt)) } : {}),
      ...(m.nose.glazingOnNose ? { glazingOnNose: true } : {}),
    },
    form: m.form,
    heights: { ...m.heights, window: [m.heights.window[0], m.heights.window[1]] },
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: { ...carOf(m.cab), ...under(m.cab.under), ...(m.cab.roof ? { roof: m.cab.roof } : {}) },
    next: { ...carOf(m.next), ...under(m.next.under), ...(nextRoof.length ? { roof: nextRoof } : {}) },
    ...(m.windowRadius !== undefined ? { windowRadius: m.windowRadius } : {}),
    ...(m.endRadius !== undefined ? { endRadius: m.endRadius } : {}),
  };
}

/**
 * A livery measured in metres (classes/<code>/spec.json `liveries`, by operator): bands
 * and shapes with heights in metres above the rail, turned into the
 * fractions of the bodyside the livery data uses.
 */
export type LiverySpec = Omit<Livery, 'bands' | 'swooshes' | 'coach'> & {
  bands?: (Omit<Band, 'lo' | 'hi'> & { y: [number, number] })[];
  shapes?: (Omit<Swoosh, 'points'> & { points: number[][] })[];
  rects?: { x: [number, number]; y: [number, number]; color: string; car?: 'cab' | 'next'; layer?: 'under'; dots?: number }[];
};

export function liveryOf(spec: { model: { heights: { bottom: number; cantrail: number } }; liveries: Record<string, unknown> }, operator: string): Livery {
  const { bands, shapes, rects, ...rest } = spec.liveries[operator] as LiverySpec;
  const f = fracOf(spec.model.heights.bottom, spec.model.heights.cantrail);
  return {
    ...rest,
    ...(bands ? { bands: bands.map(({ y, ...b }) => ({ ...b, lo: f(y[0]), hi: f(y[1]) })) } : {}),
    swooshes: [
      ...(shapes ?? []).map(({ points, ...s }) => ({ ...s, points: points.map((p) => (p.length === 3 ? [p[0], f(p[1]), 1] : [p[0], f(p[1])]) as Pt) })),
      ...(rects ?? []).map(({ x, y, ...s }): Swoosh => ({
        ...s,
        points: [[x[0], f(y[0]), 1], [x[0], f(y[1]), 1], [x[1], f(y[1]), 1], [x[1], f(y[0]), 1]],
      })),
    ],
  };
}

// --- The classes -------------------------------------------------------------


/** The 320: the 317 family's raked cab, two screens in one black band, a yellow panel over the lamp strips. */
export const class320: ClassArt = fromSpec(spec320.model as unknown as ModelSpec);

/** The 318: the 317/1's flat gangwayed cab, two screens either side of the gangway door, all-yellow below them. */
export const class318: ClassArt = fromSpec(spec318.model as unknown as ModelSpec);

/** The 465 Networker: DMSO and TSO, the raked face with its bumper blocks, the black band under the screens. */
export const class465: ClassArt = fromSpec(spec465.model as unknown as ModelSpec, 'networker');

/** The 466: the 465's DMSO with a driving trailer behind it (its rear cab is not drawn yet: spec.json pipelineNeeds). */
export const class466: ClassArt = fromSpec(spec466.model as unknown as ModelSpec, 'networker');

/** The 507: Merseyrail's BREL third-rail unit with its 2002-05 Alstom front (black band, teardrop lamp pods). */
export const class507: ClassArt = fromSpec(spec507.model as unknown as ModelSpec);

/** The 508: the same refurbished front and body as the 507 (no difference measured; classes/508/notes.md). */
export const class508: ClassArt = fromSpec(spec508.model as unknown as ModelSpec);

/** The 455: the 317-template body with the refurbished front (steel gangway frame, door set back in it). */
export const class455: ClassArt = fromSpec(spec455.model as unknown as ModelSpec);

/** The 456: two-car, its own face (one black surround, two panes; its rear cab is not drawn yet). */
export const class456: ClassArt = fromSpec(spec456.model as unknown as ModelSpec);

/** The 319: flat vertical face, marker/head/tail outboard to inboard, yellow over a navy band. */
export const class319: ClassArt = fromSpec(spec319.model as unknown as ModelSpec);

/** The 769: the 319 with engine rafts under the driving cars (the motor car behind it, with its pantograph). */
export const class769: ClassArt = fromSpec(spec769.model as unknown as ModelSpec);

/** The 220 Voyager: the long nose from a side-on photo, the body along the cars from the diagram. */
export const class220: ClassArt = fromSpec(spec220.model as unknown as ModelSpec, 'voyager');

/** The 222 Meridian: its own longer nose (side-on photo), the 220's body template. */
export const class222: ClassArt = fromSpec(spec222.model as unknown as ModelSpec, 'voyager');

/** The 221 Super Voyager: the 220's body and nose on its own (tilting) bogies. */
export const class221: ClassArt = fromSpec(spec221.model as unknown as ModelSpec, 'voyager');

/** The 180 Adelante: its long nose and body from its diagram, cab door and face from photos. */
export const class180: ClassArt = fromSpec(spec180.model as unknown as ModelSpec);

/**
 * The 390 Pendolino: its body along both cars and heights measured from
 * the diagram (classes/390/spec.json); the nose and its face kept from the
 * pilot until they are measured on a photo.
 */
export const class390: ClassArt = (() => {
  const m = spec390.model as unknown as ModelSpec;
  const built = fromSpec({ ...m, nose: { profile: [] }, form: pilot390.form! });
  return { ...pilot390, heights: built.heights, wheel: m.wheel, wheelbase: m.wheelbase, cab: { ...pilot390.cab, ...built.cab }, next: { ...pilot390.next, ...built.next } };
})();
