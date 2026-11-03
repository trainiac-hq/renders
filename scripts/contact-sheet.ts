// A contact sheet of every render, labelled, for reviewing a batch:
//
//   bun scripts/contact-sheet.ts [--renders out/renders] [--out out/contact-sheet.png] [--view hero] [--columns 3] [--dark]

import { Resvg } from '@resvg/resvg-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { combinations } from '../resolve';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = join(import.meta.dir, '..');
const renders = resolve(arg('renders') ?? join(root, 'out', 'renders'));
const view = arg('view') ?? 'hero';
const out = resolve(arg('out') ?? join(root, 'out', `contact-sheet-${view}.png`));
const columns = Number(arg('columns') ?? (view === 'hero' ? 3 : 6));
const dark = process.argv.includes('--dark');

const cells = combinations()
  .map((c) => ({ key: c.key, path: join(renders, `${c.key}-${view}.png`) }))
  .filter((c) => existsSync(c.path));
const [w, h] = view === 'hero' ? [740, 160] : [320, 180];
const label = 30;
const pad = 16;
const rows = Math.ceil(cells.length / columns);
const width = columns * (w + pad) + pad;
const height = rows * (h + label + pad) + pad;
const body = cells
  .map((c, i) => {
    const x = pad + (i % columns) * (w + pad);
    const y = pad + Math.floor(i / columns) * (h + label + pad);
    const data = readFileSync(c.path).toString('base64');
    return (
      `<text x="${x}" y="${y + 20}" font-family="Helvetica" font-size="18" fill="${dark ? '#ddd' : '#333'}">${c.key}</text>` +
      `<image x="${x}" y="${y + label}" width="${w}" height="${h}" href="data:image/png;base64,${data}"/>`
    );
  })
  .join('');
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
  `<rect width="100%" height="100%" fill="${dark ? '#1C1C1E' : '#F2F2F7'}"/>${body}</svg>`;
writeFileSync(out, new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng());
console.log(`${cells.length} renders on ${out}`);
