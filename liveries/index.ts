import type { Livery } from '../model/types';
import { GW } from './GW';
import { GR } from './GR';
import { VT } from './VT';
import { XC } from './XC';
import { TP } from './TP';
import { NT } from './NT';
import { SN } from './SN';
import { TL } from './TL';
import { GN } from './GN';
import { SE } from './SE';
import { SW } from './SW';
import { LE } from './LE';
import { CC } from './CC';
import { CH } from './CH';
import { EM } from './EM';
import { XR } from './XR';
import { SR } from './SR';
import { AW } from './AW';
import { ME } from './ME';
import { LO } from './LO';
import { GX } from './GX';
import { HX } from './HX';
import { GC } from './GC';
import { HT } from './HT';
import { LD } from './LD';
import { CS } from './CS';
import { LM } from './LM';
import { IL } from './IL';
import { CT } from './CT';

// Liveries by operator (ATOC code), then by class code or family, with a
// `default` for anything else the operator runs. Band heights are
// fractions of the bodyside, skirt (0) to cantrail (1); shapes on the
// leading car are in metres from the nose tip. Each is read from photos
// of the train as running in 2026: see SOURCES.md.

export const liveries: Record<string, Record<string, Livery>> = { GW, GR, VT, XC, TP, NT, SN, TL, GN, SE, SW, LE, CC, CH, EM, XR, SR, AW, ME, LO, GX, HX, GC, HT, LD, CS, LM, IL, CT };

export { neutral } from './shared';
