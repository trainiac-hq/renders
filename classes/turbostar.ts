import type { ClassArt } from '../model/types';
import { artFromSpec, type DmuSpec } from './dmu-spec';
import spec170 from './170/spec.json';
import spec172 from './172/spec.json';
import spec171 from './171/spec.json';
import spec168 from './168/spec.json';

// The Turbostar family (168, 170, 171, 172), each class built from its
// measured spec (classes/<code>/spec.json). Classes not yet measured stay
// in diesel.ts.

/** 170: the Turbostar's rounded GRP cab, two-leaf plug doors at the thirds. */
export const class170: ClassArt = artFromSpec(spec170 as unknown as DmuSpec, 'turbostar', 'XC');

/** 172/2-3: the gangwayed Turbostar, on inside-frame bogies. */
export const class172: ClassArt = artFromSpec(spec172 as unknown as DmuSpec, 'turbostar', 'LM');

/** 171/7-8: Southern's Turbostar, Dellner couplers under a deeper valance. */
export const class171: ClassArt = artFromSpec(spec171 as unknown as DmuSpec, 'turbostar', 'SN');

/** 168/1-3: Chiltern's Turbostars, the 171's body. */
export const class168: ClassArt = artFromSpec(spec168 as unknown as DmuSpec, 'turbostar', 'CH');
