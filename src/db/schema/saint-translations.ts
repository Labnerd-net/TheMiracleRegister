import { boolean, index, integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { saints } from "./saints";

export const saintTranslations = pgTable(
  "saint_translations",
  {
    id: serial("id").primaryKey(),
    saint_id: integer("saint_id")
      .notNull()
      .references(() => saints.id, { onDelete: "cascade" }),
    locale: text("locale").notNull(),
    name: text("name"),
    saint_name: text("saint_name"),
    biography_short: text("biography_short"),
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
    index("saint_translations_saint_id_idx").on(t.saint_id),
    unique("saint_translations_saint_id_locale_key").on(t.saint_id, t.locale),
  ]
);
