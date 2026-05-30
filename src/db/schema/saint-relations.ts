import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { relationTypeEnum } from "./enums";
import { saints } from "./saints";

export const saintRelations = pgTable(
  "saint_relations",
  {
    saint_id: integer("saint_id")
      .notNull()
      .references(() => saints.id),
    related_saint_id: integer("related_saint_id")
      .notNull()
      .references(() => saints.id),
    relation_type: relationTypeEnum("relation_type").notNull(),
  },
  (t) => [primaryKey({ columns: [t.saint_id, t.related_saint_id, t.relation_type] })]
);
