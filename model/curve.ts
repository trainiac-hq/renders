import type { Pt } from './types';

export type Bezier = readonly [Pt, Pt, Pt, Pt];

/**
 * A smooth curve through the points as cubic Béziers (Catmull-Rom). A
 * sharp point stops the curve bending through it; a segment between two
 * sharp points is straight, its control points on its ends. `chordal`
 * weighs each tangent by the segments' lengths (paint edges use it: they
 * never overshoot where uneven points meet).
 */
export function beziers(pts: Pt[], closed: boolean, spacing: 'uniform' | 'chordal' = 'uniform'): Bezier[] {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const sharp = (p: Pt) => p.length === 3;
  const out: Bezier[] = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p1 = at(i);
    const p2 = at(i + 1);
    if (sharp(p1) && sharp(p2)) {
      out.push([p1, p1, p2, p2]);
      continue;
    }
    const p0 = sharp(p1) ? p1 : at(i - 1);
    const p3 = sharp(p2) ? p2 : at(i + 2);
    // Each end's tangent is the chord across it; 'chordal' shares it out by
    // the lengths either side, so a short segment beside a long one doesn't
    // overshoot its corner.
    const d = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-9;
    const [k1, k2] = spacing === 'uniform' ? [1 / 6, 1 / 6] : [d(p1, p2) / (d(p0, p1) + d(p1, p2)) / 3, d(p1, p2) / (d(p1, p2) + d(p2, p3)) / 3];
    out.push([p1, [p1[0] + (p2[0] - p0[0]) * k1, p1[1] + (p2[1] - p0[1]) * k1], [p2[0] - (p3[0] - p1[0]) * k2, p2[1] - (p3[1] - p1[1]) * k2], p2]);
  }
  return out;
}

/** The curve as an SVG path, its points placed by `place`. */
export function curvePath(pts: Pt[], closed: boolean, place: (p: Pt) => string): string {
  let d = `M${place(pts[0])}`;
  for (const [p1, c1, c2, p2] of beziers(pts, closed)) {
    d += c1 === p1 && c2 === p2 ? `L${place(p2)}` : `C${place(c1)} ${place(c2)} ${place(p2)}`;
  }
  return closed ? d + 'Z' : d;
}

/** The open curve through the points as a polyline, `steps` points per segment. */
export function sample(pts: Pt[], steps = 12): [number, number][] {
  const out: [number, number][] = [[pts[0][0], pts[0][1]]];
  for (const [p1, c1, c2, p2] of beziers(pts, false)) {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      out.push([
        u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
        u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
      ]);
    }
  }
  return out;
}

/**
 * The front edge of a nose profile at a height: its foremost crossing of
 * that height, or `fallback` when the profile never reaches it.
 */
export function frontAt(sampled: [number, number][], y: number, fallback: number): number {
  return frontOf(sampled, fallback)(y);
}

/**
 * frontAt for many heights: the segments crossing each band between the
 * profile's heights found once, so a lookup is a binary search, not a scan
 * of every segment (the nose decals ask millions of times).
 */
export function frontOf(sampled: [number, number][], fallback: number): (y: number) => number {
  const ys = [...new Set(sampled.map((p) => p[1]))].sort((a, b) => a - b);
  const segs = sampled.slice(0, -1).map((a, i) => [a, sampled[i + 1]]).filter(([a, b]) => a[1] !== b[1]);
  // bands[i]: the segments spanning ys[i]..ys[i + 1].
  const bands = ys.slice(0, -1).map((lo, i) => segs.filter(([a, b]) => Math.min(a[1], b[1]) <= lo && Math.max(a[1], b[1]) >= ys[i + 1]));
  const crossing = (band: [number, number][][] | undefined, y: number, best: number) => {
    for (const [a, b] of band ?? []) best = Math.min(best, a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    return best;
  };
  return (y) => {
    if (!(y >= ys[0] && y <= ys[ys.length - 1])) return fallback;
    let lo = 0;
    let hi = ys.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (ys[mid] <= y) lo = mid;
      else hi = mid;
    }
    // On a profile height itself, the segments ending there from below count too.
    let best = crossing(bands[lo], y, Infinity);
    if (y === ys[lo] && lo > 0) best = crossing(bands[lo - 1], y, best);
    return best === Infinity ? fallback : best;
  };
}
