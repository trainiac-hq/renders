import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Car, ClassArt, Face, Form, LampSpot, Livery, Pt, Plough, RoofItem } from '../model/types';
import { bodyside, curvePolyline, type DoorPlace } from './layout';
import { check, checked, contain, densify, fillet, findings, fitLamps, frontShape, inside, type LampUnit, MAX_TURN, paintEdges, type Poly, RADIUS, roundRect, shape, WOBBLE } from './outline';
import { atlas, decals, LIFT } from './decals';
import { type BrandingPlace, placeBranding } from './branding';
import { BOGIES, type BogieType, type CouplerType } from '../model/gear';
import { checkBodyside } from './bodyside';
import { checkFrontFeatures, checkFrontLines } from './frontface';
import { nextStartOf } from './layout';
import { type Domain, paint } from './paint';
import { defaultForm, noseField, noseHalfWidth, noseOf, roofAt, section, shell, type Mesh } from './shell';

// Everything Blender needs to render one train, written to a directory:
// the shells as raw meshes, the textures, and scene.json describing the
// rest (running gear, roof equipment, colours) for train.py to build.

export type SceneFile = {
  heights: ClassArt['heights'];
  width: number;
  wheel: number;
  wheelbase: number;
  cars: { x0: number; length: number; nose: boolean; mesh: string; vertices: number; quads: number; tris: number }[];
  bogies: number[];
  under: [number, number][];
  /** Roof equipment, each with `top`, the roof's height beneath it. */
  roof: (({ kind: 'pantograph'; x: number } | { kind: 'pod' | 'exhaust' | 'dome'; x: number; w: number }) & { top: number })[];
  /** Gaps between cars, where the gangway bellows go, [from, to]. */
  gangways: [number, number][];
  /** Coupler at the nose: the height of its centre, and where the nose face is. */
  coupler: { y: number; x: number } | null;
  buffers: number | null;
  /** How far forward of the nose tip the train starts, and how far back it ends. */
  extent: [number, number];
  /** Where the nose ends: behind this the front view never applies. */
  noseLength: number;
  textures: { side: Domain; sideNose: Domain; front: Domain };
  colours: { face: string; panel: string; dark: string; gangway: string; under: string; roof: string; kit: string; glass: string };
  features: Features;
  /** An aerial on the nose's top, this far back from the tip. */
  antenna: number | null;
  /** A long nose's glazing, surrounds and panel, laid on its surface; the mesh's faces carry material numbers. */
  decals: { mesh: string; materials: string[] } | null;
  /** Logos and wordmarks, their SVGs beside scene.json (branding.ts). */
  branding: BrandingPlace[];
  /** Bogie and coupler types (model/gear.ts), and how far out the bogie's axle-end covers stand. */
  gear: { bogie: BogieType; coupler: CouplerType; axlebox: number };
  /** A snowplough (model/types.ts Plough), its x from the nose tip and colour resolved; null for none. */
  plough: (Omit<Plough, 'color'> & { x: number; color: string }) | null;
};

/**
 * What the renderer models rather than paints: the glazing, door edges and
 * lamps, as closed polylines in metres, plus the surfaces to set them on.
 * Bodyside shapes are [x, y]; front shapes are [z, y], z across from the
 * centre line.
 */
export type Features = {
  glazing: 'gasket' | 'bonded';
  panes: [number, number][][];
  doors: DoorPlace[];
  face: {
    screens: [number, number][][];
    lamps: [number, number][][];
    gangway: [number, number][] | null;
    /** A gangway standing out ahead of the face: its frame's outline ([z, y]) and how far forward it comes. */
    recesses: { outline: [number, number][]; depth: number }[];
    grilles: [number, number][][];
    gangwayFrame: { outline: [number, number][]; depth: number; seams: number[]; color: string | null; lower?: { to: number; color: string }; bellows?: string; rake?: number } | null;
    /** A unit number on the front: its text, where its middle is ([z, y]), its height. */
    number: { text: string; at: [number, number]; height: number; color?: string; both?: boolean; weight?: 'regular' | 'light' } | null;
    /** The lamps in each housing, fitted inside it. */
    lampUnits: LampUnit[][];
    /** Wipers as parked, pivot to tip, [z, y]. */
    wipers: { pivot: [number, number]; tip: [number, number] }[];
    /** Whether the glass is laid on the nose (a long nose) rather than set into it. */
    laidOn: boolean;
    lampRim: 'chrome' | 'black';
    tailLens: 'red' | 'clear';
    lampStyle: 'recessed' | 'flush' | 'glazed';
    lampBack: string | null;
    glazedTail?: 'red';
    gangwayMount: 'surround' | 'flush';
    /** Openings cut back into the face ([z, y] outlines) and their depth. */
    pockets: { outline: [number, number][]; depth: number }[];
    /** Blocks standing out ahead of the face ([z, y] outlines), how far, and their ribs. */
    blocks: { outline: [number, number][]; depth: number; ribs: number }[];
  };
  /** The nose surface: x at (y, z) on a grid, null outside the body. */
  nose: { y0: number; z0: number; step: number; ny: number; nz: number; x: (number | null)[] };
  /** Half the body's width by height, from y0 in steps. */
  halfWidth: { y0: number; step: number; w: number[] };
};

const FIELD_STEP = 0.02;

/** An outline cut fine before it's carried round onto a curved nose. */
const densePlace = (pts: Poly) => densify(pts, 0.01);

const area = (pts: Poly) => Math.abs(pts.reduce((t, p, i) => t + p[0] * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * p[1], 0) / 2);

/**
 * Where the wipers park: as the class says, or one up the outer edge of
 * each screen big enough for one, or a single one leaning across a wide
 * single screen.
 */
function wipers(view: Face | undefined, halfWidth: (y: number) => number): Features['face']['wipers'] {
  if (!view) return [];
  const at = ([u, y]: readonly [number, number]): [number, number] => [(u - 0.5) * 2 * halfWidth(y), y];
  if (view.wipers) return view.wipers.map((w) => ({ pivot: at(w.pivot), tip: at(w.tip) }));
  const out: Features['face']['wipers'] = [];
  for (const screen of view.screens) {
    const us = screen.map((p) => p[0]);
    const ys = screen.map((p) => p[1]);
    const [u0, u1, y0, y1] = [Math.min(...us), Math.max(...us), Math.min(...ys), Math.max(...ys)];
    const [z0, z1] = [at([u0, y0])[0], at([u1, y0])[0]];
    if (z1 - z0 < 0.3 || y1 - y0 < 0.4) continue;
    const side = (z0 + z1) / 2 > 0 ? 1 : -1;
    let pivot: [number, number];
    let length: number;
    let angle: number;
    if (z1 - z0 > 1.2) {
      pivot = [z0 + (z1 - z0) * 0.64, y0 + 0.08];
      length = Math.min((y1 - y0) * 0.95, (z1 - z0) * 0.45);
      angle = (125 * Math.PI) / 180;
    } else {
      pivot = [side > 0 ? z1 - 0.08 : z0 + 0.08, y0 + 0.07];
      length = (y1 - y0) * 0.8;
      angle = ((side > 0 ? 96 : 84) * Math.PI) / 180;
    }
    out.push({ pivot, tip: [pivot[0] + length * Math.cos(angle), pivot[1] + length * Math.sin(angle)] });
  }
  return out;
}

function features(art: ClassArt, form: Form): Features {
  const h = art.heights;
  const sec = section(art, form);
  const layout = bodyside(art);
  const field = noseField(art, form);
  const noseWidth = noseHalfWidth(art, form);
  // Across a face, u is taken over the body as it is at that height, or at
  // the cantrail above it: the roof curves in there, and shapes running up
  // past it should keep their width rather than pinch to a point.
  const faceWidth = (y: number) => noseWidth(Math.min(y, h.cantrail));
  const lowest = Math.min(h.bottom, ...art.nose.profile.map((p) => p[1]));
  const W = form.width / 2 + 0.05;
  const ny = Math.ceil((h.roof - lowest) / FIELD_STEP) + 1;
  const nz = Math.ceil((2 * W) / FIELD_STEP) + 1;
  const x: (number | null)[] = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nz; i++) {
      const v = field(lowest + j * FIELD_STEP, -W + i * FIELD_STEP);
      x.push(v === null ? null : Math.round(v * 10000) / 10000);
    }
  }
  const widths: number[] = [];
  for (let y = lowest; y <= h.roof + 1e-6; y += 0.01) widths.push(Math.round(sec.halfWidth(Math.max(h.bottom, y)) * 10000) / 10000);
  // A point of the face, [u across, y], placed across the body at its height.
  const across = (pts: [number, number][]): [number, number][] =>
    pts.map(([u, y]) => [(u - 0.5) * 2 * noseWidth(y), y]);
  // A flat front's face is modelled; a long nose's features are decals (decals.ts).
  const face = art.nose.face;

  // Parts inside parts: each windscreen inside the black frame that holds
  // it, each window in a door inside that door.
  const darkShapes = (face?.dark ?? []).map((p) => frontShape(p, faceWidth, RADIUS.window, 'face dark', true));
  for (const screen of face?.screens ?? []) {
    const glass = frontShape(screen, faceWidth, RADIUS.window, 'windscreen');
    const middle: [number, number] = [glass.reduce((t, p) => t + p[0], 0) / glass.length, glass.reduce((t, p) => t + p[1], 0) / glass.length];
    const parent = darkShapes.filter((d) => inside(d, middle)).sort((p, q) => area(p) - area(q))[0];
    if (parent) contain(glass, parent, 0.008, 'windscreen in its frame');
  }
  for (const door of layout.doors) {
    const leaf = roundRect(door.x - door.w / 2, door.lo, door.x + door.w / 2, door.hi, RADIUS.door, 'door');
    for (const p of layout.panes) {
      if (Array.isArray(p)) continue;
      const pane = roundRect(p.x0, p.y0, p.x1, p.y1, Math.max(p.r, 0.03), 'window');
      if (inside(leaf, [(p.x0 + p.x1) / 2, (p.y0 + p.y1) / 2])) contain(pane, leaf, 0.04, 'door window in its door');
    }
  }

  // Lamp clusters are modelled, set into the body, on every front: drawn
  // head-on on the face, or along the flank for a long nose's slanted ones.
  // The lamps are fitted inside each housing as it lies on the surface,
  // unwrapped flat in true metres, so a housing curving round a corner
  // still gets lamps of its real size; then each is placed back on the
  // face by where it sits on the surface.
  const surface = atlas(art, form);
  const lampShapes: Poly[] = [];
  const lampUnits: LampUnit[][] = [];
  // Unwrapped first, rounded in true metres, then checked: in the face's
  // own [z, y] too, once placed back.
  const place = (drawn: Pt[], unwrap: (p: [number, number]) => [number, number], order: 'outboard' | 'inboard' | 'below', name: string, given?: readonly LampSpot[]) => {
    const flat = check(densify(fillet(curvePolyline(drawn, 16).map(unwrap), RADIUS.fitting), 0.006), name);
    const ss = flat.map((p) => p[0]);
    const ys = flat.map((p) => p[1]);
    const across = Math.max(...ss) - Math.min(...ss) >= Math.max(...ys) - Math.min(...ys);
    // Measured lamps where the class gives them, each held inside its housing.
    const units: LampUnit[] = given?.length
      ? given.map((g) => {
          const [x, y] = unwrap([g.at[0], g.at[1]]);
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * 2 * Math.PI;
            const q: [number, number] = [x + g.r * Math.cos(a), y + g.r * Math.sin(a)];
            if (!inside(flat, q)) throw new Error(`${name}: its ${g.kind} lamp runs outside the housing`);
          }
          return { kind: g.kind, x, y, r: g.r };
        })
      : fitLamps(flat, across, 0.012, name, order);
    lampShapes.push(
      check(
        flat.map((p) => {
          const [, y, z] = surface.toSurface(p);
          return [z, y] as [number, number];
        }),
        `${name} on the face`,
      ),
    );
    lampUnits.push(units.map((u) => {
      const [, y, z] = surface.toSurface([u.x, u.y]);
      return { ...u, x: z, y };
    }));
  };
  const front = face ?? form.front;
  for (const [i, l] of (front?.lights ?? []).entries()) {
    // Drawn head-on: u across the face. Measured lamps: per housing, or a
    // flat list placed in the housing that holds each lamp.
    const units = front?.lampUnits;
    const drawn = curvePolyline(l, 16) as Poly;
    const given = units && units.length && Array.isArray(units[0])
      ? (units as LampSpot[][])[i]
      : (units as LampSpot[] | undefined)?.filter((g) => inside(drawn, [g.at[0], g.at[1]]));
    place(l, (p) => surface.fromFront(p), front?.headlamps ?? 'outboard', 'lamp', given);
  }
  for (const l of form.side?.lights ?? []) {
    place(l, (p) => surface.fromSide(p), 'outboard', 'flank lamp', form.side?.lampUnits);
    place(l, (p) => {
      const [s0, y] = surface.fromSide(p);
      return [-s0, y];
    }, 'outboard', 'flank lamp', form.side?.lampUnits);
  }
  return {
    glazing: form.glazing ?? 'bonded',
    panes: layout.panes.map((p) =>
      Array.isArray(p) ? shape(p, RADIUS.window, 'cab window') : roundRect(p.x0, p.y0, p.x1, p.y1, Math.max(p.r, 0.03), 'window'),
    ),
    doors: layout.doors,
    face: {
      screens: (face?.screens ?? []).map((p) => frontShape(p, faceWidth, RADIUS.window, 'windscreen')),
      lamps: lampShapes,
      lampUnits,
      number: (face ?? form.front)?.number ? { ...(face ?? form.front)!.number!, at: across([[(face ?? form.front)!.number!.at[0], (face ?? form.front)!.number!.at[1]]])[0] } : null,
      gangway: face?.gangway ? frontShape(face.gangway, faceWidth, RADIUS.door, 'gangway door') : null,
      // A flat face's grilles (a long nose lays its own as decals).
      grilles: (face?.grilles ?? []).map((g) => frontShape(g, faceWidth, RADIUS.fitting, 'face grille')),
      recesses: (face?.recesses ?? []).map((r) => ({ outline: frontShape(r.outline, faceWidth, RADIUS.door, 'front recess'), depth: r.depth })),
      gangwayFrame: face?.gangwayFrame
        ? { outline: frontShape(face.gangwayFrame.outline, faceWidth, RADIUS.door, 'gangway frame'), depth: face.gangwayFrame.depth, seams: face.gangwayFrame.seams ?? [], color: face.gangwayFrame.color ?? null, ...(face.gangwayFrame.lower ? { lower: face.gangwayFrame.lower } : {}), ...(face.gangwayFrame.bellows ? { bellows: face.gangwayFrame.bellows } : {}), ...(face.gangwayFrame.rake ? { rake: face.gangwayFrame.rake } : {}) }
        : null,
      wipers: wipers(face ?? form.front, faceWidth),
      laidOn: !face && !!form.front,
      lampRim: (face ?? form.front)?.lampRim ?? 'chrome',
      tailLens: (face ?? form.front)?.tailLens ?? 'red',
      lampStyle: (face ?? form.front)?.lampStyle ?? 'recessed',
      lampBack: (face ?? form.front)?.lampBack ?? null,
      ...((face ?? form.front)?.glazedTail ? { glazedTail: (face ?? form.front)?.glazedTail } : {}),
      gangwayMount: face?.gangwayMount ?? 'surround',
      pockets: ((face ?? form.front)?.pockets ?? []).map((k) => ({ outline: frontShape(k.outline, faceWidth, RADIUS.door, 'face pocket'), depth: k.depth })),
      blocks: ((face ?? form.front)?.blocks ?? []).map((b) => ({ outline: frontShape(b.outline, faceWidth, RADIUS.door, 'face block'), depth: b.depth, ribs: b.ribs ?? 0 })),
    },
    nose: { y0: lowest, z0: -W, step: FIELD_STEP, ny, nz, x },
    halfWidth: { y0: lowest, step: 0.01, w: widths },
  };
}

function writeMesh(path: string, mesh: Mesh) {
  writeFileSync(`${path}.v.bin`, new Float32Array(mesh.vertices));
  writeFileSync(`${path}.q.bin`, new Uint32Array(mesh.quads));
  writeFileSync(`${path}.t.bin`, new Uint32Array(mesh.tris));
}

export function prepare(art: ClassArt, livery: Livery, dir: string): SceneFile {
  mkdirSync(dir, { recursive: true });
  findings.length = 0;
  checked.outlines = 0;
  checked.points = 0;
  Object.assign(paintEdges, { count: 0, worst: 0, name: '', at: [0, 0] });
  const form = art.form ?? defaultForm;
  const nextStart = nextStartOf(art);
  const firstWheel = art.cab.bogies[0] - art.wheelbase / 2 - art.wheel / 2 - 0.1;
  const cars = [
    { x0: 0, length: art.cab.length, nose: true, wells: art.cab.wells },
    { x0: nextStart, length: art.next.length, nose: false, wells: art.next.wells },
  ].map((car, i) => {
    const mesh = shell(art, form, car, firstWheel);
    const name = `car${i}`;
    writeMesh(join(dir, name), mesh);
    return { ...car, mesh: name, vertices: mesh.vertices.length / 3, quads: mesh.quads.length / 4, tris: mesh.tris.length / 3 };
  });

  checkBodyside(art, form);
  const feats = features(art, form);
  {
    const hw = noseHalfWidth(art, form);
    const across = (pts: Pt[]): Poly => pts.map(([u, y]) => [(u - 0.5) * 2 * hw(Math.min(y, art.heights.cantrail)), y] as [number, number]);
    // A long nose's windscreens are laid on, not in the face's features: take them from its drawing.
    const screens = feats.face.screens.length ? feats.face.screens : (form.front?.screens ?? []).map(across);
    checkFrontFeatures({ ...feats.face, screens });
    checkFrontLines(art, form, across);
  }
  const nose = decals(art, form, livery);
  let decalFile: SceneFile['decals'] = null;
  if (nose) {
    writeMesh(join(dir, 'decals'), nose);
    writeFileSync(join(dir, 'decals.m.bin'), new Uint8Array(nose.materials));
    writeFileSync(join(dir, 'decals.n.bin'), new Float32Array(nose.normals));
    writeFileSync(join(dir, 'decals.l.bin'), new Float32Array(nose.lifts));
    writeFileSync(join(dir, 'decals.r.bin'), new Float32Array(nose.raised));
    decalFile = { mesh: 'decals', materials: nose.names };
  }

  const textures = paint(art, form, livery);
  for (const [name, bytes] of Object.entries(textures.files)) writeFileSync(join(dir, name), bytes);

  const shared = new Set(art.articulated ? [0] : []);
  const bogies = [
    ...art.cab.bogies,
    ...art.next.bogies.filter((b) => !shared.has(b)).map((b) => nextStart + b),
    ...(art.articulated ? [art.cab.length + (nextStart - art.cab.length) / 2] : []),
  ];
  const under = [
    ...(art.cab.under ?? []).map(([a, b]) => [a, b] as [number, number]),
    ...(art.next.under ?? []).map(([a, b]) => [nextStart + a, nextStart + b] as [number, number]),
  ];
  // Each item stands on the roof beneath it, down in a well where there is one.
  const on = (car: Car, r: RoofItem) => roofAt(art.heights, car.wells ?? [], r.x + ('w' in r ? r.w / 2 : 0));
  const roof = [...(art.cab.roof ?? []).map((r) => ({ ...r, top: on(art.cab, r) })), ...(art.next.roof ?? []).map((r) => ({ ...r, x: nextStart + r.x, top: on(art.next, r) }))];
  const tip = art.nose.profile[0];
  const coach: Livery = { ...livery, ...livery.coach };
  const panel = livery.panel ?? '#F7D117';
  const sec = section(art, form);
  // A face painted across its whole width shows that colour wherever the
  // face's other features leave it, round its corners included.
  const facePanel = art.nose.face?.panel ?? [];
  const fullPanel = facePanel.length > 0 && Math.min(...facePanel.map((p) => p[0])) <= 0.01 && Math.max(...facePanel.map((p) => p[0])) >= 0.99;
  const scene: SceneFile = {
    heights: art.heights,
    width: 2 * sec.halfWidth((art.heights.bottom + art.heights.cantrail) / 2),
    wheel: art.wheel,
    wheelbase: art.wheelbase,
    cars,
    bogies,
    under,
    roof,
    gangways: [[art.cab.length, nextStart]],
    coupler: art.nose.coupler ?? (art.nose.face && !art.nose.buffers ? { y: Math.max(0.55, tip[1] - 0.15), x: tip[0] } : null),
    buffers: art.nose.buffers ?? null,
    extent: [Math.min(0, tip[0]), nextStart + art.next.length],
    noseLength: art.nose.profile[art.nose.profile.length - 1][0] + Math.max(...form.setback.map(([, q]) => q)) + 0.3,
    textures: { side: textures.side, sideNose: textures.sideNose, front: textures.front },
    colours: {
      face: livery.face ?? (fullPanel && panel !== 'none' ? panel : livery.body),
      panel: panel === 'none' ? livery.body : panel,
      dark: livery.surround ?? '#15181C',
      gangway: livery.gangway ?? (panel === 'none' ? livery.body : panel),
      under: livery.under ?? '#2B2E33',
      roof: coach.roof,
      kit: coach.roofKit ?? coach.roof,
      glass: livery.glass ?? '#1B232C',
    },
    features: feats,
    decals: decalFile,
    branding: placeBranding(art, form, livery, dir),
    plough: art.plough
      ? {
          ...art.plough,
          x: tip[0],
          color: (() => {
            const c = art.plough!.color ?? 'panel';
            if (c.startsWith('#')) return c;
            if (c === 'panel') return panel === 'none' ? livery.body : panel;
            return ((livery as Record<string, unknown>)[c] as string | undefined) ?? livery.under ?? '#2B2E33';
          })(),
        }
      : null,
    gear: {
      bogie: art.gear?.bogie ?? 'generic',
      coupler: art.gear?.coupler ?? 'generic',
      axlebox: BOGIES[art.gear?.bogie ?? 'generic'].axlebox,
    },
    antenna: form.antenna ?? null,
  };
  writeFileSync(join(dir, 'scene.json'), JSON.stringify(scene, null, 1));
  // What the geometry checks here found; any failure has already thrown.
  const lifts = Object.values(LIFT).sort((p, q) => p - q);
  const report = [
    { check: 'corners', name: 'every outline', ok: true, detail: `${checked.outlines} outlines, ${checked.points} points, none turning more than ${MAX_TURN}° at a point` },
    {
      check: 'smooth edges',
      name: 'every paint edge',
      ok: paintEdges.worst <= WOBBLE.limit,
      detail: `${paintEdges.count} paint edges faired; the worst wobble ${(paintEdges.worst * 1000).toFixed(2)} mm (limit ${(WOBBLE.limit * 1000).toFixed(1)})${paintEdges.name ? `, ${paintEdges.name} at (${paintEdges.at.map((c) => c.toFixed(2)).join(', ')})` : ''}`,
    },
    ...findings,
    {
      check: 'z-fighting',
      name: 'decal layer lifts',
      ok: lifts[0] >= 0.0005 && lifts[lifts.length - 1] <= 0.003,
      detail: `layers between ${(lifts[0] * 1000).toFixed(1)} and ${(lifts[lifts.length - 1] * 1000).toFixed(1)} mm`,
    },
  ];
  writeFileSync(join(dir, 'validate.json'), JSON.stringify(report, null, 1));
  return scene;
}
