ALTER TABLE "saints" ADD COLUMN "noted_for" text[];--> statement-breakpoint
ALTER TABLE "miracles" ADD COLUMN "topics" text[];--> statement-breakpoint
CREATE INDEX "saints_patronage_gin_idx" ON "saints" USING gin ("patronage");--> statement-breakpoint
CREATE INDEX "saints_noted_for_gin_idx" ON "saints" USING gin ("noted_for");--> statement-breakpoint
CREATE INDEX "miracles_topics_gin_idx" ON "miracles" USING gin ("topics");--> statement-breakpoint
ALTER TABLE "miracles" DROP COLUMN "subtype";--> statement-breakpoint
DROP TYPE "public"."miracle_subtype";