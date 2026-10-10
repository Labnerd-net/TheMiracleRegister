import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { loadContent } from "../scripts/content-load";
import { exportContent, writeExport } from "../scripts/export-content-core";
import { runImport, type Db } from "../scripts/import-content-core";
import { createTestDb, type TestDb } from "./helpers/testDb";
import { seed } from "./helpers/fixtures";

let db: TestDb;
let close: () => Promise<void>;
const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((d) => rmSync(d, { recursive: true, force: true })));

beforeAll(async () => {
  const created = await createTestDb();
  db = created.db;
  close = created.close;
  const ids = await seed(db);
  // Things the shared fixtures do not cover: locations, padded decimals, redirects, dates, [] arrays.
  await db.insert(schema.saintLocations).values({ saint_id: ids.saints.alpha, location_name: "Alpha Tomb", lat: "45.500000", lng: "-73.250000", location_type: "tomb" });
  await db.update(schema.miracles).set({ location_lat: "45.1234500", location_lng: "-1.0000000", location_2_name: "Second place" }).where(eq(schema.miracles.id, ids.miracles.healingAnn));
  await db.update(schema.miracles).set({ topics: [] }).where(eq(schema.miracles.id, ids.miracles.apparition));
  await db.update(schema.saints).set({ birth_date: "1850-03-04", patronage: ["Nurses"] }).where(eq(schema.saints.id, ids.saints.alpha));
  await db.insert(schema.slugRedirects).values({ entity_type: "saint", old_slug: "old-alpha", new_slug: "saint-alpha" });
});
afterAll(async () => close?.());

const tmpDir = () => {
  const d = mkdtempSync(join(tmpdir(), "export-"));
  dirs.push(d);
  writeFileSync(join(d, ".content-root"), "");
  return d;
};

describe("export", () => {
  it("round-trips: exporting then dry-run importing reports no changes", async () => {
    const { files, errors } = await exportContent(db as unknown as Db);
    expect(errors).toEqual([]);
    expect(files.length).toBe(3 + 6);
    const dir = tmpDir();
    writeExport(dir, files, false);
    const loaded = loadContent({ path: dir, source: "--content-dir flag" });
    expect(loaded.errors).toEqual([]);
    const report = await runImport(db as unknown as Db, loaded, { apply: false, updatePublished: false });
    expect(report.errors).toEqual([]);
    expect(report.entities.filter((e) => e.status !== "unchanged")).toEqual([]);
    expect(report.redirects).toEqual([]);
    expect(report.unmanaged).toEqual({ saints: [], miracles: [] });
  });

  it("exports no published flag, id or timestamps, and plain-hyphen exact values", async () => {
    const { files } = await exportContent(db as unknown as Db);
    const alpha = JSON.parse(files.find((f) => f.path === "saints/saint-alpha.json")!.json);
    expect(Object.keys(alpha)).not.toContain("published");
    expect(Object.keys(alpha)).not.toContain("id");
    expect(Object.keys(alpha)).not.toContain("created_at");
    expect(alpha.previous_slugs).toEqual(["old-alpha"]);
    expect(alpha.locations[0].lat).toBe("45.500000");
    const m = JSON.parse(files.find((f) => f.path === "miracles/m-healing-ann.json")!.json);
    expect(m.location_lat).toBe("45.1234500");
    expect(m.images.map((i: { url: string }) => i.url)).toEqual(["https://example.org/first.jpg", "https://example.org/second.jpg"]);
    expect(JSON.parse(files.find((f) => f.path === "miracles/m-apparition.json")!.json).topics).toEqual([]);
  });

  it("is deterministic and ends with a newline", async () => {
    const a = await exportContent(db as unknown as Db);
    const b = await exportContent(db as unknown as Db);
    expect(a.files).toEqual(b.files);
    expect(a.files.every((f) => f.json.endsWith("}\n"))).toBe(true);
  });

  it("refuses to overwrite an existing file without force", async () => {
    const { files } = await exportContent(db as unknown as Db);
    const dir = tmpDir();
    writeExport(dir, files, false);
    writeFileSync(join(dir, files[0].path), "edited");
    const second = writeExport(dir, files, false);
    expect(second.written).toEqual([]);
    expect(second.skipped.length).toBe(files.length);
    expect(readFileSync(join(dir, files[0].path), "utf8")).toBe("edited");
    expect(writeExport(dir, files, true).written.length).toBe(files.length);
    expect(readFileSync(join(dir, files[0].path), "utf8")).toBe(files[0].json);
  });

  it("fails loudly on a row the strict format cannot represent", async () => {
    await db.update(schema.saints).set({ themes: ["not-a-theme"] }).where(eq(schema.saints.slug, "saint-beta"));
    const { errors } = await exportContent(db as unknown as Db);
    expect(errors.join()).toContain("saint saint-beta");
    await db.update(schema.saints).set({ themes: ["perseverance"] }).where(eq(schema.saints.slug, "saint-beta"));
  });
});
