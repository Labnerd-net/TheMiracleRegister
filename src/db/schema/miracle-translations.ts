import { boolean, index, integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { miracles } from "./miracles";

export const miracleTranslations = pgTable(
  "miracle_translations",
  {
    id: serial("id").primaryKey(),
    miracle_id: integer("miracle_id")
      .notNull()
      .references(() => miracles.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    title: text("title"),
    synopsis: text("synopsis"),
    cure_details: text("cure_details"),
    medical_diagnosis: text("medical_diagnosis"),
    vatican_medical_board_verdict: text("vatican_medical_board_verdict"),
    reviewed: boolean("reviewed").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("miracle_translations_miracle_id_idx").on(t.miracle_id),
    unique("miracle_translations_miracle_id_locale_key").on(t.miracle_id, t.locale),
  ]
);
