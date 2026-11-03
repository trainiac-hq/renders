// Fetches a reference photo of a class from Wikimedia Commons and records
// where it came from:
//
//   bun scripts/fetch-ref.ts [--width 2400] <class> "File:Some photo.jpg" [more files...]
//
// Saves a copy (1280px wide unless --width says otherwise) to
// classes/<class>/refs/ when its licence allows redistribution (CC0, CC BY,
// CC BY-SA, public domain), and adds a row to classes/<class>/SOURCES.md
// either way: URL, author, licence. A PNG (a side diagram) is kept whole,
// at its own size, since it's measured pixel by pixel.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const UA = { 'User-Agent': 'trainiac-renders/1.0 (https://traini.ac)' };
const args = process.argv.slice(2);
const w = args.indexOf('--width');
const width = w >= 0 ? Number(args.splice(w, 2)[1]) : 1280;
const [code, ...titles] = args;
if (!code || !titles.length) {
  console.error('usage: bun scripts/fetch-ref.ts <class> "File:..." [...]');
  process.exit(1);
}

const dir = join(import.meta.dir, '..', 'classes', code);
const refs = join(dir, 'refs');
const sources = join(dir, 'SOURCES.md');
mkdirSync(refs, { recursive: true });
if (!existsSync(sources)) {
  writeFileSync(
    sources,
    `# Class ${code}: reference photos\n\nFrom Wikimedia Commons. Files kept in refs/ are those whose licence allows\nredistribution; the rest are listed for reference only.\n\n| File | Author | Licence | Kept |\n|------|--------|---------|------|\n`,
  );
}

const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const free = (licence: string) => /^(CC0|CC BY(-SA)? [0-9.]+|Public domain|PD)/i.test(licence);

for (const title of titles) {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=${width}&format=json&titles=` +
    encodeURIComponent(title);
  const data = (await (await fetch(api, { headers: UA })).json()) as {
    query: { pages: Record<string, { imageinfo?: { url: string; thumburl: string; descriptionurl: string; extmetadata: Record<string, { value: string }> }[] }> };
  };
  const info = Object.values(data.query.pages)[0].imageinfo?.[0];
  if (!info) {
    console.log(`${title}: not found`);
    continue;
  }
  const meta = info.extmetadata;
  const author = plain(meta.Artist?.value ?? 'unknown');
  const licence = plain(meta.LicenseShortName?.value ?? 'unknown');
  const name = title.replace(/^File:/, '').replace(/[^A-Za-z0-9.]+/g, '-').replace(/-+/g, '-');
  const keep = free(licence);
  const png = /\.png$/i.test(title);
  if (keep) {
    const body = new Uint8Array(await (await fetch(png ? info.url : info.thumburl, { headers: UA })).arrayBuffer());
    writeFileSync(join(refs, name.replace(/\.(jpe?g|png)$/i, '') + (png ? '.png' : '.jpg')), body);
  }
  const table = readFileSync(sources, 'utf8');
  if (!table.includes(info.descriptionurl)) {
    writeFileSync(sources, table + `| [${title.replace(/^File:/, '')}](${info.descriptionurl}) | ${author} | ${licence} | ${keep ? 'yes' : 'no, URL only'} |\n`);
  }
  console.log(`${title}: ${licence}, ${keep ? 'kept' : 'URL only'}`);
}
