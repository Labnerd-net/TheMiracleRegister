import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  MiracleDetailSchema,
  MiracleListItemSchema,
  MiraclesQuerySchema,
  envelopeSchema,
} from "../schemas";

const miracles = new OpenAPIHono();

miracles.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: MiraclesQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(z.array(MiracleListItemSchema)) } },
        description: "List of miracles",
      },
    },
  }),
  (c) => {
    const { page, limit } = c.req.valid("query");
    return c.json({ data: [], meta: { page, limit, total: 0 }, error: null });
  }
);

miracles.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    request: { params: z.object({ slug: z.string() }) },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(MiracleDetailSchema) } },
        description: "Miracle detail",
      },
      404: {
        content: { "application/json": { schema: envelopeSchema(z.null()) } },
        description: "Not found",
      },
    },
  }),
  (c) => {
    return c.json({ data: null, meta: null, error: "Not found" }, 404);
  }
);

export default miracles;
