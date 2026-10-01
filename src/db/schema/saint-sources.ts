import { date, index, integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { sourceType } from "./enums";
import { saints } from "./saints";

export const saintSources = pgTable(
  "saint_sources",
  {
    id: serial("id").primaryKey(),
    saint_id: integer("saint_id")
      .notNull()
      .references(() => saints.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    source_type: sourceType("source_type").notNull(),
    accessed_date: date("accessed_date"),
  },
  (t) => [index("saint_sources_saint_id_idx").on(t.saint_id)]
);
