import { sql, type SQL } from "drizzle-orm";
import { likeContains } from "./like";
import type { createDb } from "../db";

export type SearchResult = {
  type: "saint" | "miracle";
  slug: string;
  title: string;
  excerpt: string | null;
};

export type SearchParams = {
  q?: string;
  topic?: string;
  excerptLength?: number;
  limit?: number;
  offset?: number;
};

type Row = { type: "saint" | "miracle" | null; slug: string | null; title: string | null; excerpt: string | null; total: number };

/**
 * Full-text search over published saints and miracles.
 *
 * `q` is matched with `websearch_to_tsquery` against the generated `search_vector` columns
 * (migration 0037): stemmed, accent-insensitive, every word must appear, and `"phrases"`, `OR` and
 * `-exclusions` work. A saint name or miracle title that merely contains `q` as a substring also
 * matches, so a partial name such as "Bern" still finds "Bernadette". A name or title containing `q`
 * sorts first; the rest are ranked by `ts_rank_cd` (title and name weigh most), then title, type and
 * slug for a stable order.
 *
 * `topic` filters by saint patronage/theme or miracle topic. With both `q` and `topic`, a result must
 * satisfy both. Ordering, paging and the total are computed in SQL.
 */
export async function searchContent(
  db: ReturnType<typeof createDb>,
  { q, topic, excerptLength = 200, limit = 20, offset = 0 }: SearchParams
): Promise<{ results: SearchResult[]; total: number }> {
  if (!q && !topic) return { results: [], total: 0 };

  const tsq = q ? sql`websearch_to_tsquery('english', immutable_unaccent(${q}::text))` : null;
  const pattern = q ? likeContains(q) : null;

  const labelHit = (label: SQL): SQL => sql`immutable_unaccent(${label}) ILIKE immutable_unaccent(${pattern}::text)`;
  const textMatch = (vector: SQL, label: SQL): SQL | null => (tsq ? sql`(${vector} @@ ${tsq} OR ${labelHit(label)})` : null);
  const titleHit = (label: SQL): SQL => (tsq ? labelHit(label) : sql`false`);
  const rank = (vector: SQL): SQL => (tsq ? sql`ts_rank_cd(${vector}, ${tsq})` : sql`0::real`);
  const where = (parts: (SQL | null)[]): SQL => sql.join(parts.filter((p): p is SQL => p !== null), sql` AND `);

  const saintHits = sql`
    SELECT 'saint'::text AS type, s.slug, s.name AS title, LEFT(s.biography_short, ${excerptLength}) AS excerpt,
           ${titleHit(sql`s.name`)} AS title_hit, ${rank(sql`s.search_vector`)} AS rank
    FROM saints s
    WHERE ${where([
      sql`s.published`,
      textMatch(sql`s.search_vector`, sql`s.name`),
      topic ? sql`(${topic}::text = ANY(s.patronage) OR ${topic}::text = ANY(s.themes))` : null,
    ])}`;
  const miracleHits = sql`
    SELECT 'miracle'::text AS type, m.slug, m.title, LEFT(m.synopsis, ${excerptLength}) AS excerpt,
           ${titleHit(sql`m.title`)} AS title_hit, ${rank(sql`m.search_vector`)} AS rank
    FROM miracles m
    WHERE ${where([
      sql`m.published`,
      textMatch(sql`m.search_vector`, sql`m.title`),
      topic ? sql`${topic}::text = ANY(m.topics)` : null,
    ])}`;

  // The count and the page come from one statement. The outer join on the count keeps one row
  // (with a null slug) when the requested page is past the last result, so total is still known.
  const { rows } = (await db.execute(sql`
    WITH hits AS (${saintHits} UNION ALL ${miracleHits}),
    page AS (
      SELECT * FROM hits ORDER BY title_hit DESC, rank DESC, title ASC, type ASC, slug ASC LIMIT ${limit} OFFSET ${offset}
    )
    SELECT p.type, p.slug, p.title, p.excerpt, c.total
    FROM (SELECT count(*)::int AS total FROM hits) c
    LEFT JOIN page p ON true
    ORDER BY p.title_hit DESC, p.rank DESC NULLS LAST, p.title ASC, p.type ASC, p.slug ASC
  `)) as unknown as { rows: Row[] };

  const results: SearchResult[] = [];
  for (const r of rows) {
    if (r.type && r.slug && r.title !== null) results.push({ type: r.type, slug: r.slug, title: r.title, excerpt: r.excerpt });
  }
  return { results, total: rows[0]?.total ?? 0 };
}
