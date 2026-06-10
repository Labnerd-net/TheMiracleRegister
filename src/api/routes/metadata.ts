import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { MIRACLE_TOPICS, SAINT_THEMES } from "../../db/topics";
import { envelopeSchema } from "../schemas";

const MetadataSchema = z
  .object({
    miracle_types: z.array(z.object({ value: z.string(), label: z.string() })),
    miracle_categories: z.array(z.object({ value: z.string(), label: z.string() })),
    approval_authorities: z.array(z.object({ value: z.string(), label: z.string() })),
    miracle_topics: z.array(z.string()),
    saint_themes: z.array(z.string()),
  })
  .openapi("Metadata");

const MIRACLE_TYPES = [
  { value: "healing", label: "Healing" },
  { value: "nature", label: "Nature" },
  { value: "eucharistic", label: "Eucharistic" },
  { value: "stigmata", label: "Stigmata" },
  { value: "incorruptibility", label: "Incorruptibility" },
  { value: "apparition", label: "Apparition" },
  { value: "miraculous_image", label: "Miraculous Image" },
  { value: "prophecy", label: "Prophecy" },
  { value: "bilocation", label: "Bilocation" },
  { value: "other", label: "Other" },
] as const;

const MIRACLE_CATEGORIES = [
  { value: "intercessory", label: "Intercessory" },
  { value: "associated", label: "Associated" },
  { value: "apparition", label: "Apparition" },
] as const;

const APPROVAL_AUTHORITIES = [
  { value: "vatican_dicastery", label: "Vatican Approved" },
  { value: "lourdes_bureau", label: "Lourdes Bureau" },
  { value: "local_bishop", label: "Bishop Approved" },
  { value: "nihil_obstat", label: "Nihil Obstat" },
  { value: "none", label: "None" },
] as const;

const metadata = new OpenAPIHono();

metadata.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": { schema: envelopeSchema(MetadataSchema) },
        },
        description: "Canonical filter options for the API",
      },
    },
  }),
  (c) => {
    return c.json({
      data: {
        miracle_types: [...MIRACLE_TYPES],
        miracle_categories: [...MIRACLE_CATEGORIES],
        approval_authorities: [...APPROVAL_AUTHORITIES],
        miracle_topics: [...MIRACLE_TOPICS],
        saint_themes: [...SAINT_THEMES],
      },
      meta: null,
      error: null,
    });
  }
);

export default metadata;
