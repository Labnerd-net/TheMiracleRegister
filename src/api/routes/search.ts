import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { SearchQuerySchema, SearchResultSchema, envelopeSchema } from "../schemas";

const search = new OpenAPIHono();

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
  (c) => {
    const { page, limit } = c.req.valid("query");
    return c.json({ data: [], meta: { page, limit, total: 0 }, error: null });
  }
);

export default search;
