// The shape of a train, as data. Every length is in metres; a point is
// [x, y] with x back from the nose tip of the leading car and y up from the
// top of the rail. A third element of 1 marks a sharp corner: everything
// else is drawn as a smooth curve through the points.

import type { BogieType, CouplerType } from './gear';

export type Pt = readonly [number, number] | readonly [number, number, 1];

export type Nose = {
  /** The front's silhouette, from under the nose up to where it meets the roof. */
  profile: Pt[];
  /** The windscreen as the side sees it, if it does. */
  windscreen?: Pt[];
  /** Other glass on the nose: a cab side window, a gangway door's. */
  glazing?: Pt[][];
  /**
   * The glazing above sits on the nose's curve by design (a long nose's
   * cab side window), so the bodyside check (pipeline/bodyside.ts) leaves it.
   */
  glazingOnNose?: boolean;
  /** Black or dark glazing around the windscreen, drawn under it. */
  surround?: Pt[];
  /** The yellow warning panel, as much of it as shows from the side. */
  panel?: Pt[];
  lights?: Pt[][];
  /**
   * The front face, for a flat or raked front whose character the side
   * view can't show: windscreens, gangway door, lamps. Points are [u, y],
   * u across the front from the far edge (0) to the near corner (1).
   */
  face?: Face;
  /** Height of the buffers, on a locomotive: they stand at x 0, ahead of the cab. */
  buffers?: number;
  /**
   * Where the coupler's head meets the face (x back from the tip, its
   * centre's height), where a class measures it; by default it sits under
   * the nose's foot, and a long nose has none showing.
   */
  coupler?: { x: number; y: number };
  /** Lines drawn on the nose: a gangway door, panel joints. */
  lines?: Pt[][];
};

export type Face = {
  /** How wide the face draws, in metres along the train. */
  depth: number;
  /** Lowest height the face shows from; the profile's first point if not given. */
  bottom?: number;
  /** The warning panel. */
  panel?: Pt[];
  /** More of it, where it's in several pieces: either side of a gangway, a strip over the screens. */
  panels?: Pt[][];
  /** Black parts: windscreen surrounds, bumpers, destination screens. */
  dark?: Pt[][];
  /** A gangway door, drawn over the dark parts in the panel's colour. */
  gangway?: Pt[];
  /** A gangway door set in the face: in a raised rubber surround (the default), or flush, only its seam showing. */
  gangwayMount?: 'surround' | 'flush';
  /** Openings cut back into a flat face (a coupler pocket between bumper blocks), dark inside, `depth` metres deep. */
  pockets?: { outline: Pt[]; depth: number }[];
  /**
   * Blocks standing `depth` metres out ahead of the face, black rubber
   * with `ribs` raised ribs across them: anticlimbers either side of a coupler.
   */
  blocks?: { outline: Pt[]; depth: number; ribs?: number }[];
  /**
   * Openings cut back into the face ([u, y] outlines, as seen head-on), each
   * `depth` metres in from the surface: the recess under a cab's front that
   * the coupler stands in, between the skirts either side of it.
   */
  recesses?: { outline: Pt[]; depth: number }[];
  /**
   * A gangway that stands out ahead of the face: a dark frame round the
   * door (its outline, [u, y]) carried forward `depth` metres on bellows,
   * the door at its front, with vertical seams at `seams` (fractions
   * across the door), the frame in `color` (black rubber by default).
   * Without it the door is set in the face.
   */
  gangwayFrame?: {
    outline: Pt[];
    depth: number;
    seams?: number[];
    color?: string;
    /** The door painted another colour below a height (metres), as a yellow lower half under black. */
    lower?: { to: number; color: string };
    /** The bellows' colour, where it isn't the default grey rubber: black, say. */
    bellows?: string;
    /** Leaning back with a raked face: metres back per metre up, from its foot. Upright by default. */
    rake?: number;
  };
  screens: Pt[][];
  lights?: Pt[][];
  /** Seams: a gangway door's outline, panel joints. */
  lines?: Pt[][];
  /**
   * Joints that run across the panel to its edge (a long nose's, laid on):
   * each end is carried on, or cut back, to exactly where the painted
   * panel ends (its outline, or a lamp recess cut through it) or to the
   * joint it points at.
   */
  edgeLines?: Pt[][];
  /**
   * On a long nose, the panel's sides run along the lamp recesses' inner
   * edges, from the panel's top down to this height (metres), meeting the
   * lamps' covers with no gap, then ease back to the panel's own outline.
   */
  panelToLamps?: number;
  // What only the rendered art shows:
  /** Perforated metal grilles: vents, horns. */
  grilles?: Pt[][];
  /** Lines of livery colour this wide (metres) along a path, as round a windscreen's top. */
  /**
   * The path the livery's line at the cantrail takes over a long nose, u
   * from 0 to 1: its colour and width are the livery's, and its ends are
   * set to meet the line along the bodysides exactly.
   */
  cantrailLine?: Pt[];
  /**
   * Other painted areas: a colour, or 'under' for the underframe's.
   * `radius`: its sharp corners' rounding (metres), where the livery's usual
   * one would blunt a small shape. `wraps`: the shape carries on round the
   * corner as the side's paint (a bumper, a cheek colour); validation then
   * checks the side wears it there at the same height (pipeline/paint.ts,
   * corner paint).
   */
  shapes?: { pts: Pt[]; color: string; radius?: number; wraps?: boolean }[];
  /** Wipers as parked, pivot to tip; by default one up each screen's outer edge. */
  wipers?: { pivot: readonly [number, number]; tip: readonly [number, number] }[];
  /**
   * A unit number: its text, the middle of it as [u, y], and its height;
   * white unless `color` says otherwise, and on both sides with `both`.
   */
  number?: { text: string; at: readonly [number, number]; height: number; color?: string; both?: boolean; weight?: 'regular' | 'light' };
  /**
   * The panel stands this proud of the body (metres), a moulding of its
   * own: the nose cone of a Hitachi, say.
   */
  rise?: number;
  /** The lamp housing's wall: polished (the default) or black, as a moulded bezel is. */
  lampRim?: 'chrome' | 'black';
  /**
   * How the lamps are set: in a deep recess with reflector bowls (the
   * default), or flush, under one clear cover following the surface, the
   * lamps just behind it: a headlamp reflector and a round LED cluster.
   * Glazed: the same cover as clear glass over a deep dark recess, in a
   * thin raised lip of body colour, the lamps seen behind it as they are:
   * a honeycomb LED cluster with its emitters, a chrome headlamp reflector.
   */
  lampStyle?: 'recessed' | 'flush' | 'glazed';
  /** A recessed housing's back painted this colour (the panel's yellow behind a clear cover); by default bare metal. */
  lampBack?: string;
  /** With the glazed style: the tail lamp's LEDs behind a red lens of its own (unlit it reads red), rather than a pale LED board. */
  glazedTail?: 'red';
  /** The tail lamp unlit: a red lens (the default) or a clear diffuser over LEDs. */
  tailLens?: 'red' | 'clear';
  /**
   * Which way a cluster puts its headlamp: towards the corner (the default)
   * or the centre line; in an upright housing, on top (the default) or,
   * with 'below', under the tail lamp.
   */
  headlamps?: 'outboard' | 'inboard' | 'below';
  /**
   * The lamps in each housing of `lights`, where measured: each a round
   * lamp at [u, y] head-on, of radius r (metres). Either one list per
   * housing (in the order of `lights`), or one flat list whose lamps go in
   * whichever housing holds their centre. A housing with none gets the
   * largest pair that fits. A marker is a small white lamp beside the
   * headlamp, seen unlit as an LED cluster.
   */
  lampUnits?: LampSpot[][] | LampSpot[];
};

/** A measured lamp on a face: [u, y] head-on, radius r (metres). */
export type LampSpot = { kind: 'head' | 'tail' | 'marker'; at: readonly [number, number]; r: number };

export type Door = {
  /** Centre of the opening. */
  x: number;
  w: number;
  leaves?: 1 | 2;
  /** The driver's door: narrower, never in a contrasting colour. */
  cab?: boolean;
  /** Window in the leaf, low and high, when it differs from the bodyside's. */
  window?: readonly [number, number];
  /**
   * Where a leaf's window runs across it, as distances from the door's
   * centre line (mirrored on a pair of leaves; on a single leaf, negative
   * is ahead of the centre); the whole leaf by default.
   */
  panes?: readonly [number, number];
  /** Bottom and top of the leaf in metres above the rail, when measured. */
  span?: readonly [number, number];
  /** Corner radius of the leaf's windows when `panes` gives them, if not the bodyside's (a stadium window's is half its width). */
  paneRadius?: number;
};

/**
 * Evenly spaced windows between two points; a count of 0 is one continuous
 * ribbon. Heights, low and high, where these differ from the car's: a
 * double-decker's upper deck.
 */
export type Windows = readonly [from: number, to: number, count: number, heights?: readonly [number, number]];

export type RoofItem =
  | { kind: 'pantograph'; x: number }
  | { kind: 'pod' | 'exhaust' | 'dome'; x: number; w: number };

export type Car = {
  length: number;
  doors: Door[];
  windows: Windows[];
  /** Window heights, when this car's differ from the class's: a loco's coach. */
  window?: readonly [number, number];
  /** Bogie centres. */
  bogies: number[];
  roof?: RoofItem[];
  /** Equipment wells, [from, to]: the roof drops to `heights.well` there, easing down over half a metre either side. */
  wells?: (readonly [number, number])[];
  /** Underframe equipment boxes, from and to. */
  under?: (readonly [number, number])[];
  /** A loco or power car with no passenger windows: louvres instead. */
  louvres?: (readonly [number, number])[];
};

export type Heights = {
  /** Bottom edge of the bodyside skirt. */
  bottom: number;
  /** Where the bodyside turns into the roof. */
  cantrail: number;
  roof: number;
  /** The roof over the cars' equipment wells (`Car.wells`), lower than `roof`. */
  well?: number;
  /** Bodyside windows, bottom and top. */
  window: readonly [number, number];
};

export type ClassArt = {
  /** Livery family: the operator's livery for this kind of train. */
  family: Family;
  /** ATOC codes of the operators running the class now (see FLEET.md). */
  operators?: string[];
  /**
   * Operators that ran the class and no longer do, with the last day (or
   * month) in passenger service: still rendered, for journeys logged then,
   * but not current. See FLEET.md for the sources.
   */
  historical?: Record<string, string>;
  /** Drawn with stand-in art until it's measured and built (CONTRIBUTING.md). */
  needsArt?: true;
  /**
   * What differs where an operator runs another sub-class of it (a 150/1
   * with no gangway among 150/2s, say): merged over the class's own data
   * for that operator's render only.
   */
  byOperator?: Record<string, Partial<Omit<ClassArt, 'byOperator' | 'operators' | 'historical'>>>;
  nose: Nose;
  heights: Heights;
  wheel: number;
  wheelbase: number;
  /** The leading car, nose included. */
  cab: Car;
  /** The car behind it, of which only the front shows. */
  next: Car;
  /** Two cars sharing a bogie at the joint, as on a FLIRT. */
  articulated?: boolean;
  /** Corner radius of the bodyside windows (0.12 m unless measured). */
  windowRadius?: number;
  /** Corner radius at the rear of the cab car and both ends of the next. */
  endRadius?: number;
  /** What the rendered art needs that a side view can't say. */
  form?: Form;
  /** Bogie and coupler types (model/gear.ts); the shared table `GEAR` fills this by class. */
  gear?: { bogie?: BogieType; coupler?: CouplerType };
  /** A snowplough under the front, measured per class (off unless given). */
  plough?: Plough;
};

/**
 * A snowplough: a V of steel plate under the leading end, its point ahead
 * of the face, seen head-on `halfWidth` either side of the centre line from
 * `bottom` to `top` metres above the rail. `ahead` is how far its point leads
 * the face, `sides` how far its outer ends do; `rake` how far the foot leads
 * the top. Colour: a livery field (`panel`, `under`, ...) or a hex.
 */
export type Plough = { top: number; bottom: number; halfWidth: number; ahead: number; sides: number; rake?: number; color?: string };

/**
 * The train in three dimensions, for the rendered art. The side view gives
 * the nose's centre line; this gives its plan and the body's section.
 */
export type Form = {
  /** Over the bodysides at the waist. */
  width: number;
  /** How far each bodyside leans in between the waist and the cantrail. */
  tumblehome: number;
  /** The roof across, cantrail to crown: 2 (the default) an ellipse; higher, flatter on top with tighter shoulders. */
  roofSquareness?: number;
  /**
   * The nose in plan: how far behind its centre line the sides of the front
   * stand, at heights, as [y, metres]. A flat front stands a corner's
   * radius back; a long nose tapers by metres.
   */
  setback: (readonly [number, number])[];
  /** The plan between centre line and sides: 2 is round, more is a flatter front with tighter corners. */
  squareness: number;
  /**
   * How the glass is set: in rubber gaskets, recessed, as on older stock,
   * or bonded flush with a black border, as on most built since the 1990s.
   */
  glazing?: 'gasket' | 'bonded';
  /**
   * A long nose's features seen head-on, u across the body at each height.
   * The rendered art lays them over the nose's surface; a flat front gives
   * its features in the nose's face instead.
   */
  front?: Face;
  /** A long nose's flanks as the side sees them, carrying on from `front` behind the nose. */
  side?: {
    panel?: Pt[];
    dark?: Pt[][];
    /** Lamp clusters running along the flank, headlamp forward. */
    lights?: Pt[][];
    /**
     * The lamps in each flank cluster, where measured: each a round lamp
     * at [x, y] in the same side view, of radius r (metres). Otherwise
     * the largest pair that fits is chosen.
     */
    lampUnits?: { kind: 'head' | 'tail'; at: readonly [number, number]; r: number }[];
    /** Panel joints: an access hatch's outline. */
    lines?: Pt[][];
    /** Glazing bars across the nose's own windows. */
    bars?: Pt[][];
  };
  /** An aerial on the nose's top, this far back from the tip. */
  antenna?: number;
};

export type Family =
  | 'hst'
  | 'loco'
  | 'iet'
  | 'pendolino'
  | 'voyager'
  | 'sprinter'
  | 'turbostar'
  | 'networker'
  | 'electrostar'
  | 'desiro'
  | 'desiro-city'
  | 'aventra'
  | 'civity'
  | 'flirt'
  | 'javelin'
  | 'at200'
  | 'arterio'
  | 'kiss'
  | 'other';

/**
 * A stripe along the bodyside. lo and hi are fractions of the side, from
 * the bottom of the skirt (0) to the cantrail (1). from and to limit it
 * along the leading car, in metres from the nose tip.
 */
export type Band = {
  lo: number;
  hi: number;
  color: string;
  from?: number;
  to?: number;
  /** Lean the band's front end back by this much at its top edge. */
  slant?: number;
  /** Only on the leading car, or only on the one behind. */
  car?: 'cab' | 'next';
};

/** A free shape on the leading car: x in metres from the nose tip, y a fraction of the side. */
export type Swoosh = {
  points: Pt[];
  color: string;
  /** On the car behind, x from its front end. */
  car?: 'cab' | 'next';
  /** Fill the shape with dots of this radius instead of solid colour. */
  dots?: number;
  /**
   * A graded dot field instead (ScotRail's saltire): dots on a staggered
   * grid `pitch` metres apart along the car and `rowPitch` up, their radius
   * going from `from` at the shape's front (smallest x) to `to` at its rear;
   * alternate rows offset by half a pitch unless `stagger` is false.
   */
  dotFade?: { pitch: number; rowPitch: number; from: number; to: number; stagger?: boolean };
  /**
   * Painted under the window band, as a cab end's colour is; or over the door
   * leaves too ('doors'), where the livery runs across their tops; by default
   * over the band and under the doors.
   */
  layer?: 'under' | 'doors';
  /** Corner radius for its sharp points (metres), when a livery's usual rounding would blunt small shapes. */
  radius?: number;
};

/**
 * A stripe on every passenger door leaf: `from` and `to` across it as
 * distances from the door's centre line (mirrored on a pair of leaves),
 * `lo` and `hi` in metres above the rail.
 */
export type DoorStripe = { from: number; to: number; lo: number; hi: number; color: string };

export type Livery = {
  body: string;
  roof: string;
  bands?: Band[];
  swooshes?: Swoosh[];
  /** A dark band around the bodyside windows, whatever their height on the class. */
  windowBand?: string;
  /** Where the window band starts on the leading car, when not just ahead of the first window. */
  windowBandFrom?: number;
  /** Door leaves, when they differ from the bodyside. */
  doors?: string;
  /** Stripes on the door leaves, over the leaves' colour. */
  doorStripes?: DoorStripe[];
  /** The warning panel; most fronts are yellow. 'none' leaves the front in its livery. */
  panel?: string;
  /** The front gangway door, when it isn't the warning panel's colour. */
  gangway?: string;
  /** The front face, when it isn't the bodyside colour. */
  face?: string;
  /** The windscreen surround. */
  surround?: string;
  /** Underframe and bogies. */
  under?: string;
  /** Roof equipment (pods, domes), when it isn't the roof's colour. */
  roofKit?: string;
  glass?: string;
  /**
   * Marks on the bodyside: a logo or wordmark as SVG content in its own
   * viewBox, fitted into a box in metres (x along the car, y up from the
   * rail), on the leading car unless `car` says otherwise.
   */
  marks?: { svg: string; viewBox: readonly [number, number]; x: readonly [number, number]; y: readonly [number, number]; car?: 'cab' | 'next' }[];
  /** What the car behind wears where it differs: a locomotive's coaches. */
  coach?: Partial<Livery>;
  /** Logos and wordmarks on the train, as the real one carries them (pipeline/branding.ts). */
  branding?: Branding[];
};

/**
 * A logo or wordmark laid on the train: vector artwork from `logos/`,
 * placed and sized by measured numbers (a class's spec.json), modelled in
 * Blender from the SVG's own curves so it stays sharp at any size.
 */
export type Branding = {
  /** The artwork: a file in logos/, without `.svg` (`GW`, `GW-wordmark`). */
  logo: string;
  /**
   * On a car's bodyside (the default), on the front, or on the nose's flank:
   * placed as on a side ([x, y] on the leading car) but laid onto the curved
   * nose ahead of the flat bodyside, each point dropped onto it from the side.
   */
  on?: 'side' | 'front' | 'flank';
  /** On the side, which car: the leading one (the default) or the next. */
  car?: 'cab' | 'next';
  /**
   * The artwork's centre: on a side, [x back from that car's front, y up]
   * in metres; on the front, [u across the face 0..1, y up].
   */
  at: readonly [number, number];
  /** Its height in metres, upright as the artwork is drawn (before `rotate`). */
  height: number;
  /**
   * Its width in metres where the train's vinyl is measured wider or narrower
   * than the artwork's own proportions; by default the artwork's at `height`.
   */
  width?: number;
  /** Turned this many degrees anticlockwise as seen: 90 for lettering reading upwards. */
  rotate?: number;
  /** Every filled shape in this one colour; otherwise the artwork's own colours. */
  color?: string;
  /** On a side: both sides (the default), or only the near (the one the hero view sees) or the far. */
  sides?: 'both' | 'near' | 'far';
  /**
   * On the far side the artwork reads the right way round (the default),
   * as lettering does; 'mirrored' where the real train carries a mirror
   * image there (an emblem facing the direction of travel on each side).
   */
  far?: 'reads' | 'mirrored';
};
