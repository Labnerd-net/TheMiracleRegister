import { boolean, date, index, integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import {
  approvalAuthority,
  contentTier,
  cureCharacteristics,
  datePrecision,
  intercessoryMedium,
  miracleCategory,
  miracleType,
  recipientGender,
  recipientPrivacy,
  timingRelativeToSaintDeath,
} from "./enums";

export const miracles = pgTable(
  "miracles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    miracle_category: miracleCategory("miracle_category").notNull(),
    type: miracleType("type").notNull(),
    topics: text("topics").array(),
    date_of_event: date("date_of_event"),
    date_precision: datePrecision("date_precision").notNull(),
    timing_relative_to_saint_death:
      timingRelativeToSaintDeath("timing_relative_to_saint_death").notNull(),
    location_name: text("location_name"),
    location_lat: numeric("location_lat", { precision: 10, scale: 7 }),
    location_lng: numeric("location_lng", { precision: 10, scale: 7 }),
    country: text("country"),
    region: text("region"),
    recipient_name: text("recipient_name"),
    recipient_gender: recipientGender("recipient_gender"),
    recipient_country: text("recipient_country"),
    recipient_privacy: recipientPrivacy("recipient_privacy").notNull(),
    recipient_age_at_event: integer("recipient_age_at_event"),
    recipient_age_approximate: boolean("recipient_age_approximate"),
    medical_diagnosis: text("medical_diagnosis"),
    cure_details: text("cure_details"),
    cure_characteristics: cureCharacteristics("cure_characteristics").notNull(),
    was_medically_verified: boolean("was_medically_verified").notNull(),
    medical_verification_date: date("medical_verification_date"),
    intercessory_medium: intercessoryMedium("intercessory_medium").notNull(),
    approval_authority: approvalAuthority("approval_authority").notNull().default("none"),
    vatican_decree_date: date("vatican_decree_date"),
    vatican_medical_board_verdict: text("vatican_medical_board_verdict"),
    witness_count: integer("witness_count"),
    used_for_beatification: boolean("used_for_beatification").notNull(),
    used_for_canonization: boolean("used_for_canonization").notNull(),
    synopsis: text("synopsis"),
    image_url: text("image_url"),
    has_primary_sources: boolean("has_primary_sources").notNull(),
    content_tier: contentTier("content_tier").notNull().default("core"),
    published: boolean("published").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("miracles_topics_gin_idx").using("gin", t.topics),
    index("miracles_type_idx").on(t.type),
    index("miracles_country_idx").on(t.country),
  ]
);
