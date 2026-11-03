import type { ClassArt, Form, Pt } from '../model/types';
import { densify, distanceToEdge, findings, inside, type Poly } from './outline';
import type { Features } from './scene';

// Checks on the front as it's built, seen head-on ([z, y], metres):
//
// - things set into the face (windscreens, lamp housings, a gangway door
//   or frame, the unit number) must not overlap one another, with a
//   centimetre between them: a lamp cutting into a windscreen's edge is
//   a model error, not a design;
// - the lines drawn on a front (panel seams) must be physical joints:
//   one that runs along the edge of a painted area, or strays outside
//   every painted area, is a paint edge drawn as a seam.

const CLEARANCE = 0.01;
const EDGE = 0.015;

type Named = { name: string; pts: Poly };

/** The smallest gap between two outlines, negative when they overlap (by about that much). */
function gap(a: Poly, b: Poly): number {
  const da = densify(a, 0.01);
  const db = densify(b, 0.01);
  let overlap = 0;
  for (const p of da) if (inside(b, p)) overlap = Math.max(overlap, distanceToEdge(b, p));
  for (const p of db) if (inside(a, p)) overlap = Math.max(overlap, distanceToEdge(a, p));
  if (overlap > 0) return -overlap;
  let best = Infinity;
  for (const p of da) best = Math.min(best, distanceToEdge(b, p));
  return best;
}

export function checkFrontFeatures(f: Features['face']) {
  // A gangway door's own window is set in the door, by design.
  const inDoor = (pts: Poly) => !!f.gangway && pts.every((p) => inside(f.gangway!, p));
  const items: Named[] = [
    ...f.screens.filter((pts) => !inDoor(pts)).map((pts, i) => ({ name: `windscreen ${i}`, pts })),
    ...f.lamps.map((pts, i) => ({ name: `lamp housing ${i}`, pts })),
    ...(f.gangway ? [{ name: 'gangway door', pts: f.gangway }] : []),
    ...(f.number
      ? [-1, ...(f.number.both ? [1] : [])].map((s) => {
          const [z, y] = f.number!.at;
          const zz = s < 0 ? z : -z;
          const w = f.number!.height * 0.45 * f.number!.text.length;
          const h = f.number!.height * 0.7;
          return { name: `unit number${s > 0 ? ' (far side)' : ''}`, pts: [[zz - w / 2, y - h], [zz + w / 2, y - h], [zz + w / 2, y + h], [zz - w / 2, y + h]] as Poly };
        })
      : []),
  ];
  const bad: string[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const g = gap(items[i].pts, items[j].pts);
      if (g < CLEARANCE) bad.push(`${items[i].name} and ${items[j].name} ${g < 0 ? `overlap by ${(-g * 1000).toFixed(0)} mm` : `are ${(g * 1000).toFixed(0)} mm apart`}`);
    }
  }
  findings.push({
    check: 'front features',
    name: 'nothing set into the front overlaps',
    ok: bad.length === 0,
    detail: bad.length ? bad.join('; ') : `${items.length} features, at least ${CLEARANCE * 1000} mm apart`,
  });
  if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`front features: ${bad.join('; ')}`);
}

/**
 * The seams drawn on a front: none may run along a painted area's edge
 * for more than a fifth of its length, and on a long nose none may leave
 * the painted areas (on a flat face, a seam off the paint is a gangway
 * door in body colour). `u`
 * maps a drawing's [u, y] into metres across.
 */
export function checkFrontLines(art: ClassArt, form: Form, u: (pts: Pt[]) => Poly) {
  checkSideLines(art);
  const view = form.front ?? art.nose.face;
  if (!view?.lines?.length) return;
  const painted = [view.panel, ...(view.panels ?? [])].filter((p): p is Pt[] => !!p).map(u);
  if (!painted.length) return;
  // A gangway door and the dark mouldings are physical parts: seams on
  // them, and along the door's edge, are real joints.
  const parts = [...(view.gangway ? [view.gangway] : []), ...(view.dark ?? [])].map(u);
  const bad: string[] = [];
  view.lines.forEach((line, i) => {
    const pts = densify(u(line), 0.01, false);
    let onEdge = 0;
    let outside = 0;
    for (const p of pts) {
      if (parts.some((q) => inside(q, p) || distanceToEdge(q, p) < 2 * EDGE)) continue;
      const near = Math.min(...painted.map((q) => distanceToEdge(q, p)));
      const within = painted.some((q) => inside(q, p));
      if (near < EDGE) onEdge++;
      else if (!within) outside++;
    }
    if (onEdge > pts.length / 5) bad.push(`line ${i} runs along a paint edge for ${Math.round((100 * onEdge) / pts.length)}% of its length`);
    // On a flat face a seam off the paint is a door in body colour; on a
    // long nose every seam is a joint in a painted cover.
    if (form.front && outside > 2) bad.push(`line ${i} runs ${(outside * 10).toFixed(0)} mm outside every painted area`);
  });
  findings.push({
    check: 'front lines',
    name: 'seams are joints, not paint edges',
    ok: bad.length === 0,
    detail: bad.length ? bad.join('; ') : `${view.lines.length} lines inside painted areas, clear of their edges`,
  });
  if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`front lines: ${bad.join('; ')}`);
}

/** The same for the nose's lines as the side sees them: none may trace the warning panel's edge. */
function checkSideLines(art: ClassArt) {
  const lines = art.nose.lines ?? [];
  const panel = art.nose.panel;
  if (!lines.length || !panel) return;
  const poly = panel.map((p) => [p[0], p[1]] as [number, number]);
  const bad: string[] = [];
  lines.forEach((line, i) => {
    const pts = densify(line.map((p) => [p[0], p[1]] as [number, number]), 0.01, false);
    const onEdge = pts.filter((p) => distanceToEdge(poly, p) < EDGE).length;
    if (onEdge > pts.length / 5) bad.push(`side line ${i} runs along the warning panel's edge for ${Math.round((100 * onEdge) / pts.length)}% of its length`);
  });
  findings.push({
    check: 'side lines',
    name: "the nose's side seams are joints, not paint edges",
    ok: bad.length === 0,
    detail: bad.length ? bad.join('; ') : `${lines.length} lines clear of the panel's edge`,
  });
  if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`side lines: ${bad.join('; ')}`);
}
