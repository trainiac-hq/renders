import type { Livery, Pt } from '../model/types';
import { fracOf } from '../model/spec';
import spec720 from '../classes/720/spec.json';

/**
 * The 720's livery as measured (classes/720/spec.json, livery), in an
 * operator's colours: a light body, the windows in a black band, an accent
 * (Greater Anglia red, c2c magenta) on the doors, the windows plain (no band), a thin sweep rising from
 * the nose's foot to the cab door and the cheek beside the screen, a lower
 * band where the operator has one, the yellow panel on the face.
 */
export function aventra720(c: { body: string; accent: string; lower?: string; roof: string; yellow: string; band: string; branded?: 'LE' | 'CC' }): Livery {
  const l = spec720.model.livery;
  const h = spec720.model.heights;
  const f = fracOf(h.bottom, h.cantrail);
  const [[s0, y0], [s1, y1]] = l.sweep;
  const w = l.sweepW;
  // The cheek band is broad on the photos (720573, 720606): about 0.22 m across the corner.
  const cw = l.cheekW;
  const edge = l.nose.map(([x, y]) => [x, f(y)] as Pt);
  const [[lf0, ly0], [lf1, ly1]] = l.lowerFront;
  return {
    body: c.body,
    roof: c.roof,
    doors: c.accent,
    face: c.body,
    panel: c.yellow,
    surround: c.band,
    // Greater Anglia's wordmark, measured: the spec's model.livery.branding.
    ...(c.branded ? { branding: (c.branded === 'CC' ? l.brandingCC : l.branding) as unknown as Livery['branding'] } : {}),
    bands: [
      { lo: f(l.orangeLine[0]), hi: f(l.orangeLine[1]), color: '#E9802E' },
      ...(c.lower ? [{ lo: 0, hi: f(l.lowerTop), color: c.lower, car: 'next' as const }] : []),
    ],
    swooshes: [
      ...(c.lower ? [{ points: [[lf0, -0.2, 1], [lf0, f(ly0), 1], [lf1, f(ly1), 1], [40, f(ly1), 1], [40, -0.2, 1]] as Pt[], color: c.lower }] : []),
      // Greater Anglia's slanting accent along the lower side (c2c has none).
      ...(c.lower ? [{ points: [[s0, f(y0), 1], [s1, f(y1), 1], [s1, f(y1 + w), 1], [s0, f(y0 + w), 1]] as Pt[], color: c.accent, radius: 0.02 }] : []),
      // The cheek beside the screen, a broad band carried round the nose's edge.
      { points: [[edge[0][0] + cw, edge[0][1], 1], ...edge.slice(1, -1).map(([x, y]) => [x + cw, y] as Pt), [edge[edge.length - 1][0] + cw, edge[edge.length - 1][1], 1], [edge[edge.length - 1][0] - 0.05, edge[edge.length - 1][1], 1], ...edge.slice(1, -1).reverse().map(([x, y]) => [x - 0.05, y] as Pt), [edge[0][0] - 0.05, edge[0][1], 1]], color: c.accent, radius: 0.02 },
    ],
  };
}
