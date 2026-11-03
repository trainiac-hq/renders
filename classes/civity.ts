import type { ClassArt, Form, Pt } from '../model/types';
import { carOf, type CarSpec } from '../model/spec';
import { aventra, type AventraSpec } from './aventra';
import spec195 from './195/spec.json';
import spec331 from './331/spec.json';
import spec196 from './196/spec.json';
import spec197 from './197/spec.json';
import spec397 from './397/spec.json';

// CAF Civity: 195, 331 (Northern), each built from its measured spec
// (classes/<code>/spec.json, every number's source in its `trace`) with
// the same face-in-metres builder as the Aventra.

/** Northern's 331 as measured (classes/331/spec.json). */
export const class331: ClassArt = aventra(spec331.model as unknown as AventraSpec, 'civity');

/** Northern's 195: the 331's body and face (one diagram template), diesel: no pantograph. */
const m195 = spec195.model as unknown as AventraSpec;
export const class195: ClassArt = aventra({ ...m195, next: { ...m195.next, roof: [{ kind: 'pod', x: 3.3, w: 2.4 }, { kind: 'pod', x: 11.5, w: 3.2 }] } }, 'civity');

/** West Midlands Railway's 196: the gangwayed Civity (classes/196/spec.json). */
export const class196: ClassArt = aventra(spec196.model as unknown as AventraSpec, 'civity');

/** Transport for Wales's 197: the same front (classes/197/spec.json). */
export const class197: ClassArt = aventra(spec197.model as unknown as AventraSpec, 'civity');

/**
 * TransPennine's 397 (Nova 2) as measured (classes/397/spec.json): the long
 * pointed Civity nose drawn from the side (its glazing, surround and lamp
 * band follow the nose's curve), single-leaf doors at the car ends.
 */
const m397 = spec397.model;
export const class397: ClassArt = {
  family: 'civity',
  nose: {
    profile: m397.nose.profile as unknown as Pt[],
    surround: m397.nose.surround as unknown as Pt[],
    windscreen: m397.nose.windscreen as unknown as Pt[],
    lights: m397.nose.lights as unknown as Pt[][],
  },
  form: m397.form as unknown as Form,
  heights: { ...m397.heights, window: m397.heights.window as [number, number] },
  windowRadius: m397.windowRadius,
  wheel: m397.wheel,
  wheelbase: m397.wheelbase,
  cab: { ...carOf(m397.cab as unknown as CarSpec), under: m397.cab.under.map(([a, b]) => [a, b] as const) },
  next: { ...carOf(m397.next as unknown as CarSpec), under: m397.next.under.map(([a, b]) => [a, b] as const) },
};
