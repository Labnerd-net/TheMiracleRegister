CREATE TABLE "miracle_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"miracle_id" integer NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"source_attribution" text
);
--> statement-breakpoint
ALTER TABLE "miracle_images" ADD CONSTRAINT "miracle_images_miracle_id_miracles_id_fk" FOREIGN KEY ("miracle_id") REFERENCES "public"."miracles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "miracle_images" ("miracle_id", "url", "display_order") SELECT "id", "image_url", 0 FROM "miracles" WHERE "image_url" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "miracles" DROP COLUMN "image_url";