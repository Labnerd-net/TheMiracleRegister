Copy this file to `[Saint Name].md` when starting research on a new stigmata case. Delete it once the case is fully published and verified against the DB — this folder should only hold files still in progress. See `Stigmata — Overview.md` for candidate cases.

=======================================================================

# The Stigmata of [Saint Name]

**Slug:**            [kebab-case-slug]
**Date/Period:**     [date stigmata first appeared, and span if it persisted for years]
**Location:**        [where the saint was living at the time]
**Lat/Lng:**         [decimal lat, decimal lng]
**Approval:**        [how this was treated in the beatification/canonization Positio, if at all]
**Content Tier:**    [core | catalog | stub — default core]
**In DB:**           No
**Image:**           [Wikimedia Commons public domain URL, or "None found — leave null"]

---

## Synopsis

[300–500 word narrative — onset, physical description, medical examinations if any, how it factored into the saint's cause. This becomes the `synopsis` field verbatim.]

---

## Data

| Field | Value |
|---|---|
| slug | |
| title | |
| miracle_category | associated |
| type | stigmata |
| topics | [comma-separated from MIRACLE_TOPICS in src/db/topics.ts, or none] |
| date_of_event | [onset date] |
| date_precision | [exact_day | month | year | decade | century | unknown] |
| timing_relative_to_saint_death | during_lifetime |
| location_name | |
| country | |
| region | |
| location_lat | |
| location_lng | |
| recipient_name | null |
| recipient_privacy | not_applicable |
| medical_diagnosis | null |
| cure_details | [describe the wounds, duration, any medical examination findings] |
| cure_characteristics | not_applicable |
| was_medically_verified | [true | false — true if doctors examined the wounds] |
| intercessory_medium | not_applicable |
| approval_authority | [vatican_dicastery | local_bishop | none] |
| used_for_beatification | false |
| used_for_canonization | false |
| has_primary_sources | [true | false] |
| content_tier | core |
| miracle_saints | [saint slug] |

---

## Notes

[Disputed facts, sourcing caveats, anything to double-check before publishing.]

---

## Sources

1. URL: | Title: | Type: [vatican_decree | news_article | book | academic | other]

=======================================================================
