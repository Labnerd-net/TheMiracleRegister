import { eq, ilike, sql, type SQL } from "drizzle-orm";
import { saints } from "../../db/schema";
import { likeContains } from "../like";

type Saint = typeof saints.$inferSelect;

export interface SaintFilters {
  canonization_stage?: Saint["canonization_stage"];
  theme?: string;
  religious_order?: string;
  nationality?: string;
}

export function saintFilterConditions(f: SaintFilters): SQL[] {
  const conditions: SQL[] = [eq(saints.published, true)];
  if (f.canonization_stage) conditions.push(eq(saints.canonization_stage, f.canonization_stage));
  if (f.theme) conditions.push(sql`${saints.themes} @> ARRAY[${f.theme}]::text[]`);
  if (f.religious_order) conditions.push(ilike(saints.religious_order, likeContains(f.religious_order)));
  if (f.nationality) conditions.push(eq(saints.nationality, f.nationality));
  return conditions;
}
