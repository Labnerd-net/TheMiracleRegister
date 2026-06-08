import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { miracles } from "./miracles";
import { saints } from "./saints";

export const miracleSaints = pgTable(
  "miracle_saints",
  {
    miracle_id: integer("miracle_id")
      .notNull()
      .references(() => miracles.id, { onDelete: "cascade" }),
    saint_id: integer("saint_id")
      .notNull()
      .references(() => saints.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.miracle_id, t.saint_id] })]
);
