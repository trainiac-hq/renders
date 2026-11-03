import { expect, test } from 'bun:test';

import { frontOf } from './curve';

/** The plain scan frontOf replaced: every segment crossing the height. */
function scan(sampled: [number, number][], y: number, fallback: number) {
  let best = Infinity;
  for (let i = 0; i < sampled.length - 1; i++) {
    const [a, b] = [sampled[i], sampled[i + 1]];
    if ((a[1] - y) * (b[1] - y) > 0 || a[1] === b[1]) continue;
    best = Math.min(best, a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
  }
  return best === Infinity ? fallback : best;
}

test('frontOf matches the scan, on and between profile heights', () => {
  let seed = 1;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 50; k++) {
    // Wandering profiles with repeated and level heights, like a nose's.
    const pts: [number, number][] = Array.from({ length: 40 }, () => [rnd() * 3, Math.round(rnd() * 20) / 4]);
    const front = frontOf(pts, -1);
    const ys = [...pts.map((p) => p[1]), ...Array.from({ length: 200 }, () => rnd() * 6 - 0.5)];
    for (const y of ys) expect(front(y)).toBe(scan(pts, y, -1));
  }
});
