CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'group');--> statement-breakpoint
CREATE TYPE "public"."recipient_gender" AS ENUM('male', 'female', 'not_applicable');--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "gender" "gender";--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "lay_person" boolean;--> statement-breakpoint
ALTER TABLE "miracles" ADD COLUMN "recipient_gender" "recipient_gender";--> statement-breakpoint
ALTER TABLE "miracles" ADD COLUMN "recipient_country" text;