import { pgEnum } from "drizzle-orm/pg-core";

export const canonizationType = pgEnum("canonization_type", [
  "confessor",
  "martyr",
  "virgin",
  "married_couple",
  "other",
]);

export const canonizationStage = pgEnum("canonization_stage", [
  "saint",
  "blessed",
  "venerable",
  "servant_of_god",
]);

export const relationTypeEnum = pgEnum("relation_type", [
  "canonized_together",
  "same_order",
  "family",
]);

export const miracleCategory = pgEnum("miracle_category", [
  "intercessory",
  "associated",
  "apparition",
]);

export const miracleType = pgEnum("miracle_type", [
  "healing",
  "nature",
  "eucharistic",
  "stigmata",
  "incorruptibility",
  "apparition",
  "miraculous_image",
  "prophecy",
  "bilocation",
  "other",
]);


export const datePrecision = pgEnum("date_precision", [
  "exact_day",
  "month",
  "year",
  "decade",
  "century",
  "unknown",
]);

export const timingRelativeToSaintDeath = pgEnum(
  "timing_relative_to_saint_death",
  ["during_lifetime", "posthumous", "not_applicable"]
);

export const recipientPrivacy = pgEnum("recipient_privacy", [
  "public",
  "first_name_only",
  "confidential",
  "not_applicable",
]);

export const cureCharacteristics = pgEnum("cure_characteristics", [
  "instant_complete",
  "gradual_complete",
  "instant_partial",
  "gradual_partial",
  "not_applicable",
]);

export const intercessoryMedium = pgEnum("intercessory_medium", [
  "prayer_only",
  "relic",
  "blessed_oil",
  "medallion",
  "visitation",
  "tomb_prayer",
  "saint_image",
  "not_applicable",
  "other",
]);

export const contentTier = pgEnum("content_tier", [
  "core",
  "catalog",
  "stub",
]);

export const locationType = pgEnum("location_type", [
  "tomb",
  "birthplace",
  "death_place",
  "shrine",
  "relic",
  "major_devotional_center",
  "other",
]);

export const sourceType = pgEnum("source_type", [
  "vatican_decree",
  "news_article",
  "book",
  "academic",
  "other",
]);

export const gender = pgEnum("gender", [
  "male",
  "female",
  "group",
]);

export const recipientGender = pgEnum("recipient_gender", [
  "male",
  "female",
  "not_applicable",
]);

export const dispensationReason = pgEnum("dispensation_reason", [
  "martyr",
  "equipollent",
  "papal_exception",
]);

export const approvalAuthority = pgEnum("approval_authority", [
  "vatican_dicastery",
  "lourdes_bureau",
  "local_bishop",
  "nihil_obstat",
  "none",
]);

export const feastScope = pgEnum("feast_scope", [
  "universal",
  "national",
  "order",
  "diocesan",
]);
