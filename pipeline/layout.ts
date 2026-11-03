import { beziers } from '../model/curve';
import type { ClassArt, Livery, Pt } from '../model/types';

// Where the windows and doors are along both cars, in metres from the nose
// tip: the one reading of the class data that both the painted textures
// and the modelled glazing follow.

export const GAP = 0.7;

/**
 * The livery's line along the top of the bodyside, if it has one: the
 * band nearest the cantrail, as heights in metres.
 */
export function cantrailBand(art: ClassArt, livery: Livery): { lo: number; hi: number; color: string } | null {
  const h = art.heights;
  const bands = (livery.bands ?? []).filter((b) => b.car !== 'next' && b.lo >= 0.85 && b.from === undefined);
  if (!bands.length) return null;
  const band = bands.reduce((p, q) => (q.lo > p.lo ? q : p));
  const at = (f: number) => h.bottom + f * (h.cantrail - h.bottom);
  return { lo: at(band.lo), hi: at(band.hi), color: band.color };
}
export const nextStartOf = (art: ClassArt) => art.cab.length + (art.articulated ? 0.35 : GAP);

/** A rectangle with rounded corners. */
export type Rounded = { x0: number; y0: number; x1: number; y1: number; r: number };

export type DoorPlace = { x: number; w: number; lo: number; hi: number; leaves: 1 | 2; cab: boolean; lead: boolean };

export type Bodyside = {
  doors: DoorPlace[];
  /** Every pane on the bodysides: saloon windows, door windows, the cab's own. */
  panes: (Rounded | Pt[])[];
};

const PILLAR = 0.22;

export function bodyside(art: ClassArt): Bodyside {
  const h = art.heights;
  const nextStart = nextStartOf(art);
  const doors: DoorPlace[] = [];
  const panes: (Rounded | Pt[])[] = [];
  for (const [car, x0] of [
    [art.cab, 0],
    [art.next, nextStart],
  ] as const) {
    for (const door of car.doors) {
      const [lo, hi] = door.span ?? [h.bottom + 0.18, door.cab ? h.window[1] + 0.12 : Math.min(h.cantrail - 0.04, h.window[1] + 0.22)];
      const place: DoorPlace = { x: x0 + door.x, w: door.w, lo, hi, leaves: door.leaves ?? 1, cab: !!door.cab, lead: x0 === 0 };
      doors.push(place);
      const [wlo, whi] = door.window ?? [h.window[0] + 0.08, h.window[1] - 0.02];
      const inset = door.cab ? 0.1 : 0.09;
      const half = door.w / 2;
      if (door.panes) {
        const [a, b] = door.panes;
        const r = door.paneRadius ?? art.windowRadius ?? 0.05;
        panes.push({ x0: place.x - b, y0: wlo, x1: place.x - a, y1: whi, r });
        if (place.leaves === 2) panes.push({ x0: place.x + a, y0: wlo, x1: place.x + b, y1: whi, r });
      } else if (place.leaves === 2) {
        panes.push({ x0: place.x - half + inset, y0: wlo, x1: place.x - 0.06, y1: whi, r: 0.07 });
        panes.push({ x0: place.x + 0.06, y0: wlo, x1: place.x + half - inset, y1: whi, r: 0.07 });
      } else {
        panes.push({ x0: place.x - half + inset, y0: wlo, x1: place.x + half - inset, y1: whi, r: 0.07 });
      }
    }
    for (const [from, to, count, heights] of car.windows) {
      const [lo, hi] = heights ?? car.window ?? h.window;
      if (count === 0) {
        panes.push({ x0: x0 + from, y0: lo, x1: x0 + to, y1: hi, r: art.windowRadius ?? 0.12 });
        continue;
      }
      const w = (to - from - PILLAR * (count - 1)) / count;
      for (let i = 0; i < count; i++) {
        const a = x0 + from + i * (w + PILLAR);
        panes.push({ x0: a, y0: lo, x1: a + w, y1: hi, r: art.windowRadius ?? 0.12 });
      }
    }
  }
  // A long nose's own glazing is laid on as decals (decals.ts) rather than cut.
  if (!art.form?.front) panes.push(...(art.nose.glazing ?? []));
  return { doors, panes };
}

/** A rounded rectangle as a closed polyline, anticlockwise from its bottom edge. */
export function roundedPolyline({ x0, y0, x1, y1, r }: Rounded, perCorner = 8): [number, number][] {
  const rr = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  const corners: [number, number, number][] = [
    [x1 - rr, y0 + rr, -Math.PI / 2],
    [x1 - rr, y1 - rr, 0],
    [x0 + rr, y1 - rr, Math.PI / 2],
    [x0 + rr, y0 + rr, Math.PI],
  ];
  const out: [number, number][] = [];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= perCorner; i++) {
      const a = start + (i / perCorner) * (Math.PI / 2);
      out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  }
  return out;
}

/**
 * A closed polyline with every corner sharper than ~150° rounded off by up
 * to `radius`, since nothing on a real train has a knife-edge corner.
 */
export function fillet(pts: [number, number][], radius = 0.035, steps = 5): [number, number][] {
  const n = pts.length;
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const [p, c, q] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n]];
    const [ax, ay] = [p[0] - c[0], p[1] - c[1]];
    const [bx, by] = [q[0] - c[0], q[1] - c[1]];
    const [la, lb] = [Math.hypot(ax, ay), Math.hypot(bx, by)];
    const cos = (ax * bx + ay * by) / (la * lb || 1);
    if (la === 0 || lb === 0 || cos < -0.87) {
      out.push(c);
      continue;
    }
    const d = Math.min(radius, la / 2.5, lb / 2.5);
    const a: [number, number] = [c[0] + (ax / la) * d, c[1] + (ay / la) * d];
    const b: [number, number] = [c[0] + (bx / lb) * d, c[1] + (by / lb) * d];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const u = 1 - t;
      out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
  }
  return out;
}

/** A closed curve of the class data as a polyline. */
export function curvePolyline(pts: Pt[], steps = 10, spacing: 'uniform' | 'chordal' = 'uniform'): [number, number][] {
  const out: [number, number][] = [];
  for (const [p1, c1, c2, p2] of beziers(pts, true, spacing)) {
    const straight = c1 === p1 && c2 === p2;
    const n = straight ? 1 : steps;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const u = 1 - t;
      out.push([
        u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
        u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1],
      ]);
    }
  }
  return out;
}
