// Format of the content files (one JSON file per saint and per miracle) that the importer
// reads and the exporter writes. Enums come from the Drizzle schema so the format cannot drift
// from the database. Omitted optional keys mean NULL; there is no `published`, `id` or timestamp.
import { z } from "zod";
import {
  approvalAuthority,
  canonizationStage,
  canonizationType,
  contentTier,
  cureCharacteristics,
  datePrecision,
  dispensationReason,
  feastScope,
  gender,
  intercessoryMedium,
  locationType,
  miracleCategory,
  miracleType,
  recipientGender,
  recipientPrivacy,
  relationTypeEnum,
  sourceType,
  timingRelativeToSaintDeath,
} from "../src/db/schema";
import { MIRACLE_TOPICS, SAINT_THEMES } from "../src/db/topics";

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const slug = z.string().regex(SLUG_RE, "must be a lowercase-hyphen slug");
const text = z.string().min(1);
const bool = z.boolean();
const int = z.number().int();

// Dates stay plain YYYY-MM-DD strings (no JS Date, so no timezone shifts).
const isoDate = z.string().refine((s) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}, "must be a real YYYY-MM-DD date");

// numeric(precision, scale) as an exact string padded to the column scale ("45.12345" ->
// "45.1234500"), which is how Postgres returns it. Pure string work: no float formatting drift.
export function scaledDecimal(precision: number, scale: number) {
  return z
    .union([z.string(), z.number()])
    .transform((v, ctx) => {
      const s = typeof v === "number" ? String(v) : v;
      const m = /^(-?)(\d+)(?:\.(\d+))?$/.exec(s);
      if (!m) {
        ctx.addIssue({ code: "custom", message: `"${s}" is not a plain decimal` });
        return z.NEVER;
      }
      const [, sign, whole, frac = ""] = m;
      if (frac.length > scale || whole.replace(/^0+(?=\d)/, "").length > precision - scale) {
        ctx.addIssue({ code: "custom", message: `"${s}" does not fit numeric(${precision},${scale})` });
        return z.NEVER;
      }
      return `${sign}${whole}.${frac.padEnd(scale, "0")}`;
    });
}

const enumOf = <T extends readonly [string, ...string[]]>(e: { enumValues: T }) => z.enum(e.enumValues);

const sourceRow = z.strictObject({
  url: text,
  title: text.optional(),
  source_type: enumOf(sourceType),
  accessed_date: isoDate.optional(),
});

const imageRow = z.strictObject({
  url: text,
  caption: text.optional(),
  source_attribution: text.optional(),
});

const locationRow = z.strictObject({
  location_name: text,
  lat: scaledDecimal(9, 6).optional(),
  lng: scaledDecimal(9, 6).optional(),
  location_type: enumOf(locationType).default("shrine"),
});

const relationRow = z.strictObject({
  saint: slug,
  type: enumOf(relationTypeEnum),
});

export const saintFileSchema = z.strictObject({
  slug,
  name: text,
  saint_name: text.optional(),
  birth_name: text.optional(),
  birth_date: isoDate.optional(),
  birth_date_precision: enumOf(datePrecision).default("exact_day"),
  death_date: isoDate.optional(),
  death_date_precision: enumOf(datePrecision).default("exact_day"),
  feast_day: text.optional(),
  feast_month: int.min(1).max(12).optional(),
  feast_day_of_month: int.min(1).max(31).optional(),
  feast_easter_offset: int.optional(),
  feast_scope: enumOf(feastScope).optional(),
  feast_scope_detail: text.optional(),
  religious_order: text.optional(),
  nationality: text.optional(),
  ministry_country: text.optional(),
  beatification_date: isoDate.optional(),
  beatified_by: text.optional(),
  canonization_date: isoDate.optional(),
  canonized_by: text.optional(),
  canonization_type: enumOf(canonizationType).optional(),
  canonization_stage: enumOf(canonizationStage),
  patronage: z.array(text).optional(),
  themes: z.array(z.enum(SAINT_THEMES)).optional(),
  biography_short: text.optional(),
  gender: enumOf(gender).optional(),
  lay_person: bool.optional(),
  beatification_miracle_dispensed: bool.optional(),
  canonization_miracle_dispensed: bool.optional(),
  dispensation_reason: enumOf(dispensationReason).optional(),
  image_url: text.optional(),
  wikipedia_url: text.optional(),
  previous_slugs: z.array(slug).optional(),
  sources: z.array(sourceRow).optional(),
  locations: z.array(locationRow).optional(),
  relations: z.array(relationRow).optional(),
});

const coord = scaledDecimal(10, 7);

export const miracleFileSchema = z.strictObject({
  slug,
  title: text,
  miracle_category: enumOf(miracleCategory),
  type: enumOf(miracleType),
  topics: z.array(z.enum(MIRACLE_TOPICS)).optional(),
  date_of_event: isoDate.optional(),
  date_precision: enumOf(datePrecision),
  timing_relative_to_saint_death: enumOf(timingRelativeToSaintDeath),
  location_name: text.optional(),
  location_lat: coord.optional(),
  location_lng: coord.optional(),
  location_2_name: text.optional(),
  location_2_lat: coord.optional(),
  location_2_lng: coord.optional(),
  country: text.optional(),
  region: text.optional(),
  recipient_name: text.optional(),
  recipient_gender: enumOf(recipientGender).optional(),
  recipient_country: text.optional(),
  recipient_privacy: enumOf(recipientPrivacy),
  recipient_age_at_event: int.optional(),
  recipient_age_approximate: bool.optional(),
  medical_diagnosis: text.optional(),
  cure_details: text.optional(),
  cure_characteristics: enumOf(cureCharacteristics),
  was_medically_verified: bool,
  medical_verification_date: isoDate.optional(),
  intercessory_medium: enumOf(intercessoryMedium),
  approval_authority: enumOf(approvalAuthority).default("none"),
  vatican_decree_date: isoDate.optional(),
  vatican_medical_board_verdict: text.optional(),
  witness_count: int.optional(),
  used_for_beatification: bool,
  used_for_canonization: bool,
  feast_month: int.min(1).max(12).optional(),
  feast_day_of_month: int.min(1).max(31).optional(),
  feast_easter_offset: int.optional(),
  synopsis: text.optional(),
  content_tier: enumOf(contentTier).default("core"),
  previous_slugs: z.array(slug).optional(),
  sources: z.array(sourceRow).optional(),
  images: z.array(imageRow).optional(),
  saints: z.array(slug).optional(),
});

export type SaintFile = z.output<typeof saintFileSchema>;
export type MiracleFile = z.output<typeof miracleFileSchema>;

// Keys that are not columns of the entity's own table (child rows and slug history).
export const SAINT_NESTED_KEYS = ["previous_slugs", "sources", "locations", "relations"] as const;
export const MIRACLE_NESTED_KEYS = ["previous_slugs", "sources", "images", "saints"] as const;
