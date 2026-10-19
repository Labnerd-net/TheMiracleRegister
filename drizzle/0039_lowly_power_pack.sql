CREATE TABLE "saint_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"saint_id" integer NOT NULL,
	"locale" text NOT NULL,
	"name" text,
	"saint_name" text,
	"biography_short" text,
	"reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saint_translations_saint_id_locale_key" UNIQUE("saint_id","locale")
);
--> statement-breakpoint
CREATE TABLE "miracle_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"miracle_id" integer NOT NULL,
	"locale" text NOT NULL,
	"title" text,
	"synopsis" text,
	"cure_details" text,
	"medical_diagnosis" text,
	"vatican_medical_board_verdict" text,
	"reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "miracle_translations_miracle_id_locale_key" UNIQUE("miracle_id","locale")
);
--> statement-breakpoint
ALTER TABLE "saint_translations" ADD CONSTRAINT "saint_translations_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miracle_translations" ADD CONSTRAINT "miracle_translations_miracle_id_miracles_id_fk" FOREIGN KEY ("miracle_id") REFERENCES "public"."miracles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saint_translations_saint_id_idx" ON "saint_translations" USING btree ("saint_id");--> statement-breakpoint
CREATE INDEX "miracle_translations_miracle_id_idx" ON "miracle_translations" USING btree ("miracle_id");