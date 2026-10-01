import { describe, expect, it } from "vitest";
import { getEaster, resolveMovableFeast } from "../src/lib/easter";

const iso = (d: Date) => d.toISOString().slice(0, 10);

describe("getEaster", () => {
  it.each([
    [2008, "2008-03-23"],
    [2019, "2019-04-21"],
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2038, "2038-04-25"],
  ])("Easter %i is %s", (year, expected) => {
    expect(iso(getEaster(year))).toBe(expected);
  });

  it("returns UTC midnight", () => {
    expect(getEaster(2026).getUTCHours()).toBe(0);
  });
});

describe("resolveMovableFeast", () => {
  it("offset 0 is Easter itself", () => {
    expect(iso(resolveMovableFeast(0, 2026))).toBe("2026-04-05");
  });
  it("Divine Mercy (+7) is the following Sunday", () => {
    expect(iso(resolveMovableFeast(7, 2026))).toBe("2026-04-12");
  });
  it("Pentecost (+49) 2025", () => {
    expect(iso(resolveMovableFeast(49, 2025))).toBe("2025-06-08");
  });
  it("Corpus Christi (+60) 2024", () => {
    expect(iso(resolveMovableFeast(60, 2024))).toBe("2024-05-30");
  });
});
