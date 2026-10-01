import { date, index, integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { sourceType } from "./enums";
import { miracles } from "./miracles";

export const miracleSources = pgTable(
  "miracle_sources",
  {
    id: serial("id").primaryKey(),
    miracle_id: integer("miracle_id")
      .notNull()
      .references(() => miracles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    title: text("title"),
    source_type: sourceType("source_type").notNull(),
    accessed_date: date("accessed_date"),
  },
  (t) => [index("miracle_sources_miracle_id_idx").on(t.miracle_id)]
);
