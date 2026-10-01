import { describe, it, expect } from "vitest";
import { setupDb } from "./helpers/testDb";
import {
  buildPatronageTerms,
  getPatronageTerms,
  hasPatronagePage,
  patronageKey,
  patronageSlug,
  resolvePatronage,
  MIN_PATRONAGE_SAINTS,
} from "../src/lib/patronage";
import { PATRONAGE_GROUPS } from "../src/db/topics";

const ctx = setupDb();
const row = (id: number, patronage: string[] | null) => ({ id, slug: `s${id}`, name: `Saint ${id}`, patronage });

describe("PATRONAGE_GROUPS config", () => {
  it("has unique slugs, valid slug format, and no alias in two groups", () => {
    const slugs = PATRONAGE_GROUPS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const keys = PATRONAGE_GROUPS.flatMap((g) => g.aliases.map(patronageKey));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("patronage normalization", () => {
  it("matches case- and whitespace-insensitively", () => {
    expect(patronageKey("  The   Sick ")).toBe("the sick");
    expect(resolvePatronage("The sick").slug).toBe("the-sick");
  });

  it("maps aliases to their group and leaves other strings as their own term", () => {
    expect(resolvePatronage("Catholic families")).toEqual({ slug: "families", label: "Families" });
    expect(resolvePatronage("florists")).toEqual({ slug: "florists", label: "florists" });
  });

  it("slugifies punctuation and accents", () => {
    expect(patronageSlug("HIV/AIDS")).toBe("hiv-aids");
    expect(patronageSlug("Diocese of Bergamo")).toBe("diocese-of-bergamo");
    expect(patronageSlug("Zélie")).toBe("zelie");
  });
});

describe("buildPatronageTerms", () => {
  it("merges aliases across saints and counts a saint once per term", () => {
    const terms = buildPatronageTerms([
      row(1, ["families", "parents"]),
      row(2, ["Catholic families"]),
      row(3, ["florists"]),
    ]);
    const families = terms.find((t) => t.slug === "families")!;
    expect(families.saints.map((s) => s.id)).toEqual([1, 2]);
    expect(terms.find((t) => t.slug === "florists")!.saints).toHaveLength(1);
  });

  it("counts related saints (a pair) toward the page threshold", () => {
    const terms = buildPatronageTerms([row(1, ["married couples"]), row(2, ["married couples"])]);
    expect(hasPatronagePage(terms[0])).toBe(true);
  });

  it("gives a single-saint term no page, even with several aliases on that saint", () => {
    const [term] = buildPatronageTerms([row(1, ["families", "parents"])]);
    expect(term.saints).toHaveLength(1);
    expect(hasPatronagePage(term)).toBe(false);
    expect(MIN_PATRONAGE_SAINTS).toBe(2);
  });

  it("ignores null and unsluggable patronage and sorts alphabetically", () => {
    const terms = buildPatronageTerms([row(1, null), row(2, ["---", "zebras", "Apes"])]);
    expect(terms.map((t) => t.label)).toEqual(["Apes", "zebras"]);
  });
});

describe("getPatronageTerms", () => {
  it("reads published saints only", async () => {
    const terms = await getPatronageTerms(ctx.db as never);
    // fixtures: nurses (alpha) and teachers (beta, merged into education); unpublished gamma has none
    expect(terms.map((t) => t.slug).sort()).toEqual(["education", "nurses"]);
  });
});
