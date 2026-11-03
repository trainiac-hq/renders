// Renders the trains in 3D with Blender:
//
//   bun scripts/render-all.ts [--only 800-GW,390-VT] [--out out/renders] [--views hero,plate] [--track] [--force] [--threads 4]
//
// Views: hero, plate, close, corner, side, face, top, elevation (the flat
// side the accuracy checks measure) and any a class's spec.json adds.
//
// For each class and operator it writes the scene (shells, textures,
// scene.json) to a work directory, then runs Blender headless on it.
// Trains whose renders are already there are skipped unless --force.

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { basename, join, resolve } from 'node:path';

import { artFor, combinations } from '../resolve';
import { prepareIsolated } from '../pipeline/isolated';

const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const out = resolve(arg('out') ?? join(import.meta.dir, '..', 'out', 'renders'));
const force = process.argv.includes('--force');
const only = arg('only')?.split(',');
const views = (arg('views') ?? 'hero,plate').split(',');
// Stand the trains on a short length of track rather than on their shadow alone.
const track = process.argv.includes('--track');
const jobs = Number(arg('jobs') ?? Math.max(1, Math.floor(availableParallelism() / 6)));
// CPU threads per Blender (its -t): --threads, else BLENDER_THREADS, else all cores.
const threads = arg('threads') ?? process.env.BLENDER_THREADS;

const todo = combinations()
  .map(({ classCode, operator, key }) => ({ classCode, operator, name: key }))
  .filter((c) => !only || only.includes(c.name))
  .filter((c) => force || !views.every((v) => existsSync(join(out, `${c.name}-${v}.png`))) || stale(c));

/**
 * Whether a train's data has changed since it was rendered: each render
 * leaves a hash of its class and livery beside it. Changes to the pipeline
 * itself need --force.
 */
function stale(c: { classCode: string | null; operator: string | null; name: string }) {
  const path = join(out, `${c.name}.inputs`);
  return !existsSync(path) || readFileSync(path, 'utf8') !== inputsOf(c);
}
function inputsOf(c: { classCode: string | null; operator: string | null }) {
  const { art, livery } = artFor(c.classCode, c.operator);
  return createHash('sha256').update(JSON.stringify({ art, livery, track })).digest('hex');
}

type Finding = { check: string; name: string; ok: boolean; detail: string };

/** The views a class's spec adds, matching the cameras of its reference photos. */
function specViews(classCode: string | null): Record<string, unknown> {
  const path = join(import.meta.dir, '..', 'classes', classCode ?? '', 'spec.json');
  if (!classCode || !existsSync(path)) return {};
  return (JSON.parse(readFileSync(path, 'utf8')) as { views?: Record<string, unknown> }).views ?? {};
}

const BUILT_IN = new Set(['hero', 'plate', 'close', 'corner', 'side', 'face', 'top', 'elevation']);
// A spec's `match-…` views are written by scripts/accuracy/match.py from the solved camera of a photo.

/**
 * One line for the terminal: the train, the stage train.py says it's on, and
 * while Cycles renders, a bar of its samples and the time it says is left.
 * shortcut: with --jobs above 1 the trains' lines overwrite each other; read each <train>.log then.
 */
let last = '';
function progress(name: string, stage: string, text: string): string {
  const sample = [...text.matchAll(/Sample (\d+)\/(\d+)/g)].at(-1);
  const left = [...text.matchAll(/Remaining: ?([\d:.]+)/g)].at(-1)?.[1];
  if (!sample) return (last = last.startsWith(`${name} ${stage} `) ? last : `${name} ${stage}`);
  const [done, total] = [Number(sample[1]), Number(sample[2])];
  const filled = Math.round((done / total) * 30);
  return (last = `${name} ${stage} [${'#'.repeat(filled)}${'-'.repeat(30 - filled)}] ${Math.round((done / total) * 100)}%${left ? ` ${left} left` : ''}`);
}

function blender(dir: string, prefix: string, classCode: string | null): Promise<void> {
  // A view another class's spec defines is skipped for this one.
  const own = specViews(classCode);
  const these = views.filter((v) => BUILT_IN.has(v) || v in own);
  return new Promise((done, fail) => {
    const script = join(import.meta.dir, '..', 'pipeline', 'train.py');
    const child = spawn(BLENDER, ['-b', '--factory-startup', '--log', 'render', '--log-level', 'info', ...(threads ? ['-t', threads] : []), '--python-exit-code', '1', '--python', script, '--', dir, prefix, ...these], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, TRAIN_TRACK: track ? 'track' : 'none', TRAIN_VIEWS: JSON.stringify(own) },
    });
    let log = '';
    // Blender's output, as it comes, in <prefix>.log: `tail -f` it to follow a render.
    writeFileSync(`${prefix}.log`, '');
    let stage = 'starting';
    const take = (d: Buffer) => {
      log += d;
      appendFileSync(`${prefix}.log`, d);
      const text = String(d);
      stage = [...text.matchAll(/^train: (.+)$/gm)].at(-1)?.[1] ?? stage;
      if (process.stderr.isTTY) process.stderr.write(`\r\x1b[K${progress(basename(prefix), stage, text)}`);
    };
    child.stdout.on('data', take);
    child.stderr.on('data', take);
    child.on('exit', (code) => {
      if (process.stderr.isTTY) process.stderr.write('\r\x1b[K');
      code === 0 ? done() : fail(new Error(`blender failed for ${prefix}:\n${log.slice(-4000)}`));
    });
  });
}

// The work directories (meshes, textures) are large: kept only with --keep.
const keep = process.argv.includes('--keep');
const failures: string[] = [];
const queue = [...todo];
async function worker() {
  for (let job = queue.shift(); job; job = queue.shift()) {
    const dir = join(out, 'work', job.name);
    const started = performance.now();
    const prefix = join(out, job.name);
    rmSync(`${prefix}-validate.json`, { force: true });
    try {
      // In a child process: resvg's memory is only handed back when it exits.
      await prepareIsolated(job.name, dir);
      await blender(dir, prefix, job.classCode);
      writeFileSync(`${prefix}.inputs`, inputsOf(job));
    } catch (e) {
      failures.push(job.name);
      console.log(`${job.name} FAILED: ${(e as Error).message.split('\n').filter((l) => /FAILED|Error/.test(l)).slice(0, 3).join(' / ')}`);
    } finally {
      // One validation report per train: the checks made here and in Blender.
      const read = (path: string) => (existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as Finding[]) : []);
      const report = [...read(join(dir, 'validate.json')), ...read(`${prefix}-validate.json`)];
      if (report.length) writeFileSync(`${prefix}-validate.json`, JSON.stringify(report, null, 1));
      const failed = report.filter((r) => !r.ok);
      console.log(`${job.name} validation: ${report.length - failed.length}/${report.length} passed${failed.map((f) => `
  FAILED ${f.check}: ${f.name}: ${f.detail}`).join('')}`);
      if (!keep && !failures.includes(job.name)) rmSync(dir, { recursive: true, force: true });
    }
    console.log(`${job.name} ${((performance.now() - started) / 1000).toFixed(1)}s (${todo.length - queue.length}/${todo.length})`);
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, todo.length) }, worker));
if (failures.length) {
  console.log(`failed: ${failures.join(', ')}`);
  process.exit(1);
}
