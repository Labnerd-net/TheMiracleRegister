// Generated from catholic-research/scripts/templates/anchoredFeasts.ts by scripts/sync-feasts.ts.
// Do not edit by hand - change the template there and re-run the sync.

const DAY_MS = 86_400_000;

export function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

// Most recent Sunday that is strictly before `date`.
export function lastSundayBefore(date: Date): Date {
  const weekday = date.getUTCDay(); // 0 = Sunday
  const back = weekday === 0 ? 7 : weekday;
  return addDays(date, -back);
}

// First Sunday that is strictly after `date`.
export function firstSundayAfter(date: Date): Date {
  const weekday = date.getUTCDay();
  return addDays(date, 7 - weekday);
}

/** Sunday within the Octave of Christmas; if Dec 25 itself is a Sunday, Dec 30 instead. */
export function holyFamily(year: number): Date {
  const christmas = utcDate(year, 12, 25);
  if (christmas.getUTCDay() === 0) return utcDate(year, 12, 30);
  return firstSundayAfter(christmas);
}

/** Sunday after Epiphany (Jan 6); if Jan 6 itself is a Sunday, the following Monday instead. */
export function baptismOfTheLord(year: number): Date {
  const epiphany = utcDate(year, 1, 6);
  if (epiphany.getUTCDay() === 0) return addDays(epiphany, 1);
  return firstSundayAfter(epiphany);
}

/** The Sunday immediately before the First Sunday of Advent. */
export function christTheKing(year: number): Date {
  // Advent 1 = lastSundayBefore(Dec 25) - 21 days; Christ the King is 7 days before that.
  return addDays(lastSundayBefore(utcDate(year, 12, 25)), -28);
}

export function resolveAnchoredFeast(
  kind: 'holyFamily' | 'baptismOfTheLord' | 'christTheKing',
  year: number
): Date {
  switch (kind) {
    case 'holyFamily': return holyFamily(year);
    case 'baptismOfTheLord': return baptismOfTheLord(year);
    case 'christTheKing': return christTheKing(year);
  }
}
