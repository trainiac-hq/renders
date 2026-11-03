// The geometry checks alone, without rendering:
//
//   bun validate/validate.ts [--only 800-GW,390-VT] [--jobs 3]
//
// Builds each train's scene into a scratch directory, which runs every
// check made before Blender (corners, containment, slivers, lines
// meeting, decals on the body), and prints the findings. The checks that
// need the model itself (decals on the shell, the ID pass) run in
// Blender as part of every render.

import { mkdtempSync, readFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { join } from 'node:path';

import { combinations } from '../resolve';
import { prepareIsolated } from '../pipeline/isolated';

const i = process.argv.indexOf('--only');
const only = i >= 0 ? process.argv[i + 1].split(',') : null;
// Each train is built in its own process (see pipeline/isolated.ts), a few
// at once; one peaks around 3 GB.
const j = process.argv.indexOf('--jobs');
const jobs = j >= 0 ? Number(process.argv[j + 1]) : Math.max(1, Math.min(4, availableParallelism() - 1));
const dir = mkdtempSync(join(tmpdir(), 'trains-'));
const todo = combinations().filter((c) => !only || only.includes(c.key));

type Finding = { ok: boolean; check: string; name: string; detail: string };
const results = new Map<string, string>();
let failed = 0;
let next = 0;
let printed = 0;

// Reports print in the usual order, whichever train finishes first.
function flush() {
  while (printed < todo.length && results.has(todo[printed].key)) console.log(results.get(todo[printed++].key));
}

async function worker() {
  for (let n = next++; n < todo.length; n = next++) {
    const { key } = todo[n];
    let text: string;
    try {
      await prepareIsolated(key, join(dir, key));
      const report = JSON.parse(readFileSync(join(dir, key, 'validate.json'), 'utf8')) as Finding[];
      const bad = report.filter((r) => !r.ok);
      failed += bad.length;
      text = [`${key}: ${report.length - bad.length}/${report.length} passed`, ...bad.map((r) => `  FAILED ${r.check}: ${r.name}: ${r.detail}`)].join('\n');
    } catch (e) {
      failed++;
      text = `${key}: FAILED ${(e as Error).message}`;
    }
    results.set(key, text);
    flush();
  }
}

await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, worker));
process.exit(failed ? 1 : 0);
