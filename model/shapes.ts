import type { Car, Pt, Windows } from './types';

// Small builders for the shapes trains are made of. On a face, u runs
// across the front from 0 (far edge) to 1 (near corner).

/** A rectangle with its corners rounded by r: each corner a curve through its 45° point. */
export const box = (x0: number, y0: number, x1: number, y1: number, r = 0): Pt[] => {
  if (r === 0) return [[x0, y0, 1], [x0, y1, 1], [x1, y1, 1], [x1, y0, 1]];
  const k = r * (1 - Math.SQRT1_2);
  return [
    [x0, y0 + r, 1], [x0, y1 - r, 1], [x0 + k, y1 - k], [x0 + r, y1, 1], [x1 - r, y1, 1], [x1 - k, y1 - k],
    [x1, y1 - r, 1], [x1, y0 + r, 1], [x1 - k, y0 + k], [x1 - r, y0, 1], [x0 + r, y0, 1], [x0 + k, y0 + k],
  ];
};

/** The same box on both sides of the front's centre line. */
export const pair = (u0: number, y0: number, u1: number, y1: number, r = 0): Pt[][] => [
  box(u0, y0, u1, y1, r),
  box(1 - u1, y0, 1 - u0, y1, r),
];

/** A centre gangway door's outline. */
export const gangwayLines = (u0: number, u1: number, y0: number, y1: number): Pt[][] => [
  [[u0, y0, 1], [u0, y1, 1], [u1, y1, 1], [u1, y0, 1]],
];

/** Two lamps either side, low on the front. */
/** A lamp cluster low on each side: the headlamp and tail lamp share one housing. */
export const lamps = (lo: number, hi: number, inset = 0.05, w = 0.085, gap = 0.02): Pt[][] => pair(inset, lo, inset + 2 * w + gap, hi, 0.03);

/**
 * A windscreen wrapping round the cab corner onto the side, back to `end`:
 * it starts ahead of the front so it meets the face's screen at the corner.
 */
export const wrap = (lo: number, hi: number, end: number) => ({
  surround: [[-1, lo - 0.07, 1], [-1, hi + 0.07, 1], [end - 0.12, hi + 0.07], [end, hi - 0.1], [end, lo - 0.07, 1]] as Pt[],
  windscreen: [[-1, lo, 1], [-1, hi, 1], [end - 0.22, hi], [end - 0.12, hi - 0.12], [end - 0.12, lo, 1]] as Pt[],
});

/** Windows given one by one, as [from, to] along the car. */
export const panes = (...spans: (readonly [number, number])[]): Windows[] => spans.map(([a, b]) => [a, b, 1] as const);

/**
 * An intermediate car of a multiple unit: double doors at the given
 * centres, windows filling the bays between them at about `pitch`.
 */
export function saloon(length: number, doors: number[], bogies: number[], door = 1.4, pitch = 1.9): Car {
  const edges = [0.5, ...doors.flatMap((x) => [x - door / 2 - 0.4, x + door / 2 + 0.4]), length - 0.5];
  const windows: Windows[] = [];
  for (let i = 0; i < edges.length; i += 2) {
    const [a, b] = [edges[i], edges[i + 1]];
    if (b - a > 0.6) windows.push([a, b, Math.max(1, Math.round((b - a) / pitch))]);
  }
  return { length, doors: doors.map((x) => ({ x, w: door, leaves: 2 as const })), windows, bogies };
}

/**
 * A rectangle in metres with each corner rounded by its own radius, in
 * the order bottom-left, top-left, top-right, bottom-right: each corner a
 * curve through its 45° point.
 */
export const rrect = (x0: number, y0: number, x1: number, y1: number, [bl, tl, tr, br]: readonly [number, number, number, number]): Pt[] => {
  const k = 1 - Math.SQRT1_2;
  const corner = (cx: number, cy: number, r: number, dx: number, dy: number, first: 'x' | 'y'): Pt[] => {
    if (r === 0) return [[cx, cy, 1]];
    const a: Pt = first === 'y' ? [cx, cy - dy * r, 1] : [cx - dx * r, cy, 1];
    const b: Pt = first === 'y' ? [cx - dx * r, cy, 1] : [cx, cy - dy * r, 1];
    return [a, [cx - dx * r * k, cy - dy * r * k], b];
  };
  return [
    ...corner(x0, y0, bl, -1, -1, 'x'),
    ...corner(x0, y1, tl, -1, 1, 'y'),
    ...corner(x1, y1, tr, 1, 1, 'x'),
    ...corner(x1, y0, br, 1, -1, 'y'),
  ];
};

/**
 * The outline round two circles of different sizes, [x, y, r] each,
 * pinched in between them by `waist`: a figure-of-eight lamp bezel.
 */
export function peanut(a: readonly [number, number, number], b: readonly [number, number, number], waist: number, steps = 10): Pt[] {
  const [ax, ay, ar] = a;
  const [bx, by, br] = b;
  const d = Math.hypot(bx - ax, by - ay);
  const theta = Math.atan2(by - ay, bx - ax);
  const phi = Math.acos((ar - br) / d);
  const out: Pt[] = [];
  const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
    for (let i = 0; i <= steps; i++) {
      const t = from + ((to - from) * i) / steps;
      out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
  };
  // Round b's far side, along the upper tangent pinched in, round a's far side, back along the lower.
  arc(bx, by, br, theta - phi, theta + phi);
  const mid = (p: number[], q: number[], s: number): Pt => {
    const [mx, my] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    return [mx - s * waist * Math.cos(theta + Math.PI / 2), my - s * waist * Math.sin(theta + Math.PI / 2)];
  };
  const up = theta + phi;
  out.push(mid([bx + br * Math.cos(up), by + br * Math.sin(up)], [ax + ar * Math.cos(up), ay + ar * Math.sin(up)], 1));
  arc(ax, ay, ar, up, theta + 2 * Math.PI - phi);
  const down = theta - phi;
  out.push(mid([ax + ar * Math.cos(down), ay + ar * Math.sin(down)], [bx + br * Math.cos(down), by + br * Math.sin(down)], -1));
  return out;
}
