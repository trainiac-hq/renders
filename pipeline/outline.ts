import { sample } from '../model/curve';
import { curvePolyline as dataCurve } from './layout';
import type { Pt } from '../model/types';

// Every outline the renderer draws or models goes through here: windows,
// doors, livery shapes, warning panels, glazing frames. Nothing on a real
// train has a knife-edge corner, so each corner is rounded with a radius
// fit for what it is, and every outline is checked before it's used: a
// turn sharper than MAX_TURN at a single point fails the build rather than
// rendering as a tell-tale polygon corner.

export type Poly = [number, number][];

/** Corner radii in metres, by what the outline is. */
export const RADIUS = {
  /** Window and windscreen corners. */
  window: 0.09,
  /** Door leaves and their openings. */
  door: 0.05,
  /** Livery boundaries and warning panels. */
  livery: 0.06,
  /** Lamps, small fittings, grilles. */
  fitting: 0.025,
  /** Where a band or field of colour meets the end of a car. */
  edge: 0.02,
} as const;

/** The sharpest turn allowed at any one point of an outline, in degrees. */
export const MAX_TURN = 20;
/** Turns gentler than this are left as they are. */
const SMOOTH_TURN = 8;
/** Each step round a fillet turns at most this much. */
const STEP_TURN = 12;

const turnAt = (p: [number, number], c: [number, number], q: [number, number]) => {
  const [ax, ay] = [c[0] - p[0], c[1] - p[1]];
  const [bx, by] = [q[0] - c[0], q[1] - c[1]];
  const [la, lb] = [Math.hypot(ax, ay), Math.hypot(bx, by)];
  if (la === 0 || lb === 0) return 0;
  const cos = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
  return (Math.acos(cos) * 180) / Math.PI;
};

/**
 * Rounds every corner of a polyline sharper than a few degrees with a true
 * circular arc of `radius`, smaller where the edges either side are too
 * short for it.
 */
export function fillet(pts: Poly, radius: number, closed = true): Poly {
  // Drop repeated points first: they hide corners from the turn test.
  const clean: Poly = [];
  for (const p of pts) {
    const last = clean[clean.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-6) clean.push(p);
  }
  if (closed && clean.length > 1) {
    const [a, b] = [clean[0], clean[clean.length - 1]];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6) clean.pop();
  }
  const m = clean.length;
  if (m < 3) return clean;
  const out: Poly = [];
  for (let i = 0; i < m; i++) {
    const c = clean[i];
    if (!closed && (i === 0 || i === m - 1)) {
      out.push(c);
      continue;
    }
    const p = clean[(i - 1 + m) % m];
    const q = clean[(i + 1) % m];
    const turn = turnAt(p, c, q);
    if (turn <= SMOOTH_TURN) {
      out.push(c);
      continue;
    }
    const [ea, eb] = [
      [p[0] - c[0], p[1] - c[1]],
      [q[0] - c[0], q[1] - c[1]],
    ];
    const [la, lb] = [Math.hypot(ea[0], ea[1]), Math.hypot(eb[0], eb[1])];
    const [ua, ub] = [
      [ea[0] / la, ea[1] / la],
      [eb[0] / lb, eb[1] / lb],
    ];
    const theta = (turn * Math.PI) / 180;
    // Distance from the corner to where the arc meets each edge.
    const d = Math.min(radius * Math.tan(theta / 2), la * 0.45, lb * 0.45);
    const r = d / Math.tan(theta / 2);
    const a: [number, number] = [c[0] + ua[0] * d, c[1] + ua[1] * d];
    const b: [number, number] = [c[0] + ub[0] * d, c[1] + ub[1] * d];
    // The centre lies along the bisector.
    const bis = [ua[0] + ub[0], ua[1] + ub[1]];
    const lbis = Math.hypot(bis[0], bis[1]) || 1;
    const dist = Math.hypot(d, r);
    const o: [number, number] = [c[0] + (bis[0] / lbis) * dist, c[1] + (bis[1] / lbis) * dist];
    const a0 = Math.atan2(a[1] - o[1], a[0] - o[0]);
    let a1 = Math.atan2(b[1] - o[1], b[0] - o[0]);
    let sweep = a1 - a0;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    while (sweep < -Math.PI) sweep += 2 * Math.PI;
    a1 = a0 + sweep;
    const steps = Math.max(2, Math.ceil(turn / STEP_TURN));
    for (let k = 0; k <= steps; k++) {
      const t = a0 + ((a1 - a0) * k) / steps;
      out.push([o[0] + r * Math.cos(t), o[1] + r * Math.sin(t)]);
    }
  }
  return out;
}

/** How many outlines the corner check has passed, for the report, and the worst wobble among them. */
export const checked = { outlines: 0, points: 0, wobble: { amount: 0, name: '', at: [0, 0] as [number, number] } };

/** An outline resampled to points `spacing` apart along it. */
export function resampleEven(pts: Poly, spacing: number, closed = true): Poly {
  const path = closed ? [...pts, pts[0]] : pts;
  const lengths = [0];
  for (let i = 1; i < path.length; i++) lengths.push(lengths[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const total = lengths[lengths.length - 1];
  const n = Math.max(closed ? 8 : 2, Math.round(total / spacing));
  const out: Poly = [];
  let j = 0;
  for (let k = 0; k < (closed ? n : n + 1); k++) {
    const d = (total * k) / n;
    while (j < path.length - 2 && lengths[j + 1] < d) j++;
    const t = (d - lengths[j]) / (lengths[j + 1] - lengths[j] || 1);
    out.push([path[j][0] + (path[j + 1][0] - path[j][0]) * t, path[j][1] + (path[j + 1][1] - path[j][1]) * t]);
  }
  return out;
}

/** Wobble: how far (metres) an edge weaves either side of a smooth course. */
export const WOBBLE = {
  /** The window each point is judged over: its chord runs this far either way along the edge. */
  reach: 0.03,
  /** A bend shorter than this along the edge, between two bending the other way, is a wobble. */
  run: 0.2,
  /** Bends further apart than this along the edge, straight between, don't count as neighbours. */
  gap: 0.02,
  /** How far smoothing may move a paint edge from where it was drawn, ironing out a wobble. */
  shift: 0.008,
  /** How deep such a bend may be before the outline fails. */
  limit: 0.0008,
} as const;

/**
 * The deepest wobble along an outline, in metres: the edge is walked in
 * 5 mm steps and each point's sagitta taken against the chord WOBBLE.reach
 * either side (positive bending one way, negative the other). A smooth
 * edge bends one way for long stretches; a wobbly one, drawn through
 * uneven points or cut in steps, swaps back and forth. The depth of each
 * short bend running straight into opposite ones either side is its
 * wobble. Straight runs and
 * true corners (a fillet's arc bends one way throughout) score nothing.
 */
export function wobble(pts: Poly, closed = true, hidden?: (p: [number, number]) => boolean): { amount: number; at: [number, number] } {
  const step = 0.005;
  const p = resampleEven(pts, step, closed);
  const n = p.length;
  const k = Math.round(WOBBLE.reach / step);
  if (n < 2 * k + 3) return { amount: 0, at: p[0] ?? [0, 0] };
  const h: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!closed && (i < k || i >= n - k)) {
      h.push(0);
      continue;
    }
    const [a, c, b] = [p[(i - k + n) % n], p[i], p[(i + k) % n]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const l = Math.hypot(dx, dy) || 1;
    h.push(((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / l);
  }
  // Stretches of the edge something covers (a lamp's recess cut through a
  // panel) are not seen, so can't wobble: they bend neither way.
  if (hidden) for (let i = 0; i < n; i++) if (hidden(p[i])) h[i] = 0;
  // Runs of one sign; points barely bending at all belong to no run.
  const quiet = 0.00015;
  const runs: { sign: number; peak: number; at: number; from: number; to: number }[] = [];
  for (let i = 0; i < n; i++) {
    const s = Math.abs(h[i]) < quiet ? 0 : Math.sign(h[i]);
    const last = runs[runs.length - 1];
    if (last && last.sign === s) {
      last.to = i;
      if (Math.abs(h[i]) > last.peak) [last.peak, last.at] = [Math.abs(h[i]), i];
    } else runs.push({ sign: s, peak: Math.abs(h[i]), at: i, from: i, to: i });
  }
  const bends = runs.filter((r) => r.sign !== 0);
  let worst = { amount: 0, at: p[0] };
  const m = bends.length;
  for (let i = 0; i < m; i++) {
    if (!closed && (i === 0 || i === m - 1)) continue;
    if (m < 3) break;
    const [before, r, after] = [bends[(i - 1 + m) % m], bends[i], bends[(i + 1) % m]];
    if (before.sign === r.sign || after.sign === r.sign) continue;
    // Only bends running straight into one another: a corner, a straight,
    // then a corner the other way is a shape, not a wobble.
    const gap = (a: number, b: number) => (b - a + n) % n;
    if (gap(before.to, r.from) * step > WOBBLE.gap || gap(r.to, after.from) * step > WOBBLE.gap) continue;
    const length = (((r.to - r.from + n) % n) + 1) * step;
    if (length >= WOBBLE.run) continue;
    // A bend only as deep as its neighbours are shallow is a ripple on them.
    const depth = Math.min(r.peak, Math.max(before.peak, after.peak));
    if (depth > worst.amount) worst = { amount: depth, at: p[r.at] };
  }
  return worst;
}

/** Throws unless no point of the outline turns more than MAX_TURN. */
export function check(pts: Poly, name: string, closed = true): Poly {
  const n = pts.length;
  checked.outlines++;
  checked.points += n;
  const w = wobble(pts, closed);
  if (w.amount > checked.wobble.amount) checked.wobble = { amount: w.amount, name, at: w.at };
  if (process.env.WOBBLE_LOG) console.error(`wobble ${(w.amount * 1000).toFixed(2)} ${name} ${w.at.map((c) => c.toFixed(3))}`);
  for (let i = closed ? 0 : 1; i < (closed ? n : n - 1); i++) {
    const turn = turnAt(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n]);
    if (turn > MAX_TURN) {
      const [x, y] = pts[i];
      throw new Error(`${name}: a ${turn.toFixed(0)}° corner at (${x.toFixed(3)}, ${y.toFixed(3)}) — outlines must be filleted`);
    }
  }
  return pts;
}

/** Straight runs cut into pieces no longer than `step`, so a later warp bends them. */
export function densify(pts: Poly, step: number, closed = true): Poly {
  const out: Poly = [];
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [a, b] = [pts[i], pts[(i + 1) % n]];
    const k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}

/** The worst wobble of any paint edge, for the report. */
export const paintEdges = { count: 0, worst: 0, name: '', at: [0, 0] as [number, number] };

/**
 * A paint boundary (a livery shape, a warning panel, a black surround),
 * faired smooth and checked: it fails when what's left of any wobble is
 * deeper than WOBBLE.limit. Every paint edge on every class goes through
 * here, so none can weave, kink or step. `hidden` marks where the edge
 * is covered (inside a recess cut through the paint), which isn't judged.
 */
export function paintEdge(pts: Poly, name: string, hidden?: (p: [number, number]) => boolean): Poly {
  let out = fair(pts);
  let w = wobble(out, true, hidden);
  // What fairing leaves (a hook where a drawn curve overshoots a corner)
  // is smoothed where it is, a little at a time, as long as the edge stays
  // within WOBBLE.shift of where it was drawn.
  const faired = out;
  for (let k = 0; k < 40 && w.amount > WOBBLE.limit; k++) {
    const next = ironed(out, w.at, WOBBLE.reach * 3);
    if (drift(next, faired) > WOBBLE.shift) break;
    out = next;
    w = wobble(out, true, hidden);
  }
  out = check(out, name);
  paintEdges.count++;
  if (w.amount > paintEdges.worst) Object.assign(paintEdges, { worst: w.amount, name, at: w.at });
  if (w.amount > WOBBLE.limit) {
    const detail = `${name}: its edge wobbles ${(w.amount * 1000).toFixed(1)} mm at (${w.at[0].toFixed(3)}, ${w.at[1].toFixed(3)}) (limit ${(WOBBLE.limit * 1000).toFixed(1)} mm)`;
    if (process.env.WOBBLE_SOFT) console.error(`wobbly ${detail}`);
    else {
      findings.push({ check: 'smooth edges', name, ok: false, detail });
      throw new Error(detail);
    }
  }
  return out;
}

/** Ten passes of Laplacian smoothing on the points of a closed outline within `reach` of a point, tapering off. */
function ironed(pts: Poly, at: [number, number], reach: number): Poly {
  let p = pts;
  const n = p.length;
  const weight = p.map((c) => Math.max(0, 1 - Math.hypot(c[0] - at[0], c[1] - at[1]) / reach));
  for (let k = 0; k < 10; k++) {
    p = p.map((c, i) => {
      const [a, b] = [p[(i - 1 + n) % n], p[(i + 1) % n]];
      const f = 0.5 * weight[i];
      return [c[0] + f * ((a[0] + b[0]) / 2 - c[0]), c[1] + f * ((a[1] + b[1]) / 2 - c[1])] as [number, number];
    });
  }
  return p;
}

/** How far any point of an outline has moved from another with the same points. */
function drift(a: Poly, b: Poly): number {
  return a.reduce((m, p, i) => Math.max(m, Math.hypot(p[0] - b[i][0], p[1] - b[i][1])), 0);
}

/** A painted shape from the class data: filleted, faired, checked for corners and wobble. */
export function paintShape(pts: Pt[], radius: number, name: string): Poly {
  return paintEdge(fillet(dataCurve(pts, 16, 'chordal'), radius), name);
}

/** A closed shape from the class data, filleted and checked. */
export function shape(pts: Pt[], radius: number, name: string): Poly {
  return check(fillet(dataCurve(pts, 16), radius), name);
}

/** An open line from the class data (a panel joint), smoothed and checked. */
export function line(pts: Pt[], name: string): Poly {
  return check(fillet(sample(pts, 16), RADIUS.fitting, false), name, false);
}

/** A rectangle with every corner rounded by r, checked. */
export function roundRect(x0: number, y0: number, x1: number, y1: number, r: number, name: string): Poly {
  const rr = Math.max(1e-4, Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2));
  return check(fillet([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], rr), name);
}

/**
 * A shape drawn head-on, [u across 0..1, y], placed across the body at
 * each height by `halfWidth` and filleted in metres there.
 */
export function frontShape(pts: Pt[], halfWidth: (y: number) => number, radius: number, name: string, paint = false): Poly {
  // A shape drawn to the edge of the face runs on past it, so its corners
  // are rounded off the body rather than leaving a notch at the edge.
  const past = pts.map((p) => (p[0] <= 0.001 ? [-0.15, ...p.slice(1)] : p[0] >= 0.999 ? [1.15, ...p.slice(1)] : p) as Pt);
  // Rounded in metres, then cut fine so the warp across the body bends any straight runs.
  const placed = dataCurve(past, 16, paint ? 'chordal' : 'uniform').map(([u, y]) => [(u - 0.5) * 2 * halfWidth(y), y] as [number, number]);
  // A paint edge is faired and checked for wobble too.
  if (paint) return paintEdge(fillet(placed, radius), name, ([z, y]) => Math.abs(z) > halfWidth(y) - 0.003);
  const fine = densify(fillet(placed, radius), 0.02);
  return check(fine.map(([z, y]) => [z, y] as [number, number]), name);
}

// --- Containment ------------------------------------------------------------------------------

/** Whether a point is inside a closed outline. */
export function inside(pts: Poly, [x, y]: [number, number]): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Distance from a point to the nearest point of a closed outline. */
export function distanceToEdge(pts: Poly, [x, y]: [number, number]): number {
  let best = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const [a, b] = [pts[i], pts[(i + 1) % pts.length]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy));
  }
  return best;
}

/** Every finding of the geometry checks, for the validation report. */
export const findings: { check: string; name: string; ok: boolean; detail: string }[] = [];

/**
 * Throws unless every point of `child` lies inside `parent` at least
 * `margin` from its edge: a lamp in its housing, a grille in its panel.
 */
export function contain(child: Poly, parent: Poly, margin: number, name: string): Poly {
  let worst = Infinity;
  for (const p of child) {
    const d = inside(parent, p) ? distanceToEdge(parent, p) : -distanceToEdge(parent, p);
    worst = Math.min(worst, d);
  }
  const ok = worst >= margin - 1e-6;
  const detail = `closest ${(worst * 1000).toFixed(1)} mm to its parent's edge (margin ${(margin * 1000).toFixed(0)} mm)`;
  findings.push({ check: 'containment', name, ok, detail });
  if (!ok) throw new Error(`${name}: ${detail}`);
  return child;
}

/** A circle as a closed outline. */
export function circle(cx: number, cy: number, r: number, n = 48): Poly {
  return Array.from({ length: n }, (_, k) => {
    const t = (k / n) * Math.PI * 2;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as [number, number];
  });
}

export type LampUnit = { kind: 'head' | 'tail' | 'marker'; x: number; y: number; r: number };

/**
 * A pair of round lamps fitted inside a housing, in the housing's own
 * frame: the headlamp and a smaller tail lamp along its length (the
 * headlamp outboard, or on top), each as large as fits `margin` inside it
 * and clear of the other. `across` says which way the pair runs.
 */
export function fitLamps(housing: Poly, across: boolean, margin: number, name: string, order: 'outboard' | 'inboard' | 'below' = 'outboard'): LampUnit[] {
  const xs = housing.map((p) => p[0]);
  const ys = housing.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Split the housing across its length; in each half, the point furthest
  // from every edge (and from the split) is where that lamp goes.
  const mid = across ? (x0 + x1) / 2 : (y0 + y1) / 2;
  const best = (lowHalf: boolean): [number, number, number] => {
    let found: [number, number, number] = [0, 0, -Infinity];
    const n = 60;
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const p: [number, number] = [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * j) / n];
        const along = across ? p[0] : p[1];
        if ((along < mid) !== lowHalf || !inside(housing, p)) continue;
        const room = Math.min(distanceToEdge(housing, p), Math.abs(along - mid)) - margin;
        if (room > found[2]) found = [p[0], p[1], room];
      }
    }
    return found;
  };
  const halves = [best(true), best(false)];
  // The headlamp outboard (further from the centre line; on a flank,
  // unwrapped, that's further back) or inboard; in an upright housing on
  // top, or under the tail lamp with 'below'.
  halves.sort((p, q) =>
    !across ? (order === 'below' ? p[1] - q[1] : q[1] - p[1]) : order === 'inboard' ? Math.abs(p[0]) - Math.abs(q[0]) : Math.abs(q[0]) - Math.abs(p[0]),
  );
  const [head, tail] = halves;
  const rHead = head[2];
  const rTail = Math.min(tail[2], rHead * 0.75);
  if (rHead <= 0.01 || rTail <= 0.005) throw new Error(`${name}: the housing is too small for its lamps`);
  const lamps: LampUnit[] = [
    { kind: 'head', x: head[0], y: head[1], r: rHead },
    { kind: 'tail', x: tail[0], y: tail[1], r: rTail },
  ];
  for (const l of lamps) contain(circle(l.x, l.y, l.r), housing, margin * 0.99, `${name} ${l.kind}`);
  return lamps;
}

/**
 * Smooths away wobble: the outline resampled evenly, then Taubin-smoothed
 * (a shrinking pass, then an inflating one, repeated), which removes the
 * ripples hand-placed points leave without shrinking the shape.
 */
export function fair(pts: Poly, spacing = 0.01, passes = 40, closed = true): Poly {
  let p = densify(pts, spacing, closed);
  const n = p.length;
  if (n < 5) return p;
  for (let k = 0; k < passes; k++) {
    for (const f of [0.5, -0.53]) {
      p = p.map((c, i) => {
        if (!closed && (i === 0 || i === n - 1)) return c;
        const [a, b] = [p[(i - 1 + n) % n], p[(i + 1) % n]];
        return [c[0] + f * ((a[0] + b[0]) / 2 - c[0]), c[1] + f * ((a[1] + b[1]) / 2 - c[1])] as [number, number];
      });
    }
  }
  // Inflation can leave a kink where the spacing changes; round any off.
  return fillet(p, spacing * 2, closed);
}
