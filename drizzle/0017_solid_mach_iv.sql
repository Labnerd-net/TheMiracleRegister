CREATE TYPE "public"."dispensation_reason" AS ENUM('martyr', 'equipollent', 'papal_exception');--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "beatification_miracle_dispensed" boolean;--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "canonization_miracle_dispensed" boolean;--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "dispensation_reason" "dispensation_reason";