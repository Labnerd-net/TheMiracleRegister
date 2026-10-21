import { describe, expect, it } from "vitest";
import { holyFamily, baptismOfTheLord, christTheKing, resolveAnchoredFeast } from "../src/lib/anchoredFeasts";

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("holyFamily", () => {
  it.each([
    [2023, "2023-12-31"],
    [2024, "2024-12-29"],
    [2025, "2025-12-28"],
    [2026, "2026-12-27"],
    [2027, "2027-12-26"],
    [2022, "2022-12-30"], // Dec 25, 2022 was itself a Sunday -> moves to Dec 30
    [2033, "2033-12-30"], // Dec 25, 2033 is also a Sunday -> same exception
  ])("Holy Family %i is %s", (year, expected) => {
    expect(iso(holyFamily(year))).toBe(expected);
  });
});

describe("baptismOfTheLord", () => {
  it.each([
    [2023, "2023-01-08"],
    [2024, "2024-01-07"],
    [2025, "2025-01-12"],
    [2026, "2026-01-11"],
    [2027, "2027-01-10"],
    [2030, "2030-01-07"], // Jan 6, 2030 is itself a Sunday -> moves to Monday Jan 7
  ])("Baptism of the Lord %i is %s", (year, expected) => {
    expect(iso(baptismOfTheLord(year))).toBe(expected);
  });
});

describe("christTheKing", () => {
  it.each([
    [2022, "2022-11-20"],
    [2023, "2023-11-26"],
    [2024, "2024-11-24"],
    [2025, "2025-11-23"],
    [2026, "2026-11-22"],
    [2027, "2027-11-21"],
  ])("Christ the King %i is %s", (year, expected) => {
    expect(iso(christTheKing(year))).toBe(expected);
  });
  it("is always a Sunday", () => {
    for (const y of [2022, 2024, 2026, 2028]) expect(christTheKing(y).getUTCDay()).toBe(0);
  });
});

describe("resolveAnchoredFeast", () => {
  it("dispatches by kind", () => {
    expect(iso(resolveAnchoredFeast("holyFamily", 2025))).toBe(iso(holyFamily(2025)));
    expect(iso(resolveAnchoredFeast("baptismOfTheLord", 2025))).toBe(iso(baptismOfTheLord(2025)));
    expect(iso(resolveAnchoredFeast("christTheKing", 2025))).toBe(iso(christTheKing(2025)));
  });
});
