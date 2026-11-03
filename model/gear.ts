/**
 * Running gear and couplers by type, and which classes carry which: one
 * table every family adds its classes to as it measures them. A class not
 * in the table keeps the generic bogie and coupler it has always had.
 *
 * The types are the kinds of hardware that look different from a platform,
 * not every manufacturer's variant: what a reader of a render can tell
 * apart. Their dimensions are nominal, read off photographs against the
 * wheels and the track gauge; the first family to measure one against a
 * drawing refines it here (or adds a type) and says so in its spec.json.
 * pipeline/blender/gear.py builds the bogies, blender/body.py the couplers.
 */

export type BogieType = keyof typeof BOGIES;
export type CouplerType = keyof typeof COUPLERS;

export const BOGIES = {
  /**
   * Outside frame over coil-sprung axleboxes, an air spring each side: the
   * shape most UK multiple units share (and the only one until this table).
   */
  generic: { axlebox: 1.13 },
  /**
   * Inside frame: the side frames run between the wheels, so from the side
   * the wheels' outer faces and the axle-end covers are what shows, with
   * the frame and air springs behind them. Bombardier FLEXX Eco (Aventra),
   * Siemens SF7000 (Desiro City). The axle-end cover stands 0.86 m out,
   * on the wheel's hub.
   */
  'inside-frame': { axlebox: 0.86 },
} as const;

export const COUPLERS = {
  /** A plain block head with air pipes: what every class had until this table. */
  generic: {},
  /**
   * Automatic coupler with a square face: a cone beside a funnel for
   * alignment, the air ports between, and an electrical head on a slide
   * below the mechanical one. Dellner (Electrostar, Pendolino, Voyager)
   * and Scharfenberg (Siemens, many Hitachi) differ at this scale only in
   * the face's size: Dellner 0.30 m, Scharfenberg 0.34 m.
   */
  dellner: { face: 0.3, electrical: true },
  scharfenberg: { face: 0.34, electrical: true },
  /**
   * BSI (BR Sprinter/Turbostar family): a round head about 0.32 m across
   * with a flat face, the hook and buffer ring proud of it, no separate
   * electrical head (contacts sit in the face).
   */
  bsi: { face: 0.32, electrical: false },
  /**
   * Tightlock (AAR type H): a knuckle coupler, the knuckle standing upright
   * on one side of the head and a guard arm on the other, as on loco-hauled
   * stock and some DMUs.
   */
  tightlock: { face: 0.28, electrical: false },
} as const;

/**
 * Which classes run on which type. Add a class here when its gear is
 * measured (with the photos in its spec.json trace); the renders of every
 * class not listed are unchanged.
 */
export const GEAR: Record<string, { bogie?: BogieType; coupler?: CouplerType }> = {};
