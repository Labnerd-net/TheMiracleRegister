import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { or, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { miracles, saints } from "../../db/schema";
import { SearchQuerySchema, SearchResultSchema, envelopeSchema } from "../schemas";
import type { ApiEnv } from "../env";

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
    const results: Array<{ type: "saint" | "miracle"; slug: string; title: string; excerpt: string | null }> = [];

    if (topic) {
      const matchingSaints = await db
        .select({ slug: saints.slug, name: saints.name })
        .from(saints)
        .where(
          or(
            sql`${topic} = ANY(${saints.patronage})`,
            sql`${topic} = ANY(${saints.themes})`
          )
        );

      const matchingMiracles = await db
        .select({ slug: miracles.slug, title: miracles.title, synopsis: miracles.synopsis })
        .from(miracles)
        .where(sql`${topic} = ANY(${miracles.topics})`);

      for (const s of matchingSaints) {
        results.push({ type: "saint", slug: s.slug, title: s.name, excerpt: null });
      }
      for (const m of matchingMiracles) {
        results.push({
          type: "miracle",
          slug: m.slug,
          title: m.title,
          excerpt: m.synopsis ? m.synopsis.slice(0, 200) : null,
        });
      }
    }

    const offset = (page - 1) * limit;
    const paged = results.slice(offset, offset + limit);

    return c.json({
      data: paged,
      meta: { page, limit, total: results.length },
      error: null,
    });
  }
);

export default search;
