import { and, eq, ilike, or, sql } from "drizzle-orm";
import type { createDb } from "../db";
import { miracles, saints } from "../db/schema";

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
  perEntityLimit?: number;
};

export async function searchContent(
  db: ReturnType<typeof createDb>,
  { q, topic, excerptLength = 200, perEntityLimit = 100 }: SearchParams
): Promise<{ results: SearchResult[]; capped: boolean }> {
  const seen = new Set<string>();
  const results: SearchResult[] = [];
  let capped = false;

  const push = (r: SearchResult) => {
    const key = `${r.type}:${r.slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(r);
    }
  };

  if (q) {
    const pattern = `%${q}%`;
    const [matchingSaints, matchingMiracles] = await Promise.all([
      db
        .select({
          slug: saints.slug,
          name: saints.name,
          excerpt: sql<string | null>`LEFT(${saints.biography_short}, ${excerptLength})`,
        })
        .from(saints)
        .where(
          and(eq(saints.published, true), or(ilike(saints.name, pattern), ilike(saints.biography_short, pattern)))
        )
        .limit(perEntityLimit),
      db
        .select({
          slug: miracles.slug,
          title: miracles.title,
          excerpt: sql<string | null>`LEFT(${miracles.synopsis}, ${excerptLength})`,
        })
        .from(miracles)
        .where(
          and(
            eq(miracles.published, true),
            or(
              ilike(miracles.title, pattern),
              ilike(miracles.synopsis, pattern),
              ilike(miracles.medical_diagnosis, pattern),
              ilike(miracles.cure_details, pattern)
            )
          )
        )
        .limit(perEntityLimit),
    ]);

    if (matchingSaints.length >= perEntityLimit || matchingMiracles.length >= perEntityLimit) capped = true;
    for (const s of matchingSaints) push({ type: "saint", slug: s.slug, title: s.name, excerpt: s.excerpt });
    for (const m of matchingMiracles) push({ type: "miracle", slug: m.slug, title: m.title, excerpt: m.excerpt });
  }

  if (topic) {
    const [matchingSaints, matchingMiracles] = await Promise.all([
      db
        .select({ slug: saints.slug, name: saints.name })
        .from(saints)
        .where(
          and(
            eq(saints.published, true),
            or(sql`${topic} = ANY(${saints.patronage})`, sql`${topic} = ANY(${saints.themes})`)
          )
        )
        .limit(perEntityLimit),
      db
        .select({
          slug: miracles.slug,
          title: miracles.title,
          excerpt: sql<string | null>`LEFT(${miracles.synopsis}, ${excerptLength})`,
        })
        .from(miracles)
        .where(and(eq(miracles.published, true), sql`${topic} = ANY(${miracles.topics})`))
        .limit(perEntityLimit),
    ]);

    if (matchingSaints.length >= perEntityLimit || matchingMiracles.length >= perEntityLimit) capped = true;
    for (const s of matchingSaints) push({ type: "saint", slug: s.slug, title: s.name, excerpt: null });
    for (const m of matchingMiracles) push({ type: "miracle", slug: m.slug, title: m.title, excerpt: m.excerpt });
  }

  return { results, capped };
}
