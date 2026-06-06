CREATE TABLE "saint_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"saint_id" integer NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"source_type" "source_type" NOT NULL,
	"accessed_date" date
);
--> statement-breakpoint
ALTER TABLE "saint_sources" ADD CONSTRAINT "saint_sources_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE no action ON UPDATE no action;