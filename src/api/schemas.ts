import { z } from "@hono/zod-openapi";
import { MIRACLE_TOPICS, SAINT_THEMES } from "../db/topics";
import {
  approvalAuthority,
  canonizationStage,
  canonizationType,
  cureCharacteristics,
  datePrecision,
  gender,
  intercessoryMedium,
  miracleCategory,
  miracleType,
  recipientGender,
  recipientPrivacy,
  relationTypeEnum,
  sourceType,
  timingRelativeToSaintDeath,
} from "../db/schema/enums";

const e = <T extends string>(vals: readonly T[]): z.ZodEnum<[T, ...T[]]> =>
  z.enum(vals as [T, ...T[]]);

// --- Shared ---

export const MetaSchema = z
  .object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    capped: z.boolean().optional(),
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
    saint_name: z.string().nullable(),
    canonization_stage: e(canonizationStage.enumValues),
    feast_day: z.string().nullable(),
    nationality: z.string().nullable(),
    image_url: z.string().nullable(),
  })
  .openapi("SaintListItem");

export const RelatedSaintSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string(),
    relation_type: e(relationTypeEnum.enumValues),
  })
  .openapi("RelatedSaint");

export const MiracleListItemSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    title: z.string(),
    type: e(miracleType.enumValues),
    topics: z.array(z.string()).nullable(),
    country: z.string().nullable(),
    date_of_event: z.string().nullable(),
    date_precision: e(datePrecision.enumValues),
    recipient_name: z.string().nullable(),
    was_medically_verified: z.boolean(),
    approval_authority: e(approvalAuthority.enumValues),
    cure_details: z.string().nullable(),
    used_for_beatification: z.boolean(),
    used_for_canonization: z.boolean(),
    saints: z.array(z.object({ id: z.number().int(), slug: z.string(), name: z.string() })),
  })
  .openapi("MiracleListItem");

export const SaintDetailSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    name: z.string(),
    saint_name: z.string().nullable(),
    birth_name: z.string().nullable(),
    birth_date: z.string().nullable(),
    death_date: z.string().nullable(),
    feast_day: z.string().nullable(),
    religious_order: z.string().nullable(),
    nationality: z.string().nullable(),
    beatification_date: z.string().nullable(),
    beatified_by: z.string().nullable(),
    canonization_date: z.string().nullable(),
    canonized_by: z.string().nullable(),
    canonization_type: e(canonizationType.enumValues).nullable(),
    canonization_stage: e(canonizationStage.enumValues),
    patronage: z.array(z.string()).nullable(),
    themes: z.array(z.string()).nullable(),
    biography_short: z.string().nullable(),
    gender: e(gender.enumValues).nullable(),
    lay_person: z.boolean().nullable(),
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
    source_type: e(sourceType.enumValues),
    accessed_date: z.string().nullable(),
  })
  .openapi("Source");

export const MiracleImageSchema = z
  .object({
    id: z.number().int(),
    url: z.string(),
    caption: z.string().nullable(),
    display_order: z.number().int(),
    source_attribution: z.string().nullable(),
  })
  .openapi("MiracleImage");

export const MiracleDetailSchema = z
  .object({
    id: z.number().int(),
    slug: z.string(),
    title: z.string(),
    miracle_category: e(miracleCategory.enumValues),
    type: e(miracleType.enumValues),
    topics: z.array(z.string()).nullable(),
    date_of_event: z.string().nullable(),
    date_precision: e(datePrecision.enumValues),
    timing_relative_to_saint_death: e(timingRelativeToSaintDeath.enumValues),
    location_name: z.string().nullable(),
    location_lat: z.string().nullable(),
    location_lng: z.string().nullable(),
    country: z.string().nullable(),
    region: z.string().nullable(),
    recipient_name: z.string().nullable(),
    recipient_gender: e(recipientGender.enumValues).nullable(),
    recipient_country: z.string().nullable(),
    recipient_privacy: e(recipientPrivacy.enumValues),
    recipient_age_at_event: z.number().int().nullable(),
    medical_diagnosis: z.string().nullable(),
    cure_details: z.string().nullable(),
    cure_characteristics: e(cureCharacteristics.enumValues),
    was_medically_verified: z.boolean(),
    medical_verification_date: z.string().nullable(),
    intercessory_medium: e(intercessoryMedium.enumValues),
    approval_authority: e(approvalAuthority.enumValues),
    vatican_decree_date: z.string().nullable(),
    vatican_medical_board_verdict: z.string().nullable(),
    used_for_beatification: z.boolean(),
    used_for_canonization: z.boolean(),
    witness_count: z.number().int().nullable(),
    synopsis: z.string().nullable(),
    has_primary_sources: z.boolean(),
    saints: z.array(z.object({ id: z.number().int(), slug: z.string(), name: z.string() })),
    sources: z.array(SourceSchema),
    images: z.array(MiracleImageSchema),
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
  type: e(miracleType.enumValues).optional(),
  topic: z.enum([...MIRACLE_TOPICS]).optional(),
  category: e(miracleCategory.enumValues).optional(),
  country: z.string().optional(),
  year_from: z.coerce.number().int().optional(),
  year_to: z.coerce.number().int().optional(),
  used_for_beatification: z.string().optional(),
  used_for_canonization: z.string().optional(),
  // "none" excluded — not a useful filter value
  approval_authority: z.enum(["vatican_dicastery", "lourdes_bureau", "local_bishop", "nihil_obstat"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(2).optional(),
  topic: z.enum([...MIRACLE_TOPICS, ...SAINT_THEMES]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
