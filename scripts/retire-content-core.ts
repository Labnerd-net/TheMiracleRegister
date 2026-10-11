// Retires a published saint or miracle. The import pipeline (import-content-core.ts) never
// deletes a row and never sets published back to false - by design, since a missing content
// file is ambiguous (deleted on purpose? accidentally not checked out?) and the importer only
// ever reads files, never diffs against what's absent. Retiring something on purpose is a
// distinct, rarer operation with a different safety shape, so it gets its own script rather
// than overloading the importer with a "delete anything the files no longer mention" mode.
import { and, eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import type { Db } from "./import-content-core";

export type { Db };
export type RetireKind = "saint" | "miracle";
export type RetireMode = "unpublish" | "delete";

export type RetirePlan = {
  kind: RetireKind;
  slug: string;
  found: boolean;
  id?: number;
  /** `name` for a saint, `title` for a miracle. */
  label?: string;
  published?: boolean;
  childCounts?: Record<string, number>;
  /** Side effects worth a human's attention; never auto-resolved by `applyRetirement`. */
  warnings: string[];
};

async function planSaint(db: Db, slug: string): Promise<RetirePlan> {
  const row = await db.query.saints.findFirst({ where: eq(schema.saints.slug, slug) });
  if (!row) return { kind: "saint", slug, found: false, warnings: [] };

  const [sources, locations, relationsOut, relationsIn, miracleLinks, redirects] = await Promise.all([
    db.query.saintSources.findMany({ where: eq(schema.saintSources.saint_id, row.id) }),
    db.query.saintLocations.findMany({ where: eq(schema.saintLocations.saint_id, row.id) }),
    db.query.saintRelations.findMany({ where: eq(schema.saintRelations.saint_id, row.id) }),
    db.query.saintRelations.findMany({ where: eq(schema.saintRelations.related_saint_id, row.id) }),
    db.query.miracleSaints.findMany({ where: eq(schema.miracleSaints.saint_id, row.id) }),
    db.query.slugRedirects.findMany({
      where: and(eq(schema.slugRedirects.entity_type, "saint"), eq(schema.slugRedirects.new_slug, slug)),
    }),
  ]);

  const warnings: string[] = [];
  for (const link of miracleLinks) {
    const siblings = await db.query.miracleSaints.findMany({ where: eq(schema.miracleSaints.miracle_id, link.miracle_id) });
    if (siblings.length === 1) {
      const m = await db.query.miracles.findFirst({ where: eq(schema.miracles.id, link.miracle_id) });
      warnings.push(`miracle "${m?.slug}" would be left with no linked saint at all`);
    }
  }
  if (redirects.length) {
    warnings.push(`${redirects.length} slug_redirect row(s) point an old slug at "${slug}" - they would start 404ing`);
  }

  return {
    kind: "saint",
    slug,
    found: true,
    id: row.id,
    label: row.name,
    published: row.published,
    childCounts: {
      sources: sources.length,
      locations: locations.length,
      relations: relationsOut.length + relationsIn.length,
      miracleLinks: miracleLinks.length,
    },
    warnings,
  };
}

async function planMiracle(db: Db, slug: string): Promise<RetirePlan> {
  const row = await db.query.miracles.findFirst({ where: eq(schema.miracles.slug, slug) });
  if (!row) return { kind: "miracle", slug, found: false, warnings: [] };

  const [sources, images, saintLinks, redirects] = await Promise.all([
    db.query.miracleSources.findMany({ where: eq(schema.miracleSources.miracle_id, row.id) }),
    db.query.miracleImages.findMany({ where: eq(schema.miracleImages.miracle_id, row.id) }),
    db.query.miracleSaints.findMany({ where: eq(schema.miracleSaints.miracle_id, row.id) }),
    db.query.slugRedirects.findMany({
      where: and(eq(schema.slugRedirects.entity_type, "miracle"), eq(schema.slugRedirects.new_slug, slug)),
    }),
  ]);

  const warnings: string[] = [];
  if (redirects.length) {
    warnings.push(`${redirects.length} slug_redirect row(s) point an old slug at "${slug}" - they would start 404ing`);
  }

  return {
    kind: "miracle",
    slug,
    found: true,
    id: row.id,
    label: row.title,
    published: row.published,
    childCounts: { sources: sources.length, images: images.length, saintLinks: saintLinks.length },
    warnings,
  };
}

export function planRetirement(db: Db, kind: RetireKind, slug: string): Promise<RetirePlan> {
  return kind === "saint" ? planSaint(db, slug) : planMiracle(db, slug);
}

export type RetireResult = { ok: true; mode: RetireMode } | { ok: false; reason: string };

/** Caller must have already shown the plan and confirmed. Runs in one transaction. */
export async function applyRetirement(db: Db, kind: RetireKind, slug: string, mode: RetireMode): Promise<RetireResult> {
  return db.transaction(async (tx) => {
    if (kind === "saint") {
      const row = await tx.query.saints.findFirst({ where: eq(schema.saints.slug, slug) });
      if (!row) return { ok: false, reason: `no saint row for slug "${slug}"` };
      if (mode === "unpublish") {
        await tx.update(schema.saints).set({ published: false }).where(eq(schema.saints.id, row.id));
        return { ok: true, mode };
      }
      // saint_relations has no onDelete cascade (it's symmetric, stored in both directions,
      // and import-content-core.ts manages it by hand too) - clear both directions first.
      await tx.delete(schema.saintRelations).where(eq(schema.saintRelations.saint_id, row.id));
      await tx.delete(schema.saintRelations).where(eq(schema.saintRelations.related_saint_id, row.id));
      await tx.delete(schema.saints).where(eq(schema.saints.id, row.id));
      return { ok: true, mode };
    }
    const row = await tx.query.miracles.findFirst({ where: eq(schema.miracles.slug, slug) });
    if (!row) return { ok: false, reason: `no miracle row for slug "${slug}"` };
    if (mode === "unpublish") {
      await tx.update(schema.miracles).set({ published: false }).where(eq(schema.miracles.id, row.id));
      return { ok: true, mode };
    }
    // miracle_sources, miracle_images and miracle_saints all cascade on miracle_id.
    await tx.delete(schema.miracles).where(eq(schema.miracles.id, row.id));
    return { ok: true, mode };
  });
}

export function formatPlan(plan: RetirePlan): string {
  if (!plan.found) return `No ${plan.kind} row found for slug "${plan.slug}" - nothing to do.`;
  const lines = [
    `Found ${plan.kind} "${plan.slug}" (id ${plan.id}): "${plan.label}", published: ${plan.published}`,
    `Child rows: ${Object.entries(plan.childCounts ?? {}).map(([k, v]) => `${k}=${v}`).join(", ")}`,
  ];
  if (plan.warnings.length) lines.push(...plan.warnings.map((w) => `WARNING: ${w}`));
  return lines.join("\n");
}
