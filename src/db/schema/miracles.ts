import { boolean, date, integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import {
  cureCharacteristics,
  datePrecision,
  intercessoryMedium,
  miracleCategory,
  miracleSubtype,
  miracleType,
  recipientGender,
  recipientPrivacy,
  timingRelativeToSaintDeath,
} from "./enums";
import { saints } from "./saints";

export const miracles = pgTable("miracles", {
  id: serial("id").primaryKey(),
  saint_id: integer("saint_id")
    .notNull()
    .references(() => saints.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  miracle_category: miracleCategory("miracle_category").notNull(),
  type: miracleType("type").notNull(),
  subtype: miracleSubtype("subtype"),
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
  recipient_privacy: recipientPrivacy("recipient_privacy").notNull(),
  recipient_age_at_event: integer("recipient_age_at_event"),
  recipient_gender: recipientGender("recipient_gender").notNull(),
  medical_diagnosis: text("medical_diagnosis"),
  cure_details: text("cure_details"),
  cure_characteristics: cureCharacteristics("cure_characteristics").notNull(),
  was_medically_verified: boolean("was_medically_verified").notNull(),
  medical_verification_date: date("medical_verification_date"),
  intercessory_medium: intercessoryMedium("intercessory_medium").notNull(),
  vatican_recognized: boolean("vatican_recognized").notNull(),
  vatican_decree_date: date("vatican_decree_date"),
  vatican_medical_board_verdict: text("vatican_medical_board_verdict"),
  used_for_beatification: boolean("used_for_beatification").notNull(),
  used_for_canonization: boolean("used_for_canonization").notNull(),
  synopsis: text("synopsis"),
  has_primary_sources: boolean("has_primary_sources").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
