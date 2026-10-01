import * as schema from "../../src/db/schema";
import type { TestDb } from "./testDb";

// Fixed, fictional dataset. Tests assert against these exact records.
//
// Saints:    saint-alpha (published, saint)      saint-beta (published, blessed)
//            saint-gamma (UNPUBLISHED)
// Miracles (list order is date_of_event asc, nulls last):
//   m-confidential       1800  nature/associated  France    beta + gamma(unpub)  privacy confidential
//   m-hidden-saint-only  1900  healing            Spain     gamma(unpub) only
//   m-healing-ann        1950  healing            France    alpha                privacy public
//   m-first-name         2001  healing            Italy     alpha + beta         privacy first_name_only
//   m-apparition         null  apparition         Portugal  beta                 privacy not_applicable
//   m-unpublished        1950  healing            France    alpha                UNPUBLISHED
// Free-text search terms are unique per record: shrine (title), lanterns (synopsis),
// quartz (diagnosis), harmonic (cure_details).

const miracleDefaults = {
  miracle_category: "intercessory",
  type: "healing",
  date_precision: "year",
  timing_relative_to_saint_death: "posthumous",
  recipient_privacy: "public",
  cure_characteristics: "instant_complete",
  was_medically_verified: true,
  intercessory_medium: "prayer_only",
  approval_authority: "none",
  used_for_beatification: false,
  used_for_canonization: false,
  published: true,
} as const;

export type SeedIds = {
  saints: Record<"alpha" | "beta" | "gamma", number>;
  miracles: Record<
    "confidential" | "hiddenSaintOnly" | "healingAnn" | "firstName" | "apparition" | "unpublished",
    number
  >;
};

export async function seed(db: TestDb): Promise<SeedIds> {
  const [alpha, beta, gamma] = await db
    .insert(schema.saints)
    .values([
      {
        slug: "saint-alpha",
        name: "Saint Alpha",
        canonization_stage: "saint",
        religious_order: "Franciscan",
        nationality: "Italy",
        themes: ["hope", "marian"],
        patronage: ["nurses"],
        biography_short: "Alpha devoted his life to the poor.",
        published: true,
      },
      {
        slug: "saint-beta",
        name: "Blessed Beta",
        canonization_stage: "blessed",
        religious_order: "Jesuit",
        nationality: "France",
        themes: ["perseverance"],
        patronage: ["teachers"],
        biography_short: "Beta taught orphans.",
        published: true,
      },
      {
        slug: "saint-gamma",
        name: "Hidden Gamma",
        canonization_stage: "saint",
        religious_order: "Franciscan",
        nationality: "Italy",
        themes: ["hope"],
        biography_short: "Gamma devoted herself to hidden work.",
        published: false,
      },
    ])
    .returning({ id: schema.saints.id });

  const [confidential, hiddenSaintOnly, healingAnn, firstName, apparition, unpublished] = await db
    .insert(schema.miracles)
    .values([
      {
        ...miracleDefaults,
        slug: "m-confidential",
        title: "Nature Sign Over the Valley",
        miracle_category: "associated",
        type: "nature",
        topics: ["veterans", "children"],
        date_of_event: "1800-01-01",
        country: "France",
        recipient_name: "Carl Nobody",
        recipient_privacy: "confidential",
        medical_diagnosis: "Quartz fever",
        approval_authority: "none",
      },
      {
        ...miracleDefaults,
        slug: "m-hidden-saint-only",
        title: "Cure Credited to a Hidden Saint",
        date_of_event: "1900-01-01",
        country: "Spain",
      },
      {
        ...miracleDefaults,
        slug: "m-healing-ann",
        title: "Fever Healing at Alpha Shrine",
        topics: ["children"],
        date_of_event: "1950-05-01",
        date_precision: "exact_day",
        country: "France",
        recipient_name: "Ann Testwell",
        recipient_privacy: "public",
        approval_authority: "vatican_dicastery",
        used_for_canonization: true,
        synopsis: "Ann recovered fully.",
      },
      {
        ...miracleDefaults,
        slug: "m-first-name",
        title: "Recovery in the Hills",
        topics: ["mothers"],
        date_of_event: "2001-03-10",
        country: "Italy",
        recipient_name: "Bea Fictiva",
        recipient_privacy: "first_name_only",
        approval_authority: "local_bishop",
        used_for_beatification: true,
        synopsis: `Lanterns were lit. ${"x".repeat(400)}`,
      },
      {
        ...miracleDefaults,
        slug: "m-apparition",
        title: "Vision at the Spring",
        miracle_category: "apparition",
        type: "apparition",
        date_of_event: null,
        date_precision: "unknown",
        country: "Portugal",
        recipient_privacy: "not_applicable",
        cure_characteristics: "not_applicable",
        approval_authority: "nihil_obstat",
        cure_details: "A harmonic tone was heard.",
      },
      {
        ...miracleDefaults,
        slug: "m-unpublished",
        title: "Unpublished Delta",
        topics: ["children"],
        date_of_event: "1950-01-01",
        country: "France",
        synopsis: "Lanterns again.",
        published: false,
      },
    ])
    .returning({ id: schema.miracles.id });

  await db.insert(schema.miracleSaints).values([
    { miracle_id: confidential.id, saint_id: beta.id },
    { miracle_id: confidential.id, saint_id: gamma.id },
    { miracle_id: hiddenSaintOnly.id, saint_id: gamma.id },
    { miracle_id: healingAnn.id, saint_id: alpha.id },
    { miracle_id: firstName.id, saint_id: alpha.id },
    { miracle_id: firstName.id, saint_id: beta.id },
    { miracle_id: apparition.id, saint_id: beta.id },
    { miracle_id: unpublished.id, saint_id: alpha.id },
  ]);

  await db.insert(schema.saintRelations).values([
    { saint_id: alpha.id, related_saint_id: beta.id, relation_type: "same_order" },
    { saint_id: beta.id, related_saint_id: alpha.id, relation_type: "same_order" },
    { saint_id: alpha.id, related_saint_id: gamma.id, relation_type: "family" },
    { saint_id: gamma.id, related_saint_id: alpha.id, relation_type: "family" },
  ]);

  await db.insert(schema.miracleSources).values({
    miracle_id: healingAnn.id,
    url: "https://example.org/source",
    title: "Example source",
    source_type: "book",
  });

  await db.insert(schema.miracleImages).values([
    { miracle_id: healingAnn.id, url: "https://example.org/second.jpg", display_order: 2 },
    { miracle_id: healingAnn.id, url: "https://example.org/first.jpg", display_order: 1 },
  ]);

  return {
    saints: { alpha: alpha.id, beta: beta.id, gamma: gamma.id },
    miracles: {
      confidential: confidential.id,
      hiddenSaintOnly: hiddenSaintOnly.id,
      healingAnn: healingAnn.id,
      firstName: firstName.id,
      apparition: apparition.id,
      unpublished: unpublished.id,
    },
  };
}
