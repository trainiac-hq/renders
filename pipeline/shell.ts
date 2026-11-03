import { frontOf, sample } from '../model/curve';
import type { ClassArt, Form, Heights } from '../model/types';

// The body shells as meshes. A car is one closed surface: a cross-section
// (the loading gauge's flat sides, tumblehome and roof curve) carried
// along the car, its ends shaped by a nose function x = P(y) + Q(y)·f(u).
// P is the side view's centre line, Q how far the sides of the front
// stand behind it (Form.setback), u how far across the body a point is,
// and f the plan shape between them. A flat front is the same surface
// with a small Q and a square f, so every class is built the same way.

/** Where a car's shell starts and ends, along the train. */
export type ShellCar = { x0: number; length: number; nose: boolean; wells?: readonly (readonly [number, number])[] };

const WELL_RAMP = 0.5;
/** How far under the cantrail a well starts pressing the section down. */
const WELL_BAND = 0.15;
/** The roof's height x along a car: `roof`, or lower over a well, eased down over WELL_RAMP either side of it. */
export function roofAt(h: Heights, wells: readonly (readonly [number, number])[], x: number): number {
  let top = h.roof;
  for (const [a, b] of wells) {
    const t = Math.min(1, Math.max(0, (Math.min(x - a, b - x) + WELL_RAMP) / WELL_RAMP));
    top = Math.min(top, h.roof - (h.roof - (h.well ?? h.roof)) * t * t * (3 - 2 * t));
  }
  return top;
}

export type Mesh = { vertices: number[]; quads: number[]; tris: number[] };

/** Defaults for classes whose form hasn't been measured: a flat front with rounded corners. */
export const defaultForm: Form = { width: 2.75, tumblehome: 0.1, setback: [[0, 0.22]], squareness: 6 };

const PERIMETER = 240;
const RINGS = 72;
const END_RINGS = 14;
const CORNER = 0.1;

export type Section = {
  /** Half width at a height, for a section whose bottom is at the body's skirt. */
  halfWidth: (y: number) => number;
  /** The closed outline, [y, z] from the bottom centre round the right side, roof and left side. */
  outline: [number, number][];
  bottom: number;
  roof: number;
};

export function section(art: ClassArt, form: Form): Section {
  const h = art.heights;
  const W = form.width / 2;
  const waist = Math.min(h.window[0], h.cantrail - 0.3);
  const cant = W - form.tumblehome;
  const halfWidth = (y: number) => {
    if (y >= h.cantrail) {
      const t = Math.min(1, (y - h.cantrail) / (h.roof - h.cantrail));
      const p = form.roofSquareness ?? 2;
      return cant * Math.max(0, 1 - t ** p) ** (1 / p);
    }
    if (y >= waist) return W - form.tumblehome * ((y - waist) / (h.cantrail - waist)) ** 1.5;
    if (y < h.bottom + CORNER) {
      const d = h.bottom + CORNER - y;
      return W - CORNER + Math.sqrt(Math.max(0, CORNER * CORNER - d * d));
    }
    return W;
  };

  // The right half, bottom centre to roof centre, finely, then resampled
  // evenly by length so the mesh's rows are evenly spaced round it.
  const fine: [number, number][] = [];
  for (let i = 0; i <= 40; i++) fine.push([h.bottom, ((W - CORNER) * i) / 40]);
  for (let i = 1; i <= 600; i++) {
    // Heights crowd towards the roof, where the outline turns fastest.
    const t = i / 600;
    const y = h.bottom + (h.roof - h.bottom) * (t < 0.85 ? t / 0.85 * 0.8 : 0.8 + 0.2 * Math.sin(((t - 0.85) / 0.15) * (Math.PI / 2)));
    fine.push([y, halfWidth(y)]);
  }
  fine.push([h.roof, 0]);
  const half = resample(fine, PERIMETER / 2);
  const outline = [...half, ...half.slice(1, -1).reverse().map(([y, z]) => [y, -z] as [number, number])];
  return { halfWidth, outline, bottom: h.bottom, roof: h.roof };
}

function resample(pts: [number, number][], segments: number): [number, number][] {
  const lengths = [0];
  for (let i = 1; i < pts.length; i++) lengths.push(lengths[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = lengths[lengths.length - 1];
  const out: [number, number][] = [];
  let j = 0;
  for (let k = 0; k <= segments; k++) {
    const d = (total * k) / segments;
    while (j < pts.length - 2 && lengths[j + 1] < d) j++;
    const t = (d - lengths[j]) / (lengths[j + 1] - lengths[j] || 1);
    out.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * t, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * t]);
  }
  return out;
}

/**
 * A smooth curve through a table of [x, y] by monotone cubic interpolation
 * (Fritsch–Carlson): no creases at the entries, which would show as ripples
 * in the paint's reflections, and no overshoot between them. Flat beyond
 * the ends.
 */
export function smoothTable(table: readonly (readonly [number, number])[]): (x: number) => number {
  const n = table.length;
  if (n === 1) return () => table[0][1];
  const xs = table.map((p) => p[0]);
  const ys = table.map((p) => p[1]);
  const slopes = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = xs.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === n - 1) return slopes[n - 2];
    const [a, b] = [slopes[i - 1], slopes[i]];
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  });
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
    );
  };
}

/** The nose function's parts for a class: its centre line and setback, by height. */
export function noseOf(art: ClassArt, form: Form) {
  const profile = art.nose.profile;
  const sampled = sample(profile, 64);
  const ys = sampled.map((p) => p[1]);
  const [lo, hi] = [Math.min(...ys), Math.max(...ys)];
  const roofStart = profile[profile.length - 1][0];
  const front = frontOf(sampled, roofStart);
  const P = (y: number) => front(Math.min(hi - 1e-4, Math.max(lo + 1e-4, y)));
  const Q = smoothTable(form.setback);
  const m = form.squareness;
  return {
    P,
    Q,
    lowest: Math.min(lo, art.heights.bottom),
    /** How far back from the centre line the front is, as a fraction of Q, at u across from it. */
    plan: (u: number) => 1 - Math.sqrt(Math.max(0, 1 - Math.min(1, u) ** m)),
    /** The inverse: how far across a point is that stands `f` of Q back. */
    across: (f: number) => Math.max(0, 1 - (1 - Math.min(1, Math.max(0, f))) ** 2) ** (1 / m),
  };
}

/**
 * The leading car's nose as a field: for a point (y, z) on the front, how
 * far back from the nose tip the surface is there, or null outside the
 * body. The same surface `shell` builds, for placing things on it.
 */
export function noseField(art: ClassArt, form: Form): (y: number, z: number) => number | null {
  const n = noseOf(art, form);
  const halfWidth = noseHalfWidth(art, form);
  return (y, z) => {
    if (y < n.lowest || y > art.heights.roof) return null;
    const hw = halfWidth(y);
    if (Math.abs(z) > hw) return null;
    return n.P(y) + n.Q(y) * n.plan(Math.abs(z) / Math.max(1e-4, hw));
  };
}

/**
 * Half the leading car's width at a height on its nose. The shell
 * stretches heights near the bottom down to the nose's lowest point, so a
 * height there is first taken back to the section height it came from.
 */
export function noseHalfWidth(art: ClassArt, form: Form): (y: number) => number {
  const sec = section(art, form);
  const h = art.heights;
  const lowest = noseOf(art, form).lowest;
  const band = 0.4;
  return (y) =>
    sec.halfWidth(y >= h.bottom + band || lowest >= h.bottom ? y : h.bottom + ((y - lowest) * band) / (h.bottom + band - lowest));
}

/**
 * One car's shell. Its front is the class's nose when `nose` is set, else
 * a flat end like its rear, the corners rounded by the class's end radius.
 */
export function shell(art: ClassArt, form: Form, car: ShellCar, firstWheel: number): Mesh {
  const sec = section(art, form);
  const h = art.heights;
  const n = noseOf(art, form);
  const endR = art.endRadius ?? 0.3;
  const outline = sec.outline;
  const centre = (h.bottom + h.roof) / 2;

  // A flat end: the roof edge rounded by the end radius, the sides by a
  // tight corner. x is measured back from the end.
  const endP = (y: number) => {
    const top = h.roof - endR;
    if (y <= top) return 0;
    const d = y - top;
    return endR - Math.sqrt(Math.max(0, endR * endR - d * d));
  };
  const endF = (u: number) => 1 - Math.sqrt(Math.max(0, 1 - Math.min(1, u) ** 8));
  const end = (y: number, z: number) => endP(y) + 0.12 * endF(Math.abs(z) / Math.max(1e-4, sec.halfWidth(y)));

  // Under the nose the shell can come lower than the skirt (a fairing or
  // the valance over the coupler); it rises back to the skirt before the
  // first wheel. Heights near the bottom are stretched down to meet it.
  const remapBottom = (y: number, bottom: number) => {
    const band = 0.4;
    if (y >= h.bottom + band || bottom >= h.bottom) return y;
    return bottom + ((y - h.bottom) / band) * (h.bottom + band - bottom);
  };
  // Over a well the roof comes down: heights from just under the cantrail up are pressed down to meet it.
  const topAt = (x: number) => roofAt(h, car.wells ?? [], x);
  const remapTop = (y: number, top: number) => {
    const from = h.cantrail - WELL_BAND;
    if (top >= h.roof || y <= from) return y;
    return from + ((y - from) * (top - from)) / (h.roof - from);
  };
  const front = (y: number, z: number) => {
    if (!car.nose) return end(y, z);
    const yy = remapBottom(y, n.lowest);
    return n.P(yy) + n.Q(yy) * n.plan(Math.abs(z) / Math.max(1e-4, sec.halfWidth(y)));
  };
  const lowerFront = Math.max(...outline.filter(([y]) => y < h.bottom + 0.4).map(([y, z]) => front(y, z)));
  const chinEnd = Math.max(lowerFront + 0.3, Math.min(lowerFront + 1.5, firstWheel));
  const bottomAt = (x: number) => {
    if (!car.nose || n.lowest >= h.bottom || x <= lowerFront) return car.nose ? n.lowest : h.bottom;
    const t = Math.min(1, (x - lowerFront) / (chinEnd - lowerFront));
    return n.lowest + (h.bottom - n.lowest) * t * t * (3 - 2 * t);
  };

  const vertices: number[] = [];
  const add = (x: number, y: number, z: number) => {
    vertices.push(car.x0 + x, y, z);
    return vertices.length / 3 - 1;
  };
  const quads: number[] = [];
  const tris: number[] = [];
  const P = outline.length;
  const ring = (indices: number[], prev: number[]) => {
    for (let i = 0; i < P; i++) quads.push(prev[i], prev[(i + 1) % P], indices[(i + 1) % P], indices[i]);
  };

  // Front cap: rings shrinking to a pole at the section's middle, each
  // point pushed forward or back by the nose function.
  const frontRings: number[][] = [];
  const pole = add(front(centre, 0), remapBottom(centre, bottomAt(0)), 0);
  for (let k = 1; k <= RINGS; k++) {
    const r = 1 - (1 - k / RINGS) ** 2;
    frontRings.push(
      outline.map(([y, z]) => {
        const yy = centre + (y - centre) * r;
        const zz = z * r;
        const x = front(yy, zz);
        return add(x, remapTop(car.nose ? remapBottom(yy, n.lowest) : yy, topAt(x)), zz);
      }),
    );
  }
  for (let i = 0; i < P; i++) tris.push(pole, frontRings[0][(i + 1) % P], frontRings[0][i]);
  for (let k = 1; k < RINGS; k++) ring(frontRings[k], frontRings[k - 1]);

  // Along the car: stations spaced finely near the front, where the nose
  // still curves, then evenly. Each outline point runs from where the
  // front cap left it to where the rear cap takes it.
  const startX = outline.map(([y, z]) => front(y, z));
  const endX = outline.map(([y, z]) => car.length - end(y, z));
  if (car.wells?.length) {
    // Over a well the roof drops along the car, so each row across the band it
    // presses down must be level: the nose (or end) reaches the crown's centre
    // ahead of the points beside it, and a row starting there would twist. The
    // band's rows start behind the last of them and end ahead of the first.
    const band = outline.map(([y]) => y > h.cantrail - WELL_BAND);
    const s0 = Math.max(...startX.filter((_, i) => band[i]));
    const s1 = Math.min(...endX.filter((_, i) => band[i]));
    band.forEach((b, i) => {
      if (b) [startX[i], endX[i]] = [s0, s1];
    });
  }
  const fineTo = car.nose ? Math.max(...startX) + 2 : 1;
  const stations: number[] = [];
  for (let x = 0; x < fineTo; x += 0.08) stations.push(x);
  for (let x = fineTo; x < car.length - 1; x += 0.4) stations.push(x);
  for (let x = car.length - 1; x <= car.length; x += 0.08) stations.push(x);
  const span = car.length;
  let prev = frontRings[RINGS - 1];
  for (let j = 1; j < stations.length; j++) {
    const t = stations[j] / span;
    const row = outline.map(([y, z], i) => {
      // Points keep their place in the fine front region, then spread to
      // reach the rear cap.
      const x = startX[i] + (endX[i] - startX[i]) * t;
      return add(x, remapTop(remapBottom(y, bottomAt(x)), topAt(x)), z);
    });
    ring(row, prev);
    prev = row;
  }

  // Rear cap, mirrored: rings shrinking to a pole.
  for (let k = END_RINGS - 1; k >= 1; k--) {
    const r = 1 - (1 - k / END_RINGS) ** 2;
    const row = outline.map(([y, z]) => {
      const yy = centre + (y - centre) * r;
      const zz = z * r;
      return add(car.length - end(yy, zz), remapTop(yy, topAt(car.length)), zz);
    });
    ring(row, prev);
    prev = row;
  }
  const back = add(car.length - end(centre, 0), centre, 0);
  for (let i = 0; i < P; i++) tris.push(back, prev[i], prev[(i + 1) % P]);

  return { vertices, quads, tris };
}
