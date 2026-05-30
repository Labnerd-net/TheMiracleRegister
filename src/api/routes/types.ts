import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { MiracleTypeItemSchema, envelopeSchema } from "../schemas";

const MIRACLE_TYPES = [
  { type: "healing", label: "Healing" },
  { type: "nature", label: "Nature" },
  { type: "eucharistic", label: "Eucharistic" },
  { type: "stigmata", label: "Stigmata" },
  { type: "incorruptibility", label: "Incorruptibility" },
  { type: "apparition", label: "Apparition" },
  { type: "miraculous_image", label: "Miraculous Image" },
  { type: "prophecy", label: "Prophecy" },
  { type: "bilocation", label: "Bilocation" },
  { type: "other", label: "Other" },
] as const;

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
