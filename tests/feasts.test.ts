import { describe, expect, it } from "vitest";
import { easterOffsetForDate, getMovableFeastsInMonth } from "../src/lib/feasts";
import { formatFeastDay, MONTH_NAMES } from "../src/lib/format";
import { FIXED_FEASTS, MOVABLE_FEASTS, getFixedFeasts, getMovableFeast } from "../src/data/feastDays";

describe("easterOffsetForDate", () => {
  it("is 0 on Easter Sunday", () => expect(easterOffsetForDate(2026, 4, 5)).toBe(0));
  it("is 7 on Divine Mercy Sunday", () => expect(easterOffsetForDate(2026, 4, 12)).toBe(7));
  it("is negative before Easter", () => expect(easterOffsetForDate(2026, 4, 3)).toBe(-2));
  it("handles Easter in March", () => expect(easterOffsetForDate(2024, 4, 7)).toBe(7));
  it("is exact on the last day of a year", () => {
    // 2025: Easter Apr 20 -> Dec 31 is 255 days later
    expect(easterOffsetForDate(2025, 12, 31)).toBe(255);
  });
});

describe("getMovableFeastsInMonth", () => {
  it("places Divine Mercy and Pentecost correctly for 2026", () => {
    const april = getMovableFeastsInMonth(2026, 4);
    expect(april.find((f) => f.easterOffset === 7)?.day).toBe(12);
    const may = getMovableFeastsInMonth(2026, 5);
    expect(may.find((f) => f.easterOffset === 49)?.day).toBe(24);
  });
  it("returns only feasts in the requested month", () => {
    expect(getMovableFeastsInMonth(2026, 1)).toEqual([]);
  });
  it("places every movable feast in exactly one month", () => {
    let total = 0;
    for (let m = 1; m <= 12; m++) total += getMovableFeastsInMonth(2025, m).length;
    expect(total).toBe(MOVABLE_FEASTS.length);
  });
});

describe("formatFeastDay", () => {
  it("formats month and day", () => expect(formatFeastDay(12, 8)).toBe("December 8"));
  it("returns null for movable or missing dates", () => {
    expect(formatFeastDay(null, null)).toBeNull();
    expect(formatFeastDay(5, null)).toBeNull();
  });
  it("has 12 month names", () => expect(MONTH_NAMES).toHaveLength(12));
});

describe("feastDays data invariants", () => {
  it("every fixed feast has a valid month/day for that month", () => {
    for (const f of FIXED_FEASTS) {
      expect(f.month, f.name).toBeGreaterThanOrEqual(1);
      expect(f.month, f.name).toBeLessThanOrEqual(12);
      const daysInMonth = new Date(Date.UTC(2024, f.month, 0)).getUTCDate(); // leap year
      expect(f.day, f.name).toBeGreaterThanOrEqual(1);
      expect(f.day, f.name).toBeLessThanOrEqual(daysInMonth);
    }
  });
  it("fixed feasts have non-empty names", () => {
    for (const f of FIXED_FEASTS) expect(f.name.trim(), `${f.month}/${f.day}`).not.toBe("");
  });
  it("has no exact duplicate fixed entries", () => {
    const keys = FIXED_FEASTS.map((f) => `${f.month}/${f.day}/${f.name}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("movable offsets are unique", () => {
    const offsets = MOVABLE_FEASTS.map((f) => f.easterOffset);
    expect(new Set(offsets).size).toBe(offsets.length);
  });
  it("lookup helpers agree with the arrays", () => {
    expect(getFixedFeasts(12, 25).length).toBeGreaterThan(0);
    expect(getFixedFeasts(2, 30)).toEqual([]);
    expect(getMovableFeast(7)?.name).toBe("Divine Mercy Sunday");
    expect(getMovableFeast(999)).toBeUndefined();
  });
});
