import { integer, numeric, pgTable, serial, text } from "drizzle-orm/pg-core";
import { saints } from "./saints";
import { locationType } from "./enums";

export const saintLocations = pgTable("saint_locations", {
  id: serial("id").primaryKey(),
  saint_id: integer("saint_id")
    .notNull()
    .references(() => saints.id, { onDelete: "cascade" }),
  location_name: text("location_name").notNull(),
  lat: numeric("lat", { precision: 9, scale: 6 }),
  lng: numeric("lng", { precision: 9, scale: 6 }),
  location_type: locationType("location_type").notNull().default("shrine"),
});
