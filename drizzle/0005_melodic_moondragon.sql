CREATE INDEX "miracles_saint_id_idx" ON "miracles" USING btree ("saint_id");--> statement-breakpoint
CREATE INDEX "miracles_type_idx" ON "miracles" USING btree ("type");--> statement-breakpoint
CREATE INDEX "miracles_country_idx" ON "miracles" USING btree ("country");