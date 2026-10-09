import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sql as dsql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { runChecks, type Sql } from "../scripts/check-data-core";
import { createTestDb, type TestDb } from "./helpers/testDb";

let db: TestDb;
let close: () => Promise<void>;
let saintId: number;
let miracleId: number;

// No feast entries are marked [in DB], so the in-db-feast rule only sees what each test sets up.
const FEAST_SRC = "";

// Adapts PGlite to the tagged-template runner the checks expect (the queries have no parameters).
const runner: Sql = async (strings) =>
  ((await (db as any).$client.query(strings.join(""))).rows as Record<string, any>[]);
const check = () => runChecks(runner, { feastSrc: FEAST_SRC });

beforeAll(async () => {
  const created = await createTestDb();
  db = created.db;
  close = created.close;
});
afterAll(async () => close?.());

// A minimal dataset that passes every rule; each test breaks exactly one thing.
beforeEach(async () => {
  await db.execute(dsql`truncate saints, miracles, slug_redirects restart identity cascade`);
  const [s] = await db
    .insert(schema.saints)
    .values({ slug: "saint-ok", name: "Saint Ok", canonization_stage: "saint", biography_short: "A plain life.", published: true })
    .returning({ id: schema.saints.id });
  saintId = s.id;
  await db.insert(schema.saintSources).values({ saint_id: saintId, url: "https://example.org/s", title: "S", source_type: "book" });
  const [m] = await db
    .insert(schema.miracles)
    .values({
      slug: "miracle-ok", title: "Miracle Ok", miracle_category: "intercessory", type: "healing", date_precision: "year",
      timing_relative_to_saint_death: "posthumous", recipient_privacy: "public", cure_characteristics: "instant_complete",
      was_medically_verified: true, intercessory_medium: "prayer_only", approval_authority: "none",
      used_for_beatification: false, used_for_canonization: false, synopsis: "A recovery.", published: true,
    })
    .returning({ id: schema.miracles.id });
  miracleId = m.id;
  await db.insert(schema.miracleSources).values({ miracle_id: miracleId, url: "https://example.org/m", title: "M", source_type: "book" });
  await db.insert(schema.miracleSaints).values({ miracle_id: miracleId, saint_id: saintId });
});

const errorsFor = async (rule: string) => (await check()).errors.filter((e) => e.startsWith(`[${rule}]`));
const warningsFor = async (rule: string) => (await check()).warnings.filter((e) => e.startsWith(`[${rule}]`));

describe("check-data baseline", () => {
  it("passes a clean dataset", async () => {
    const r = await check();
    expect(r.errors).toEqual([]);
    expect(r.warnings).toEqual([]);
    expect([r.saintCount, r.miracleCount]).toEqual([1, 1]);
  });
});

describe("check-data rules", () => {
  it("slug-format: flags non-kebab slugs", async () => {
    await db.execute(dsql`update saints set slug = 'Bad_Slug'`);
    expect(await errorsFor("slug-format")).toHaveLength(1);
  });

  it("topics / themes: flags values outside the canonical lists", async () => {
    await db.execute(dsql`update miracles set topics = array['not-a-topic']`);
    await db.execute(dsql`update saints set themes = array['not-a-theme']`);
    expect(await errorsFor("topics")).toHaveLength(1);
    expect(await errorsFor("themes")).toHaveLength(1);
  });

  it("patronage: requires a leading capital", async () => {
    await db.execute(dsql`update saints set patronage = array['nurses']`);
    expect((await errorsFor("patronage")).join()).toContain("capital");
  });

  it("sources: published records need at least one source", async () => {
    await db.execute(dsql`delete from miracle_sources`);
    await db.execute(dsql`delete from saint_sources`);
    expect(await errorsFor("sources")).toHaveLength(2);
  });

  it("sources: unpublished records may have none", async () => {
    await db.execute(dsql`update miracles set published = false`);
    await db.execute(dsql`update saints set published = false`);
    await db.execute(dsql`delete from miracle_sources`);
    await db.execute(dsql`delete from saint_sources`);
    expect(await errorsFor("sources")).toEqual([]);
  });

  it("wikipedia-source: flags a Wikipedia saint_sources row", async () => {
    await db.insert(schema.saintSources).values({ saint_id: saintId, url: "https://en.wikipedia.org/wiki/X", title: "W", source_type: "other" });
    expect(await errorsFor("wikipedia-source")).toHaveLength(1);
  });

  it("url-scheme: flags non-http(s) URLs", async () => {
    await db.execute(dsql`update miracle_sources set url = 'javascript:alert(1)'`);
    await db.execute(dsql`update saints set image_url = 'ftp://x.test/a.jpg'`);
    expect(await errorsFor("url-scheme")).toHaveLength(2);
  });

  it("miracle-saints: published intercessory miracle needs a published saint", async () => {
    await db.execute(dsql`update saints set published = false`);
    expect(await errorsFor("miracle-saints")).toHaveLength(1);
  });

  it("miracle-saints: Lourdes Bureau and non-intercessory miracles are exempt", async () => {
    await db.execute(dsql`delete from miracle_saints`);
    await db.execute(dsql`update miracles set approval_authority = 'lourdes_bureau'`);
    expect(await errorsFor("miracle-saints")).toEqual([]);
    await db.execute(dsql`update miracles set approval_authority = 'none', miracle_category = 'apparition'`);
    expect(await errorsFor("miracle-saints")).toEqual([]);
  });

  it("relations: flags a missing mirror row and a self relation", async () => {
    const [b] = await db.insert(schema.saints).values({ slug: "saint-b", name: "B", canonization_stage: "saint" }).returning({ id: schema.saints.id });
    await db.insert(schema.saintRelations).values({ saint_id: saintId, related_saint_id: b.id, relation_type: "family" });
    expect(await errorsFor("relations")).toHaveLength(1);
    await db.insert(schema.saintRelations).values({ saint_id: b.id, related_saint_id: saintId, relation_type: "family" });
    expect(await errorsFor("relations")).toEqual([]);
    await db.insert(schema.saintRelations).values({ saint_id: saintId, related_saint_id: saintId, relation_type: "family" });
    expect((await errorsFor("relations")).join()).toContain("related to itself");
  });

  it("feast: flags out-of-range months and impossible dates", async () => {
    await db.execute(dsql`update saints set feast_month = 13, feast_day_of_month = 1`);
    await db.execute(dsql`update miracles set feast_month = 2, feast_day_of_month = 30`);
    expect(await errorsFor("feast")).toHaveLength(2);
  });

  it("feast: allows Feb 29 and warns on a lone month", async () => {
    await db.execute(dsql`update saints set feast_month = 2, feast_day_of_month = 29`);
    expect(await errorsFor("feast")).toEqual([]);
    await db.execute(dsql`update saints set feast_month = 5, feast_day_of_month = null`);
    expect(await warningsFor("feast")).toHaveLength(1);
  });

  it("in-db-feast: [in DB] entry needs a published saint with that date", async () => {
    const feastSrc = "  // { month: 3, day: 4, name: 'Saint Ok', scope: 'universal' }, // [in DB]\n";
    const run = () => runChecks(runner, { feastSrc });
    expect((await run()).errors.filter((e) => e.startsWith("[in-db-feast]"))).toHaveLength(1);
    await db.execute(dsql`update saints set feast_month = 3, feast_day_of_month = 4`);
    expect((await run()).errors.filter((e) => e.startsWith("[in-db-feast]"))).toEqual([]);
  });

  it("in-db-feast: warns when a saint's feast date has no [in DB] entry", async () => {
    await db.execute(dsql`update saints set feast_month = 3, feast_day_of_month = 4`);
    expect(await warningsFor("in-db-feast")).toHaveLength(1);
  });

  it("privacy: first_name_only allows the first name but not the surname", async () => {
    await db.execute(dsql`update miracles set recipient_name = 'Bea Fictiva', recipient_privacy = 'first_name_only', synopsis = 'Bea recovered.'`);
    expect(await errorsFor("privacy")).toEqual([]);
    await db.execute(dsql`update miracles set synopsis = 'Bea Fictiva recovered.'`);
    expect(await errorsFor("privacy")).toHaveLength(1);
  });

  it("privacy: confidential forbids every name part", async () => {
    await db.execute(dsql`update miracles set recipient_name = 'Carl Nobody', recipient_privacy = 'confidential', synopsis = 'Carl recovered.'`);
    expect(await errorsFor("privacy")).toHaveLength(1);
  });

  it("privacy: public recipients are not checked", async () => {
    await db.execute(dsql`update miracles set recipient_name = 'Ann Testwell', synopsis = 'Ann Testwell recovered.'`);
    expect(await errorsFor("privacy")).toEqual([]);
  });

  it("saint-locations: flags exact duplicates, warns on distinct places sharing coordinates", async () => {
    const loc = { saint_id: saintId, lat: "45.500000", lng: "-73.600000", location_type: "shrine" as const };
    await db.insert(schema.saintLocations).values([
      { ...loc, location_name: "Oratory" },
      { ...loc, location_name: "Oratory" },
      { ...loc, location_name: "Tomb" },
    ]);
    expect(await errorsFor("saint-locations")).toHaveLength(1);
    expect(await warningsFor("saint-locations")).toHaveLength(1);
  });

  it("slug-redirect: old slug must not be live and new slug must resolve", async () => {
    await db.insert(schema.slugRedirects).values([
      { entity_type: "saint", old_slug: "saint-ok", new_slug: "saint-ok" },
      { entity_type: "saint", old_slug: "gone", new_slug: "missing" },
    ]);
    const errs = await errorsFor("slug-redirect");
    expect(errs.some((e) => e.includes("shadows a live record"))).toBe(true);
    expect(errs.some((e) => e.includes("no live target"))).toBe(true);
  });

  it("em-dash: flags em dashes in free text", async () => {
    await db.execute(dsql`update saints set biography_short = 'Life — long.'`);
    await db.execute(dsql`update miracles set synopsis = 'A — B', cure_details = 'C — D', medical_diagnosis = 'E — F', vatican_medical_board_verdict = 'G — H'`);
    expect(await errorsFor("em-dash")).toHaveLength(5);
  });

  it("self-reference: flags site-structure framing in narrative text", async () => {
    await db.execute(dsql`update saints set biography_short = 'Listed on this site.'`);
    await db.execute(dsql`update miracles set synopsis = 'See this database for more.'`);
    expect(await errorsFor("self-reference")).toHaveLength(2);
  });

  it("self-reference: does not trip on 'registered' or 'registration'", async () => {
    await db.execute(dsql`update miracles set synopsis = 'The case was registered after registration closed.'`);
    expect(await errorsFor("self-reference")).toEqual([]);
  });
});
