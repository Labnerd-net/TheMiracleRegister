ALTER TABLE "miracle_sources" DROP CONSTRAINT "miracle_sources_miracle_id_miracles_id_fk";
--> statement-breakpoint
ALTER TABLE "saint_sources" DROP CONSTRAINT "saint_sources_saint_id_saints_id_fk";
--> statement-breakpoint
ALTER TABLE "miracle_sources" ADD CONSTRAINT "miracle_sources_miracle_id_miracles_id_fk" FOREIGN KEY ("miracle_id") REFERENCES "public"."miracles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saint_sources" ADD CONSTRAINT "saint_sources_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE cascade ON UPDATE no action;