import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { slugEntityType } from "./enums";

// Rows are written by the rename triggers (drizzle/0032_slug_redirect_triggers.sql), not by hand.
export const slugRedirects = pgTable(
  "slug_redirects",
  {
    id: serial("id").primaryKey(),
    entity_type: slugEntityType("entity_type").notNull(),
    old_slug: text("old_slug").notNull(),
    new_slug: text("new_slug").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("slug_redirects_entity_old_slug_unique").on(t.entity_type, t.old_slug)],
);
