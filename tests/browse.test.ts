import { describe, it, expect } from "vitest";
import { setupDb } from "./helpers/testDb";
import { getTopicCounts, getThemeCounts, isIndexable, MIN_BROWSE_RECORDS } from "../src/lib/browse";
import { MIRACLE_TOPICS, SAINT_THEMES } from "../src/db/topics";
import { humanizeSlug } from "../src/lib/format";

const ctx = setupDb();
const db = () => ctx.db as never;
const count = (rows: { value: string; count: number }[], v: string) => rows.find((r) => r.value === v)?.count;

describe("browse counts", () => {
  it("returns every controlled value in list order", async () => {
    expect((await getTopicCounts(db())).map((r) => r.value)).toEqual([...MIRACLE_TOPICS]);
    expect((await getThemeCounts(db())).map((r) => r.value)).toEqual([...SAINT_THEMES]);
  });

  it("counts published miracles per topic and excludes unpublished ones", async () => {
    const topics = await getTopicCounts(db());
    // fixtures: children on 2 published miracles + 1 unpublished; veterans on 1; mothers on 1
    expect(count(topics, "children")).toBe(2);
    expect(count(topics, "veterans")).toBe(1);
    expect(count(topics, "mothers")).toBe(1);
    expect(count(topics, "addiction")).toBe(0);
  });

  it("counts published saints per theme and excludes unpublished ones", async () => {
    const themes = await getThemeCounts(db());
    // fixtures: hope on 1 published + 1 unpublished saint; perseverance on 1; marian on 1
    expect(count(themes, "hope")).toBe(1);
    expect(count(themes, "perseverance")).toBe(1);
    expect(count(themes, "marian")).toBe(1);
  });
});

describe("indexing threshold", () => {
  it("is indexable only at or above the minimum", () => {
    expect(isIndexable(MIN_BROWSE_RECORDS - 1)).toBe(false);
    expect(isIndexable(MIN_BROWSE_RECORDS)).toBe(true);
  });
});

describe("humanizeSlug", () => {
  it("turns hyphenated slugs into a sentence-case label", () => {
    expect(humanizeSlug("pregnancy-and-childbirth")).toBe("Pregnancy and childbirth");
    expect(humanizeSlug("marian")).toBe("Marian");
  });
});
