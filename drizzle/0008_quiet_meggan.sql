CREATE TYPE "public"."content_tier" AS ENUM('core', 'catalog', 'stub');--> statement-breakpoint
ALTER TABLE "miracles" ADD COLUMN "content_tier" "content_tier" DEFAULT 'core' NOT NULL;