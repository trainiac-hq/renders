import { Resvg } from '@resvg/resvg-js';

import type { Car, ClassArt, Form, Livery, Pt, Swoosh } from '../model/types';
import { bodyside, cantrailBand, type DoorPlace, nextStartOf } from './layout';
import { check, fillet, findings, frontShape, line, paintShape, type Poly, RADIUS, roundRect, shape } from './outline';
import { encodePng } from './png';
import { noseHalfWidth, noseOf, section } from './shell';

// The livery and the shapes on the body, painted flat as textures that the
// renderer projects onto the shell: the side view across both flanks, the
// front view along the train onto the nose. Colour goes in one image; the
// rest are masks saying where glass, seams, the warning panel and so on
// lie, so the renderer can give each its own material.
//
// A nose feature (panel, surround, windscreen, lamps) is drawn twice, as
// the side sees it and as the front does, and the renderer takes each
// point of the nose from whichever view faces it more squarely. The side
// views are the class's `nose`; the front view is `nose.face` on a flat
// front, `form.front` on a long nose.

/** Pixels per metre. */
const SIDE_PPM = 280;
/** The nose's features from the side, finer: their edges sit on the corners where views meet. */
const NOSE_PPM = 800;
const FRONT_PPM = 640;
const SIDE_X0 = -1.5;
const FRONT_HALF = 1.6;

export type Domain = { x0: number; x1: number; y0: number; y1: number; width: number; height: number };

export type Textures = {
  side: Domain;
  sideNose: Domain;
  front: Domain;
  /** File name to PNG bytes. */
  files: Record<string, Uint8Array>;
};


type Shape = { d: string; color?: string; opacity?: number; stroke?: number; raw?: string };

/**
 * Shapes rasterised to RGBA. They are drawn in `from`'s pixels; when the
 * image is another domain over the same metres, they're mapped across.
 */
function rasterise(domain: Domain, shapes: Shape[], background: string, from: Domain = domain): Uint8Array {
  const k = domain.width / (domain.x1 - domain.x0) / (from.width / (from.x1 - from.x0));
  const dx = (from.x0 - domain.x0) * (domain.width / (domain.x1 - domain.x0));
  const dy = (domain.y1 - from.y1) * (domain.height / (domain.y1 - domain.y0));
  const body = shapes
    .map((s) =>
      s.raw
        ? s.raw
        : s.stroke
        ? `<path d="${s.d}" fill="none" stroke="${s.color ?? '#fff'}" stroke-width="${s.stroke}" stroke-linejoin="round"${s.opacity !== undefined ? ` opacity="${s.opacity}"` : ''}/>`
        : `<path d="${s.d}" fill="${s.color ?? '#fff'}"${s.opacity !== undefined ? ` opacity="${s.opacity}"` : ''}/>`,
    )
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${domain.width}" height="${domain.height}" viewBox="0 0 ${domain.width} ${domain.height}">` +
    `<rect width="100%" height="100%" fill="${background}"/><g transform="matrix(${k} 0 0 ${k} ${dx} ${dy})">${body}</g></svg>`;
  const image = new Resvg(svg, { fitTo: { mode: 'original' } }).render();
  return new Uint8Array(image.pixels);
}

/** A rendered white-on-black layer as one byte per pixel. */
function grey(rgba: Uint8Array): Uint8Array {
  const out = new Uint8Array(rgba.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4];
  return out;
}

/** Packs greyscale layers into one image's channels. */
function pack(domain: Domain, layers: Uint8Array[]): Uint8Array {
  const n = domain.width * domain.height;
  const channels = layers.length as 1 | 3 | 4;
  const out = new Uint8Array(n * channels);
  for (let i = 0; i < n; i++) for (let c = 0; c < channels; c++) out[i * channels + c] = layers[c][i];
  return encodePng(domain.width, domain.height, channels, out);
}

function rgb(rgba: Uint8Array): Uint8Array {
  const n = rgba.length / 4;
  const out = new Uint8Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = rgba[i * 4];
    out[i * 3 + 1] = rgba[i * 4 + 1];
    out[i * 3 + 2] = rgba[i * 4 + 2];
  }
  return out;
}

export function paint(art: ClassArt, form: Form, livery: Livery): Textures {
  const h = art.heights;
  const nextStart = nextStartOf(art);
  const sec = section(art, form);
  const nose = noseOf(art, form);
  const noseWidth = noseHalfWidth(art, form);
  // Across a face, u is taken over the body as it is at that height, or at
  // the cantrail above it: the roof curves in there, and shapes running up
  // past it should keep their width rather than pinch to a point.
  const faceWidth = (y: number) => noseWidth(Math.min(y, h.cantrail));
  const y0 = Math.min(0, nose.lowest - 0.2);
  const y1 = h.roof + 0.05;
  const sideX1 = nextStart + art.next.length + 0.5;
  const side: Domain = {
    x0: SIDE_X0,
    x1: sideX1,
    y0,
    y1,
    width: Math.round((sideX1 - SIDE_X0) * SIDE_PPM),
    height: Math.round((y1 - y0) * SIDE_PPM),
  };
  const noseX1 = Math.min(sideX1, art.nose.profile[art.nose.profile.length - 1][0] + Math.max(...form.setback.map(([, q]) => q)) + 1.5);
  const noseDomain: Domain = {
    x0: SIDE_X0,
    x1: noseX1,
    y0,
    y1,
    width: Math.round((noseX1 - SIDE_X0) * NOSE_PPM),
    height: Math.round((y1 - y0) * NOSE_PPM),
  };
  const front: Domain = {
    x0: -FRONT_HALF,
    x1: FRONT_HALF,
    y0,
    y1,
    width: Math.round(2 * FRONT_HALF * FRONT_PPM),
    height: Math.round((y1 - y0) * FRONT_PPM),
  };

  // --- The side view --------------------------------------------------------
  const X = (x: number) => ((x - side.x0) * SIDE_PPM).toFixed(1);
  const Y = (y: number) => ((side.y1 - y) * SIDE_PPM).toFixed(1);
  // Every shape is an outline from outline.ts: corners filleted, checked.
  const path = (poly: Poly, closed = true) => 'M' + poly.map(([x, y]) => `${X(x)} ${Y(y)}`).join('L') + (closed ? 'Z' : '');
  const rect = (x0: number, yy0: number, x1: number, yy1: number, name: string, r: number = RADIUS.edge) =>
    path(roundRect(x0, yy0, x1, yy1, r, name));
  const curve = (pts: Pt[], radius: number, name: string) => path(shape(pts, radius, name));
  // Paint boundaries: faired, and failing on any wobble.
  const painted = (pts: Pt[], radius: number, name: string) => path(paintShape(pts, radius, name));
  const frac = (f: number) => h.bottom + f * (h.cantrail - h.bottom);
  const under = livery.under ?? '#2B2E33';
  const coach: Livery = { ...livery, ...livery.coach };

  // Colour: the bodies' paint, bands and shapes, like the drawn art's.
  const albedo: Shape[] = [{ d: rect(side.x0, side.y0, side.x1, side.y1, 'ground'), color: under }];
  const paintCar = (lv: Livery, car: Car, x0: number, from: number, to: number) => {
    const lead = x0 === 0;
    albedo.push({ d: rect(from, h.bottom - 0.02, to, h.roof + 0.1, 'body'), color: lv.body });
    // The nose may come down below the skirt; it wears the body colour there.
    if (lead && nose.lowest < h.bottom) albedo.push({ d: rect(from, nose.lowest - 0.05, Math.min(to, 4), h.bottom, 'chin'), color: lv.body });
    for (const band of lv.bands ?? []) {
      if (band.car === (lead ? 'next' : 'cab')) continue;
      const [lo, hi] = [frac(band.lo), frac(band.hi)];
      let [a, b, slant] = lead ? [band.from ?? from, band.to ?? to, band.slant ?? 0] : [from, to, 0];
      // A long nose carries the cantrail line over its top as a decal; on
      // the bodyside it starts where the nose's cap ends, under the decal's end.
      const line = cantrailBand(art, lv);
      if (lead && form.front?.cantrailLine && line && frac(band.lo) === line.lo) {
        const y = (line.lo + line.hi) / 2;
        a = Math.max(a, nose.P(y) + nose.Q(y) - 0.005);
      }
      const corners: Poly = [[a, lo], [b, lo], [b, hi], [a + slant, hi]];
      albedo.push({ d: path(check(fillet(corners, Math.min(RADIUS.edge, (hi - lo) / 2.5)), 'band')), color: band.color });
    }
    const swooshes = (layer: 'under' | 'doors' | undefined) => {
      for (const swoosh of lv.swooshes ?? []) {
        if ((swoosh.car ?? 'cab') !== (lead ? 'cab' : 'next') || swoosh.layer !== layer) continue;
        const pts = swoosh.points.map((p) => [x0 + p[0], frac(p[1]), ...(p.length === 3 ? [1] : [])] as unknown as Pt);
        if (swoosh.dotFade) albedo.push(...dotField(pts, swoosh.dotFade, swoosh.color));
        else if (swoosh.dots) albedo.push(...dots(pts, swoosh.dots, swoosh.color));
        else albedo.push({ d: painted(pts, swoosh.radius ?? RADIUS.livery, 'livery shape'), color: swoosh.color });
      }
    };
    swooshes('under');
    if (lv.windowBand) {
      const [lo, hi] = car.window ?? h.window;
      const first = Math.min(...car.windows.map((w) => w[0]), ...car.doors.filter((d) => !d.cab).map((d) => d.x - d.w / 2));
      const start = lead ? (lv.windowBandFrom ?? first - 0.3) : from;
      albedo.push({ d: rect(start, lo - 0.1, to, hi + 0.1, 'window band', RADIUS.window), color: lv.windowBand });
    }
    swooshes(undefined);
    // The roof colour starts where the nose meets the roof.
    const roofFrom = lead ? art.nose.profile[art.nose.profile.length - 1][0] : from;
    albedo.push({ d: rect(roofFrom, h.cantrail, to, h.roof + 0.2, 'roof'), color: lv.roof });
    // Logos and wordmarks, over the paint and the doors' colour.
    const marks = () => {
      for (const mk of lv.marks ?? []) {
        if ((mk.car ?? 'cab') !== (lead ? 'cab' : 'next')) continue;
        const [a, b] = mk.x;
        const [lo, hi] = mk.y;
        const w = ((b - a) * SIDE_PPM).toFixed(1);
        const ht = ((hi - lo) * SIDE_PPM).toFixed(1);
        albedo.push({ d: '', raw: `<svg x="${X(x0 + a)}" y="${Y(hi)}" width="${w}" height="${ht}" viewBox="0 0 ${mk.viewBox[0]} ${mk.viewBox[1]}" preserveAspectRatio="xMidYMid meet">${mk.svg}</svg>` });
      }
    };
    for (const door of layout.doors) {
      if (door.cab || door.lead !== lead) continue;
      if (lv.doors) albedo.push({ d: doorPath(door), color: lv.doors });
      for (const st of lv.doorStripes ?? []) {
        for (const side of door.leaves === 2 ? [-1, 1] : [1]) {
          const [a, b] = [door.x + side * st.from, door.x + side * st.to].sort((p, q) => p - q);
          albedo.push({ d: rect(a, st.lo, b, st.hi, 'door stripe', RADIUS.fitting), color: st.color });
        }
      }
    }
    swooshes('doors');
    marks();
  };
  const dots = (pts: Pt[], size: number, color: string): Shape[] => {
    const inside = (x: number, y: number) => {
      let hit = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    };
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const step = size * 2.6;
    const k = (size * SIDE_PPM).toFixed(1);
    let d = '';
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += step) {
      for (let x = Math.min(...xs); x <= Math.max(...xs); x += step) {
        if (inside(x, y)) d += `M${X(x - size)} ${Y(y)}a${k} ${k} 0 1 0 ${2 * +k} 0a${k} ${k} 0 1 0 ${-2 * +k} 0Z`;
      }
    }
    return d ? [{ d, color }] : [];
  };
  // A graded dot field: a staggered grid whose dots shrink (or grow) along the car.
  const dotField = (pts: Pt[], f: NonNullable<Swoosh['dotFade']>, color: string): Shape[] => {
    const inside = (x: number, y: number) => {
      let hit = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i];
        const [xj, yj] = pts[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
      }
      return hit;
    };
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
    let d = '';
    let row = 0;
    for (let y = Math.min(...ys) + f.rowPitch / 2; y <= Math.max(...ys); y += f.rowPitch, row++) {
      for (let x = x0 + (row % 2 && f.stagger !== false ? f.pitch / 2 : 0); x <= x1; x += f.pitch) {
        if (!inside(x, y)) continue;
        const r = f.from + ((f.to - f.from) * (x - x0)) / Math.max(1e-6, x1 - x0);
        if (r < 0.006) continue;
        const k = (r * SIDE_PPM).toFixed(2);
        d += `M${X(x - r)} ${Y(y)}a${k} ${k} 0 1 0 ${(2 * +k).toFixed(2)} 0a${k} ${k} 0 1 0 ${(-2 * +k).toFixed(2)} 0Z`;
      }
    }
    return d ? [{ d, color }] : [];
  };
  const layout = bodyside(art);
  const doorPath = (door: DoorPlace) => rect(door.x - door.w / 2, door.lo, door.x + door.w / 2, door.hi, 'door', RADIUS.door);
  paintCar(livery, art.cab, 0, side.x0, art.cab.length + 0.01);
  paintCar(coach, art.next, nextStart, nextStart - 0.01, side.x1);

  // Glass, seams and louvres on the bodysides.
  const glass: Shape[] = [];
  const seams: Shape[] = [];
  const louvres: Shape[] = [];
  // A window: its glass, and a seam round it where the rubber sits.
  const pane = (d: string) => {
    glass.push({ d });
    seams.push({ d, stroke: 0.03 * SIDE_PPM, opacity: 0.6 });
  };
  for (const door of layout.doors) {
    seams.push({ d: doorPath(door), stroke: 0.035 * SIDE_PPM });
    if (door.leaves === 2) seams.push({ d: rect(door.x - 0.012, door.lo, door.x + 0.012, door.hi, 'door joint', 0.012) });
    // A cab door's handle, recessed into the leaf near its trailing edge.
    if (door.cab) {
      const hx = door.x + door.w / 2 - 0.12;
      const hy = (door.lo + door.hi) / 2 - 0.05;
      seams.push({ d: rect(hx - 0.035, hy - 0.09, hx + 0.035, hy + 0.09, 'door handle', 0.03) });
    }
  }
  for (const p of layout.panes) {
    pane(Array.isArray(p) ? curve(p, RADIUS.window, 'cab window') : rect(p.x0, p.y0, p.x1, p.y1, 'window', Math.max(p.r, 0.03)));
  }
  for (const [car, x0] of [[art.cab, 0], [art.next, nextStart]] as const) {
    for (const [from, to] of car.louvres ?? []) {
      for (let x = from; x < to - 0.05; x += 0.16) louvres.push({ d: rect(x0 + x, h.window[0] - 0.1, x0 + x + 0.07, h.window[1], 'louvre', RADIUS.fitting) });
    }
  }
  for (const l of art.nose.lines ?? []) seams.push({ d: path(line(l, 'panel joint'), false), stroke: 0.03 * SIDE_PPM });

  // The nose's side view.
  const face = art.nose.face;
  const panelColour = livery.panel ?? '#F7D117';
  const sideNose = {
    panel: art.nose.panel && panelColour !== 'none' ? [{ d: painted(art.nose.panel, RADIUS.livery, 'warning panel') }] : [],
    dark: art.nose.surround ? [{ d: painted(art.nose.surround, RADIUS.window, 'windscreen surround') }] : [],
    screen: art.nose.windscreen ? [{ d: curve(art.nose.windscreen, RADIUS.window, 'windscreen') }] : [],
    lamp: (art.nose.lights ?? []).map((l) => ({ d: curve(l, RADIUS.fitting, 'lamp') })),
  };

  // --- The front view ---------------------------------------------------------
  const FX = (z: number) => ((z - front.x0) * FRONT_PPM).toFixed(1);
  const FY = (y: number) => ((front.y1 - y) * FRONT_PPM).toFixed(1);
  const fpath = (poly: Poly, closed = true) => 'M' + poly.map(([z, y]) => `${FX(z)} ${FY(y)}`).join('L') + (closed ? 'Z' : '');
  // u across the body at that height, 0 one side and 1 the other.
  const onFront = (pts: Pt[], radius: number, name: string, paint = false) => fpath(frontShape(pts, faceWidth, radius, name, paint));
  const frontLine = (pts: Pt[], name: string) =>
    fpath(line(pts.map(([u, y]) => [(u - 0.5) * 2 * faceWidth(y), y] as Pt), name), false);
  const view = form.front ?? face;
  const frontLayers = {
    panel:
      panelColour === 'none'
        ? []
        : [view?.panel, ...(view?.panels ?? [])].filter((p): p is Pt[] => !!p).map((p) => ({ d: onFront(p, RADIUS.livery, 'front panel', !form.front) })),
    dark: (view?.dark ?? []).map((p) => ({ d: onFront(p, RADIUS.window, 'front dark', !form.front) })),
    screen: (view?.screens ?? []).map((p) => ({ d: onFront(p, RADIUS.window, 'front screen') })),
    lamp: (view?.lights ?? []).map((p) => ({ d: onFront(p, RADIUS.fitting, 'front lamp') })),
    gangway: view?.gangway ? [{ d: onFront(view.gangway, RADIUS.door, 'gangway door') }] : [],
    lines: (view?.lines ?? []).map((p) => ({ d: frontLine(p, 'front joint'), stroke: 0.03 * FRONT_PPM })),
  };
  // Painted areas on a flat face in colours of their own: a line of the
  // livery across it, say. A long nose lays its shapes on as decals.
  const frontPaint: Shape[] = form.front
    ? []
    : (face?.shapes ?? []).map((sh) => ({ d: onFront(sh.pts, sh.radius ?? RADIUS.livery, 'front shape', true), color: sh.color === 'under' ? under : sh.color }));

  const s = (shapes: Shape[]) => grey(rasterise(side, shapes, '#000'));
  const f = (shapes: Shape[]) => grey(rasterise(front, shapes, '#000'));

  // Each view's nose features carried through the nose's surface into the
  // other view, so the two views agree wherever the renderer blends them.
  // A flat front's face is the whole truth about its front, so only it is
  // carried round onto the corners; a side drawing's windscreen running
  // out ahead of the face would otherwise glaze all of it.
  // A long nose drawn head-on in `form.front` takes its features from that
  // drawing alone: the side drawings are made to read at the drawn art's
  // size, and two independent drawings never meet cleanly on a curved nose.
  const layers = ['panel', 'dark', 'screen', 'lamp'] as const;
  const n = (shapes: Shape[]) => grey(rasterise(noseDomain, shapes, '#000', side));
  const sideMasks = layers.map((k) => n(form.front ? [] : sideNose[k]));
  // A long nose's features are modelled as decals, so leave its paint plain.
  const frontMasks = layers.map((k) => f(form.front ? [] : frontLayers[k]));
  const toSide = (mask: Uint8Array, into: Uint8Array) => {
    for (let j = 0; j < noseDomain.height; j++) {
      const y = noseDomain.y1 - (j + 0.5) / NOSE_PPM;
      const [p, q, hw] = [nose.P(y), nose.Q(y), noseWidth(y)];
      if (q <= 0) continue;
      const i0 = Math.max(0, Math.floor((p - noseDomain.x0) * NOSE_PPM));
      // A flat front's paint wraps a few centimetres past its corner onto
      // the side, as it's applied, so the edge falls on the flat bodyside
      // rather than along the curve where the views hand over.
      const wrap = face ? 0.05 : 0;
      const i1 = Math.min(noseDomain.width, Math.ceil((p + q + wrap - noseDomain.x0) * NOSE_PPM));
      for (let i = i0; i < i1; i++) {
        const x = noseDomain.x0 + (i + 0.5) / NOSE_PPM;
        const z = Math.min(nose.across((x - p) / q) * hw, hw - 0.01);
        const v = sampleMask(mask, front, z, y, FRONT_PPM);
        if (v > into[j * noseDomain.width + i]) into[j * noseDomain.width + i] = v;
      }
    }
  };
  const toFront = (mask: Uint8Array, into: Uint8Array) => {
    for (let j = 0; j < front.height; j++) {
      const y = front.y1 - (j + 0.5) / FRONT_PPM;
      const hw = noseWidth(y);
      const [p, q] = [nose.P(y), nose.Q(y)];
      for (let i = 0; i < front.width; i++) {
        const z = front.x0 + (i + 0.5) / FRONT_PPM;
        if (Math.abs(z) > hw) continue;
        const x = p + q * nose.plan(Math.abs(z) / hw);
        const v = sampleMask(mask, noseDomain, x, y, NOSE_PPM);
        if (v > into[j * front.width + i]) into[j * front.width + i] = v;
      }
    }
  };
  const sideOut = sideMasks.map((m) => m.slice());
  const frontOut = frontMasks.map((m) => m.slice());
  layers.forEach((_, k) => {
    toSide(frontMasks[k], sideOut[k]);
    if (!face) toFront(sideMasks[k], frontOut[k]);
  });

  // Where the front view may apply at all: the nose's cap and a flat
  // front's few centimetres of wrap, edged to the pixel. Behind it the
  // surface may still lean forward (a chin sweeping back to the skirt),
  // but it carries the side's paint.
  function zone(): Uint8Array {
    const out = new Uint8Array(noseDomain.width * noseDomain.height);
    const wrap = face ? 0.05 : 0;
    for (let j = 0; j < noseDomain.height; j++) {
      const y = noseDomain.y1 - (j + 0.5) / NOSE_PPM;
      const edge = (nose.P(y) + nose.Q(y) + wrap - noseDomain.x0) * NOSE_PPM;
      for (let i = 0; i < noseDomain.width; i++) {
        const cover = Math.max(0, Math.min(1, edge - i));
        out[j * noseDomain.width + i] = Math.round(cover * 255);
      }
    }
    return out;
  }

  const sideAlbedo = rasterise(side, albedo, under);
  // A face shape marked `wraps` (it reaches the face's corner and carries on
  // round it as the side's paint) must find the side wearing the same colour there,
  // its edge at the same height, or the two paints meet in a step at the
  // corner (the 345's bumper). Checked just behind the
  // corner on the side drawing, at the shape's top where it meets the edge.
  if (!form.front) {
    const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
    const at = (x: number, y: number) => {
      const i = Math.round((x - side.x0) * SIDE_PPM), j = Math.round((side.y1 - y) * SIDE_PPM);
      const k = (j * side.width + i) * 4;
      return [sideAlbedo[k], sideAlbedo[k + 1], sideAlbedo[k + 2]];
    };
    const near = (a: number[], b: number[]) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))) < 12;
    const bad: string[] = [];
    for (const sh of (face?.shapes ?? []).filter((x) => x.wraps)) {
      const colour = sh.color === 'under' ? under : sh.color;
      if (!colour.startsWith('#') || colour.length !== 7) continue;
      const pts = sh.pts.map(([u, y]) => [(u - 0.5) * 2 * faceWidth(y), y] as [number, number]);
      const edge = pts.filter(([z]) => Math.abs(z) >= faceWidth(h.bottom) - 0.03);
      if (edge.length < 2) continue;
      const top = Math.max(...edge.map((p) => p[1]));
      if (top <= h.bottom + 0.05) continue;
      const lo = Math.max(h.bottom + 0.01, Math.min(...edge.map((p) => p[1])));
      // Inside the shape's band where it meets the edge, and 1.5 cm above its
      // top, over the first 20 cm behind the corner (where a livery may then turn its own way): the side's edge must run
      // on at the face's height (a curve through the side's points can bulge).
      const want = hex(colour);
      for (let d = 0.05; d <= 0.2; d += 0.05) {
        const x = nose.P(top) + nose.Q(top) + d;
        const below = at(x, Math.max(lo, top - 0.03)), above = at(x, top + 0.015);
        if (!near(below, want) || near(above, want)) {
          bad.push(`a ${colour} face shape reaches the corner at ${top.toFixed(2)} m but ${d.toFixed(2)} m behind it the side is ${near(below, want) ? 'the same colour above that height' : 'another colour'}`);
          break;
        }
      }
    }
    findings.push({ check: 'corner paint', name: 'face paint meets the side paint at the corner', ok: bad.length === 0, detail: bad.length ? bad.join('; ') : 'continuous' });
    if (bad.length && process.env.TRAIN_STRICT !== '0') throw new Error(`corner paint: ${bad.join('; ')}`);
  }

  const files: Record<string, Uint8Array> = {
    'side-albedo.png': encodePng(side.width, side.height, 3, rgb(sideAlbedo)),
    'side-mat.png': pack(side, [s(glass), s(seams), s(louvres)]),
    'side-nose.png': pack(noseDomain, sideOut),
    'side-zone.png': pack(noseDomain, [zone()]),
    'front-nose.png': pack(front, frontOut),
    'front-mat.png': pack(front, [f(frontLayers.gangway), f(frontLayers.lines), f([])]),
    'front-albedo.png': encodePng(front.width, front.height, 4, rasterise(front, frontPaint, 'none')),
  };
  return { side, sideNose: noseDomain, front, files };
}

/** One layer of a mask, nearest pixel to a point in metres. */
function sampleMask(mask: Uint8Array, domain: Domain, x: number, y: number, ppm: number): number {
  // Bilinear, so an edge carried onto a steep part of the nose stays smooth.
  const fi = (x - domain.x0) * ppm - 0.5;
  const fj = (domain.y1 - y) * ppm - 0.5;
  const i = Math.floor(fi);
  const j = Math.floor(fj);
  const at = (a: number, b: number) =>
    a < 0 || b < 0 || a >= domain.width || b >= domain.height ? 0 : mask[b * domain.width + a];
  const [ti, tj] = [fi - i, fj - j];
  return Math.round(
    (at(i, j) * (1 - ti) + at(i + 1, j) * ti) * (1 - tj) + (at(i, j + 1) * (1 - ti) + at(i + 1, j + 1) * ti) * tj,
  );
}
