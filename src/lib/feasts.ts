import { getEaster, resolveMovableFeast } from "./easter";
import { resolveAnchoredFeast } from "./anchoredFeasts";
import { MOVABLE_FEASTS, ANCHORED_FEASTS, type AnchoredFeastKind } from "../data/feastDays";

export type ResolvedMovableFeast = { day: number; name: string; easterOffset: number };
export type ResolvedAnchoredFeast = { day: number; name: string; kind: AnchoredFeastKind };

// Days between Easter Sunday of `year` and the given calendar date (negative = before Easter)
export function easterOffsetForDate(year: number, month: number, day: number): number {
  return Math.round((Date.UTC(year, month - 1, day) - getEaster(year).getTime()) / 86_400_000);
}

// Movable feasts that fall in the given month (1-12) of `year`, with their day of month
export function getMovableFeastsInMonth(year: number, month: number): ResolvedMovableFeast[] {
  const result: ResolvedMovableFeast[] = [];
  for (const feast of MOVABLE_FEASTS) {
    const date = resolveMovableFeast(feast.easterOffset, year);
    if (date.getUTCMonth() + 1 === month) {
      result.push({ day: date.getUTCDate(), name: feast.name, easterOffset: feast.easterOffset });
    }
  }
  return result;
}

// Anchored feasts (Holy Family / Baptism of the Lord / Christ the King) that fall in the given
// month (1-12) of `year`, with their day of month
export function getAnchoredFeastsInMonth(year: number, month: number): ResolvedAnchoredFeast[] {
  const result: ResolvedAnchoredFeast[] = [];
  for (const feast of ANCHORED_FEASTS) {
    const date = resolveAnchoredFeast(feast.kind, year);
    if (date.getUTCMonth() + 1 === month) {
      result.push({ day: date.getUTCDate(), name: feast.name, kind: feast.kind });
    }
  }
  return result;
}
