import { expect, test } from 'bun:test';

import { roofAt } from './shell';

test('roofAt: full height away from wells, the well height in them, eased between', () => {
  const h = { bottom: 0.75, cantrail: 4.45, roof: 4.8, well: 4.52, window: [1.42, 2.2] as const };
  const wells = [[3.9, 6.3]] as const;
  expect(roofAt(h, wells, 2.0)).toBe(4.8);
  expect(roofAt(h, wells, 3.4)).toBe(4.8);
  expect(roofAt(h, wells, 5.0)).toBe(4.52);
  expect(roofAt(h, wells, 3.65)).toBeCloseTo(4.66, 6);
  expect(roofAt(h, wells, 6.55)).toBeCloseTo(4.66, 6);
  expect(roofAt({ ...h, well: undefined }, wells, 5.0)).toBe(4.8);
});
