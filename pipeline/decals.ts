import { writeFileSync } from 'node:fs';

import type { ClassArt, Form, Livery, Pt } from '../model/types';
import { cantrailBand, curvePolyline } from './layout';
import { sample } from '../model/curve';
import { check, circle, contain, densify, distanceToEdge, fair, fillet, findings, fitLamps, paintEdge, RADIUS } from './outline';

import { type Mesh, noseHalfWidth, noseOf } from './shell';

// A long nose's glazing, black surrounds and warning panel, as thin meshes
// laid on its surface, so their edges are exact curves whatever the body
// mesh is doing underneath.
//
// They are built in the nose's unwrapped surface: s is distance over the
// surface from the centre line, across the nose and on along the flank, at
// each height y. Distances there are true distances on the train, so a
// surround offset by 4 cm is 4 cm wide all the way round, and meshes have
// even triangles whether they lie on the face or wrap onto the side.

type P2 = [number, number];

const SAMPLES = 160;

/** The nose's unwrapping: to and from (s, y), and onto the surface. */
export function atlas(art: ClassArt, form: Form) {
  const nose = noseOf(art, form);
  const halfWidth = noseHalfWidth(art, form);
  const h = art.heights;
  // Arc length along the nose's plan curve at a height, from the centre
  // line (t = 0) to the flank (t = 1, t being z over the half width).
  // Rows are kept on a 1 cm grid of heights and blended between.
  const rows = new Map<number, { t: number[]; s: number[] }>();
  const row = (key: number) => {
    let r = rows.get(key);
    if (r) return r;
    const y = key / 100;
    const [p, q, hw] = [nose.P(y), nose.Q(y), halfWidth(y)];
    const t: number[] = [];
    const s: number[] = [];
    let total = 0;
    let prev: P2 = [0, p];
    for (let i = 0; i <= SAMPLES; i++) {
      // Crowd samples towards the flank, where the curve turns fastest.
      const tt = 1 - (1 - i / SAMPLES) ** 2;
      const here: P2 = [tt * hw, p + q * nose.plan(tt)];
      total += Math.hypot(here[0] - prev[0], here[1] - prev[1]);
      prev = here;
      t.push(tt);
      s.push(total);
    }
    r = { t, s };
    rows.set(key, r);
    return r;
  };
  const lookup = (from: number[], to: number[], v: number) => {
    if (v <= from[0]) return to[0];
    let lo = 0;
    let hi = from.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (from[mid] < v) lo = mid;
      else hi = mid;
    }
    const k = Math.min(1, Math.max(0, (v - from[lo]) / (from[hi] - from[lo] || 1)));
    return to[lo] + (to[hi] - to[lo]) * k;
  };
  /** A row lookup blended between the rows either side of a height. */
  const blended = (y: number, f: (r: { t: number[]; s: number[] }) => number) => {
    const k = y * 100;
    const k0 = Math.floor(k);
    const w = k - k0;
    return f(row(k0)) * (1 - w) + f(row(k0 + 1)) * w;
  };
  const edgeAt = (y: number) => blended(y, (r) => r.s[r.s.length - 1]);
  const sOf = (t: number, y: number) => blended(y, (r) => lookup(r.t, r.s, t));
  const tOf = (s: number, y: number) => blended(y, (r) => lookup(r.s, r.t, s));
  const clampY = (y: number) => Math.min(h.roof - 0.01, Math.max(nose.lowest + 0.01, y));

  /** A point drawn head-on, [u across 0..1, y], to (s, y). */
  const fromFront = ([u, y]: P2): P2 => {
    const t = (u - 0.5) * 2;
    return [Math.sign(t) * sOf(Math.min(1, Math.abs(t)), clampY(y)), y];
  };
  /** A point drawn from the side, [x back from the tip, y], to (s, y) on the near flank. */
  const fromSide = ([x, y]: P2): P2 => {
    const yy = clampY(y);
    const [p, q] = [nose.P(yy), nose.Q(yy)];
    if (x >= p + q) return [-(edgeAt(yy) + x - p - q), y];
    return [-sOf(nose.across((x - p) / q), yy), y];
  };
  /** (s, y) to a point on the surface, [x, y, z]. */
  const toSurface = ([s, y]: P2): [number, number, number] => {
    const yy = clampY(y);
    const [p, q, hw] = [nose.P(yy), nose.Q(yy), halfWidth(yy)];
    const a = Math.abs(s);
    const edge = edgeAt(yy);
    if (a >= edge) return [p + q + (a - edge), y, Math.sign(s) * hw];
    const t = tOf(a, yy);
    return [p + q * nose.plan(t), y, Math.sign(s) * t * hw];
  };
  return { fromFront, fromSide, toSurface };
}

// --- Polygons in the unwrapped surface ---------------------------------------------------

function area(pts: P2[]) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [p, q] = [pts[i], pts[(i + 1) % pts.length]];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** A closed outline moved outwards by d (inwards when negative). */
export function offset(pts: P2[], d: number): P2[] {
  const sign = area(pts) > 0 ? 1 : -1;
  const n = pts.length;
  return pts.map((c, i) => {
    const [p, q] = [pts[(i - 1 + n) % n], pts[(i + 1) % n]];
    const normals = [
      [c[1] - p[1], p[0] - c[0]],
      [q[1] - c[1], c[0] - q[0]],
    ].map(([x, y]) => {
      const l = Math.hypot(x, y) || 1;
      return [(x / l) * sign, (y / l) * sign];
    });
    const [nx, ny] = [normals[0][0] + normals[1][0], normals[0][1] + normals[1][1]];
    const l = Math.hypot(nx, ny) || 1;
    const cos = Math.max(0.5, (normals[0][0] * nx + normals[0][1] * ny) / l);
    return [c[0] + (nx / l) * (d / cos), c[1] + (ny / l) * (d / cos)];
  });
}

/** An outline resampled to n points evenly along its length. */
function resample(pts: P2[], n: number): P2[] {
  const closed = [...pts, pts[0]];
  const lengths = [0];
  for (let i = 1; i < closed.length; i++) lengths.push(lengths[i - 1] + Math.hypot(closed[i][0] - closed[i - 1][0], closed[i][1] - closed[i - 1][1]));
  const total = lengths[lengths.length - 1];
  const out: P2[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const d = (total * k) / n;
    while (j < closed.length - 2 && lengths[j + 1] < d) j++;
    const t = (d - lengths[j]) / (lengths[j + 1] - lengths[j] || 1);
    out.push([closed[j][0] + (closed[j + 1][0] - closed[j][0]) * t, closed[j][1] + (closed[j + 1][1] - closed[j][1]) * t]);
  }
  return out;
}

/** Whether a point is inside a closed outline. */
function inside(pts: P2[], [x, y]: P2): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** The part of a closed outline inside an axis-aligned cell (Sutherland–Hodgman). */
function clip(pts: P2[], x0: number, y0: number, x1: number, y1: number): P2[] {
  const edges: [(p: P2) => boolean, (a: P2, b: P2) => P2][] = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  let out = pts;
  for (const [keep, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const [a, b] = [input[i], input[(i + 1) % input.length]];
      if (keep(b)) {
        if (!keep(a)) out.push(cut(a, b));
        out.push(b);
      } else if (keep(a)) out.push(cut(a, b));
    }
    if (out.length === 0) break;
  }
  return out;
}

/**
 * A filled outline as a grid of small cells: whole cells inside it, and
 * the outline clipped to each cell along its edge. Small enough that the
 * flat pieces never dip into the curved body under them, and exact at the
 * edge whatever the outline's shape.
 */
function fill(pts: P2[], step: number, holes: P2[][] = []): { verts: P2[]; tris: [number, number, number][] } {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [sx, sy] = [Math.min(...xs), Math.min(...ys)];
  const nx = Math.ceil((Math.max(...xs) - sx) / step);
  const ny = Math.ceil((Math.max(...ys) - sy) / step);
  // Cells the outline passes through.
  const edge = new Set<number>();
  for (let i = 0; i < pts.length; i++) {
    const [a, b] = [pts[i], pts[(i + 1) % pts.length]];
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (step / 4)) + 1;
    for (let k = 0; k <= n; k++) {
      const [x, y] = [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n];
      const [cx, cy] = [Math.min(nx - 1, Math.floor((x - sx) / step)), Math.min(ny - 1, Math.floor((y - sy) / step))];
      for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) edge.add((cy + dy) * nx + cx + dx);
    }
  }
  const boxes = holes.map((h) => {
    const hx = h.map((p) => p[0]);
    const hy = h.map((p) => p[1]);
    return [Math.min(...hx), Math.max(...hx), Math.min(...hy), Math.max(...hy)];
  });
  const verts: P2[] = [];
  const tris: [number, number, number][] = [];
  const piece = (poly: P2[]) => {
    if (poly.length < 3) return;
    const base = verts.length;
    verts.push(...poly);
    for (let i = 1; i < poly.length - 1; i++) tris.push([base, base + i, base + i + 1]);
  };
  const cell = (x0: number, y0: number, x1: number, y1: number, onEdge: boolean) => {
    if (onEdge) piece(clip(pts, x0, y0, x1, y1));
    else if (inside(pts, [(x0 + x1) / 2, (y0 + y1) / 2])) piece([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
  };
  // Where a hole (a lamp's recess) crosses a cell, the cell is cut into
  // small pieces: those inside the hole are left out, and those its edge
  // crosses are cut along that edge, so the fill's edge there is the
  // hole's own smooth outline rather than a stair-step of whole pieces.
  const SUB = 6;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const [x0, y0] = [sx + i * step, sy + j * step];
      const [x1, y1] = [x0 + step, y0 + step];
      const onEdge = edge.has(j * nx + i);
      const near = holes.filter((_, k) => boxes[k][0] < x1 && boxes[k][1] > x0 && boxes[k][2] < y1 && boxes[k][3] > y0);
      if (!near.length) {
        cell(x0, y0, x1, y1, onEdge);
        continue;
      }
      const d = step / SUB;
      for (let a = 0; a < SUB; a++) {
        for (let b = 0; b < SUB; b++) {
          const [u0, v0] = [x0 + a * d, y0 + b * d];
          const square: P2[] = [[u0, v0], [u0 + d, v0], [u0 + d, v0 + d], [u0, v0 + d]];
          let poly = onEdge ? clip(pts, u0, v0, u0 + d, v0 + d) : inside(pts, [u0 + d / 2, v0 + d / 2]) ? square : [];
          for (const h of near) {
            if (poly.length < 3) break;
            poly = outsideHole(poly, h, [u0 + d / 2, v0 + d / 2], d);
          }
          piece(poly);
        }
      }
    }
  }
  return { verts, tris };
}

/**
 * The part of a small piece outside a hole. A piece well clear of the
 * hole's edge is wholly in or out; one the edge crosses is cut along the
 * line of the edge's nearest segment, which over a piece a few
 * millimetres across is the edge itself to a hundredth of a millimetre
 * (the holes are lamp recesses, rounded at 25 mm and more).
 */
function outsideHole(poly: P2[], hole: P2[], centre: P2, size: number): P2[] {
  let best = Infinity;
  let at = 0;
  for (let i = 0; i < hole.length; i++) {
    const [a, b] = [hole[i], hole[(i + 1) % hole.length]];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const t = Math.max(0, Math.min(1, ((centre[0] - a[0]) * dx + (centre[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    const dist = Math.hypot(centre[0] - a[0] - t * dx, centre[1] - a[1] - t * dy);
    if (dist < best) [best, at] = [dist, i];
  }
  if (best > size) return inside(hole, centre) ? [] : poly;
  const [a, b] = [hole[at], hole[(at + 1) % hole.length]];
  // Inside the hole is to the left of its edges when it runs anticlockwise.
  const sign = area(hole) > 0 ? 1 : -1;
  const side = (p: P2) => sign * ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
  const out: P2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const [p, q] = [poly[i], poly[(i + 1) % poly.length]];
    const [sp, sq] = [side(p), side(q)];
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

/** The band between two outlines, as quads of even width. */
function band(outer: P2[], inner: P2[], n: number): { verts: P2[]; quads: [number, number, number, number][] } {
  const a = resample(outer, n);
  const b = resample(inner, n);
  // Line the two up from the inner point nearest the outer's first.
  let start = 0;
  let best = Infinity;
  b.forEach((p, i) => {
    const d = Math.hypot(p[0] - a[0][0], p[1] - a[0][1]);
    if (d < best) [best, start] = [d, i];
  });
  const bb = [...b.slice(start), ...b.slice(0, start)];
  if (area(a) * area(bb) < 0) bb.reverse();
  const verts = [...a, ...bb];
  const quads: [number, number, number, number][] = [];
  for (let i = 0; i < n; i++) quads.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
  return { verts, quads };
}

// --- The decals ------------------------------------------------------------------------------

/** The decal mesh: faces carry material numbers; every vertex has the surface's normal there and its layer's lift. */
export type Decals = Mesh & { materials: number[]; names: string[]; normals: number[]; lifts: number[]; raised: number[] };

/**
 * How far each layer stands off the paint, in metres: all between 0.5 and
 * 3 mm, at least 0.25 mm apart, so they stack without fighting and never
 * float visibly. A layer always covers what it's drawn over: regions meant
 * to meet share the upper one's edge, the lower running on under it, so
 * no sliver of body colour can show between them.
 */
export const LIFT = {
  panel: 0.0006,
  /** Painted areas over the panel: a valance along the bottom. */
  shape: 0.0009,
  dark: 0.0012,
  grille: 0.0015,
  stripe: 0.0018,
  frame: 0.0021,
  glass: 0.0024,
  bar: 0.0027,
} as const;

/** Margins between a part and the edge of what holds it. */
const MARGIN = { lamp: 0.012, grille: 0.02, window: 0.02 };

export function decals(art: ClassArt, form: Form, paints: Livery): Decals | null {
  const panelShown = (paints.panel ?? '#F7D117') !== 'none';
  const front = form.front;
  if (!front) return null;
  const a = atlas(art, form);
  const halfWidth = noseHalfWidth(art, form);
  const out: Decals = { vertices: [], quads: [], tris: [], materials: [], names: [], normals: [], lifts: [], raised: [] };
  // Materials by name, numbered as they're first used. 'paint:<colour>' is
  // satin paint in that colour; the rest are the renderer's own.
  const mat = (name: string) => {
    const i = out.names.indexOf(name);
    if (i >= 0) return i;
    out.names.push(name);
    return out.names.length - 1;
  };
  const triMats: number[] = [];
  const quadMats: number[] = [];

  // A point on the surface and the outward normal there, from the
  // unwrapping by finite differences. Blender lays each vertex onto the
  // shell itself along this normal, at its layer's lift.
  // A panel that stands proud: everything laid on inside its outline is
  // lifted with it, rising over a short ramp at its edge, which is the
  // step between the moulding and the body.
  // Its outline is the panel's (below); where a lamp's recess is cut
  // through it, the ramp runs down to the recess's edge too, so the
  // moulding meets the lamp's cover flush.
  let cone: P2[] | null = null;
  const RAMP = 0.018;
  const rise = (p: P2) => {
    if (!cone || !front.rise || !inside(cone, p)) return 0;
    const edge = Math.min(distanceToEdge(cone, p), ...holes.map((h) => (inside(h, p) ? 0 : distanceToEdge(h, p))));
    const t = Math.min(1, edge / RAMP);
    return front.rise * t * t * (3 - 2 * t);
  };
  const place = ([s, y]: P2, layer: number) => {
    const raised = rise([s, y]);
    const lift = layer + raised;
    const p = a.toSurface([s, y]);
    // Central differences: on the centre line, where the nose's plan may
    // meet itself at an angle, the normal is the two sides' bisector.
    const [s0, s1] = [a.toSurface([s - 0.003, y]), a.toSurface([s + 0.003, y])];
    const [y0, y1] = [a.toSurface([s, y - 0.003]), a.toSurface([s, y + 0.003])];
    const u = [s1[0] - s0[0], s1[1] - s0[1], s1[2] - s0[2]];
    const v = [y1[0] - y0[0], y1[1] - y0[1], y1[2] - y0[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    n = n.map((c) => c / l);
    // Outwards: away from the train's middle and ahead of the nose.
    const away = n[0] * -1 + n[2] * Math.sign(p[2] || 1e-9);
    if (away < 0) n = n.map((c) => -c);
    out.vertices.push(p[0], p[1], p[2]);
    out.normals.push(n[0], n[1], n[2]);
    out.lifts.push(lift);
    out.raised.push(raised);
  };
  // Nothing laid on may hang off the body's edge.
  const lowest = noseOf(art, form).lowest;
  const onBody = (outline: P2[], name: string) => {
    const ys = outline.map((p) => p[1]);
    const ok = Math.min(...ys) >= lowest + 0.005 && Math.max(...ys) <= art.heights.roof - 0.02;
    findings.push({ check: 'on the body', name, ok, detail: `spans ${Math.min(...ys).toFixed(3)} to ${Math.max(...ys).toFixed(3)} m up; the nose runs ${lowest.toFixed(3)} to ${art.heights.roof.toFixed(3)}` });
    if (!ok) throw new Error(`${name}: hangs off the body (${Math.min(...ys).toFixed(3)} to ${Math.max(...ys).toFixed(3)} m)`);
  };
  // The lamps' recesses are cut into the body (body.py): nothing laid on
  // the nose may skin over them.
  const holes: P2[][] = [];
  // Every area laid on, with its height, for the check that what one layer
  // leaves showing of another is never a sliver.
  const laid: { area: P2[]; hole?: P2[]; lift: number; material: string }[] = [];
  const addFill = (outline: P2[], lift: number, material: string, cut: P2[][] = []) => {
    laid.push({ area: outline, lift, material });
    onBody(outline, material);
    const { verts, tris } = fill(outline, 0.012, [...holes, ...cut]);
    const base = out.vertices.length / 3;
    for (const v of verts) place(v, lift);
    const m = mat(material);
    for (const [i, j, k] of tris) {
      out.tris.push(base + i, base + j, base + k);
      triMats.push(m);
    }
  };
  const addQuads = (verts: P2[], quads: [number, number, number, number][], lift: number, material: string) => {
    const base = out.vertices.length / 3;
    for (const v of verts) place(v, lift);
    const m = mat(material);
    for (const [i, j, k, l] of quads) {
      out.quads.push(base + i, base + j, base + k, base + l);
      quadMats.push(m);
    }
  };
  const addBand = (outer: P2[], inner: P2[], lift: number, material: string) => {
    laid.push({ area: outer, hole: inner, lift, material });
    const { verts, quads } = band(outer, inner, Math.max(48, Math.round(perimeter(outer) / 0.004)));
    addQuads(verts, quads, lift, material);
  };
  /** A strip of even width along an open line. */
  const addStripe = (raw: P2[], width: number, lift: number, material: string) => {
    // Over a raised panel's ramp the stripe must follow the ramp's curve,
    // not a chord across it (which dips under the panel and shows again
    // at the foot as a blob), so it is sampled well inside the ramp's width.
    const line = front.rise ? densify(raw, RAMP / 8, false) : raw;
    const verts: P2[] = [];
    line.forEach((p, i) => {
      const [q0, q1] = [line[Math.max(0, i - 1)], line[Math.min(line.length - 1, i + 1)]];
      const [dx, dy] = [q1[0] - q0[0], q1[1] - q0[1]];
      const l = Math.hypot(dx, dy) || 1;
      const [nx, ny] = [(-dy / l) * (width / 2), (dx / l) * (width / 2)];
      verts.push([p[0] + nx, p[1] + ny], [p[0] - nx, p[1] - ny]);
    });
    const quads: [number, number, number, number][] = [];
    for (let i = 0; i < line.length - 1; i++) quads.push([2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1]);
    addQuads(verts, quads, lift, material);
  };

  // Outlines are unwrapped first and then shaped in true metres on the
  // train: livery boundaries faired smooth, fittings filleted, all checked.
  const mirror = (pts: P2[]): P2[] => pts.map(([s, y]) => [-s, y]);
  const bothSides = (pts: P2[]) => [pts, mirror(pts)];
  const livery = (pts: Pt[], to: (p: P2) => P2, name: string) => paintEdge(fillet(curvePolyline(pts, 16, 'chordal').map(to), RADIUS.livery), name);
  const fitting = (pts: Pt[], to: (p: P2) => P2, radius: number, name: string) =>
    check(densify(fillet(curvePolyline(pts, 16).map(to), radius), 0.006), name);
  const unwrapLine = (pts: Pt[], name: string): P2[] =>
    check(fair(fillet(sample(pts, 16).map((p) => a.fromFront(p)), RADIUS.livery, false), 0.01, 40, false), name, false);

  // Lamp recesses. Set deep, a little larger than the cutters so their
  // rim is clean. Set flush, there is no rim to hide an edge: the hole is
  // the housing exactly as body.py cuts it (offset 12 mm on the face,
  // [z, y]), so the paint runs right up to the lamp's cover.
  const flush = front.lampStyle === 'flush' || front.lampStyle === 'glazed';
  const housing = (lamp: P2[]): P2[] => {
    const face = lamp.map((p) => {
      const [, y, z] = a.toSurface(p);
      return [z, y] as P2;
    });
    const even = resample(face, Math.max(8, Math.floor(perimeter(face) / 0.004)));
    return offset(even, 0.012).map(([z, y]) => a.fromFront([z / (2 * halfWidth(y)) + 0.5, y]));
  };
  const recess = (lamp: P2[]) => (flush ? offset(housing(lamp), 0.0005) : offset(lamp, 0.016));
  for (const lamp of front.lights ?? []) holes.push(recess(fitting(lamp, a.fromFront, RADIUS.fitting, 'lamp recess')));
  for (const lamp of form.side?.lights ?? []) holes.push(...bothSides(fitting(lamp, a.fromSide, RADIUS.fitting, 'flank lamp recess')).map(recess));

  // The panel, its sides carried along the lamps' inner edges where the class says so.
  const panelOutline = front.panel
    ? front.panelToLamps === undefined
      ? livery(front.panel, a.fromFront, 'panel')
      : paintEdge(fillet(alongLamps(curvePolyline(front.panel, 16, 'chordal').map(a.fromFront), holes, front.panelToLamps), RADIUS.livery), 'panel', (p) => holes.some((h) => inside(h, p) || distanceToEdge(h, p) < 0.005))
    : null;
  if (front.rise && panelOutline) cone = panelOutline;

  // Painted regions, lowest first.
  if (panelShown) {
    if (panelOutline) addFill(panelOutline, LIFT.panel, 'panel');
    if (form.side?.panel) for (const p of bothSides(livery(form.side.panel, a.fromSide, 'flank panel'))) addFill(p, LIFT.panel, 'panel');
  }
  // A later shape is painted over the earlier ones: cut out of them, at the same height.
  const shapes = (front.shapes ?? []).map((area) => ({ outline: livery(area.pts, a.fromFront, 'painted area'), color: area.color }));
  for (const [k, sh] of shapes.entries()) addFill(sh.outline, LIFT.shape, `paint:${sh.color}`, shapes.slice(k + 1).map((t) => t.outline));
  const darks = (front.dark ?? []).map((d) => livery(d, a.fromFront, 'nose dark'));
  for (const d of darks) addFill(d, LIFT.dark, 'dark');
  const flankDarks = (form.side?.dark ?? []).flatMap((d) => bothSides(livery(d, a.fromSide, 'flank dark')));
  for (const d of flankDarks) addFill(d, LIFT.dark, 'dark');

  // Grilles: perforated metal in a black frame, each inside the dark panel that holds it.
  for (const g of front.grilles ?? []) {
    const grille = fitting(g, a.fromFront, RADIUS.fitting, 'grille');
    const frame = offset(grille, 0.012);
    const parent = darks.find((d) => inside(d, centroid(grille)));
    if (!parent) throw new Error('grille: not inside any dark panel');
    contain(frame, parent, MARGIN.grille, 'grille');
    addBand(frame, grille, LIFT.grille, 'black');
    addFill(grille, LIFT.grille, 'grille');
  }
  for (const line of form.side?.lines ?? []) {
    for (const l of bothSides(check(densify(fillet(curvePolyline(line, 16).map(a.fromSide), RADIUS.door), 0.006), 'flank joint'))) {
      addBand(offset(l, 0.004), offset(l, -0.004), LIFT.stripe, 'seam');
    }
  }
  // Panel joints: thin dark lines (a coupler cover's edge and middle).
  const JOINT = 0.008;
  const joints = (front.lines ?? []).map((line) => unwrapLine(line, 'joint'));
  // Joints that run to the panel's edge: each end carried on, or cut
  // back, to where the painted panel ends (its outline, or a lamp's
  // recess cut through it) or to the joint it points at.
  const visible = (p: P2) => !!panelOutline && inside(panelOutline, p) && !holes.some((h) => inside(h, p));
  for (const line of front.edgeLines ?? []) joints.push(toEdges(unwrapLine(line, 'edge joint'), visible, panelOutline ? [panelOutline, ...holes] : [], joints, JOINT));
  for (const j of joints) addStripe(j, JOINT, LIFT.stripe, 'seam');
  if (process.env.DECALS_DUMP) writeFileSync(process.env.DECALS_DUMP, JSON.stringify({ panel: panelOutline, holes, joints }));
  if (panelOutline && panelShown) checkJointEnds(joints, front.edgeLines?.length ?? 0, [panelOutline, ...holes], visible, JOINT);
  // The cantrail line over the nose: the livery's own colour and width,
  // its ends at the bodyside line's height and running on along the flank
  // a little way, level, so the two meet as one line.
  const line = cantrailBand(art, paints);
  if (front.cantrailLine && line) {
    const y = (line.lo + line.hi) / 2;
    const width = line.hi - line.lo;
    const pts = front.cantrailLine.map((p, i, all) => (i === 0 || i === all.length - 1 ? ([p[0], y] as Pt) : p));
    const path = unwrapLine(pts, 'cantrail line');
    const [first, last] = [path[0], path[path.length - 1]];
    const run = (p: P2): P2[] => [0.01, 0.02, 0.03].map((d) => [p[0] + Math.sign(p[0]) * d, y]);
    const whole = [...run(first).reverse(), ...path, ...run(last)];
    addStripe(whole, width, LIFT.stripe, `paint:${line.color}`);
    // Where it meets the bodyside: same height, same width, level.
    for (const [end, next] of [[first, path[1]], [last, path[path.length - 2]]] as const) {
      const dy = Math.abs(end[1] - y);
      const slope = Math.abs((next[1] - end[1]) / (next[0] - end[0] || 1e-9));
      const ok = dy < 0.0005 && slope < 0.15;
      findings.push({
        check: 'line continuity',
        name: 'cantrail line at the nose',
        ok,
        detail: `meets the bodyside line ${(dy * 1000).toFixed(2)} mm off its centre, width ${(width * 1000).toFixed(0)} mm both sides, slope ${slope.toFixed(2)} at the seam`,
      });
      if (!ok) throw new Error('cantrail line: does not meet the bodyside line cleanly');
    }
  }
  for (const screen of front.screens) {
    const glass = fitting(screen, a.fromFront, RADIUS.window, 'windscreen');
    // A screen set in a dark panel (a camera's, say) stays inside it.
    const parent = darks.find((d) => inside(d, centroid(glass)));
    if (parent) contain(glass, parent, MARGIN.window, 'screen in its panel');
    else addBand(offset(glass, 0.04), glass, LIFT.frame, 'frame');
    addFill(glass, LIFT.glass, 'glass');
  }
  for (const pane of art.nose.glazing ?? []) {
    for (const glass of bothSides(fitting(pane, a.fromSide, RADIUS.window, 'cab window'))) {
      const parent = flankDarks.find((d) => inside(d, centroid(glass)));
      if (parent) contain(offset(glass, 0.035), parent, MARGIN.window / 2, 'cab window');
      addBand(offset(glass, 0.035), glass, LIFT.frame, 'frame');
      addFill(glass, LIFT.glass, 'glass');
    }
  }
  // Glazing bars across those windows.
  for (const bar of form.side?.bars ?? []) {
    const line = check(sample(bar, 16).map(a.fromSide), 'glazing bar', false);
    for (const l of bothSides(line)) addStripe(l, 0.03, LIFT.bar, 'frame');
  }

  // A lower area left showing past an upper one's edge must be there by
  // design, never a sliver: what's visible of each painted area, opened
  // by a 12 mm disc, must lose almost nothing.
  for (const [k, region] of laid.entries()) {
    if (region.hole || !/^(panel|dark|paint:)/.test(region.material)) continue;
    const paints = (r: { material: string }) => r.material.startsWith('paint:');
    const above = laid.filter((r, j) => j !== k && (r.lift > region.lift || (r.lift === region.lift && j > k && paints(r) && paints(region))));
    // Thin pieces longer than 50 mm: a crescent of one colour along another's edge.
    const pieces = slivers(region.area, [...above, ...holes.map((h) => ({ area: h }))]);
    const long = pieces.filter((p) => p.length > 0.05);
    const ok = long.length === 0;
    const worst = pieces.reduce((m, p) => Math.max(m, p.length), 0);
    findings.push({
      check: 'slivers',
      name: `${region.material} left showing`,
      ok,
      detail: ok
        ? `${pieces.length} thin tips where edges cross, the longest ${(worst * 1000).toFixed(0)} mm (limit 50)`
        : long.map((p) => `${(p.length * 1000).toFixed(0)} mm sliver at (${p.at[0].toFixed(2)}, ${p.at[1].toFixed(2)})`).join(', '),
    });
    if (!ok) throw new Error(`${region.material}: shows as slivers past the areas over it: ${findings[findings.length - 1].detail}`);
  }

  out.materials = [...quadMats, ...triMats];
  return out;
}

/**
 * How much of an area, in square metres, shows only as slivers once the
 * areas over it are taken away: rasterised at 2 mm, the visible part is
 * opened (eroded, then dilated) by a 6 mm radius and what that removes
 * is counted.
 */
function slivers(area: P2[], over: { area: P2[]; hole?: P2[] }[]): { length: number; area: number; at: P2 }[] {
  const px = 0.002;
  const xs = area.map((p) => p[0]);
  const ys = area.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs) - 0.02, Math.min(...ys) - 0.02];
  const w = Math.ceil((Math.max(...xs) + 0.02 - x0) / px);
  const h = Math.ceil((Math.max(...ys) + 0.02 - y0) / px);
  const raster = (poly: P2[]) => {
    const m = new Uint8Array(w * h);
    // Scanline fill.
    for (let j = 0; j < h; j++) {
      const y = y0 + (j + 0.5) * px;
      const cross: number[] = [];
      for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
        const [a, b] = [poly[k], poly[i]];
        if (a[1] > y !== b[1] > y) cross.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      cross.sort((p, q) => p - q);
      for (let c = 0; c + 1 < cross.length; c += 2) {
        const i0 = Math.max(0, Math.ceil((cross[c] - x0) / px - 0.5));
        const i1 = Math.min(w - 1, Math.floor((cross[c + 1] - x0) / px - 0.5));
        for (let i = i0; i <= i1; i++) m[j * w + i] = 1;
      }
    }
    return m;
  };
  const visible = raster(area);
  for (const o of over) {
    const ox = o.area.map((p) => p[0]);
    const oy = o.area.map((p) => p[1]);
    if (Math.max(...ox) < x0 || Math.min(...ox) > x0 + w * px || Math.max(...oy) < y0 || Math.min(...oy) > y0 + h * px) continue;
    const cover = raster(o.area);
    const gap = o.hole ? raster(o.hole) : null;
    for (let i = 0; i < visible.length; i++) if (cover[i] && !(gap && gap[i])) visible[i] = 0;
  }
  const r = 3;
  // Square erosion then dilation, separable.
  const pass = (src: Uint8Array, keep: (window: number) => boolean) => {
    const tmp = new Uint8Array(w * h);
    const out = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        let n = 0;
        for (let d = -r; d <= r; d++) {
          const ii = i + d;
          if (ii >= 0 && ii < w) n += src[j * w + ii];
        }
        tmp[j * w + i] = keep(n) ? 1 : 0;
      }
    }
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        let n = 0;
        for (let d = -r; d <= r; d++) {
          const jj = j + d;
          if (jj >= 0 && jj < h) n += tmp[jj * w + i];
        }
        out[j * w + i] = keep(n) ? 1 : 0;
      }
    }
    return out;
  };
  const eroded = pass(visible, (n) => n === 2 * r + 1);
  const opened = pass(eroded, (n) => n > 0);
  // The thin pieces, each measured by its longest extent: the tip of a
  // wedge where two edges cross is short, a crescent along an edge long.
  const thin = new Uint8Array(w * h);
  for (let i = 0; i < visible.length; i++) if (visible[i] && !opened[i]) thin[i] = 1;
  const pieces: { length: number; area: number; at: P2 }[] = [];
  const seen = new Uint8Array(w * h);
  for (let start = 0; start < thin.length; start++) {
    if (!thin[start] || seen[start]) continue;
    const stack = [start];
    seen[start] = 1;
    let [i0, i1, j0, j1, n] = [Infinity, -Infinity, Infinity, -Infinity, 0];
    while (stack.length) {
      const c = stack.pop()!;
      const [i, j] = [c % w, Math.floor(c / w)];
      [i0, i1, j0, j1, n] = [Math.min(i0, i), Math.max(i1, i), Math.min(j0, j), Math.max(j1, j), n + 1];
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const [ii, jj] = [i + di, j + dj];
        if (ii < 0 || jj < 0 || ii >= w || jj >= h) continue;
        const k = jj * w + ii;
        if (thin[k] && !seen[k]) {
          seen[k] = 1;
          stack.push(k);
        }
      }
    }
    pieces.push({
      length: Math.hypot(i1 - i0 + 1, j1 - j0 + 1) * px,
      area: n * px * px,
      at: [x0 + ((i0 + i1) / 2) * px, y0 + ((j0 + j1) / 2) * px],
    });
  }
  return pieces;
}

function centroid(pts: P2[]): P2 {
  return [pts.reduce((t, p) => t + p[0], 0) / pts.length, pts.reduce((t, p) => t + p[1], 0) / pts.length];
}

function perimeter(pts: P2[]) {
  let l = 0;
  for (let i = 0; i < pts.length; i++) {
    const [p, q] = [pts[i], pts[(i + 1) % pts.length]];
    l += Math.hypot(q[0] - p[0], q[1] - p[1]);
  }
  return l;
}

/**
 * A panel's outline with its sides carried along the lamp recesses'
 * inner edges: every point of a side beside a recess at its height, from the panel's top down to `down` metres, is moved to
 * a centimetre inside the recess's inner edge (the recess, cut through
 * the panel, then makes the edge), easing back to the panel's own edge
 * over the 30 cm below `down`.
 */
function alongLamps(panel: P2[], recesses: P2[][], down: number): P2[] {
  const OVERLAP = 0.01;
  const BLEND = 0.3;
  const TOP = 0.04;
  const pts = densify(panel, 0.005);
  // The panel's own side at a height: its outermost crossing that way.
  const outer = (y: number, side: number) => {
    let best = -Infinity;
    for (let i = 0; i < panel.length; i++) {
      const [a, b] = [panel[i], panel[(i + 1) % panel.length]];
      if (a[1] > y === b[1] > y) continue;
      best = Math.max(best, side * (a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])));
    }
    return best;
  };
  for (const h of recesses) {
    const ys = h.map((p) => p[1]);
    const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
    const side = Math.sign(centroid(h)[0]);
    // The recess's edge nearest the centre line at a height.
    const inner = (y: number) => {
      let best = Infinity;
      for (let i = 0; i < h.length; i++) {
        const [a, b] = [h[i], h[(i + 1) % h.length]];
        if (a[1] > y === b[1] > y) continue;
        const s = a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
        best = Math.min(best, s * side);
      }
      return best;
    };
    for (const p of pts) {
      if (Math.sign(p[0]) !== side || p[1] < down - BLEND) continue;
      // Above the recess's rounded top, the side runs straight up from where
      // its inner edge is still straight.
      const yc = Math.min(y1 - TOP, Math.max(Math.max(down, y0 + 0.005), p[1]));
      const edge = inner(yc);
      // Only the side's own points: the top edge running in to its corner stays.
      if (!Number.isFinite(edge) || side * p[0] < outer(p[1], side) - 0.02) continue;
      const w = p[1] >= down ? 1 : ((t) => t * t * (3 - 2 * t))((p[1] - (down - BLEND)) / BLEND);
      p[0] += (side * (edge + OVERLAP) - p[0]) * w;
    }
  }
  // Points moved onto one another (the top edge run in to its corner)
  // are merged, leaving a clean corner for the fillet to round.
  const out: P2[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 0.004) out.push(p);
  }
  return out;
}

/**
 * An open line with each end carried on along its direction, or cut back,
 * to where `inside` stops holding (the painted panel's visible edge) or it
 * meets another joint, then stopped short by as much as the stripe's
 * square end would otherwise poke past that edge.
 */
function toEdges(line: P2[], visible: (p: P2) => boolean, edges: P2[][], others: P2[][], width: number): P2[] {
  const near = (p: P2) => others.some((o) => distanceToLine(o, p) < width / 2);
  const end = (tip: P2, prev: P2): P2 => {
    const l = Math.hypot(tip[0] - prev[0], tip[1] - prev[1]) || 1;
    const dir: P2 = [(tip[0] - prev[0]) / l, (tip[1] - prev[1]) / l];
    const at = (t: number): P2 => [tip[0] + dir[0] * t, tip[1] + dir[1] * t];
    if (near(tip)) return tip;
    // March out if the tip is on the paint, back if it is off it.
    const out = visible(tip);
    let [lo, hi] = [0, 0];
    for (let t = 0.002; t <= 1; t += 0.002) {
      const p = at(out ? t : -t);
      if (visible(p) !== out || (out && near(p))) {
        [lo, hi] = out ? [t - 0.002, t] : [-t, -t + 0.002];
        break;
      }
    }
    for (let k = 0; k < 30; k++) {
      const m = (lo + hi) / 2;
      if (visible(at(m)) && !near(at(m))) lo = m;
      else hi = m;
    }
    // The stripe's square end meets an edge crossing it at an angle: stop
    // short by half its width times that angle's tangent, and half a millimetre.
    const hit = at(lo);
    let tangent: P2 = [-dir[1], dir[0]];
    let best = Infinity;
    for (const e of edges) {
      for (let i = 0; i < e.length; i++) {
        const [a, b] = [e[i], e[(i + 1) % e.length]];
        const d = distanceToSegment(a, b, hit);
        if (d < best) {
          best = d;
          const lb = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          tangent = [(b[0] - a[0]) / lb, (b[1] - a[1]) / lb];
        }
      }
    }
    const sin = Math.abs(tangent[0] * dir[1] - tangent[1] * dir[0]);
    const cos = Math.abs(tangent[0] * dir[0] + tangent[1] * dir[1]);
    const back = Math.min(0.02, (width / 2) * (cos / Math.max(sin, 0.05)) + 0.0005);
    return at(lo - back);
  };
  const n = line.length;
  const first = end(line[0], line[1]);
  const last = end(line[n - 1], line[n - 2]);
  return densify([first, ...line.slice(1, -1), last], 0.01, false);
}

/**
 * Every joint's ends on a painted panel: an end either reaches the paint's
 * edge (the stripe's end corners within a millimetre of it and on the
 * paint), stops on another joint, or stops well clear of the edge (more
 * than 6 cm). An end a few centimetres short of the edge is a joint drawn
 * short of where it runs; the first `edges` lines must reach the edge.
 */
function checkJointEnds(joints: P2[][], fromEdgeLines: number, outlines: P2[][], visible: (p: P2) => boolean, width: number) {
  const bad: string[] = [];
  const toEdge = (p: P2) => Math.min(...outlines.map((o) => distanceToEdge(o, p)));
  const firstEdge = joints.length - fromEdgeLines;
  joints.forEach((j, k) => {
    const others = joints.filter((_, i) => i !== k);
    for (const [tip, prev, which] of [[j[0], j[1], 'start'], [j[j.length - 1], j[j.length - 2], 'end']] as const) {
      const l = Math.hypot(tip[0] - prev[0], tip[1] - prev[1]) || 1;
      const [nx, ny] = [(-(tip[1] - prev[1]) / l) * (width / 2), ((tip[0] - prev[0]) / l) * (width / 2)];
      const corners: P2[] = [[tip[0] + nx, tip[1] + ny], [tip[0] - nx, tip[1] - ny]];
      if (others.some((o) => distanceToLine(o, tip) < width)) continue;
      const gap = Math.max(...corners.map(toEdge));
      const on = corners.every(visible) || corners.every((c) => toEdge(c) < 0.001);
      const reaches = Math.min(...corners.map(toEdge)) < 0.001 && gap < 0.012 && on;
      if (k >= firstEdge && !reaches) bad.push(`edge joint ${k - firstEdge} ${which} stops ${(gap * 1000).toFixed(0)} mm short of the paint's edge`);
      else if (!reaches && visible(tip) && gap < 0.06 && gap > 0.003) bad.push(`joint ${k} ${which} stops ${(gap * 1000).toFixed(0)} mm short of the paint's edge`);
    }
  });
  findings.push({
    check: 'front lines',
    name: "joints run to the paint's edge or stop clear of it",
    ok: bad.length === 0,
    detail: bad.length ? bad.join('; ') : `${joints.length} joints: every end on the paint's edge, on another joint, or clear of the edge`,
  });
  if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`front lines: ${bad.join('; ')}`);
}

function distanceToSegment(a: P2, b: P2, p: P2) {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function distanceToLine(line: P2[], p: P2) {
  let best = Infinity;
  for (let i = 0; i + 1 < line.length; i++) best = Math.min(best, distanceToSegment(line[i], line[i + 1], p));
  return best;
}
