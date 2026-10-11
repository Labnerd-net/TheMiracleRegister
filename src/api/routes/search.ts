import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createDb } from "../../db";
import { searchContent } from "../../lib/search";
import { SearchQuerySchema, SearchResultSchema, envelopeSchema } from "../schemas";
import { badRequest, validationHook } from "../errors";
import type { ApiEnv } from "../env";

const search = new OpenAPIHono<ApiEnv>({ defaultHook: validationHook });

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
      400: {
        content: { "application/json": { schema: envelopeSchema(z.null()) } },
        description: "Invalid parameters",
      },
    },
  }),
  async (c) => {
    const { q, topic, page, limit } = c.req.valid("query");

    if (!q && !topic) {
      return badRequest(c, "Provide q or topic");
    }

    const db = createDb(c.env.DATABASE_URL);
    const { results, total } = await searchContent(db, { q, topic, limit, offset: (page - 1) * limit });

    return c.json({ data: results, meta: { page, limit, total }, error: null }, 200);
  }
);

export default search;
