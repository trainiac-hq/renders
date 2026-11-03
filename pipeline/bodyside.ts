import type { ClassArt, Form } from '../model/types';
import { bodyside, nextStartOf } from './layout';
import { findings } from './outline';
import { noseOf } from './shell';

// Whether everything set into the bodyside sits on the flat of it. The
// side elevation can't tell: a door drawn half round the cab corner
// measures right from the side and bends round the corner in 3D. So
// every door (its grab rails included), window and cab window is held
// against where the flat side starts behind the nose (the profile plus
// its setback, at every height the feature spans) and where it ends
// before each car end's corner.

/** How far back from the car end the end's corner reaches (shell.ts `end`). */
const END_CORNER = 0.12;
/** A cab door's grab rails stand this far out from its edges (blender/body.py `grab_rails`). */
const RAIL = 0.07 + 0.014;

export type SideFeature = { name: string; x0: number; x1: number; y0: number; y1: number };

export function sideFeatures(art: ClassArt): SideFeature[] {
  const layout = bodyside(art);
  const out: SideFeature[] = [];
  for (const d of layout.doors) {
    const pad = d.cab ? RAIL : 0;
    out.push({ name: `${d.cab ? 'cab door' : 'door'} at ${d.x.toFixed(2)} m${d.cab ? ' (with its grab rails)' : ''}`, x0: d.x - d.w / 2 - pad, x1: d.x + d.w / 2 + pad, y0: d.lo, y1: d.hi });
  }
  for (const p of layout.panes) {
    if (Array.isArray(p)) {
      if (art.nose.glazingOnNose) continue;
      const xs = p.map((q) => q[0]);
      const ys = p.map((q) => q[1]);
      out.push({ name: `cab window at ${Math.min(...xs).toFixed(2)} m`, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) });
    } else {
      out.push({ name: `window at ${p.x0.toFixed(2)} m`, x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1 });
    }
  }
  return out;
}

/** Where the flat bodyside starts behind the nose, at a height. */
export function flatStart(art: ClassArt, form: Form): (y: number) => number {
  const n = noseOf(art, form);
  return (y) => n.P(y) + n.Q(y);
}

/**
 * Records a finding for every feature that isn't on the flat side, with
 * how far it reaches onto the nose's corner or a car end's, and throws if
 * any does.
 */
export function checkBodyside(art: ClassArt, form: Form) {
  const start = flatStart(art, form);
  const nextStart = nextStartOf(art);
  const bad: string[] = [];
  let count = 0;
  for (const f of sideFeatures(art)) {
    count++;
    const lead = f.x0 < art.cab.length;
    let over = 0;
    let where = '';
    if (lead) {
      for (let i = 0; i <= 20; i++) {
        const y = f.y0 + ((f.y1 - f.y0) * i) / 20;
        const d = start(y) - f.x0;
        if (d > over) [over, where] = [d, `onto the nose's corner at ${y.toFixed(2)} m up`];
      }
      const rear = f.x1 - (art.cab.length - END_CORNER);
      if (rear > over) [over, where] = [rear, "onto the cab car's rear corner"];
    } else {
      const front = nextStart + END_CORNER - f.x0;
      const rear = f.x1 - (nextStart + art.next.length - END_CORNER);
      if (front > over) [over, where] = [front, "onto the next car's front corner"];
      if (rear > over) [over, where] = [rear, "onto the next car's rear corner"];
    }
    if (over > 0.001) bad.push(`${f.name} reaches ${(over * 1000).toFixed(0)} mm ${where}`);
  }
  findings.push({
    check: 'bodyside',
    name: 'doors and windows on the flat side',
    ok: bad.length === 0,
    detail: bad.length ? bad.join('; ') : `${count} features, all clear of the nose's corner and the car ends`,
  });
  if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`bodyside: ${bad.join('; ')}`);
}
