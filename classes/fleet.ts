import * as bremu from './bremu';
import * as desiro from './desiro';
import * as diesel from './diesel';
import * as electric from './electric';
import * as hitachi from './hitachi';
import * as loco from './loco';
import * as sprinter from './sprinter';
import * as turbostar from './turbostar';
import { box, lamps } from '../model/shapes';
import type { ClassArt } from '../model/types';

// Every class we can draw, by its TOPS class number, with the operators
// that run it. The shapes live in data/, one entry per class, measured
// from Commons side drawings and photos (see SOURCES.md); adding a class
// is adding an entry there and a line here.

/** A modern multiple unit with no class in particular, for anything we can't name. */
export const generic: ClassArt = {
  family: 'other',
  nose: {
    profile: [[0.3, 0.6, 1], [0.04, 0.9], [0.0, 1.15], [0.0, 2.0], [0.15, 2.9], [0.45, 3.5], [0.95, 3.8, 1]],
    face: {
      depth: 1.6,
      panel: box(0, 0.4, 1, 2.0),
      dark: [box(0.02, 1.96, 0.98, 3.3, 0.14), box(0.41, 0.5, 0.59, 0.9, 0.03)],
      screens: [box(0.05, 2.04, 0.95, 3.22, 0.12)],
      lights: lamps(1.2, 1.45),
    },
  },
  heights: { bottom: 1.0, cantrail: 3.45, roof: 3.8, window: [1.95, 2.8] },
  wheel: 0.84,
  wheelbase: 2.6,
  cab: {
    length: 23,
    doors: [{ x: 1.6, w: 0.6, cab: true }, { x: 6.3, w: 1.5, leaves: 2 }, { x: 16.4, w: 1.5, leaves: 2 }],
    windows: [[2.4, 5.2, 2], [7.4, 15.3, 4], [17.5, 22.4, 3]],
    bogies: [3.6, 19.6],
    under: [[6.0, 16.8]],
  },
  next: {
    length: 23,
    doors: [{ x: 4.6, w: 1.5, leaves: 2 }, { x: 16.4, w: 1.5, leaves: 2 }],
    windows: [[0.6, 3.5, 2], [5.7, 15.3, 4]],
    bogies: [3.6, 19.6],
  },
};

/** A class, the operators running it now, and those that ran it until a date (FLEET.md). */
const runs = (art: ClassArt, operators: string[], historical?: Record<string, string>): ClassArt => ({
  ...art,
  operators,
  ...(historical ? { historical } : {}),
});

/** A class still waiting to be built: the generic unit stands in, flagged. */
const standIn = (operators: string[]): ClassArt => ({ ...generic, operators, needsArt: true });

export const fleet: Record<string, ClassArt> = {
  '43': runs(loco.class43, ['SR'], { GW: '2025-12-13' }),
  '57': standIn(['GW']),
  '67': standIn(['AW']),
  '68': runs(loco.class68, ['CH']),
  '73': standIn(['CS']),
  '91': runs(loco.class91, ['GR']),
  '92': runs(electric.class92, ['CS']),

  '139': standIn(['LM']),
  '150': runs(sprinter.class150, ['GW', 'NT', 'AW', 'LM']),
  '153': runs(sprinter.class153, ['AW', 'SR']),
  '155': runs(sprinter.class155, ['NT']),
  '156': runs(sprinter.class156, ['NT', 'SR']),
  '158': runs(sprinter.class158, ['GW', 'NT', 'EM', 'SR', 'AW', 'SW']),
  '159': runs(sprinter.class159, ['SW']),
  '165': runs(diesel.class165, ['GW', 'CH']),
  '166': runs(diesel.class166, ['GW']),
  '168': runs(turbostar.class168, ['CH']),
  '170': runs(turbostar.class170, ['XC', 'NT', 'EM', 'SR'], { AW: '2024-01-29', LM: '2023-05' }),
  '171': runs(turbostar.class171, ['SN']),
  '172': runs(turbostar.class172, ['LM']),
  '175': runs(diesel.class175, ['GW'], { AW: '2023-12' }),
  '180': runs(bremu.class180, ['GC']),
  '185': runs(desiro.class185, ['TP']),
  '195': runs(diesel.class195, ['NT']),
  '196': runs(diesel.class196, ['LM']),
  '197': runs(diesel.class197, ['AW']),
  '220': runs(bremu.class220, ['XC']),
  '221': runs(bremu.class221, ['XC', 'GC'], { VT: '2024-12-14' }),
  '222': runs(bremu.class222, ['EM', 'LD']),
  '230': standIn(['AW', 'GW']),
  '231': runs(diesel.class231, ['AW']),

  '318': runs(bremu.class318, ['SR']),
  '319': runs(bremu.class319, [], { NT: '2024-01-02' }),
  '320': runs(bremu.class320, ['SR']),
  '323': runs(electric.class323, ['NT'], { LM: '2024-09-29' }),
  '331': runs(electric.class331, ['NT']),
  '333': runs(electric.class333, ['NT']),
  '334': runs(electric.class334, ['SR']),
  '345': runs(electric.class345, ['XR']),
  '350': runs(desiro.class350, ['LM']),
  '357': runs(electric.class357, ['CC']),
  '360': runs(desiro.class360, ['EM']),
  '375': runs(electric.class375, ['SE']),
  '376': runs(electric.class376, ['SE']),
  '377': runs(electric.class377, ['SN', 'SE']),
  '378': runs(electric.class378, ['LO']),
  '379': runs(electric.class379, ['GN'], { LE: '2022-02' }),
  '380': runs(desiro.class380, ['SR']),
  '385': runs(electric.class385, ['SR']),
  '387': runs(electric.class387, ['GW', 'GN', 'GX', 'HX', 'SN'], { CC: '2022' }),
  '390': runs(bremu.class390, ['VT']),
  '395': runs(electric.class395, ['SE']),
  '397': runs(electric.class397, ['TP']),
  '444': runs(desiro.class444, ['SW']),
  '450': runs(desiro.class450, ['SW']),
  '455': runs(bremu.class455, [], { SW: '2026-03-20' }),
  '456': runs(bremu.class456, [], { SW: '2022-01-17' }),
  '458': runs(electric.class458, ['SW']),
  '465': runs(bremu.class465, ['SE']),
  '466': runs(bremu.class466, ['SE']),
  '484': runs(electric.class484, ['IL']),
  '507': runs(bremu.class507, [], { ME: '2024-11-28' }),
  '508': runs(bremu.class508, [], { ME: '2024-01-16' }),
  '700': runs(desiro.class700, ['TL']),
  '701': runs(electric.class701, ['SW']),
  '707': runs(desiro.class707, ['SE']),
  '710': runs(electric.class710, ['LO']),
  '717': runs(desiro.class717, ['GN']),
  '720': runs(electric.class720, ['LE', 'CC']),
  '730': runs(electric.class730, ['LM']),
  '745': runs(electric.class745, ['LE']),
  '755': runs(diesel.class755, ['LE']),
  '756': runs(diesel.class756, ['AW']),
  // GW never carried passengers with them (returned April 2023), kept on purpose.
  '769': runs(bremu.class769, ['NT'], { AW: '2023-05-19', GW: '2023-04' }),
  '777': runs(electric.class777, ['ME']),

  '800': runs(hitachi.class800, ['GW', 'GR']),
  '801': runs(hitachi.at300Front, ['GR']),
  '802': runs(hitachi.at300Front, ['GW', 'TP', 'HT']),
  '803': runs(hitachi.at300Front, ['LD']),
  '805': runs(hitachi.evero, ['VT']),
  '807': runs(hitachi.evero, ['VT']),
  '810': runs(hitachi.aurora, ['EM']),
  // Not a TOPS class: Caltrain's (CT) Stadler double-deckers.
  KISS: runs(electric.kiss, ['CT']),
};
