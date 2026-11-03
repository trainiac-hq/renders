import type { ClassArt, Face, Form, Pt } from '../model/types';
import { rrect } from '../model/shapes';
import { carOf, faceU, mirror, type CarSpec } from '../model/spec';
import spec444 from './444/spec.json';
import spec350 from './350/spec.json';
import spec360 from './360/spec.json';
import spec380 from './380/spec.json';
import spec185 from './185/spec.json';
import spec700 from './700/spec.json';
import spec707 from './707/spec.json';
import spec717 from './717/spec.json';
import spec450 from './450/spec.json';

// Siemens Desiro (first generation), built from measured specs
// (classes/<code>/spec.json): the gangwayed 350, 380, 444 and 450, the
// 360 and the diesel 185 without a gangway.

type Lamp = { m: number; y: number; r: number };
/**
 * Edges across the face, in metres of a 1.4 m half-width. The face's
 * drawing is scaled to the body's width at each height, which narrows
 * upward (tumblehome); `innerHi`/`outerHi` give an edge's place at the
 * top where it differs, so an edge upright on the real train stays upright.
 */
type Box = { inner: number; outer: number; lo: number; hi: number; innerHi?: number; outerHi?: number };

/** A box's outline with its sides leaning from their bottom places to `innerHi`/`outerHi` at the top. */
function leaning(pts: Pt[], b: Box): Pt[] {
  const dIn = (b.innerHi ?? b.inner) - b.inner;
  const dOut = (b.outerHi ?? b.outer) - b.outer;
  return pts.map((p) => {
    const t = Math.max(0, Math.min(1, (p[1] - b.lo) / (b.hi - b.lo)));
    const across = (p[0] - b.inner) / (b.outer - b.inner);
    const x = p[0] + t * (dIn + (dOut - dIn) * across);
    return (p.length === 3 ? [x, p[1], 1] : [x, p[1]]) as Pt;
  });
}
/** What desiroGangway reads from a spec's model (classes/<code>/spec.json). */
type GangwayModel = {
  face: {
    halfWidth: number;
    surround: Box & { rOuterTop: number; r: number };
    glass: Box & { r: number };
    panel: Box & { rOuterBottom: number };
    /** Up the outer edge; with `curveFrom`, its inner edge curves out from that height to meet the outer edge at the top. */
    strip: Box & { rTop: number; curveFrom?: number };
    lamps: { head: Lamp; marker?: Lamp; tail: Lamp; ring: number };
    gangwayFrame: { half: number; lo: number; hi: number; r: number; depth: number; color: string; bellows?: string; rake?: number };
    gangwayDoor: { half: number; lo: number; hi: number; seams: number[]; lowerTo: number | null };
    lower: {
      top: number;
      /** Ribbed skirt boxes each side under the valance, with `ribs` lighter ribs across them. */
      skirts?: Box & { ribs: number; color: string; rib: string };
      /** The anti-climber pad at each corner under the yellow. */
      pads?: Box & { color: string };
      /** The open recess between the skirts that the coupler stands in. */
      /** With `depth`, cut that far back into the face as well as painted. */
      recess?: { half: number; lo: number; hi: number; color: string; depth?: number };
    };
    topLine?: { lo: number; hi: number };
    number: { text: string; m: number; y: number; height: number; weight?: 'regular' | 'light' };
    wiper: { pivot: number[]; tip: number[] };
  };
  livery: { yellow: string; orange?: string };
};

/** A round outline about a centre, for a lamp's black ring. */
const ring = (m: number, y: number, r: number, n = 16): Pt[] =>
  Array.from({ length: n }, (_, k) => [m + r * Math.cos((2 * Math.PI * k) / n), y + r * Math.sin((2 * Math.PI * k) / n)] as Pt);

/**
 * The yellow up a face's outer edge, its inner edge rising straight to
 * `from` and then curving out (a quarter ellipse) to meet the outer edge
 * at the top, so the band narrows to a rounded tip.
 */
function strip(st: Box, from: number): Pt[] {
  // `innerHi` is the inner edge's place where it starts to curve.
  const inner = st.innerHi ?? st.inner;
  const [a, b] = [st.outer - inner, st.hi - from];
  // Sampled finely as straight pieces: a spline through so thin a shape overshoots at the tip.
  const arc = Array.from({ length: 15 }, (_, k) => {
    const t = ((k + 1) / 16) * (Math.PI / 2);
    return [st.outer - a * Math.cos(t), from + b * Math.sin(t), 1] as Pt;
  });
  return [[st.outer, st.lo, 1], [st.inner, st.lo, 1], [inner, from, 1], ...arc, [st.outer, st.hi, 1]];
}

/** Under a gangwayed face's valance: the coupler's recess, a ribbed skirt each side, a pad at each corner. */
function lowerFront(lower: GangwayModel['face']['lower']): [Pt[], string][] {
  const out: [Pt[], string][] = [];
  const r = lower.recess;
  if (r) out.push([rrect(-r.half, r.lo, r.half, r.hi, [0, 0.03, 0.03, 0]), r.color]);
  const k = lower.skirts;
  if (k) {
    for (const side of [-1, 1]) {
      const [a, b] = side > 0 ? [k.inner, k.outer] : [-k.outer, -k.inner];
      out.push([rrect(a, k.lo, b, k.hi, [0.02, 0.02, 0.02, 0.02]), k.color]);
      // Ribs: a light band along the top edge of each slat.
      const pitch = (k.hi - k.lo) / k.ribs;
      for (let i = 1; i < k.ribs; i++) {
        const y = k.lo + i * pitch;
        out.push([rrect(a + 0.02, y - 0.012, b - 0.02, y + 0.004, [0, 0, 0, 0]), k.rib]);
      }
    }
  }
  const pd = lower.pads;
  if (pd) for (const pts of [rrect(pd.inner, pd.lo, pd.outer, pd.hi, [0.04, 0.04, 0.04, 0.04])]) out.push([pts, pd.color], [mirror(pts), pd.color]);
  return out;
}

/**
 * The gangwayed Desiro face, flat and upright: a gangway standing out in
 * a metal frame, its door dark over a painted lower part; a screen each
 * side in a black surround, the unit number over it; the warning yellow a
 * panel under each screen and a strip up the outer edge; three lamps a
 * side flush in black rings, the headlamp inboard, a small marker
 * outboard and the tail below between them; a dark lower front.
 */
export function desiroGangway(spec: { model: unknown }, family: ClassArt['family'] = 'desiro'): ClassArt {
  const m = spec.model as GangwayModel & typeof spec450.model;
  const f = m.face;
  const lv = m.livery;
  const u = faceU(f.halfWidth);
  const both = (pts: Pt[]) => [u(pts), u(mirror(pts))];
  const at = (x: number, y: number) => u([[x, y]])[0] as [number, number];
  const s = f.surround;
  const g = f.glass;
  const pn = f.panel;
  const st = f.strip;
  const { head, marker, tail } = f.lamps;
  const lamps = [
    { kind: 'head' as const, ...head },
    ...(marker ? [{ kind: 'marker' as const, ...marker }] : []),
    { kind: 'tail' as const, ...tail },
  ];
  const gf = f.gangwayFrame;
  const gd = f.gangwayDoor;
  const w = f.wiper;
  const face: Face = {
    depth: 1.7,
    bottom: 0.4,
    panels: [
      ...both(rrect(pn.inner, pn.lo, pn.outer, pn.hi, [0.04, 0.02, 0, pn.rOuterBottom])),
      ...both(st.curveFrom === undefined ? rrect(st.inner, st.lo, st.outer, st.hi, [0, st.rTop * 0.6, st.rTop, 0]) : strip(st, st.curveFrom)),
    ],
    dark: both(leaning(rrect(s.inner, s.lo, s.outer, s.hi, [s.r, s.r, s.rOuterTop, s.r]), s)),
    screens: both(leaning(rrect(g.inner, g.lo, g.outer, g.hi, [g.r, g.r, s.rOuterTop * 0.7, g.r]), g)),
    lights: lamps.flatMap((l) => both(ring(l.m, l.y, l.r + f.lamps.ring))),
    lampUnits: lamps.flatMap((l) => [
      { kind: l.kind, at: at(l.m, l.y), r: l.r },
      { kind: l.kind, at: at(-l.m, l.y), r: l.r },
    ]),
    gangway: u(rrect(-gd.half, gd.lo, gd.half, gd.hi, [0.03, 0.04, 0.04, 0.03])),
    ...(f.lower.recess?.depth ? { recesses: [{ outline: u(rrect(-f.lower.recess.half, f.lower.recess.lo, f.lower.recess.half, f.lower.recess.hi, [0.03, 0.05, 0.05, 0.03])), depth: f.lower.recess.depth }] } : {}),
    gangwayFrame: {
      outline: u(rrect(-gf.half, gf.lo, gf.half, gf.hi, [0.04, gf.r, gf.r, 0.04])),
      depth: gf.depth,
      seams: gd.seams,
      color: gf.color,
      bellows: gf.bellows,
      rake: gf.rake,
      ...(gd.lowerTo ? { lower: { to: gd.lowerTo, color: lv.yellow } } : {}),
    },
    shapes: [
      { pts: u(rrect(-1.5, 0.2, 1.5, f.lower.top, [0, 0, 0, 0])), color: 'under' },
      ...lowerFront(f.lower).map(([pts, color]) => ({ pts: u(pts), color })),
      ...(f.topLine && lv.orange ? [{ pts: u(rrect(-1.5, f.topLine.lo, 1.5, f.topLine.hi, [0, 0, 0, 0])), color: lv.orange }] : []),
    ],
    wipers: [
      { pivot: at(w.pivot[0], w.pivot[1]), tip: at(w.tip[0], w.tip[1]) },
      { pivot: at(-w.pivot[0], w.pivot[1]), tip: at(-w.tip[0], w.tip[1]) },
    ],
    number: { text: f.number.text, at: at(f.number.m, f.number.y), height: f.number.height, both: true, ...(f.number.weight ? { weight: f.number.weight } : {}) },
    lampRim: 'black',
  };
  return {
    family,
    nose: { profile: m.nose.profile as unknown as Pt[], face },
    form: { ...(m.form as unknown as Form), glazing: 'bonded' },
    heights: { ...m.heights, window: m.heights.window as [number, number] },
    windowRadius: m.windowRadius,
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: carOf(m.cab as unknown as CarSpec),
    next: carOf(m.next as unknown as CarSpec),
  };
}

export const class450: ClassArt = desiroGangway(spec450);
export const class444: ClassArt = desiroGangway(spec444);
export const class350: ClassArt = desiroGangway(spec350);
export const class380: ClassArt = desiroGangway(spec380);

type FlatModel = typeof spec360.model & {
  face: { housing?: number[][]; lamps: { marker?: { m: number; y: number; r: number }; ring?: number }; number?: { text: string; m: number; y: number; height: number } };
};

/**
 * The Desiro without a gangway: the face raked back above the lamps, one
 * black band round both screens dipping at the centre, the warning yellow
 * over the rest of the face up to an orange line at the cantrail, three
 * lamps a side flush in black rings (headlamp inboard, marker outboard,
 * tail below), a dark lower front.
 */
export function desiroFlat(spec: { model: unknown }, family: ClassArt['family'] = 'desiro'): ClassArt {
  const m = spec.model as FlatModel;
  const f = m.face;
  const lv = m.livery;
  const u = faceU(f.halfWidth);
  const at = (x: number, y: number) => u([[x, y]])[0] as [number, number];
  const g = f.glass;
  const pn = f.panel;
  const lamps = [
    { kind: 'head' as const, ...f.lamps.head },
    ...(f.lamps.marker ? [{ kind: 'marker' as const, ...f.lamps.marker }] : []),
    { kind: 'tail' as const, ...f.lamps.tail },
  ];
  const both = (pts: Pt[]) => [u(pts), u(mirror(pts))];
  // One housing a side holding its lamps (the 185's teardrop), or each lamp in its own black ring.
  const housing = f.housing?.map(([x, y]) => [x, y] as Pt);
  const face: Face = {
    depth: 1.6,
    bottom: 0.4,
    panel: u(rrect(-1.5, pn.lo, 1.5, pn.hi, [pn.rBottom, 0, 0, pn.rBottom])),
    dark: [u(f.surround.map(([x, y]) => [x, y] as Pt))],
    screens: [
      u(rrect(g.left[0], g.lo, g.left[1], g.hi, [g.r, g.rOuterTop, g.r, g.r])),
      u(rrect(g.right[0], g.lo, g.right[1], g.hi, [g.r, g.r, g.rOuterTop, g.r])),
    ],
    lights: housing ? both(housing) : lamps.flatMap((l) => both(ring(l.m, l.y, l.r + (f.lamps.ring ?? 0.02)))),
    lampUnits: lamps.flatMap((l) => [
      { kind: l.kind, at: at(-l.m, l.y), r: l.r },
      { kind: l.kind, at: at(l.m, l.y), r: l.r },
    ]),
    shapes: [
      { pts: u(rrect(-1.5, 0.2, 1.5, f.lower.top, [0, 0, 0, 0])), color: 'under' },
      ...lowerFront(f.lower as GangwayModel['face']['lower']).map(([pts, color]) => ({ pts: u(pts), color })),
      { pts: u(rrect(-1.5, f.topLine.lo, 1.5, f.topLine.hi, [0, 0, 0, 0])), color: lv.orange },
    ],
    wipers: f.wipers.map((w) => ({ pivot: at(w.pivot[0], w.pivot[1]), tip: at(w.tip[0], w.tip[1]) })),
    ...(f.number ? { number: { text: f.number.text, at: at(f.number.m, f.number.y), height: f.number.height, color: '#1A1A1A' } } : {}),
    lampRim: housing ? 'chrome' : 'black',
  };
  return {
    family,
    nose: { profile: m.nose.profile as unknown as Pt[], face },
    form: { ...(m.form as unknown as Form), glazing: 'bonded' },
    heights: { ...m.heights, window: m.heights.window as [number, number] },
    windowRadius: m.windowRadius,
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: carOf(m.cab as unknown as CarSpec),
    next: carOf(m.next as unknown as CarSpec),
  };
}

export const class360: ClassArt = desiroFlat(spec360);
export const class185: ClassArt = desiroFlat(spec185);

type CityModel = typeof spec700.model & {
  face: {
    door?: { half: number; lo: number; hi: number; window?: number[] };
    number: { color?: string; weight?: 'regular' | 'light' };
    /** The lamp pod as measured, right half ([m, y], third element 1 = sharp): a slanted quadrilateral with a rounded outer end. */
    podOutline?: number[][];
    /** Lamps under the pod's smoked glass (Face.lampStyle 'glazed'): an LED tail cluster, a chrome headlamp. */
    lampStyle?: 'recessed' | 'flush' | 'glazed';
    glazedTail?: 'red';
    /** The centre panel's outline, right half, from its foot on the centre line round to its top. */
    panelSeam?: number[][];
    /** Where the mask or the yellow is narrower at its foot than its top: the half-width there. */
    mask: { halfLo?: number };
    panel: { halfLo?: number };
    glass: { halfLo?: number };
  };
};

/** A centred outline whose half-width runs from `half` at `hi` to `halfLo` at `lo` (a trapezoid, its corners as drawn). */
function tapered(pts: Pt[], half: number, halfLo: number | undefined, lo: number, hi: number): Pt[] {
  if (halfLo === undefined) return pts;
  return pts.map((p) => {
    const t = Math.max(0, Math.min(1, (p[1] - lo) / (hi - lo)));
    const x = (p[0] * (halfLo + (half - halfLo) * t)) / half;
    return (p.length === 3 ? [x, p[1], 1] : [x, p[1]]) as Pt;
  });
}

/**
 * The Desiro City: a long raked nose, one black mask round a single
 * windscreen (or two, either side of a front door), the warning yellow a
 * panel under it between two black lamp pods on white cheeks, each pod a
 * tail lamp outboard and the headlamp inboard; a dark coupler recess below.
 */
export function desiroCity(spec: { model: unknown }, family: ClassArt['family'] = 'desiro-city'): ClassArt {
  const m = spec.model as CityModel;
  const f = m.face;
  const lv = m.livery;
  const u = faceU(f.halfWidth);
  const both = (pts: Pt[]) => [u(pts), u(mirror(pts))];
  const at = (x: number, y: number) => u([[x, y]])[0] as [number, number];
  const { mask, glass, panel, pods, lower } = f;
  const d = f.door;
  const lamps = [
    { kind: 'tail' as const, ...f.lamps.tail },
    { kind: 'head' as const, ...f.lamps.head },
  ];
  const w = f.wiper;
  const face: Face = {
    depth: 1.6,
    bottom: f.bottom,
    panel: u(tapered(rrect(-panel.half, panel.lo, panel.half, panel.hi, [panel.r, 0.02, 0.02, panel.r]), panel.half, panel.halfLo, panel.lo, panel.hi)),
    dark: [
      u(tapered(rrect(-mask.half, mask.lo, mask.half, mask.hi, [mask.r * 0.4, mask.r, mask.r, mask.r * 0.4]), mask.half, mask.halfLo, mask.lo, mask.hi)),
      ...(f.podOutline ? [] : both(rrect(pods.inner, pods.lo, pods.outer, pods.hi, [pods.r, pods.r * 0.5, pods.r, pods.r]))),
    ],
    screens: d
      ? [
          u(rrect(-glass.half, glass.lo, -d.half - 0.08, glass.hi, [glass.r * 0.3, glass.r, 0.03, 0.03])),
          u(rrect(d.half + 0.08, glass.lo, glass.half, glass.hi, [0.03, 0.03, glass.r, glass.r * 0.3])),
          ...(d.window ? [u(rrect(-d.half + 0.05, d.window[0], d.half - 0.05, d.window[1], [0.04, 0.04, 0.04, 0.04]))] : []),
        ]
      : [u(tapered(rrect(-glass.half, glass.lo, glass.half, glass.hi, [glass.r * 0.3, glass.r, glass.r, glass.r * 0.3]), glass.half, glass.halfLo, glass.lo, glass.hi))],
    ...(d || f.panelSeam
      ? {
          lines: [
            ...(d ? [u(rrect(-d.half, d.lo, d.half, d.hi, [0, 0, 0, 0]))] : []),
            // The yellow centre panel's own outline, the pods in the surround either side of it.
            ...(f.panelSeam
              ? [(() => {
                  // Straight edges: the seam is drawn through a smooth curve, so each edge is given in short steps.
                  const half = f.panelSeam.map(([x, y]) => [x, y] as Pt);
                  const loop = [...half, ...mirror(half)];
                  const pts: Pt[] = [];
                  for (let i = 0; i < loop.length; i++) {
                    const [a, b] = [loop[i], loop[(i + 1) % loop.length]];
                    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.02));
                    for (let k = 0; k < n; k++) pts.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as Pt);
                  }
                  return u([...pts, pts[0]]);
                })()]
              : []),
          ],
        }
      : {}),
    lights: f.podOutline
      ? both(f.podOutline.map((p) => (p.length === 3 ? [p[0], p[1], 1] : [p[0], p[1]]) as Pt))
      : both(
      rrect(
        Math.min(...lamps.map((l) => l.m - l.r)) - 0.03,
        Math.min(...lamps.map((l) => l.y - l.r)) - 0.03,
        Math.max(...lamps.map((l) => l.m + l.r)) + 0.03,
        Math.max(...lamps.map((l) => l.y + l.r)) + 0.03,
        [0.05, 0.05, 0.05, 0.05],
      ),
    ),
    lampUnits: lamps.flatMap((l) => [
      { kind: l.kind, at: at(-l.m, l.y), r: l.r },
      { kind: l.kind, at: at(l.m, l.y), r: l.r },
    ]),
    shapes: [
      { pts: u(rrect(-lower.half, lower.lo, lower.half, lower.hi, [0.08, 0.04, 0.04, 0.08])), color: 'under' },
      { pts: u(rrect(-1.5, f.topLine.lo, 1.5, f.topLine.hi, [0, 0, 0, 0])), color: lv.orange },
    ],
    wipers: [{ pivot: at(w.pivot[0], w.pivot[1]), tip: at(w.tip[0], w.tip[1]) }],
    number: { text: f.number.text, at: at(f.number.m, f.number.y), height: f.number.height, color: f.number.color ?? '#1A1A1A', ...(f.number.weight ? { weight: f.number.weight } : {}) },
    lampRim: 'black',
    ...(f.lampStyle ? { lampStyle: f.lampStyle } : {}),
    ...(f.glazedTail ? { glazedTail: f.glazedTail } : {}),
  };
  return {
    family,
    nose: { profile: m.nose.profile as unknown as Pt[], face },
    heights: { ...m.heights, window: m.heights.window as [number, number] },
    windowRadius: m.windowRadius,
    wheel: m.wheel,
    wheelbase: m.wheelbase,
    cab: carOf(m.cab as unknown as CarSpec),
    next: carOf(m.next as unknown as CarSpec),
  };
}

export const class700: ClassArt = desiroCity(spec700);
export const class707: ClassArt = desiroCity(spec707);
export const class717: ClassArt = desiroCity(spec717);
