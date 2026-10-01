CREATE TYPE "public"."slug_entity_type" AS ENUM('saint', 'miracle');--> statement-breakpoint
CREATE TABLE "slug_redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" "slug_entity_type" NOT NULL,
	"old_slug" text NOT NULL,
	"new_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "slug_redirects_entity_old_slug_unique" UNIQUE("entity_type","old_slug")
);
