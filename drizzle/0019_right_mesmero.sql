CREATE TYPE "public"."approval_authority" AS ENUM('vatican_dicastery', 'lourdes_bureau', 'local_bishop', 'none');--> statement-breakpoint
ALTER TYPE "public"."miracle_category" ADD VALUE 'apparition';--> statement-breakpoint
ALTER TABLE "miracles" ADD COLUMN "approval_authority" "approval_authority" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "miracles" ADD COLUMN "witness_count" integer;--> statement-breakpoint
ALTER TABLE "miracles" DROP COLUMN "vatican_recognized";