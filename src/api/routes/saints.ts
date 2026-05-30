import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
  PaginationQuerySchema,
  SaintDetailSchema,
  SaintListItemSchema,
  envelopeSchema,
} from "../schemas";

const saints = new OpenAPIHono();

saints.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: PaginationQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(z.array(SaintListItemSchema)) } },
        description: "List of saints",
      },
    },
  }),
  (c) => {
    const { page, limit } = c.req.valid("query");
    return c.json({ data: [], meta: { page, limit, total: 0 }, error: null });
  }
);

saints.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    request: { params: z.object({ slug: z.string() }) },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(SaintDetailSchema) } },
        description: "Saint detail",
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

export default saints;
