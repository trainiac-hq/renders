import { fleet, generic } from './classes/fleet';
import { liveries, neutral } from './liveries';
import { GEAR } from './model/gear';
import type { ClassArt, Livery } from './model/types';

/**
 * What gets drawn for a class and operator: the class's own shape when we
 * have it, else a generic modern unit; the operator's livery for that kind
 * of train, else its usual one, else neutral grey.
 */
export function artFor(classCode: string | null, operator: string | null): { art: ClassArt; livery: Livery } {
  const base = (classCode && fleet[classCode]) || generic;
  const forOperator = operator && base.byOperator?.[operator] ? { ...base, ...base.byOperator[operator] } : base;
  const gear = classCode ? GEAR[classCode] : undefined;
  const art = gear ? { ...forOperator, gear: { ...gear, ...forOperator.gear } } : forOperator;
  const own = operator ? liveries[operator] : undefined;
  const livery = own ? (classCode && own[classCode]) || own[art.family] || own.default : neutral;
  return { art, livery };
}

export type Combination = { classCode: string | null; operator: string | null; key: string; until?: string };

/** Whether an operator runs a class now, rather than only did until a date. */
export const runsNow = (classCode: string, operator: string) => !!fleet[classCode]?.operators?.includes(operator);

/** The name a render is published under. */
export const keyOf = (classCode: string | null, operator: string | null) => `${classCode ?? 'generic'}-${operator ?? 'none'}`;

/**
 * Everything that's rendered: every class with each operator that runs
 * it or ran it (those carry `until`, the last date in service), the generic unit in every operator's livery, and the generic unit
 * in neutral grey for when nothing is known.
 */
export function combinations(): Combination[] {
  const out: Combination[] = [];
  for (const [code, art] of Object.entries(fleet)) {
    for (const op of art.operators ?? []) out.push({ classCode: code, operator: op, key: keyOf(code, op) });
    // Pairs that ran until a date are still rendered, for journeys logged then.
    for (const [op, until] of Object.entries(art.historical ?? {})) out.push({ classCode: code, operator: op, key: keyOf(code, op), until });
  }
  for (const op of Object.keys(liveries)) out.push({ classCode: null, operator: op, key: keyOf(null, op) });
  out.push({ classCode: null, operator: null, key: keyOf(null, null) });
  return out;
}
