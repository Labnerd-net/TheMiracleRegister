import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { formatReport, runImport, type Db, type ImportOptions } from "../scripts/import-content-core";
import { createTestDb, type TestDb } from "./helpers/testDb";
import { content, minimalMiracle, minimalSaint } from "./helpers/content";

let db: TestDb;
let close: () => Promise<void>;

beforeAll(async () => {
  const created = await createTestDb();
  db = created.db;
  close = created.close;
});
afterAll(async () => close?.());
beforeEach(async () => {
  await db.execute(sql`truncate saints, miracles, slug_redirects restart identity cascade`);
});

const run = (c: ReturnType<typeof content>, opts: Partial<ImportOptions> = {}) =>
  runImport(db as unknown as Db, c, { apply: true, updatePublished: false, feastSrc: "", ...opts });
const dry = (c: ReturnType<typeof content>, opts: Partial<ImportOptions> = {}) => run(c, { apply: false, ...opts });

const count = async (t: typeof schema.saints | typeof schema.miracles | typeof schema.slugRedirects) =>
  (await db.select().from(t)).length;
const saintRow = async (slug: string) => (await db.select().from(schema.saints).where(eq(schema.saints.slug, slug)))[0];
const miracleRow = async (slug: string) => (await db.select().from(schema.miracles).where(eq(schema.miracles.slug, slug)))[0];

const saintA = (extra = {}) =>
  minimalSaint("saint-a", {
    sources: [{ url: "https://example.org/a", title: "A", source_type: "book" }],
    locations: [{ location_name: "Tomb of A", lat: 45.5, lng: "-73.25", location_type: "tomb" }],
    relations: [{ saint: "saint-b", type: "same_order" }],
    ...extra,
  });
const soloB = () => minimalSaint("saint-b");
const saintB = () => minimalSaint("saint-b", { relations: [{ saint: "saint-a", type: "same_order" }] });
const miracleM = (extra = {}) =>
  minimalMiracle("miracle-m", {
    saints: ["saint-a"],
    location_lat: 45.12345,
    sources: [{ url: "https://example.org/m", source_type: "news_article" }],
    images: [{ url: "https://example.org/1.jpg" }, { url: "https://example.org/2.jpg", caption: "Two" }],
    synopsis: "A plain account.",
    ...extra,
  });
const base = () => content([saintA(), saintB()], [miracleM()]);

describe("dry run", () => {
  it("writes nothing and reports what would be created", async () => {
    const r = await dry(base());
    expect(r.applied).toBe(false);
    expect(r.entities.map((e) => `${e.status}:${e.slug}`).sort()).toEqual(["new:miracle-m", "new:saint-a", "new:saint-b"]);
    expect(await count(schema.saints)).toBe(0);
    expect(await count(schema.miracles)).toBe(0);
    expect(formatReport(r, false)).toContain("Dry run: nothing written");
  });
});

describe("apply", () => {
  it("inserts new records unpublished with children and both relation directions", async () => {
    const r = await run(base());
    expect(r.errors).toEqual([]);
    expect(r.applied).toBe(true);
    expect((await saintRow("saint-a")).published).toBe(false);
    const m = await miracleRow("miracle-m");
    expect(m.published).toBe(false);
    expect(m.location_lat).toBe("45.1234500");
    const images = await db.select().from(schema.miracleImages).where(eq(schema.miracleImages.miracle_id, m.id));
    expect(images.sort((a, b) => a.display_order - b.display_order).map((i) => i.url)).toEqual(["https://example.org/1.jpg", "https://example.org/2.jpg"]);
    expect(await db.select().from(schema.miracleSaints)).toHaveLength(1);
    expect(await db.select().from(schema.saintRelations)).toHaveLength(2);
    const loc = (await db.select().from(schema.saintLocations))[0];
    expect([loc.lat, loc.lng]).toEqual(["45.500000", "-73.250000"]);
  });

  it("a second run reports everything unchanged and leaves updated_at alone", async () => {
    await run(base());
    const before = await saintRow("saint-a");
    const r = await run(base());
    expect(r.entities.every((e) => e.status === "unchanged")).toBe(true);
    expect((await saintRow("saint-a")).updated_at).toEqual(before.updated_at);
  });

  it("updates an unpublished row, replaces children and advances updated_at", async () => {
    await run(base());
    const before = await saintRow("saint-a");
    await new Promise((r) => setTimeout(r, 20));
    const r = await run(content([saintA({ name: "Renamed", sources: [{ url: "https://example.org/new", source_type: "academic" }] }), saintB()], [miracleM()]));
    expect(r.entities.find((e) => e.slug === "saint-a")?.status).toBe("changed");
    const after = await saintRow("saint-a");
    expect(after.name).toBe("Renamed");
    expect(after.updated_at.getTime()).toBeGreaterThan(before.updated_at.getTime());
    const sources = await db.select().from(schema.saintSources);
    expect(sources.map((s) => s.url)).toEqual(["https://example.org/new"]);
  });

  it("a children-only change still bumps the parent updated_at", async () => {
    await run(base());
    const before = await miracleRow("miracle-m");
    await new Promise((r) => setTimeout(r, 20));
    await run(content([saintA(), saintB()], [miracleM({ images: [{ url: "https://example.org/only.jpg" }] })]));
    expect((await miracleRow("miracle-m")).updated_at.getTime()).toBeGreaterThan(before.updated_at.getTime());
  });

  it("reports columns the file omits that the database holds, and nulls them", async () => {
    await run(base());
    await db.update(schema.saints).set({ religious_order: "Franciscan" }).where(eq(schema.saints.slug, "saint-a"));
    const r = await dry(base());
    expect(r.entities.find((e) => e.slug === "saint-a")?.nulled).toEqual(["religious_order"]);
    await run(base());
    expect((await saintRow("saint-a")).religious_order).toBeNull();
  });

  it("lists database rows with no file as unmanaged and leaves them", async () => {
    await run(base());
    const r = await run(content([soloB()]));
    expect(r.unmanaged.saints).toEqual(["saint-a"]);
    expect(r.unmanaged.miracles).toEqual(["miracle-m"]);
    expect(await count(schema.saints)).toBe(2);
    expect(await count(schema.miracles)).toBe(1);
  });

  it("writes the mirror relation row for a saint that has no file, and removes it again", async () => {
    await run(content([soloB()]));
    const r = await run(content([minimalSaint("saint-c", { relations: [{ saint: "saint-b", type: "family" }] })]));
    expect(r.errors).toEqual([]);
    expect(await db.select().from(schema.saintRelations)).toHaveLength(2);
    await run(content([minimalSaint("saint-c")]));
    expect(await db.select().from(schema.saintRelations)).toHaveLength(0);
  });
});

describe("published rows", () => {
  const publish = async () => {
    await db.execute(sql`update saints set published = true`);
    await db.execute(sql`update miracles set published = true`);
  };

  it("refuses changes without --update-published and writes nothing", async () => {
    await run(base());
    await publish();
    const r = await run(content([saintA({ name: "Edited" }), saintB()], [miracleM()]));
    expect(r.applied).toBe(false);
    expect(r.errors.join("\n")).toContain("--update-published");
    expect((await saintRow("saint-a")).name).toBe("Name of saint-a");
  });

  it("an unchanged published file is not a problem", async () => {
    await run(base());
    await publish();
    const r = await run(base());
    expect(r.errors).toEqual([]);
    expect(r.applied).toBe(true);
  });

  it("applies with --update-published and leaves published unchanged", async () => {
    await run(base());
    await publish();
    const r = await run(content([saintA({ name: "Edited" }), saintB()], [miracleM()]), { updatePublished: true });
    expect(r.applied).toBe(true);
    const s = await saintRow("saint-a");
    expect(s.name).toBe("Edited");
    expect(s.published).toBe(true);
  });

  it("refuses a relation edit that rewrites the mirror row on a published saint with no file", async () => {
    await run(content([soloB()]));
    await publish();
    const r = await run(content([minimalSaint("saint-c", { relations: [{ saint: "saint-b", type: "family" }] })]));
    expect(r.applied).toBe(false);
    expect(await db.select().from(schema.saintRelations)).toHaveLength(0);
  });
});

describe("check:data gate", () => {
  it("rolls the whole run back when a new check error appears", async () => {
    // Em dashes are rejected by runChecks, not by the file schema.
    const r = await run(content([saintA(), saintB()], [miracleM({ synopsis: "Bad — dash" })]));
    expect(r.applied).toBe(false);
    expect(r.errors.join("\n")).toContain("em-dash");
    expect(await count(schema.saints)).toBe(0);
    expect(await count(schema.miracles)).toBe(0);
  });

  it("does not let an error that was already in the database block an unrelated import", async () => {
    await run(content([soloB()]));
    await db.update(schema.saints).set({ biography_short: "Old — problem" }).where(eq(schema.saints.slug, "saint-b"));
    const r = await run(content([minimalSaint("saint-d")]));
    expect(r.errors).toEqual([]);
    expect(r.applied).toBe(true);
    expect(r.checks?.baselineErrors.join("\n")).toContain("em-dash");
  });
});

describe("references and redirects", () => {
  it("rejects a miracle that references an unknown saint", async () => {
    const r = await run(content([saintB()], [minimalMiracle("miracle-x", { saints: ["nobody"] })]));
    expect(r.errors.join("\n")).toContain('unknown saint "nobody"');
    expect(await count(schema.miracles)).toBe(0);
  });

  it("accepts a miracle that references a saint already in the database", async () => {
    await run(content([soloB()]));
    const r = await run(content([], [minimalMiracle("miracle-x", { saints: ["saint-b"] })]));
    expect(r.errors).toEqual([]);
    expect(await db.select().from(schema.miracleSaints)).toHaveLength(1);
  });

  it("inserts missing redirects and never removes any", async () => {
    await run(content([minimalSaint("saint-new", { previous_slugs: ["saint-old"] })]));
    expect((await db.select().from(schema.slugRedirects)).map((r) => `${r.old_slug}>${r.new_slug}`)).toEqual(["saint-old>saint-new"]);
    await run(content([minimalSaint("saint-new")]));
    expect(await count(schema.slugRedirects)).toBe(1);
  });

  it("rejects a previous slug that already redirects elsewhere", async () => {
    await db.insert(schema.slugRedirects).values({ entity_type: "saint", old_slug: "taken", new_slug: "someone-else" });
    const r = await run(content([minimalSaint("saint-new", { previous_slugs: ["taken"] })]));
    expect(r.errors.join("\n")).toContain('already redirects to "someone-else"');
  });

  it("rejects a previous slug equal to a database row's current slug", async () => {
    await run(content([soloB()]));
    const r = await run(content([minimalSaint("saint-new", { previous_slugs: ["saint-b"] })]));
    expect(r.errors.join("\n")).toContain("current slug of another saint");
  });
});

describe("invariants", () => {
  it("never publishes and never deletes saints, miracles or redirects across a sequence of runs", async () => {
    const runs = [
      base(),
      content([saintA({ name: "x" }), saintB()], [miracleM({ title: "T2" })]),
      content([soloB()]),
      content([minimalSaint("saint-z", { previous_slugs: ["old-z"] })]),
    ];
    let prev = [0, 0, 0];
    for (const c of runs) {
      await run(c);
      const now = [await count(schema.saints), await count(schema.miracles), await count(schema.slugRedirects)];
      now.forEach((n, i) => expect(n).toBeGreaterThanOrEqual(prev[i]));
      prev = now;
      const published = await db.execute(sql`select (select count(*) from saints where published) + (select count(*) from miracles where published) as n`);
      expect(Number((published.rows[0] as { n: string }).n)).toBe(0);
    }
  });
});
