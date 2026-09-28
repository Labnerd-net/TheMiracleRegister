Copy this file to `[Saint Name] — [Phenomenon].md` when starting research on a new case. Delete it once the case is fully published and verified against the DB — this folder should only hold files still in progress. See `Miraculous and Saintly Phenomena — Overview.md` for candidate cases. Note: stigmata cases go in the dedicated `Stigmata/` folder instead.

=======================================================================

# [Phenomenon] of [Saint Name]

**Slug:**            [kebab-case-slug]
**Date/Period:**     [date, or span of years if the phenomenon recurred over the saint's life]
**Location:**        [primary location associated with the saint during the phenomenon]
**Lat/Lng:**         [decimal lat, decimal lng]
**Approval:**        [how this was treated in the beatification/canonization Positio, if at all]
**Content Tier:**    [core | catalog | stub — default core]
**In DB:**           No
**Image:**           [Wikimedia Commons public domain URL, or "None found — leave null"]

---

## Synopsis

[300–500 word narrative — describe specific documented incidents rather than the phenomenon in the abstract. This becomes the `synopsis` field verbatim.]

---

## Data

| Field | Value |
|---|---|
| slug | |
| title | |
| miracle_category | associated |
| type | [bilocation | prophecy | other] |
| topics | [comma-separated from MIRACLE_TOPICS in src/db/topics.ts, or none] |
| date_of_event | [null if the phenomenon recurred over years rather than a single event] |
| date_precision | [exact_day | month | year | decade | century | unknown] |
| timing_relative_to_saint_death | during_lifetime |
| location_name | |
| country | |
| region | |
| location_lat | |
| location_lng | |
| recipient_name | [only if a specific witness/recipient is central] |
| recipient_privacy | [public | not_applicable] |
| medical_diagnosis | null |
| cure_details | [describe the phenomenon's documented instances] |
| cure_characteristics | not_applicable |
| was_medically_verified | [true | false] |
| intercessory_medium | not_applicable |
| approval_authority | [vatican_dicastery | local_bishop | none] |
| used_for_beatification | false |
| used_for_canonization | false |
| content_tier | core |
| miracle_saints | [saint slug this phenomenon is attributed to] |

---

## Notes

[Disputed facts, sourcing caveats, anything to double-check before publishing.]

---

## Sources

1. URL: | Title: | Type: [vatican_decree | news_article | book | academic | other]

=======================================================================
