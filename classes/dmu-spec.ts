import type { Band, ClassArt, Door, Face, Family, Form, Livery, Nose, Pt, Swoosh } from '../model/types';
import { peanut, rrect } from '../model/shapes';
import { carOf, faceU, fracOf, mirror, type CarSpec } from '../model/spec';

// The Turbostar and Sprinter families are built from their measured specs
// (classes/<code>/spec.json, the method in CONTRIBUTING.md): the
// geometry in metres, the face in metres from its centre line, and each
// operator's livery in metres under `liveries.<ATOC>`, so one spec serves
// every operator running the class.

type Num4 = readonly [number, number, number, number];
type Coords = readonly (readonly number[])[];

/** A face item: a rounded rectangle or an outline, in metres from the centre line. */
export type FaceItem = {
  m?: readonly [number, number];
  y?: readonly [number, number];
  r?: number | Num4;
  pts?: Coords;
  mirror?: boolean;
  color?: string;
};

type LampSpec = { m: number; y: number; r: number };

export type FaceSpec = {
  halfWidth: number;
  depth: number;
  bottom?: number;
  panel?: FaceItem[];
  dark?: FaceItem[];
  screens?: FaceItem[];
  lights?: FaceItem[];
  lamps?: {
    head?: LampSpec;
    tail?: LampSpec;
    /** Every lamp in the near cluster, where there are more than a head and a tail. */
    units?: (LampSpec & { kind: 'head' | 'tail' })[];
    order?: string;
    /** The black ring round each lamp, when the cluster is drawn round its lamps. */
    rim?: number;
  };
  gangway?: FaceItem;
  gangwayFrame?: { outline: FaceItem; depth: number; seams?: number[]; color?: string };
  lines?: FaceItem[];
  grilles?: FaceItem[];
  shapes?: FaceItem[];
  number?: { text: string; m: number; y: number; height: number; color?: string; both?: boolean };
  wipers?: { pivot: readonly [number, number]; tip: readonly [number, number]; mirror?: boolean }[];
  lampRim?: Face['lampRim'];
  lampStyle?: Face['lampStyle'];
  tailLens?: Face['tailLens'];
};

type CarSpecIn = Omit<CarSpec, 'doors'> & { doors: (Door & { kind?: string })[] };

export type ModelSpec = {
  heights: { bottom: number; cantrail: number; roof: number; window: readonly [number, number] };
  wheel: number;
  wheelbase: number;
  windowRadius?: number;
  endRadius?: number;
  cab: CarSpecIn;
  next: CarSpecIn;
  nose: { profile: Coords; windscreen?: Coords; surround?: Coords; glazing?: Coords[]; panel?: Coords; lines?: Coords[]; glazingOnNose?: boolean };
  form?: Form;
  face: FaceSpec;
  plough?: ClassArt['plough'];
  variants?: Record<string, Partial<ModelSpec>>;
};

export type LiverySpec = {
  body: string;
  roof: string;
  doors?: string;
  windowBand?: string;
  windowBandFrom?: number;
  panel?: string;
  face?: string;
  gangway?: string;
  surround?: string;
  under?: string;
  glass?: string;
  bands?: { y: readonly [number, number]; color: string; from?: number; to?: number; car?: 'cab' | 'next'; slant?: number }[];
  shapes?: { car?: 'cab' | 'next'; pts: Coords; color: string; layer?: 'under'; dots?: number; dotFade?: Swoosh['dotFade']; radius?: number }[];
  doorStripes?: Livery['doorStripes'];
  faceShapes?: FaceItem[];
  facePanel?: FaceItem[];
  /** Logos and wordmarks, as `Livery.branding` (metres along the car and up). */
  branding?: Livery['branding'];
  /** The unit number where this operator puts it, over the face's (text, place or colour). */
  number?: Partial<NonNullable<FaceSpec['number']>>;
};

export type DmuSpec = { class: string; model: ModelSpec; liveries: Record<string, LiverySpec> };

const pt = (p: readonly number[]): Pt => (p[2] ? [p[0], p[1], 1] : [p[0], p[1]]);
const pts = (c: Coords): Pt[] => c.map(pt);

/** A face item's outlines in metres: one, or two where it's mirrored. */
function outlines(item: FaceItem): Pt[][] {
  let shape: Pt[];
  if (item.pts) shape = pts(item.pts);
  else {
    const [a, b] = item.m!;
    const [lo, hi] = item.y!;
    const r = item.r ?? 0;
    shape = rrect(Math.min(a, b), lo, Math.max(a, b), hi, typeof r === 'number' ? [r, r, r, r] : r);
  }
  return item.mirror ? [shape, mirror(shape)] : [shape];
}

/** Merges a variant over the model: objects key by key, anything else replaced. */
function merge<T>(base: T, over: Partial<T> | undefined): T {
  if (!over) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] = v && typeof v === 'object' && !Array.isArray(v) && b && typeof b === 'object' && !Array.isArray(b) ? merge(b, v as Partial<typeof b>) : v;
  }
  return out as T;
}

const car = (c: CarSpecIn) =>
  carOf({ ...c, doors: c.doors.map(({ kind: _kind, ...d }) => d) } as unknown as CarSpec);

/**
 * The flat front from its spec, in u across the face. A livery's own
 * paint on the front (`faceShapes`, `facePanel`) comes in through `livery`,
 * and a shape whose colour names a livery field takes that operator's.
 */
function faceOf(f: FaceSpec, livery?: LiverySpec): Face {
  const u = faceU(f.halfWidth);
  const all = (items: FaceItem[] | undefined) => (items ?? []).flatMap(outlines).map(u);
  const colour = (c: string) => (c.startsWith('#') || c === 'under' ? c : ((livery as Record<string, unknown> | undefined)?.[c] as string | undefined) ?? c);
  const panels = all(livery?.facePanel ?? f.panel);
  const lights = (f.lights ?? []).flatMap(outlines);
  // The near cluster's lamps, measured; the far one's mirror them.
  const units = f.lamps?.units ?? [
    ...(f.lamps?.head ? [{ kind: 'head' as const, ...f.lamps.head }] : []),
    ...(f.lamps?.tail ? [{ kind: 'tail' as const, ...f.lamps.tail }] : []),
  ];
  // Without a drawn housing, each cluster is drawn round its own lamps.
  const housings =
    lights.length || units.length < 2
      ? lights
      : [1, -1].map((s) => {
          const [a, b] = units.map((l) => [s * l.m, l.y, l.r + (f.lamps?.rim ?? 0.02)] as const);
          return peanut(a, b, 0.03);
        });
  const centre = (p: Pt[]) => p.reduce((t, q) => t + q[0], 0) / p.length;
  const lampUnits = units.length
    ? housings.map((h) => {
        const s = Math.sign(centre(h)) || 1;
        return units.map((l) => ({ kind: l.kind, at: u([[s * l.m, l.y]])[0] as [number, number], r: l.r }));
      })
    : undefined;
  const closed = (p: Pt[]) => [...p, p[0]];
  const number = f.number ? { ...f.number, ...livery?.number } : undefined;
  const wipers = (f.wipers ?? []).flatMap((w) => {
    const one = (s: number) => ({ pivot: u([[s * w.pivot[0], w.pivot[1]]])[0] as [number, number], tip: u([[s * w.tip[0], w.tip[1]]])[0] as [number, number] });
    return w.mirror ? [one(1), one(-1)] : [one(1)];
  });
  const shapes = [...(f.shapes ?? []), ...(livery?.faceShapes ?? [])].flatMap((s) => outlines(s).map((p) => ({ pts: u(p), color: colour(s.color ?? 'under') })));
  return {
    depth: f.depth,
    ...(f.bottom !== undefined ? { bottom: f.bottom } : {}),
    ...(panels.length ? { panel: panels[0], panels: panels.slice(1) } : {}),
    dark: all(f.dark),
    screens: all(f.screens),
    lights: housings.map(u),
    ...(lampUnits ? { lampUnits } : {}),
    ...(f.lamps?.order === 'head inboard' ? { headlamps: 'inboard' as const } : {}),
    ...(f.gangway ? { gangway: u(outlines(f.gangway)[0]) } : {}),
    ...(f.gangwayFrame
      ? { gangwayFrame: { outline: u(outlines(f.gangwayFrame.outline)[0]), depth: f.gangwayFrame.depth, seams: f.gangwayFrame.seams, color: f.gangwayFrame.color } }
      : {}),
    lines: (f.lines ?? []).flatMap((l) => outlines(l).map((p) => u(l.pts ? p : closed(p)))),
    ...(f.grilles ? { grilles: all(f.grilles) } : {}),
    ...(shapes.length ? { shapes } : {}),
    ...(wipers.length ? { wipers } : {}),
    ...(number ? { number: { text: number.text, at: u([[number.m, number.y]])[0] as [number, number], height: number.height, color: number.color, both: number.both } } : {}),
    ...(f.lampRim ? { lampRim: f.lampRim } : {}),
    ...(f.lampStyle ? { lampStyle: f.lampStyle } : {}),
    ...(f.tailLens ? { tailLens: f.tailLens } : {}),
  };
}

function artOf(m: ModelSpec, family: Family, livery?: LiverySpec): Omit<ClassArt, 'byOperator'> {
  const n = m.nose;
  const nose: Nose = {
    profile: pts(n.profile),
    ...(n.windscreen ? { windscreen: pts(n.windscreen) } : {}),
    ...(n.surround ? { surround: pts(n.surround) } : {}),
    ...(n.glazing ? { glazing: n.glazing.map(pts) } : {}),
    ...(n.glazingOnNose ? { glazingOnNose: true } : {}),
    ...(n.panel ? { panel: pts(n.panel) } : {}),
    ...(n.lines ? { lines: n.lines.map(pts) } : {}),
    face: faceOf(m.face, livery),
  };
  return {
    family,
    nose,
    heights: { ...m.heights, window: [m.heights.window[0], m.heights.window[1]] },
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    ...(m.windowRadius !== undefined ? { windowRadius: m.windowRadius } : {}),
    ...(m.endRadius !== undefined ? { endRadius: m.endRadius } : {}),
    cab: car(m.cab),
    next: car(m.next),
    ...(m.form ? { form: m.form } : {}),
    ...(m.plough ? { plough: m.plough } : {}),
  };
}

/**
 * A class from its spec. The base is drawn with the first operator's
 * livery-specific front paint; an operator whose front paint or sub-class
 * differs gets its own `byOperator` entry.
 */
export function artFromSpec(spec: DmuSpec, family: Family, first: string): ClassArt {
  const base = artOf(spec.model, family, spec.liveries[first]);
  const byOperator: NonNullable<ClassArt['byOperator']> = {};
  for (const op of Object.keys(spec.liveries)) {
    if (op === first && !spec.model.variants?.[op]) continue;
    const own = artOf(merge(spec.model, spec.model.variants?.[op]), family, spec.liveries[op]);
    const diff = Object.fromEntries(Object.entries(own).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify((base as Record<string, unknown>)[k])));
    if (Object.keys(diff).length) byOperator[op] = diff;
  }
  return { ...base, ...(Object.keys(byOperator).length ? { byOperator } : {}) };
}

/** An operator's livery on a class, from the spec's metres: heights become fractions of the bodyside. */
export function liveryFromSpec(spec: DmuSpec, op: string): Livery {
  const l = spec.liveries[op];
  const h = merge(spec.model, spec.model.variants?.[op]).heights;
  const f = fracOf(h.bottom, h.cantrail);
  const bands: Band[] = (l.bands ?? []).map((b) => ({
    lo: f(b.y[0]),
    hi: f(b.y[1]),
    color: b.color,
    ...(b.from !== undefined ? { from: b.from } : {}),
    ...(b.to !== undefined ? { to: b.to } : {}),
    ...(b.car ? { car: b.car } : {}),
    ...(b.slant !== undefined ? { slant: b.slant } : {}),
  }));
  const swooshes: Swoosh[] = (l.shapes ?? []).map((s) => ({
    points: s.pts.map((p) => (p[2] ? [p[0], f(p[1]), 1] : [p[0], f(p[1])]) as Pt),
    color: s.color,
    ...(s.car ? { car: s.car } : {}),
    ...(s.layer ? { layer: s.layer } : {}),
    ...(s.dots ? { dots: s.dots } : {}),
    ...(s.dotFade ? { dotFade: s.dotFade } : {}),
    ...(s.radius !== undefined ? { radius: s.radius } : {}),
  }));
  const keys = ['doors', 'windowBand', 'windowBandFrom', 'panel', 'face', 'gangway', 'surround', 'under', 'glass', 'doorStripes', 'branding'] as const;
  return {
    body: l.body,
    roof: l.roof,
    ...Object.fromEntries(keys.filter((k) => l[k] !== undefined).map((k) => [k, l[k]])),
    ...(bands.length ? { bands } : {}),
    ...(swooshes.length ? { swooshes } : {}),
  };
}
