CREATE TYPE "public"."location_type" AS ENUM('tomb', 'birthplace', 'death_place', 'shrine', 'relic', 'major_devotional_center', 'other');--> statement-breakpoint
CREATE TABLE "saint_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"saint_id" integer NOT NULL,
	"location_name" text NOT NULL,
	"lat" numeric(9, 6),
	"lng" numeric(9, 6),
	"location_type" "location_type" DEFAULT 'shrine' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saint_locations" ADD CONSTRAINT "saint_locations_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saints" DROP COLUMN "shrine_name";--> statement-breakpoint
ALTER TABLE "saints" DROP COLUMN "shrine_lat";--> statement-breakpoint
ALTER TABLE "saints" DROP COLUMN "shrine_lng";