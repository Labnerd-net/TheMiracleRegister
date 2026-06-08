CREATE TABLE "miracle_saints" (
	"miracle_id" integer NOT NULL,
	"saint_id" integer NOT NULL,
	CONSTRAINT "miracle_saints_miracle_id_saint_id_pk" PRIMARY KEY("miracle_id","saint_id")
);
--> statement-breakpoint
ALTER TABLE "miracles" DROP CONSTRAINT "miracles_saint_id_saints_id_fk";
--> statement-breakpoint
DROP INDEX "miracles_saint_id_idx";--> statement-breakpoint
ALTER TABLE "miracle_saints" ADD CONSTRAINT "miracle_saints_miracle_id_miracles_id_fk" FOREIGN KEY ("miracle_id") REFERENCES "public"."miracles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miracle_saints" ADD CONSTRAINT "miracle_saints_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "miracle_saints" ("miracle_id", "saint_id") SELECT "id", "saint_id" FROM "miracles";--> statement-breakpoint
ALTER TABLE "miracles" DROP COLUMN "saint_id";