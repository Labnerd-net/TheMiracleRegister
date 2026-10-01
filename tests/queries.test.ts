import { describe, expect, it } from "vitest";
import { and } from "drizzle-orm";
import { miracles, saints } from "../src/db/schema";
import { fetchSaintsByMiracle, miracleFilterConditions } from "../src/lib/queries/miracles";
import { saintFilterConditions } from "../src/lib/queries/saints";
import { setupDb } from "./helpers/testDb";

const ctx = setupDb();

const miracleSlugs = async (f: Parameters<typeof miracleFilterConditions>[1]) =>
  (await ctx.db.select({ slug: miracles.slug }).from(miracles).where(and(...miracleFilterConditions(ctx.db as never, f))))
    .map((r) => r.slug)
    .sort();

const saintSlugs = async (f: Parameters<typeof saintFilterConditions>[0]) =>
  (await ctx.db.select({ slug: saints.slug }).from(saints).where(and(...saintFilterConditions(f)))).map((r) => r.slug).sort();

describe("fetchSaintsByMiracle", () => {
  it("returns an empty map for no ids", async () => {
    expect((await fetchSaintsByMiracle(ctx.db as never, [])).size).toBe(0);
  });

  it("returns every published saint of a joint miracle", async () => {
    const map = await fetchSaintsByMiracle(ctx.db as never, [ctx.ids.miracles.firstName]);
    expect(map.get(ctx.ids.miracles.firstName)!.map((s) => s.slug).sort()).toEqual(["saint-alpha", "saint-beta"]);
  });

  it("excludes unpublished saints by default and includes them for preview", async () => {
    const id = ctx.ids.miracles.confidential;
    const hidden = await fetchSaintsByMiracle(ctx.db as never, [id]);
    expect(hidden.get(id)!.map((s) => s.slug)).toEqual(["saint-beta"]);
    const preview = await fetchSaintsByMiracle(ctx.db as never, [id], { includeUnpublished: true });
    expect(preview.get(id)!.map((s) => s.slug).sort()).toEqual(["saint-beta", "saint-gamma"]);
  });

  it("has no entry for a miracle whose only saint is unpublished", async () => {
    const map = await fetchSaintsByMiracle(ctx.db as never, [ctx.ids.miracles.hiddenSaintOnly]);
    expect(map.has(ctx.ids.miracles.hiddenSaintOnly)).toBe(false);
  });
});

describe("miracleFilterConditions", () => {
  it("never returns unpublished miracles", async () => {
    expect(await miracleSlugs({})).not.toContain("m-unpublished");
    expect(await miracleSlugs({})).toHaveLength(5);
  });

  it("filters by saint, type and country (substring, case-insensitive)", async () => {
    expect(await miracleSlugs({ saint_id: ctx.ids.saints.alpha })).toEqual(["m-first-name", "m-healing-ann"]);
    expect(await miracleSlugs({ type: "apparition" })).toEqual(["m-apparition"]);
    expect(await miracleSlugs({ country: "ITAL" })).toEqual(["m-first-name"]);
  });

  it("treats % in country as a literal", async () => {
    expect(await miracleSlugs({ country: "%" })).toEqual([]);
  });

  it("filters by year range", async () => {
    expect(await miracleSlugs({ year_from: 1900, year_to: 1950 })).toEqual(["m-healing-ann", "m-hidden-saint-only"]);
  });
});

describe("saintFilterConditions", () => {
  it("never returns unpublished saints", async () => {
    expect(await saintSlugs({})).toEqual(["saint-alpha", "saint-beta"]);
  });

  it("filters by stage", async () => {
    expect(await saintSlugs({ canonization_stage: "blessed" })).toEqual(["saint-beta"]);
  });
});
