import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { miracles, saints } from "../../db/schema";
import { SearchQuerySchema, SearchResultSchema, envelopeSchema } from "../schemas";
import type { ApiEnv } from "../env";

type SearchResult = { type: "saint" | "miracle"; slug: string; title: string; excerpt: string | null };

const search = new OpenAPIHono<ApiEnv>();

search.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: SearchQuerySchema },
    responses: {
      200: {
        content: {
          "application/json": { schema: envelopeSchema(z.array(SearchResultSchema)) },
        },
        description: "Search results",
      },
    },
  }),
  async (c) => {
    const { q, topic, page, limit } = c.req.valid("query");

    if (!q && !topic) {
      return c.json({ data: [], meta: { page, limit, total: 0 }, error: "Provide q or topic" });
    }

    const db = createDb(c.env.DATABASE_URL);
    const seen = new Set<string>();
    const results: SearchResult[] = [];

    const push = (r: SearchResult) => {
      const key = `${r.type}:${r.slug}`;
      if (!seen.has(key)) { seen.add(key); results.push(r); }
    };

    if (q) {
      const pattern = `%${q}%`;
      const [matchingSaints, matchingMiracles] = await Promise.all([
        db
          .select({
            slug: saints.slug,
            name: saints.name,
            excerpt: sql<string | null>`LEFT(${saints.biography_short}, 200)`,
          })
          .from(saints)
          .where(and(eq(saints.published, true), or(ilike(saints.name, pattern), ilike(saints.biography_short, pattern)))),
        db
          .select({
            slug: miracles.slug,
            title: miracles.title,
            excerpt: sql<string | null>`LEFT(${miracles.synopsis}, 200)`,
          })
          .from(miracles)
          .where(
            and(
              eq(miracles.published, true),
              or(
                ilike(miracles.title, pattern),
                ilike(miracles.synopsis, pattern),
                ilike(miracles.medical_diagnosis, pattern),
                ilike(miracles.cure_details, pattern),
              )
            )
          ),
      ]);

      for (const s of matchingSaints) push({ type: "saint", slug: s.slug, title: s.name, excerpt: s.excerpt });
      for (const m of matchingMiracles) push({ type: "miracle", slug: m.slug, title: m.title, excerpt: m.excerpt });
    }

    if (topic) {
      const [matchingSaints, matchingMiracles] = await Promise.all([
        db
          .select({ slug: saints.slug, name: saints.name })
          .from(saints)
          .where(and(eq(saints.published, true), or(sql`${topic} = ANY(${saints.patronage})`, sql`${topic} = ANY(${saints.themes})`))),
        db
          .select({
            slug: miracles.slug,
            title: miracles.title,
            excerpt: sql<string | null>`LEFT(${miracles.synopsis}, 200)`,
          })
          .from(miracles)
          .where(and(eq(miracles.published, true), sql`${topic} = ANY(${miracles.topics})`)),
      ]);

      for (const s of matchingSaints) push({ type: "saint", slug: s.slug, title: s.name, excerpt: null });
      for (const m of matchingMiracles) push({ type: "miracle", slug: m.slug, title: m.title, excerpt: m.excerpt });
    }

    const offset = (page - 1) * limit;
    const paged = results.slice(offset, offset + limit);

    return c.json({ data: paged, meta: { page, limit, total: results.length }, error: null });
  }
);

export default search;
