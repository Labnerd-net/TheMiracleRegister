import { and, eq, gte, ilike, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { createDb } from "../../db";
import { miracleSaints, miracles, saints } from "../../db/schema";
import { likeContains } from "../like";

type Db = ReturnType<typeof createDb>;
type Miracle = typeof miracles.$inferSelect;

export interface MiracleFilters {
  saint_id?: number;
  type?: Miracle["type"];
  topic?: string;
  category?: Miracle["miracle_category"];
  country?: string;
  year_from?: number;
  year_to?: number;
  used_for_beatification?: boolean;
  used_for_canonization?: boolean;
  approval_authority?: Miracle["approval_authority"];
}

export function miracleFilterConditions(db: Db, f: MiracleFilters): SQL[] {
  const conditions: SQL[] = [eq(miracles.published, true)];
  if (f.saint_id !== undefined) {
    conditions.push(
      inArray(
        miracles.id,
        db.select({ id: miracleSaints.miracle_id }).from(miracleSaints).where(eq(miracleSaints.saint_id, f.saint_id))
      )
    );
  }
  if (f.type !== undefined) conditions.push(eq(miracles.type, f.type));
  if (f.topic !== undefined) conditions.push(sql`${miracles.topics} @> ARRAY[${f.topic}]::text[]`);
  if (f.category !== undefined) conditions.push(eq(miracles.miracle_category, f.category));
  if (f.country !== undefined) conditions.push(ilike(miracles.country, likeContains(f.country)));
  if (f.year_from !== undefined)
    conditions.push(gte(sql`EXTRACT(YEAR FROM ${miracles.date_of_event})::int`, f.year_from));
  if (f.year_to !== undefined)
    conditions.push(lte(sql`EXTRACT(YEAR FROM ${miracles.date_of_event})::int`, f.year_to));
  if (f.used_for_beatification) conditions.push(eq(miracles.used_for_beatification, true));
  if (f.used_for_canonization) conditions.push(eq(miracles.used_for_canonization, true));
  if (f.approval_authority !== undefined) conditions.push(eq(miracles.approval_authority, f.approval_authority));
  return conditions;
}

export interface LinkedSaint {
  id: number;
  slug: string;
  name: string;
}

/** Saints linked to each miracle. Unpublished saints are excluded unless `includeUnpublished` (preview). */
export async function fetchSaintsByMiracle(
  db: Db,
  miracleIds: number[],
  { includeUnpublished = false }: { includeUnpublished?: boolean } = {}
): Promise<Map<number, LinkedSaint[]>> {
  const map = new Map<number, LinkedSaint[]>();
  if (miracleIds.length === 0) return map;
  const inIds = inArray(miracleSaints.miracle_id, miracleIds);
  const links = await db
    .select({
      miracle_id: miracleSaints.miracle_id,
      id: saints.id,
      slug: saints.slug,
      name: saints.name,
    })
    .from(miracleSaints)
    .innerJoin(saints, eq(miracleSaints.saint_id, saints.id))
    .where(includeUnpublished ? inIds : and(inIds, eq(saints.published, true)));
  for (const link of links) {
    if (!map.has(link.miracle_id)) map.set(link.miracle_id, []);
    map.get(link.miracle_id)!.push({ id: link.id, slug: link.slug, name: link.name });
  }
  return map;
}
