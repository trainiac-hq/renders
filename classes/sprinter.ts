import type { ClassArt } from '../model/types';
import { artFromSpec, type DmuSpec } from './dmu-spec';
import spec158 from './158/spec.json';
import spec159 from './159/spec.json';
import spec153 from './153/spec.json';
import spec156 from './156/spec.json';
import spec150 from './150/spec.json';
import spec155 from './155/spec.json';

// The Sprinter family (150, 153, 155, 156, 158, 159), each class built from
// its measured spec (classes/<code>/spec.json): geometry in metres, the face
// in metres from its centre line, a livery per operator. Classes not yet
// measured stay in diesel.ts.

/** 158: the Express Sprinter, double-leaf plug doors at both car ends. */
export const class158: ClassArt = artFromSpec(spec158 as unknown as DmuSpec, 'sprinter', 'GW');

/** 159: a 158 rebuilt for South Western Railway, three cars, the middle one without a cab. */
export const class159: ClassArt = artFromSpec(spec159 as unknown as DmuSpec, 'sprinter', 'SW');

/** 153: a 155 car rebuilt as a single unit, the original cab leading. */
export const class153: ClassArt = artFromSpec(spec153 as unknown as DmuSpec, 'sprinter', 'AW');

/** 156: the Super Sprinter, two cars, single-leaf doors at the car ends. */
export const class156: ClassArt = artFromSpec(spec156 as unknown as DmuSpec, 'sprinter', 'NT');

/** 150: the Sprinter, two cars, two-leaf doors at the thirds; 150/1 (no gangway) where NT and LM run them. */
export const class150: ClassArt = artFromSpec(spec150 as unknown as DmuSpec, 'sprinter', 'GW');

/** 155: Leyland's Super Sprinter, single-leaf plug doors at the car ends. */
export const class155: ClassArt = artFromSpec(spec155 as unknown as DmuSpec, 'sprinter', 'NT');
