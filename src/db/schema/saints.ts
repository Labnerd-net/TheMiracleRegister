import {
  date,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { canonizationStage, canonizationType } from "./enums";

export const saints = pgTable(
  "saints",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    birth_name: text("birth_name"),
    birth_date: date("birth_date"),
    death_date: date("death_date"),
    feast_day: text("feast_day"),
    religious_order: text("religious_order"),
    nationality: text("nationality"),
    birth_place: text("birth_place"),
    death_place: text("death_place"),
    beatification_date: date("beatification_date"),
    beatified_by: text("beatified_by"),
    canonization_date: date("canonization_date"),
    canonized_by: text("canonized_by"),
    canonization_type: canonizationType("canonization_type"),
    canonization_stage: canonizationStage("canonization_stage").notNull(),
    patronage: text("patronage").array(),
    noted_for: text("noted_for").array(),
    biography_short: text("biography_short"),
    total_attributed_miracles: integer("total_attributed_miracles"),
    image_url: text("image_url"),
    wikipedia_url: text("wikipedia_url"),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("saints_patronage_gin_idx").using("gin", t.patronage),
    index("saints_noted_for_gin_idx").using("gin", t.noted_for),
  ]
);
