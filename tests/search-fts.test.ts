import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { miracles, saints } from "../src/db/schema";
import { createRequester, json } from "./helpers/apiApp";
import { setupDb } from "./helpers/testDb";

const ctx = setupDb();
const req = createRequester();

type R = { type: string; slug: string };
const search = async (qs: string) => json(await req(`/api/v1/search?${qs}`));
const keys = (data: R[]) => data.map((r) => `${r.type}:${r.slug}`);

const miracleBase = {
  miracle_category: "intercessory",
  type: "healing",
  date_precision: "year",
  timing_relative_to_saint_death: "posthumous",
  recipient_privacy: "public",
  cure_characteristics: "instant_complete",
  was_medically_verified: true,
  intercessory_medium: "prayer_only",
  approval_authority: "none",
  used_for_beatification: false,
  used_for_canonization: false,
  published: true,
} as const;

// Extra records for the full-text behaviours. Terms are unique to this file.
describe("full-text search", () => {
  let ready: Promise<void> | undefined;
  const seedExtra = () =>
    (ready ??= (async () => {
      await ctx.db.insert(saints).values([
        { slug: "andre-test", name: "André Testfort", canonization_stage: "saint", biography_short: "A porter who prayed.", published: true },
        { slug: "quillon-test", name: "Quillon Testwright", canonization_stage: "saint", biography_short: "A hermit.", published: true },
        { slug: "bernadette-test", name: "Bernadette Testmont", canonization_stage: "saint", biography_short: "A shepherd girl.", published: true },
      ]);
      await ctx.db.insert(miracles).values([
        { ...miracleBase, slug: "m-stem", title: "Quietly Restored", synopsis: "The patient healed within days.", topics: [] },
        { ...miracleBase, slug: "m-words", title: "Unrelated Title", cure_details: "A small child recovered from advanced cancer.", topics: [] },
        { ...miracleBase, slug: "m-title-hit", title: "Zephyr Vigil", synopsis: "A night of prayer.", topics: [] },
        { ...miracleBase, slug: "m-body-hit", title: "Another Account", synopsis: "Many gathered for the zephyr in the hills.", topics: [] },
        { ...miracleBase, slug: "m-long-mention", title: "Pilgrimage Account", synopsis: Array(12).fill("Quillon blessed the pilgrims. Quillon prayed.").join(" "), topics: [] },
        { ...miracleBase, slug: "m-accent", title: "Cure of Zélie Testcase", topics: [] },
      ]);
    })());

  const s = async (qs: string) => {
    await seedExtra();
    return search(qs);
  };

  it("finds stemmed forms (healing finds healed)", async () => {
    expect(keys((await s("q=healing")).data)).toContain("miracle:m-stem");
  });

  it("matches multi-word queries in any order", async () => {
    expect(keys((await s("q=cancer+child")).data)).toEqual(["miracle:m-words"]);
    expect(keys((await s("q=child+cancer")).data)).toEqual(["miracle:m-words"]);
  });

  it("requires every word", async () => {
    expect((await s("q=cancer+zephyr")).data).toEqual([]);
  });

  it("is accent-insensitive in both directions", async () => {
    expect(keys((await s("q=Andre")).data)).toEqual(["saint:andre-test"]);
    expect(keys((await s("q=André")).data)).toEqual(["saint:andre-test"]);
    expect(keys((await s("q=Zelie")).data)).toEqual(["miracle:m-accent"]);
  });

  it("matches a partial saint name", async () => {
    expect(keys((await s("q=Bern")).data)).toEqual(["saint:bernadette-test"]);
  });

  it("ranks a title match above a body-only mention", async () => {
    expect(keys((await s("q=zephyr")).data)).toEqual(["miracle:m-title-hit", "miracle:m-body-hit"]);
  });

  it("puts a name or title containing the query first, however often another record mentions it", async () => {
    expect(keys((await s("q=quillon")).data)).toEqual(["saint:quillon-test", "miracle:m-long-mention"]);
  });

  it("supports quoted phrases and exclusions", async () => {
    expect(keys((await s("q=%22advanced+cancer%22")).data)).toEqual(["miracle:m-words"]);
    expect((await s("q=%22cancer+advanced%22")).data).toEqual([]);
    expect(keys((await s("q=zephyr+-hills")).data)).toEqual(["miracle:m-title-hit"]);
  });

  it("requires both q and topic when both are given", async () => {
    expect(keys((await s("q=alpha&topic=children")).data)).toEqual(["miracle:m-healing-ann"]);
    expect(keys((await s("q=alpha&topic=hope")).data)).toEqual(["saint:saint-alpha"]);
    expect((await s("q=zephyr&topic=children")).data).toEqual([]);
  });

  it("reports the true total and keeps it past the last page", async () => {
    const first = await s("q=alpha&limit=1");
    expect(first.meta).toMatchObject({ page: 1, limit: 1, total: 2 });
    expect(first.meta.capped).toBeUndefined();
    const past = await s("q=alpha&limit=1&page=9");
    expect(past.data).toEqual([]);
    expect(past.meta).toMatchObject({ page: 9, total: 2 });
  });

  it("pages deterministically through ties", async () => {
    const all = keys((await s("topic=children&limit=100")).data);
    const paged = [
      ...keys((await s("topic=children&limit=1&page=1")).data),
      ...keys((await s("topic=children&limit=1&page=2")).data),
    ];
    expect(paged).toEqual(all);
  });

  it("indexes edits made after insert (generated column)", async () => {
    await seedExtra();
    await ctx.db.update(miracles).set({ title: "Renamed Quokka Event" }).where(eq(miracles.slug, "m-stem"));
    expect(keys((await search("q=quokka")).data)).toEqual(["miracle:m-stem"]);
    expect(keys((await search("q=restored")).data)).not.toContain("miracle:m-stem");
  });

  it("never matches unpublished records", async () => {
    await seedExtra();
    await ctx.db.update(miracles).set({ published: false }).where(eq(miracles.slug, "m-accent"));
    expect((await search("q=zelie")).data).toEqual([]);
  });
});
