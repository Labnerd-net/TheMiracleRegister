import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { MiracleTypeItemSchema, envelopeSchema } from "../schemas";
import { miracleType } from "../../db/schema/enums";
import { humanizeSnakeCase } from "../../lib/format";

const MIRACLE_TYPES = miracleType.enumValues.map((type) => ({
  type,
  label: humanizeSnakeCase(type),
}));

const types = new OpenAPIHono();

types.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": { schema: envelopeSchema(z.array(MiracleTypeItemSchema)) },
        },
        description: "List of miracle types",
      },
    },
  }),
  (c) => {
    return c.json({ data: [...MIRACLE_TYPES], meta: null, error: null });
  }
);

export default types;
