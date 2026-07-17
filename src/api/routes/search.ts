import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { searchContent } from "../../lib/search";
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
    const { results, capped } = await searchContent(db, { q, topic });

    const offset = (page - 1) * limit;
    const paged = results.slice(offset, offset + limit);

    return c.json({ data: paged, meta: { page, limit, total: results.length, ...(capped && { capped: true }) }, error: null });
  }
);

export default search;
