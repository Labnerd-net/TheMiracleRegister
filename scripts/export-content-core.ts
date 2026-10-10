// Builds content files from the database rows (the inverse of import-content-core.ts).
// Output goes through the same Zod schema the importer reads, so a row the strict format cannot
// represent fails here instead of silently round-tripping wrong.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { asc } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { miracleFileSchema, saintFileSchema } from "./content-schema";
import type { Db } from "./import-content-core";

export type ExportedFile = { path: string; json: string };

const omitNull = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined));
const omitEmpty = <T>(xs: T[]) => (xs.length ? xs : undefined);

export async function exportContent(db: Db): Promise<{ files: ExportedFile[]; errors: string[] }> {
  const [saints, miracles, saintSources, saintLocations, relations, miracleSources, miracleImages, miracleSaints, redirects] =
    await Promise.all([
      db.select().from(schema.saints).orderBy(asc(schema.saints.slug)),
      db.select().from(schema.miracles).orderBy(asc(schema.miracles.slug)),
      db.select().from(schema.saintSources).orderBy(asc(schema.saintSources.id)),
      db.select().from(schema.saintLocations).orderBy(asc(schema.saintLocations.id)),
      db.select().from(schema.saintRelations),
      db.select().from(schema.miracleSources).orderBy(asc(schema.miracleSources.id)),
      db.select().from(schema.miracleImages).orderBy(asc(schema.miracleImages.display_order), asc(schema.miracleImages.id)),
      db.select().from(schema.miracleSaints),
      db.select().from(schema.slugRedirects).orderBy(asc(schema.slugRedirects.old_slug)),
    ]);
  const saintSlug = new Map(saints.map((s) => [s.id, s.slug]));
  const files: ExportedFile[] = [];
  const errors: string[] = [];
  const prev = (kind: "saint" | "miracle", slug: string) =>
    omitEmpty(redirects.filter((r) => r.entity_type === kind && r.new_slug === slug).map((r) => r.old_slug));
  const serialize = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;

  for (const s of saints) {
    const { id, published: _p, created_at: _c, updated_at: _u, ...cols } = s;
    void _p; void _c; void _u;
    const candidate = {
      ...omitNull(cols),
      previous_slugs: prev("saint", s.slug),
      sources: omitEmpty(saintSources.filter((r) => r.saint_id === id).map((r) => omitNull({ url: r.url, title: r.title, source_type: r.source_type, accessed_date: r.accessed_date }))),
      locations: omitEmpty(saintLocations.filter((r) => r.saint_id === id).map((r) => omitNull({ location_name: r.location_name, lat: r.lat, lng: r.lng, location_type: r.location_type }))),
      relations: omitEmpty(
        relations
          .filter((r) => r.saint_id === id)
          .map((r) => ({ saint: saintSlug.get(r.related_saint_id)!, type: r.relation_type }))
          .sort((a, b) => `${a.saint}|${a.type}`.localeCompare(`${b.saint}|${b.type}`)),
      ),
    };
    const parsed = saintFileSchema.safeParse(candidate);
    if (parsed.success) files.push({ path: `saints/${s.slug}.json`, json: serialize(parsed.data) });
    else errors.push(`saint ${s.slug}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }

  for (const m of miracles) {
    const { id, published: _p, created_at: _c, updated_at: _u, ...cols } = m;
    void _p; void _c; void _u;
    const candidate = {
      ...omitNull(cols),
      previous_slugs: prev("miracle", m.slug),
      sources: omitEmpty(miracleSources.filter((r) => r.miracle_id === id).map((r) => omitNull({ url: r.url, title: r.title, source_type: r.source_type, accessed_date: r.accessed_date }))),
      images: omitEmpty(miracleImages.filter((r) => r.miracle_id === id).map((r) => omitNull({ url: r.url, caption: r.caption, source_attribution: r.source_attribution }))),
      saints: omitEmpty(miracleSaints.filter((r) => r.miracle_id === id).map((r) => saintSlug.get(r.saint_id)!).sort()),
    };
    const parsed = miracleFileSchema.safeParse(candidate);
    if (parsed.success) files.push({ path: `miracles/${m.slug}.json`, json: serialize(parsed.data) });
    else errors.push(`miracle ${m.slug}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  return { files, errors };
}

/** Writes files under `dir`; an existing file is kept unless `force`. Returns what was written and skipped. */
export function writeExport(dir: string, files: ExportedFile[], force: boolean): { written: string[]; skipped: string[] } {
  const written: string[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    const target = join(dir, f.path);
    if (existsSync(target) && !force) {
      skipped.push(f.path);
      continue;
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, f.json, "utf8");
    written.push(f.path);
  }
  return { written, skipped };
}
