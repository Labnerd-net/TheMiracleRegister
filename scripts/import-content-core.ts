// Upserts content files into the database. `runImport` is driver-agnostic (any Drizzle
// Postgres database): the CLI passes a Neon WebSocket pool, tests pass PGlite.
//
// Invariants: published is never set to true (inserts use false, updates never include the
// column); no saints, miracles or slug_redirects row is ever deleted (child rows are replaced).
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { getTableColumns } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { runChecks, type Rec, type Sql } from "./check-data-core";
import type { LoadedContent } from "./content-load";
import type { MiracleFile, SaintFile } from "./content-schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export type ImportOptions = {
  apply: boolean;
  updatePublished: boolean;
  /** Passed through to runChecks (tests supply an empty feastDays source). */
  feastSrc?: string;
};

type Row = Record<string, unknown>;
export type Change = { field: string; from: unknown; to: unknown };
export type EntityStatus = "new" | "unchanged" | "changed" | "refused";
export type EntityPlan = {
  kind: "saint" | "miracle";
  slug: string;
  status: EntityStatus;
  published: boolean;
  changes: Change[];
  /** Scalar columns where the database holds a value and the file omits it (apply would null them). */
  nulled: string[];
};
export type RedirectToAdd = { entity_type: "saint" | "miracle"; old_slug: string; new_slug: string };

export type ImportReport = {
  applied: boolean;
  errors: string[];
  entities: EntityPlan[];
  unmanaged: { saints: string[]; miracles: string[] };
  redirects: RedirectToAdd[];
  checks?: { baselineErrors: string[]; newErrors: string[]; warnings: string[] };
};

const EXCLUDED = new Set(["id", "published", "created_at", "updated_at"]);
const columnsOf = (t: Parameters<typeof getTableColumns>[0]) =>
  Object.keys(getTableColumns(t)).filter((k) => !EXCLUDED.has(k));
const SAINT_COLUMNS = columnsOf(schema.saints);
const MIRACLE_COLUMNS = columnsOf(schema.miracles);

// Update payloads cannot carry these, which makes `published: true` unrepresentable.
type SaintWrite = Omit<typeof schema.saints.$inferInsert, "id" | "published" | "created_at" | "updated_at">;
type MiracleWrite = Omit<typeof schema.miracles.$inferInsert, "id" | "published" | "created_at" | "updated_at">;

const pick = (src: object, keys: string[]): Row =>
  Object.fromEntries(keys.map((k) => [k, (src as Row)[k] ?? null]));

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function scalarChanges(file: Row, db: Row, keys: string[]): Change[] {
  return keys.filter((k) => !same(file[k], db[k])).map((k) => ({ field: k, from: db[k], to: file[k] }));
}

const nulledOf = (changes: Change[]) =>
  changes.filter((c) => c.to === null && c.from !== null && c.from !== undefined).map((c) => c.field);

// Normalized child rows, shared by the file side and the database side.
const sourceRows = (rows: { url: string; title?: string | null; source_type: string; accessed_date?: string | null }[]) =>
  rows.map((r) => ({ url: r.url, title: r.title ?? null, source_type: r.source_type, accessed_date: r.accessed_date ?? null }));
const imageRows = (rows: { url: string; caption?: string | null; source_attribution?: string | null }[]) =>
  rows.map((r) => ({ url: r.url, caption: r.caption ?? null, source_attribution: r.source_attribution ?? null }));
const locationRows = (rows: { location_name: string; lat?: string | null; lng?: string | null; location_type: string }[]) =>
  rows.map((r) => ({ location_name: r.location_name, lat: r.lat ?? null, lng: r.lng ?? null, location_type: r.location_type }));
const sortedUnique = (xs: string[]) => [...new Set(xs)].sort();

class ImportAbort extends Error {
  constructor(public report: ImportReport) {
    super("import aborted");
  }
}

type DbState = Awaited<ReturnType<typeof readState>>;

async function readState(db: Db) {
  const [saints, miracles, saintSources, saintLocations, relations, miracleSources, miracleImages, miracleSaints, redirects] =
    await Promise.all([
      db.select().from(schema.saints),
      db.select().from(schema.miracles),
      db.select().from(schema.saintSources).orderBy(asc(schema.saintSources.id)),
      db.select().from(schema.saintLocations).orderBy(asc(schema.saintLocations.id)),
      db.select().from(schema.saintRelations),
      db.select().from(schema.miracleSources).orderBy(asc(schema.miracleSources.id)),
      db.select().from(schema.miracleImages).orderBy(asc(schema.miracleImages.display_order), asc(schema.miracleImages.id)),
      db.select().from(schema.miracleSaints),
      db.select().from(schema.slugRedirects),
    ]);
  return { saints, miracles, saintSources, saintLocations, relations, miracleSources, miracleImages, miracleSaints, redirects };
}

function groupBy<T>(rows: T[], key: (r: T) => number): Map<number, T[]> {
  const m = new Map<number, T[]>();
  for (const r of rows) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
  return m;
}

type Plan = {
  report: Omit<ImportReport, "applied" | "checks">;
  state: DbState;
  saintPlans: { file: SaintFile; plan: EntityPlan; id?: number; childChanged: Set<string> }[];
  miraclePlans: { file: MiracleFile; plan: EntityPlan; id?: number; childChanged: Set<string> }[];
};

function buildPlan(state: DbState, content: LoadedContent, opts: ImportOptions): Plan {
  const errors: string[] = [];
  const dbSaintBySlug = new Map(state.saints.map((s) => [s.slug, s]));
  const dbMiracleBySlug = new Map(state.miracles.map((m) => [m.slug, m]));
  const saintSlugById = new Map(state.saints.map((s) => [s.id, s.slug]));
  const fileSaintSlugs = new Set(content.saints.map((s) => s.slug));
  const knownSaint = (slug: string) => fileSaintSlugs.has(slug) || dbSaintBySlug.has(slug);

  const sSources = groupBy(state.saintSources, (r) => r.saint_id);
  const sLocations = groupBy(state.saintLocations, (r) => r.saint_id);
  const sRelations = groupBy(state.relations, (r) => r.saint_id);
  const mSources = groupBy(state.miracleSources, (r) => r.miracle_id);
  const mImages = groupBy(state.miracleImages, (r) => r.miracle_id);
  const mSaints = groupBy(state.miracleSaints, (r) => r.miracle_id);

  // Redirects: existing (type, old_slug) -> new_slug.
  const redirectTarget = new Map(state.redirects.map((r) => [`${r.entity_type}:${r.old_slug}`, r.new_slug]));
  const redirects: RedirectToAdd[] = [];
  const checkRedirects = (kind: "saint" | "miracle", e: { slug: string; previous_slugs?: string[] }, existsInDb: Set<string>, isNew: boolean) => {
    if (isNew && redirectTarget.has(`${kind}:${e.slug}`)) {
      errors.push(`${kind} "${e.slug}": slug is an old slug in slug_redirects (redirects to "${redirectTarget.get(`${kind}:${e.slug}`)}")`);
    }
    for (const prev of e.previous_slugs ?? []) {
      if (existsInDb.has(prev)) {
        errors.push(`${kind} "${e.slug}": previous slug "${prev}" is the current slug of another ${kind} in the database`);
        continue;
      }
      const target = redirectTarget.get(`${kind}:${prev}`);
      if (target === undefined) redirects.push({ entity_type: kind, old_slug: prev, new_slug: e.slug });
      else if (target !== e.slug) errors.push(`${kind} "${e.slug}": previous slug "${prev}" already redirects to "${target}"`);
    }
  };

  const saintPlans: Plan["saintPlans"] = [];
  for (const file of content.saints) {
    const existing = dbSaintBySlug.get(file.slug);
    const fileRow = pick(file, SAINT_COLUMNS);
    const childChanged = new Set<string>();
    let changes: Change[] = [];
    if (existing) {
      changes = scalarChanges(fileRow, pick(existing, SAINT_COLUMNS), SAINT_COLUMNS);
      const cmp = (field: string, to: unknown, from: unknown) => {
        if (!same(to, from)) {
          changes.push({ field, from, to });
          childChanged.add(field);
        }
      };
      cmp("sources", sourceRows(file.sources ?? []), sourceRows(sSources.get(existing.id) ?? []));
      cmp("locations", locationRows(file.locations ?? []), locationRows(sLocations.get(existing.id) ?? []));
      cmp(
        "relations",
        sortedUnique((file.relations ?? []).map((r) => `${r.saint}|${r.type}`)),
        sortedUnique((sRelations.get(existing.id) ?? []).map((r) => `${saintSlugById.get(r.related_saint_id)}|${r.relation_type}`)),
      );
    } else {
      for (const f of ["sources", "locations", "relations"] as const) if (file[f]?.length) childChanged.add(f);
    }
    for (const r of file.relations ?? []) {
      if (!knownSaint(r.saint)) errors.push(`saint "${file.slug}": relation to unknown saint "${r.saint}"`);
    }
    checkRedirects("saint", file, new Set([...dbSaintBySlug.keys()].filter((s) => s !== file.slug)), !existing);
    saintPlans.push({
      file,
      id: existing?.id,
      childChanged,
      plan: {
        kind: "saint",
        slug: file.slug,
        status: !existing ? "new" : changes.length ? "changed" : "unchanged",
        published: existing?.published ?? false,
        changes,
        nulled: nulledOf(changes),
      },
    });
  }

  const miraclePlans: Plan["miraclePlans"] = [];
  for (const file of content.miracles) {
    const existing = dbMiracleBySlug.get(file.slug);
    const fileRow = pick(file, MIRACLE_COLUMNS);
    const childChanged = new Set<string>();
    let changes: Change[] = [];
    if (existing) {
      changes = scalarChanges(fileRow, pick(existing, MIRACLE_COLUMNS), MIRACLE_COLUMNS);
      const cmp = (field: string, to: unknown, from: unknown) => {
        if (!same(to, from)) {
          changes.push({ field, from, to });
          childChanged.add(field);
        }
      };
      cmp("sources", sourceRows(file.sources ?? []), sourceRows(mSources.get(existing.id) ?? []));
      cmp("images", imageRows(file.images ?? []), imageRows(mImages.get(existing.id) ?? []));
      cmp(
        "saints",
        sortedUnique(file.saints ?? []),
        sortedUnique((mSaints.get(existing.id) ?? []).map((r) => saintSlugById.get(r.saint_id) ?? `#${r.saint_id}`)),
      );
    } else {
      for (const f of ["sources", "images", "saints"] as const) if (file[f]?.length) childChanged.add(f);
    }
    for (const s of file.saints ?? []) {
      if (!knownSaint(s)) errors.push(`miracle "${file.slug}": references unknown saint "${s}"`);
    }
    checkRedirects("miracle", file, new Set([...dbMiracleBySlug.keys()].filter((s) => s !== file.slug)), !existing);
    miraclePlans.push({
      file,
      id: existing?.id,
      childChanged,
      plan: {
        kind: "miracle",
        slug: file.slug,
        status: !existing ? "new" : changes.length ? "changed" : "unchanged",
        published: existing?.published ?? false,
        changes,
        nulled: nulledOf(changes),
      },
    });
  }

  // A relation edit also rewrites the mirror row on a saint that has no file; refuse if it is published.
  for (const sp of saintPlans) {
    if (!sp.childChanged.has("relations")) continue;
    const touched = new Set([
      ...(sp.file.relations ?? []).map((r) => r.saint),
      ...(sp.id ? (sRelations.get(sp.id) ?? []).map((r) => saintSlugById.get(r.related_saint_id) ?? "") : []),
    ]);
    for (const slug of touched) {
      const other = dbSaintBySlug.get(slug);
      if (other?.published && !fileSaintSlugs.has(slug) && sp.plan.status !== "refused") {
        sp.plan.status = "refused";
        sp.plan.changes.push({ field: `relations (mirror row on published saint "${slug}")`, from: null, to: null });
      }
    }
  }

  // Published rows are only edited with --update-published.
  for (const p of [...saintPlans, ...miraclePlans]) {
    if (p.plan.status === "changed" && p.plan.published && !opts.updatePublished) p.plan.status = "refused";
  }

  const entities = [...saintPlans, ...miraclePlans].map((p) => p.plan);
  return {
    state,
    saintPlans,
    miraclePlans,
    report: {
      errors,
      entities,
      redirects,
      unmanaged: {
        saints: state.saints.filter((s) => !fileSaintSlugs.has(s.slug)).map((s) => s.slug).sort(),
        miracles: state.miracles.filter((m) => !content.miracles.some((f) => f.slug === m.slug)).map((m) => m.slug).sort(),
      },
    },
  };
}

// runChecks takes parameterless tagged-template queries; run them on the transaction.
function checkRunner(db: Db): Sql {
  return async (strings) => {
    const res = (await db.execute(sql.raw(strings.join("")))) as unknown as { rows?: Rec[] } | Rec[];
    return Array.isArray(res) ? res : (res.rows ?? []);
  };
}

async function writePlan(tx: Db, plan: Plan): Promise<void> {
  const idBySlug = new Map(plan.state.saints.map((s) => [s.slug, s.id]));
  const fileSaintSlugs = new Set(plan.saintPlans.map((p) => p.file.slug));

  // Saints: scalars, then sources and locations.
  for (const sp of plan.saintPlans) {
    const { file } = sp;
    let id = sp.id;
    if (sp.plan.status === "new") {
      const values = { ...(pick(file, SAINT_COLUMNS) as SaintWrite), published: false };
      [{ id }] = await tx.insert(schema.saints).values(values).returning({ id: schema.saints.id });
    } else if (sp.plan.status === "changed") {
      const set: Partial<SaintWrite> = {};
      for (const c of sp.plan.changes) if (SAINT_COLUMNS.includes(c.field)) (set as Row)[c.field] = c.to;
      // Child-only changes still bump the parent so sitemap lastmod moves.
      await tx.update(schema.saints).set(Object.keys(set).length ? set : { updated_at: new Date() }).where(eq(schema.saints.id, id!));
    }
    if (id === undefined) continue;
    idBySlug.set(file.slug, id);
    sp.id = id;
    if (sp.childChanged.has("sources")) {
      await tx.delete(schema.saintSources).where(eq(schema.saintSources.saint_id, id));
      const rows = sourceRows(file.sources ?? []).map((r) => ({ ...r, saint_id: id! }));
      if (rows.length) await tx.insert(schema.saintSources).values(rows as (typeof schema.saintSources.$inferInsert)[]);
    }
    if (sp.childChanged.has("locations")) {
      await tx.delete(schema.saintLocations).where(eq(schema.saintLocations.saint_id, id));
      const rows = locationRows(file.locations ?? []).map((r) => ({ ...r, saint_id: id! }));
      if (rows.length) await tx.insert(schema.saintLocations).values(rows as (typeof schema.saintLocations.$inferInsert)[]);
    }
  }

  // Relations once every saint has an id. Stored in both directions; the mirror of a relation
  // to a saint that has no file is written here, the rest comes from that saint's own file.
  const noFileIds = plan.state.saints.filter((s) => !fileSaintSlugs.has(s.slug)).map((s) => s.id);
  for (const sp of plan.saintPlans) {
    if (!sp.childChanged.has("relations") || sp.id === undefined) continue;
    const id = sp.id;
    await tx.delete(schema.saintRelations).where(eq(schema.saintRelations.saint_id, id));
    if (noFileIds.length) {
      await tx.delete(schema.saintRelations).where(and(eq(schema.saintRelations.related_saint_id, id), inArray(schema.saintRelations.saint_id, noFileIds)));
    }
    const rows: (typeof schema.saintRelations.$inferInsert)[] = [];
    for (const r of sp.file.relations ?? []) {
      const other = idBySlug.get(r.saint)!;
      rows.push({ saint_id: id, related_saint_id: other, relation_type: r.type });
      if (!fileSaintSlugs.has(r.saint)) rows.push({ saint_id: other, related_saint_id: id, relation_type: r.type });
    }
    if (rows.length) await tx.insert(schema.saintRelations).values(rows).onConflictDoNothing();
  }

  // Miracles.
  for (const mp of plan.miraclePlans) {
    const { file } = mp;
    let id = mp.id;
    if (mp.plan.status === "new") {
      const values = { ...(pick(file, MIRACLE_COLUMNS) as MiracleWrite), published: false };
      [{ id }] = await tx.insert(schema.miracles).values(values).returning({ id: schema.miracles.id });
    } else if (mp.plan.status === "changed") {
      const set: Partial<MiracleWrite> = {};
      for (const c of mp.plan.changes) if (MIRACLE_COLUMNS.includes(c.field)) (set as Row)[c.field] = c.to;
      await tx.update(schema.miracles).set(Object.keys(set).length ? set : { updated_at: new Date() }).where(eq(schema.miracles.id, id!));
    }
    if (id === undefined) continue;
    mp.id = id;
    if (mp.childChanged.has("sources")) {
      await tx.delete(schema.miracleSources).where(eq(schema.miracleSources.miracle_id, id));
      const rows = sourceRows(file.sources ?? []).map((r) => ({ ...r, miracle_id: id! }));
      if (rows.length) await tx.insert(schema.miracleSources).values(rows as (typeof schema.miracleSources.$inferInsert)[]);
    }
    if (mp.childChanged.has("images")) {
      await tx.delete(schema.miracleImages).where(eq(schema.miracleImages.miracle_id, id));
      const rows = imageRows(file.images ?? []).map((r, i) => ({ ...r, miracle_id: id!, display_order: i }));
      if (rows.length) await tx.insert(schema.miracleImages).values(rows);
    }
    if (mp.childChanged.has("saints")) {
      await tx.delete(schema.miracleSaints).where(eq(schema.miracleSaints.miracle_id, id));
      const rows = sortedUnique(file.saints ?? []).map((s) => ({ miracle_id: id!, saint_id: idBySlug.get(s)! }));
      if (rows.length) await tx.insert(schema.miracleSaints).values(rows);
    }
  }

  if (plan.report.redirects.length) {
    await tx.insert(schema.slugRedirects).values(plan.report.redirects).onConflictDoNothing();
  }
}

/** Dry run unless `opts.apply`. With apply, everything runs in one transaction and any failure rolls it back. */
export async function runImport(db: Db, content: LoadedContent, opts: ImportOptions): Promise<ImportReport> {
  if (content.errors.length) {
    return { applied: false, errors: content.errors, entities: [], unmanaged: { saints: [], miracles: [] }, redirects: [] };
  }

  if (!opts.apply) {
    const plan = buildPlan(await readState(db), content, opts);
    return { applied: false, ...plan.report };
  }

  try {
    return await db.transaction(async (tx) => {
      const txDb = tx as unknown as Db;
      const baseline = (await runChecks(checkRunner(txDb), { feastSrc: opts.feastSrc })).errors;
      const plan = buildPlan(await readState(txDb), content, opts);
      const refused = plan.report.entities.filter((e) => e.status === "refused");
      const preErrors = [
        ...plan.report.errors,
        ...refused.map((e) => `${e.kind} "${e.slug}" is published and has changes; pass --update-published to apply them`),
      ];
      if (preErrors.length) throw new ImportAbort({ applied: false, ...plan.report, errors: preErrors });

      await writePlan(txDb, plan);

      const after = await runChecks(checkRunner(txDb), { feastSrc: opts.feastSrc });
      const newErrors = after.errors.filter((e) => !baseline.includes(e));
      const checks = { baselineErrors: baseline, newErrors, warnings: after.warnings };
      if (newErrors.length) {
        throw new ImportAbort({
          applied: false,
          ...plan.report,
          errors: newErrors.map((e) => `check:data ${e}`),
          checks,
        });
      }
      return { applied: true, ...plan.report, checks };
    });
  } catch (e) {
    if (e instanceof ImportAbort) return e.report;
    throw e;
  }
}

const show = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  const flat = (s ?? "null").replace(/\s+/g, " ");
  return flat.length > 80 ? `${flat.slice(0, 77)}...` : flat;
};

export function formatReport(r: ImportReport, apply: boolean): string {
  const lines: string[] = [];
  const by = (s: EntityStatus) => r.entities.filter((e) => e.status === s);
  for (const status of ["new", "changed", "refused"] as const) {
    for (const e of by(status)) {
      lines.push(`${status.toUpperCase().padEnd(8)} ${e.kind} ${e.slug}${e.published ? " (published)" : ""}`);
      if (status !== "new") {
        for (const c of e.changes) lines.push(`           ${c.field}: ${show(c.from)} -> ${show(c.to)}`);
      }
      if (e.nulled.length) lines.push(`           would null: ${e.nulled.join(", ")}`);
    }
  }
  lines.push(`UNCHANGED ${by("unchanged").length}`);
  if (r.unmanaged.saints.length || r.unmanaged.miracles.length) {
    lines.push(`UNMANAGED (in the database, no file; left alone): ${[...r.unmanaged.saints.map((s) => `saint ${s}`), ...r.unmanaged.miracles.map((m) => `miracle ${m}`)].join(", ")}`);
  }
  if (r.redirects.length) lines.push(`REDIRECTS to add: ${r.redirects.map((x) => `${x.entity_type} ${x.old_slug} -> ${x.new_slug}`).join(", ")}`);
  if (r.checks?.baselineErrors.length) lines.push(`check:data errors already present before this run (${r.checks.baselineErrors.length}), not blocking:\n  ${r.checks.baselineErrors.join("\n  ")}`);
  if (r.checks?.warnings.length) lines.push(`check:data warnings (${r.checks.warnings.length}):\n  ${r.checks.warnings.join("\n  ")}`);
  if (r.errors.length) lines.push(`\nERRORS (${r.errors.length}) - nothing was written:\n  ${r.errors.join("\n  ")}`);
  else lines.push(r.applied ? "\nApplied." : apply ? "\nNothing applied." : "\nDry run: nothing written. Re-run with --apply to write.");
  return lines.join("\n");
}
