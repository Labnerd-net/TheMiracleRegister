Copy this file to `[Image Name].md` when starting research on a new miraculous image case. Delete it once the case is fully published and verified against the DB — this folder should only hold files still in progress. See `Miraculous Images — Overview.md` for candidate cases.

=======================================================================

# [Image Name]

**Slug:**            [kebab-case-slug]
**Date:**            [date the image appeared/was discovered]
**Location:**        [where the image currently resides]
**Lat/Lng:**         [decimal lat, decimal lng]
**Approval:**        [who approved it and when]
**Content Tier:**    [core | catalog | stub — default core]
**In DB:**           No
**Image:**           [Wikimedia Commons public domain URL of the image itself]

---

## Synopsis

[300–500 word narrative. This becomes the `synopsis` field verbatim.]

---

## Data

| Field | Value |
|---|---|
| slug | |
| title | |
| miracle_category | associated |
| type | miraculous_image |
| topics | [comma-separated from MIRACLE_TOPICS in src/db/topics.ts, or none] |
| date_of_event | |
| date_precision | [exact_day | month | year | decade | century | unknown] |
| timing_relative_to_saint_death | [during_lifetime | posthumous | not_applicable — depends whether tied to a living saint's story] |
| location_name | |
| country | |
| region | |
| location_lat | |
| location_lng | |
| recipient_name | [only if a specific person is central to the event, e.g. Juan Diego for the Tilma] |
| recipient_privacy | [public | not_applicable] |
| medical_diagnosis | null |
| cure_details | [describe the phenomenon itself here if not purely medical] |
| cure_characteristics | not_applicable |
| was_medically_verified | [true | false — true if forensic/scientific examination of the artifact was performed] |
| intercessory_medium | not_applicable |
| approval_authority | [vatican_dicastery | local_bishop | nihil_obstat | none] |
| vatican_decree_date | |
| used_for_beatification | false |
| used_for_canonization | false |
| content_tier | core |
| miracle_saints | [linked saint slug if the image is tied to a specific saint's cause, else (none)] |

---

## Notes

[Disputed facts, sourcing caveats, anything to double-check before publishing.]

---

## Sources

1. URL: | Title: | Type: [vatican_decree | news_article | book | academic | other]

=======================================================================
