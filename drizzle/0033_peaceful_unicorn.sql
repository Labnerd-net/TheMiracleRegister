CREATE INDEX "miracle_saints_saint_id_idx" ON "miracle_saints" USING btree ("saint_id");--> statement-breakpoint
CREATE INDEX "miracle_sources_miracle_id_idx" ON "miracle_sources" USING btree ("miracle_id");--> statement-breakpoint
CREATE INDEX "miracle_images_miracle_id_display_order_idx" ON "miracle_images" USING btree ("miracle_id","display_order");--> statement-breakpoint
CREATE INDEX "saint_sources_saint_id_idx" ON "saint_sources" USING btree ("saint_id");--> statement-breakpoint
CREATE INDEX "saint_locations_saint_id_idx" ON "saint_locations" USING btree ("saint_id");