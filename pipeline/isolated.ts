// Builds one train's scene in a process of its own:
//
//   bun pipeline/isolated.ts <key> <dir>
//
// resvg's rendered images are never freed under Bun, so building every
// train in one process grows by a gigabyte and a half a train (CI was
// killed at 16 GB a tenth of the way through). A process per train hands
// all of it back when the train is done.

import { spawn } from 'node:child_process';

import { artFor, combinations } from '../resolve';
import { prepare } from './scene';

/** `prepare` for the train named `key`, run in a child process. */
export function prepareIsolated(key: string, dir: string): Promise<void> {
  return new Promise((done, fail) => {
    const child = spawn(process.execPath, [import.meta.path, key, dir], { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    child.stderr.on('data', (d) => (err += d));
    child.on('exit', (code) => (code === 0 ? done() : fail(new Error(err.trim() || `preparing ${key} exited with ${code}`))));
  });
}

if (import.meta.main) {
  const [key, dir] = process.argv.slice(2);
  const train = combinations().find((c) => c.key === key);
  if (!train || !dir) {
    console.error(`usage: bun pipeline/isolated.ts <key> <dir> (no train ${key})`);
    process.exit(2);
  }
  const { art, livery } = artFor(train.classCode, train.operator);
  prepare(art, livery, dir);
}
