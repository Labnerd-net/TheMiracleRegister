CREATE TYPE "public"."canonization_stage" AS ENUM('saint', 'blessed', 'venerable', 'servant_of_god');--> statement-breakpoint
CREATE TYPE "public"."canonization_type" AS ENUM('confessor', 'martyr', 'virgin', 'married_couple', 'other');--> statement-breakpoint
CREATE TYPE "public"."cure_characteristics" AS ENUM('instant_complete', 'gradual_complete', 'instant_partial', 'gradual_partial', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."date_precision" AS ENUM('exact_day', 'month', 'year', 'decade', 'century', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."intercessory_medium" AS ENUM('prayer_only', 'relic', 'blessed_oil', 'medallion', 'visitation', 'tomb_prayer', 'saint_image', 'not_applicable', 'other');--> statement-breakpoint
CREATE TYPE "public"."miracle_category" AS ENUM('intercessory', 'associated');--> statement-breakpoint
CREATE TYPE "public"."miracle_subtype" AS ENUM('cancer', 'neurological', 'infectious', 'obstetric', 'orthopedic', 'gastrointestinal', 'cardiovascular', 'dermatological', 'respiratory', 'other');--> statement-breakpoint
CREATE TYPE "public"."miracle_type" AS ENUM('healing', 'nature', 'eucharistic', 'stigmata', 'incorruptibility', 'apparition', 'miraculous_image', 'prophecy', 'bilocation', 'other');--> statement-breakpoint
CREATE TYPE "public"."recipient_gender" AS ENUM('male', 'female', 'unknown', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."recipient_privacy" AS ENUM('public', 'first_name_only', 'confidential', 'not_applicable');--> statement-breakpoint
CREATE TYPE "public"."relation_type" AS ENUM('canonized_together', 'same_order');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('vatican_decree', 'news_article', 'book', 'academic', 'other');--> statement-breakpoint
CREATE TYPE "public"."timing_relative_to_saint_death" AS ENUM('during_lifetime', 'posthumous', 'not_applicable');--> statement-breakpoint
CREATE TABLE "saints" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"birth_name" text,
	"birth_date" date,
	"death_date" date,
	"feast_day" text,
	"religious_order" text,
	"nationality" text,
	"birth_place" text,
	"death_place" text,
	"beatification_date" date,
	"beatified_by" text,
	"canonization_date" date,
	"canonized_by" text,
	"canonization_type" "canonization_type",
	"canonization_stage" "canonization_stage" NOT NULL,
	"patronage" text[],
	"biography_short" text,
	"total_attributed_miracles" integer,
	"image_url" text,
	"wikipedia_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saints_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "saint_relations" (
	"saint_id" integer NOT NULL,
	"related_saint_id" integer NOT NULL,
	"relation_type" "relation_type" NOT NULL,
	CONSTRAINT "saint_relations_saint_id_related_saint_id_relation_type_pk" PRIMARY KEY("saint_id","related_saint_id","relation_type")
);
--> statement-breakpoint
CREATE TABLE "miracles" (
	"id" serial PRIMARY KEY NOT NULL,
	"saint_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"miracle_category" "miracle_category" NOT NULL,
	"type" "miracle_type" NOT NULL,
	"subtype" "miracle_subtype",
	"date_of_event" date,
	"date_precision" date_precision NOT NULL,
	"timing_relative_to_saint_death" "timing_relative_to_saint_death" NOT NULL,
	"location_name" text,
	"location_lat" numeric(10, 7),
	"location_lng" numeric(10, 7),
	"country" text,
	"region" text,
	"recipient_name" text,
	"recipient_privacy" "recipient_privacy" NOT NULL,
	"recipient_age_at_event" integer,
	"recipient_gender" "recipient_gender" NOT NULL,
	"medical_diagnosis" text,
	"cure_details" text,
	"cure_characteristics" "cure_characteristics" NOT NULL,
	"was_medically_verified" boolean NOT NULL,
	"medical_verification_date" date,
	"intercessory_medium" "intercessory_medium" NOT NULL,
	"vatican_recognized" boolean NOT NULL,
	"vatican_decree_date" date,
	"vatican_medical_board_verdict" text,
	"used_for_beatification" boolean NOT NULL,
	"used_for_canonization" boolean NOT NULL,
	"synopsis" text,
	"has_primary_sources" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "miracles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "miracle_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"miracle_id" integer NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"source_type" "source_type" NOT NULL,
	"accessed_date" date
);
--> statement-breakpoint
ALTER TABLE "saint_relations" ADD CONSTRAINT "saint_relations_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saint_relations" ADD CONSTRAINT "saint_relations_related_saint_id_saints_id_fk" FOREIGN KEY ("related_saint_id") REFERENCES "public"."saints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miracles" ADD CONSTRAINT "miracles_saint_id_saints_id_fk" FOREIGN KEY ("saint_id") REFERENCES "public"."saints"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miracle_sources" ADD CONSTRAINT "miracle_sources_miracle_id_miracles_id_fk" FOREIGN KEY ("miracle_id") REFERENCES "public"."miracles"("id") ON DELETE no action ON UPDATE no action;