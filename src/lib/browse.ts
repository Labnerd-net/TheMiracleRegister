import { eq } from "drizzle-orm";
import type { createDb } from "../db";
import { miracles, saints } from "../db/schema";
import { MIRACLE_TOPICS, SAINT_THEMES } from "../db/topics";

/** Browse pages with fewer published records than this render but are noindex and left out of the sitemap. */
export const MIN_BROWSE_RECORDS = 3;

export type BrowseCount = { value: string; count: number };

type Db = ReturnType<typeof createDb>;

/** Tallies the controlled values; anything not in `allowed` (stray data) is ignored. */
function tally(rows: (string[] | null)[], allowed: readonly string[]): BrowseCount[] {
  const counts = new Map<string, number>(allowed.map((v) => [v, 0]));
  for (const tags of rows) {
    for (const tag of new Set(tags ?? [])) {
      if (counts.has(tag)) counts.set(tag, counts.get(tag)! + 1);
    }
  }
  return allowed.map((value) => ({ value, count: counts.get(value)! }));
}

/** Published miracle count per `MIRACLE_TOPICS` value, in list order. */
export async function getTopicCounts(db: Db): Promise<BrowseCount[]> {
  const rows = await db.select({ topics: miracles.topics }).from(miracles).where(eq(miracles.published, true));
  return tally(rows.map((r) => r.topics), MIRACLE_TOPICS);
}

/** Published saint count per `SAINT_THEMES` value, in list order. */
export async function getThemeCounts(db: Db): Promise<BrowseCount[]> {
  const rows = await db.select({ themes: saints.themes }).from(saints).where(eq(saints.published, true));
  return tally(rows.map((r) => r.themes), SAINT_THEMES);
}

export function isIndexable(count: number): boolean {
  return count >= MIN_BROWSE_RECORDS;
}
