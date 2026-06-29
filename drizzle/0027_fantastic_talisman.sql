CREATE TYPE "public"."feast_scope" AS ENUM('universal', 'national', 'order', 'diocesan');--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "feast_scope" "feast_scope";--> statement-breakpoint
ALTER TABLE "saints" ADD COLUMN "feast_scope_detail" text;