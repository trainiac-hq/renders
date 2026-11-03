// Turns the rendered PNGs into what's published: WebP at 3x and 2x for
// each view, named by their content so they can be cached forever, and
// manifest.json saying which file is which (see MANIFEST.md). A render
// whose shadow runs into the frame's edge has it faded out first (see
// pipeline/edges.ts), and none is published that still does; edges.json
// says what each render's edges were and are.
//
//   bun scripts/publish.ts [--renders out/renders] [--out out/publish]
//
// Needs cwebp (brew install webp).

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { fleet } from '../classes/fleet';
import { edgesClear, type Edges, fadeShadow, shadowAtEdges, trainMask } from '../pipeline/edges';
import { decodePng, encodePng } from '../pipeline/png';
import { combinations, keyOf } from '../resolve';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = join(import.meta.dir, '..');
const renders = resolve(arg('renders') ?? join(root, 'out', 'renders'));
const out = resolve(arg('out') ?? join(root, 'out', 'publish'));
const files = join(out, 'trains');

/** The views, by the size in points they're drawn at in the app. Renders are 3x. */
export const VIEWS = { hero: { width: 370, height: 80 }, plate: { width: 160, height: 90 } } as const;
type View = keyof typeof VIEWS;

export type Manifest = {
  version: 1;
  /** Where the files are served from; a file's URL is base + its name. */
  base: string;
  views: Record<View, { width: number; height: number }>;
  /** Per rendered train (`<class>-<operator>`, `generic-<operator>`, `generic-none`): its files by view and scale. */
  renders: Record<string, Record<View, { '2x': string; '3x': string }>>;
  /** A class's own render to fall back on for an operator it isn't rendered for: its first operator's. */
  classes: Record<string, string>;
};

// Encoding is slow; a render that hasn't changed keeps its WebPs. The cache
// maps a PNG's hash and the settings to the file name they made.
const cachePath = join(out, 'cache.json');
const cache: Record<string, string> = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
mkdirSync(files, { recursive: true });
const SETTINGS = 'q88-a100-m6-sharp-edges';

function webp(png: string, scale: number, view: View): Buffer {
  const { width, height } = VIEWS[view];
  const tmp = join(out, 'tmp.webp');
  const size = scale === 3 ? [] : ['-resize', String(width * scale), String(height * scale)];
  const run = spawnSync('cwebp', ['-quiet', '-q', '88', '-alpha_q', '100', '-m', '6', '-sharp_yuv', ...size, png, '-o', tmp]);
  if (run.status !== 0) throw new Error(`cwebp failed on ${png}: ${run.stderr}`);
  const bytes = readFileSync(tmp);
  rmSync(tmp);
  return bytes;
}

const manifest: Manifest = { version: 1, base: 'https://traini.ac/trains/', views: VIEWS, renders: {}, classes: {} };
const missing: string[] = [];
const edges: Record<string, { before: Edges; after: Edges; faded: boolean }> = {};
const used = new Set<string>();
for (const { key } of combinations()) {
  const entry = {} as Manifest['renders'][string];
  let complete = true;
  for (const view of Object.keys(VIEWS) as View[]) {
    const png = join(renders, `${key}-${view}.png`);
    if (!existsSync(png)) {
      complete = false;
      continue;
    }
    const scales = {} as { '2x': string; '3x': string };
    const bytes = readFileSync(png);
    const source = createHash('sha256').update(bytes).digest('hex');
    let input = png;
    const { width, height, rgba } = decodePng(bytes);
    const maskPath = join(renders, `${key}-${view}-train.png`);
    const train = trainMask(rgba, width, height, existsSync(maskPath) ? decodePng(readFileSync(maskPath)).rgba : undefined);
    const before = shadowAtEdges(rgba, width, height, train);
    let after = before;
    if (!edgesClear(before)) {
      const faded = fadeShadow(rgba, width, height, train);
      after = shadowAtEdges(faded, width, height, train);
      if (!edgesClear(after)) throw new Error(`${key} ${view}: the shadow still reaches the frame's edge after fading: ${JSON.stringify(after)}`);
      input = join(out, `faded-${key}-${view}.png`);
      writeFileSync(input, encodePng(width, height, 4, faded));
    }
    edges[`${key}-${view}`] = { before, after, faded: input !== png };
    for (const scale of [2, 3] as const) {
      const id = `${source}:${scale}:${SETTINGS}`;
      let name = cache[id];
      if (!name || !existsSync(join(files, name))) {
        const bytes = webp(input, scale, view);
        const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10);
        name = `${key}.${view}@${scale}x.${hash}.webp`;
        writeFileSync(join(files, name), bytes);
        cache[id] = name;
      }
      scales[`${scale}x`] = name;
      used.add(name);
    }
    if (input !== png) rmSync(input);
    entry[view] = scales;
  }
  if (complete) manifest.renders[key] = entry;
  else missing.push(key);
}
for (const [code, art] of Object.entries(fleet)) {
  // A class no one runs now falls back to its last operator's livery.
  const first = art.operators?.[0] ?? Object.keys(art.historical ?? {})[0];
  if (first && !art.needsArt && manifest.renders[keyOf(code, first)]) manifest.classes[code] = keyOf(code, first);
}
// Files no longer in the manifest go.
for (const name of readdirSync(files)) if (!used.has(name)) rmSync(join(files, name));
writeFileSync(cachePath, JSON.stringify(cache));
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
writeFileSync(join(out, 'edges.json'), JSON.stringify(edges, null, 1) + '\n');
const faded = Object.values(edges).filter((e) => e.faded).length;
if (faded) console.log(`${faded} renders had their shadow faded out before the frame's edges`);
console.log(`${Object.keys(manifest.renders).length} trains published to ${out}${missing.length ? `; not rendered: ${missing.join(', ')}` : ''}`);
