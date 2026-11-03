import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Branding, ClassArt, Form, Livery } from '../model/types';
import { flatStart, sideFeatures } from './bodyside';
import { nextStartOf } from './layout';
import { findings } from './outline';
import { noseHalfWidth } from './shell';

// Logos and wordmarks: the operator's own vector artwork (logos/*.svg),
// laid on the train where the real one carries it, at its measured size.
// Blender builds each from the SVG's curves (blender/branding.py), so it
// is as sharp in a close-up as in a thumbnail. Here they are placed in
// the train's coordinates and checked: the artwork exists, and on a side
// it lies on the flat of the bodyside, clear of the nose's corner, the car
// ends, and every door and window (paint can't go over glass or a door's
// gap).

export const LOGOS = join(import.meta.dir, '..', 'logos');

/** Where Blender lays one piece of branding. */
export type BrandingPlace = {
  /** The SVG, copied into the scene's directory. */
  file: string;
  on: 'side' | 'front' | 'flank';
  /** Its centre: [x along the train, y up] on a side; [z across, y up] on the front. */
  at: [number, number];
  height: number;
  /** Its measured width, when the branding gives one; otherwise the artwork keeps its proportions. */
  width: number | null;
  rotate: number;
  color: string | null;
  sides: ('near' | 'far')[];
  far: 'reads' | 'mirrored';
};

/** The artwork's width over its height, from its viewBox (or width and height). */
export function aspect(svg: string): number {
  const box = svg.match(/viewBox="\s*([-\d.e]+)[\s,]+([-\d.e]+)[\s,]+([-\d.e]+)[\s,]+([-\d.e]+)\s*"/);
  if (box) return Number(box[3]) / Number(box[4]);
  const w = svg.match(/<svg[^>]*\swidth="([\d.]+)/);
  const h = svg.match(/<svg[^>]*\sheight="([\d.]+)/);
  if (w && h) return Number(w[1]) / Number(h[1]);
  throw new Error('branding: the artwork has neither a viewBox nor a width and height');
}

/** The corners of a piece of branding's box as placed, turned by its rotation. */
function corners(cx: number, cy: number, w: number, h: number, degrees: number): [number, number][] {
  const t = (degrees * Math.PI) / 180;
  const [c, s] = [Math.cos(t), Math.sin(t)];
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}

/**
 * The livery's branding placed on this class, its SVGs copied into `dir`.
 * Throws (and records a finding) for a missing artwork or one that leaves
 * the flat bodyside or overlaps a door or window.
 */
export function placeBranding(art: ClassArt, form: Form, livery: Livery, dir: string): BrandingPlace[] {
  const items = livery.branding ?? [];
  if (!items.length) return [];
  const nextStart = nextStartOf(art);
  const start = flatStart(art, form);
  const features = sideFeatures(art);
  const halfWidth = noseHalfWidth(art, form);
  const h = art.heights;
  const bad: string[] = [];
  const out: BrandingPlace[] = [];
  items.forEach((b: Branding, k) => {
    const name = `${b.logo} (${k})`;
    const src = join(LOGOS, `${b.logo}.svg`);
    if (!existsSync(src)) {
      bad.push(`${name}: no logos/${b.logo}.svg`);
      return;
    }
    const w = b.width ?? b.height * aspect(readFileSync(src, 'utf8'));
    const file = `logo-${k}-${b.logo}.svg`;
    copyFileSync(src, join(dir, file));
    const on = b.on ?? 'side';
    const rotate = b.rotate ?? 0;
    if (on === 'flank') {
      // On the nose's curve, ahead of the flat side: on the leading car, between skirt and cantrail.
      const [cx, cy] = b.at;
      const box = corners(cx, cy, w, b.height, rotate);
      const ys = box.map((p) => p[1]);
      if ((b.car ?? 'cab') !== 'cab') bad.push(`${name}: a flank logo goes on the leading car`);
      if (Math.min(...ys) < h.bottom - 0.3 || Math.max(...ys) > h.cantrail) bad.push(`${name} runs off the nose's flank`);
      const sides = b.sides === 'near' ? ['near'] : b.sides === 'far' ? ['far'] : ['near', 'far'];
      out.push({ file, on, at: [cx, cy], height: b.height, width: b.width ?? null, rotate, color: b.color ?? null, sides: sides as ('near' | 'far')[], far: b.far ?? 'reads' });
    } else if (on === 'side') {
      const lead = (b.car ?? 'cab') === 'cab';
      const x0 = lead ? 0 : nextStart;
      const length = lead ? art.cab.length : art.next.length;
      const [cx, cy] = [x0 + b.at[0], b.at[1]];
      const box = corners(cx, cy, w, b.height, rotate);
      const xs = box.map((p) => p[0]);
      const ys = box.map((p) => p[1]);
      const [bx0, bx1, by0, by1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      // On the flat: behind the nose's corner, before the ends' corners, between skirt and cantrail.
      if (lead) for (let i = 0; i <= 10; i++) {
        const y = by0 + ((by1 - by0) * i) / 10;
        if (bx0 < start(y)) bad.push(`${name} reaches ${((start(y) - bx0) * 1000).toFixed(0)} mm onto the nose's corner at ${y.toFixed(2)} m up`);
      }
      if (!lead && bx0 < x0 + 0.12) bad.push(`${name} reaches onto the next car's front corner`);
      if (bx1 > x0 + length - 0.12) bad.push(`${name} reaches onto the car's rear corner`);
      if (by0 < h.bottom || by1 > h.cantrail) bad.push(`${name} runs off the bodyside (${by0.toFixed(2)} to ${by1.toFixed(2)} m up; the side runs ${h.bottom} to ${h.cantrail})`);
      for (const f of features) {
        if (f.x0 < bx1 && f.x1 > bx0 && f.y0 < by1 && f.y1 > by0) bad.push(`${name} overlaps the ${f.name}`);
      }
      const sides = b.sides === 'near' ? ['near'] : b.sides === 'far' ? ['far'] : ['near', 'far'];
      out.push({ file, on, at: [cx, cy], height: b.height, width: b.width ?? null, rotate, color: b.color ?? null, sides: sides as ('near' | 'far')[], far: b.far ?? 'reads' });
    } else {
      const [u, y] = b.at;
      const hw = halfWidth(Math.min(y, h.cantrail));
      const z = (u - 0.5) * 2 * hw;
      const box = corners(z, y, w, b.height, rotate);
      if (box.some(([zz, yy]) => Math.abs(zz) > halfWidth(Math.min(yy, h.cantrail)) - 0.02)) bad.push(`${name} runs off the front's edge`);
      out.push({ file, on, at: [z, y], height: b.height, width: b.width ?? null, rotate, color: b.color ?? null, sides: ['near'], far: 'reads' });
    }
  });
  findings.push({
    check: 'branding',
    name: 'logos and wordmarks placed',
    ok: bad.length === 0,
    detail: bad.length ? bad.join('; ') : `${out.length} placed, each on the flat bodyside clear of doors and windows, or on the front`,
  });
  if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`branding: ${bad.join('; ')}`);
  return out;
}
