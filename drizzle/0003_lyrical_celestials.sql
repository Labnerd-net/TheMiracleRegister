ALTER TABLE "saints" ADD COLUMN "themes" text[];--> statement-breakpoint
CREATE INDEX "saints_themes_gin_idx" ON "saints" USING gin ("themes");