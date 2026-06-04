import { z } from "@hono/zod-openapi";

// --- Shared ---

export const MetaSchema = z
  .object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  })
  .openapi("Meta");

export function envelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    meta: MetaSchema.nullable(),
    error: z.string().nullable(),
  });
}

// --- Saints ---

export const SaintListItemSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string(),
    canonization_stage: z.enum(["saint", "blessed", "venerable", "servant_of_god"]),
    feast_day: z.string().nullable(),
    nationality: z.string().nullable(),
    image_url: z.string().nullable(),
    total_attributed_miracles: z.number().int().nullable(),
  })
  .openapi("SaintListItem");

export const RelatedSaintSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string(),
    relation_type: z.enum(["canonized_together", "same_order"]),
  })
  .openapi("RelatedSaint");

export const MiracleListItemSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    title: z.string(),
    type: z.enum([
      "healing", "nature", "eucharistic", "stigmata", "incorruptibility",
      "apparition", "miraculous_image", "prophecy", "bilocation", "other",
    ]),
    topics: z.array(z.string()).nullable(),
    country: z.string().nullable(),
    date_of_event: z.string().nullable(),
    date_precision: z.enum(["exact_day", "month", "year", "decade", "century", "unknown"]),
    recipient_name: z.string().nullable(),
    was_medically_verified: z.boolean(),
    vatican_recognized: z.boolean(),
    saint_id: z.number().int(),
  })
  .openapi("MiracleListItem");

export const SaintDetailSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string(),
    birth_name: z.string().nullable(),
    birth_date: z.string().nullable(),
    death_date: z.string().nullable(),
    feast_day: z.string().nullable(),
    religious_order: z.string().nullable(),
    nationality: z.string().nullable(),
    birth_place: z.string().nullable(),
    death_place: z.string().nullable(),
    beatification_date: z.string().nullable(),
    beatified_by: z.string().nullable(),
    canonization_date: z.string().nullable(),
    canonized_by: z.string().nullable(),
    canonization_type: z
      .enum(["confessor", "martyr", "virgin", "married_couple", "other"])
      .nullable(),
    canonization_stage: z.enum(["saint", "blessed", "venerable", "servant_of_god"]),
    patronage: z.array(z.string()).nullable(),
    themes: z.array(z.string()).nullable(),
    biography_short: z.string().nullable(),
    total_attributed_miracles: z.number().int().nullable(),
    image_url: z.string().nullable(),
    wikipedia_url: z.string().nullable(),
    related_saints: z.array(RelatedSaintSchema),
    miracles: z.array(MiracleListItemSchema),
  })
  .openapi("SaintDetail");

// --- Miracles ---

export const SourceSchema = z
  .object({
    id: z.number().int(),
    url: z.string(),
    title: z.string().nullable(),
    source_type: z.enum(["vatican_decree", "news_article", "book", "academic", "other"]),
    accessed_date: z.string().nullable(),
  })
  .openapi("Source");

export const MiracleDetailSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    title: z.string(),
    miracle_category: z.enum(["intercessory", "associated"]),
    type: z.enum([
      "healing", "nature", "eucharistic", "stigmata", "incorruptibility",
      "apparition", "miraculous_image", "prophecy", "bilocation", "other",
    ]),
    topics: z.array(z.string()).nullable(),
    date_of_event: z.string().nullable(),
    date_precision: z.enum(["exact_day", "month", "year", "decade", "century", "unknown"]),
    timing_relative_to_saint_death: z.enum(["during_lifetime", "posthumous", "not_applicable"]),
    location_name: z.string().nullable(),
    location_lat: z.string().nullable(),
    location_lng: z.string().nullable(),
    country: z.string().nullable(),
    region: z.string().nullable(),
    recipient_name: z.string().nullable(),
    recipient_privacy: z.enum(["public", "first_name_only", "confidential", "not_applicable"]),
    recipient_age_at_event: z.number().int().nullable(),
    medical_diagnosis: z.string().nullable(),
    cure_details: z.string().nullable(),
    cure_characteristics: z.enum([
      "instant_complete", "gradual_complete", "instant_partial", "gradual_partial", "not_applicable",
    ]),
    was_medically_verified: z.boolean(),
    medical_verification_date: z.string().nullable(),
    intercessory_medium: z.enum([
      "prayer_only", "relic", "blessed_oil", "medallion", "visitation",
      "tomb_prayer", "saint_image", "not_applicable", "other",
    ]),
    vatican_recognized: z.boolean(),
    vatican_decree_date: z.string().nullable(),
    vatican_medical_board_verdict: z.string().nullable(),
    used_for_beatification: z.boolean(),
    used_for_canonization: z.boolean(),
    synopsis: z.string().nullable(),
    has_primary_sources: z.boolean(),
    saint_id: z.number().int(),
    sources: z.array(SourceSchema),
  })
  .openapi("MiracleDetail");

// --- Types ---

export const MiracleTypeItemSchema = z
  .object({
    type: z.string(),
    label: z.string(),
  })
  .openapi("MiracleTypeItem");

// --- Search ---

export const SearchResultSchema = z
  .object({
    type: z.enum(["saint", "miracle"]),
    slug: z.string(),
    title: z.string(),
    excerpt: z.string().nullable(),
  })
  .openapi("SearchResult");

// --- Query params ---

export const MiraclesQuerySchema = z.object({
  saint_id: z.coerce.number().int().optional(),
  type: z
    .enum([
      "healing", "nature", "eucharistic", "stigmata", "incorruptibility",
      "apparition", "miraculous_image", "prophecy", "bilocation", "other",
    ])
    .optional(),
  country: z.string().optional(),
  year_from: z.coerce.number().int().optional(),
  year_to: z.coerce.number().int().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const SearchQuerySchema = z.object({
  q: z.string().optional(),
  topic: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
