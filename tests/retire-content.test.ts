import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { applyRetirement, planRetirement, type Db } from "../scripts/retire-content-core";
import { createTestDb, type TestDb } from "./helpers/testDb";
import { seed, type SeedIds } from "./helpers/fixtures";

let db: TestDb;
let close: () => Promise<void>;
let ids: SeedIds;

beforeAll(async () => {
  const created = await createTestDb();
  db = created.db;
  close = created.close;
});
afterAll(async () => close?.());
beforeEach(async () => {
  await db.execute(sql`truncate saints, miracles, slug_redirects restart identity cascade`);
  ids = await seed(db);
});

const asDb = () => db as unknown as Db;

describe("planRetirement", () => {
  it("reports not found for an unknown slug", async () => {
    const plan = await planRetirement(asDb(), "miracle", "no-such-miracle");
    expect(plan.found).toBe(false);
  });

  it("reports a miracle's row and child counts", async () => {
    const plan = await planRetirement(asDb(), "miracle", "m-healing-ann");
    expect(plan.found).toBe(true);
    expect(plan.label).toBe("Fever Healing at Alpha Shrine");
    expect(plan.published).toBe(true);
    expect(plan.childCounts).toEqual({ sources: 1, images: 2, saintLinks: 1 });
    expect(plan.warnings).toEqual([]);
  });

  it("warns when retiring a saint would leave a miracle with no saint at all", async () => {
    // saint-beta is the only saint linked to m-apparition.
    const plan = await planRetirement(asDb(), "saint", "saint-beta");
    expect(plan.found).toBe(true);
    expect(plan.warnings).toEqual([expect.stringContaining('"m-apparition" would be left with no linked saint')]);
  });

  it("does not warn about a miracle that still has another linked saint", async () => {
    // saint-alpha links to m-first-name, which also has saint-beta.
    const plan = await planRetirement(asDb(), "saint", "saint-alpha");
    expect(plan.warnings.some((w) => w.includes("m-first-name"))).toBe(false);
  });

  it("warns about dangling slug_redirects", async () => {
    await db.insert(schema.slugRedirects).values({ entity_type: "miracle", old_slug: "old-m", new_slug: "m-healing-ann" });
    const plan = await planRetirement(asDb(), "miracle", "m-healing-ann");
    expect(plan.warnings).toEqual([expect.stringContaining("1 slug_redirect row(s)")]);
  });
});

describe("applyRetirement", () => {
  it("fails cleanly for an unknown slug", async () => {
    const result = await applyRetirement(asDb(), "miracle", "no-such-miracle", "unpublish");
    expect(result.ok).toBe(false);
  });

  it("unpublish mode flips published without touching child rows", async () => {
    const result = await applyRetirement(asDb(), "miracle", "m-healing-ann", "unpublish");
    expect(result).toEqual({ ok: true, mode: "unpublish" });
    const row = (await db.select().from(schema.miracles).where(eq(schema.miracles.slug, "m-healing-ann")))[0];
    expect(row.published).toBe(false);
    const sources = await db.select().from(schema.miracleSources).where(eq(schema.miracleSources.miracle_id, ids.miracles.healingAnn));
    expect(sources.length).toBe(1);
  });

  it("delete mode removes a miracle row and cascades its children", async () => {
    const result = await applyRetirement(asDb(), "miracle", "m-healing-ann", "delete");
    expect(result).toEqual({ ok: true, mode: "delete" });
    const rows = await db.select().from(schema.miracles).where(eq(schema.miracles.slug, "m-healing-ann"));
    expect(rows.length).toBe(0);
    const sources = await db.select().from(schema.miracleSources).where(eq(schema.miracleSources.miracle_id, ids.miracles.healingAnn));
    expect(sources.length).toBe(0);
    const images = await db.select().from(schema.miracleImages).where(eq(schema.miracleImages.miracle_id, ids.miracles.healingAnn));
    expect(images.length).toBe(0);
  });

  it("delete mode on a saint clears both-direction relations without a foreign key error, leaving orphaned miracles in place", async () => {
    // saint-alpha has relations in both directions with both beta and gamma.
    const result = await applyRetirement(asDb(), "saint", "saint-alpha", "delete");
    expect(result).toEqual({ ok: true, mode: "delete" });
    const saintRows = await db.select().from(schema.saints).where(eq(schema.saints.slug, "saint-alpha"));
    expect(saintRows.length).toBe(0);
    const relations = await db.select().from(schema.saintRelations);
    expect(relations.length).toBe(0);
    // m-unpublished was linked only to alpha - the miracle row itself survives, just with no saint link.
    const miracleRows = await db.select().from(schema.miracles).where(eq(schema.miracles.slug, "m-unpublished"));
    expect(miracleRows.length).toBe(1);
    const links = await db.select().from(schema.miracleSaints).where(eq(schema.miracleSaints.miracle_id, ids.miracles.unpublished));
    expect(links.length).toBe(0);
  });

  it("unpublish mode on a saint only flips published", async () => {
    const result = await applyRetirement(asDb(), "saint", "saint-alpha", "unpublish");
    expect(result).toEqual({ ok: true, mode: "unpublish" });
    const row = (await db.select().from(schema.saints).where(eq(schema.saints.slug, "saint-alpha")))[0];
    expect(row.published).toBe(false);
    const relations = await db.select().from(schema.saintRelations);
    expect(relations.length).toBe(4);
  });
});
