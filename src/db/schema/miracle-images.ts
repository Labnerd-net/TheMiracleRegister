import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { miracles } from "./miracles";

export const miracleImages = pgTable("miracle_images", {
  id: serial("id").primaryKey(),
  miracle_id: integer("miracle_id")
    .notNull()
    .references(() => miracles.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  display_order: integer("display_order").notNull().default(0),
  source_attribution: text("source_attribution"),
});
