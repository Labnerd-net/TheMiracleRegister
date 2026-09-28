Copy this file to `[Case Name].md` when starting research on a new Eucharistic miracle. Delete it once the case is fully published and verified against the DB — this folder should only hold files still in progress. Candidate cases not yet started live in `Eucharistic Miracles — Carlo Acutis Exhibition Data.md`.

=======================================================================

# [Miracle Title]

**Slug:**            [kebab-case-slug, e.g. eucharistic-miracle-of-bolsena]
**Date:**            [date of event]
**Location:**        [church/shrine name, city, country]
**Lat/Lng:**         [decimal lat, decimal lng]
**Approval:**        [who approved it and when — see approval_authority below]
**Content Tier:**    [core | catalog | stub — default core]
**In DB:**           No
**Image:**           [Wikimedia Commons public domain URL, or "None found on Wikimedia Commons — leave null"]

---

## Synopsis

[300–500 word narrative; longer only if the case warrants it. This becomes the `synopsis` field verbatim.]

---

## Data

| Field | Value |
|---|---|
| slug | |
| title | |
| miracle_category | associated |
| type | eucharistic |
| topics | [comma-separated from MIRACLE_TOPICS in src/db/topics.ts, or none — usually none for host-phenomenon cases] |
| date_of_event | |
| date_precision | [exact_day | month | year | decade | century | unknown] |
| timing_relative_to_saint_death | not_applicable |
| location_name | |
| country | |
| region | |
| location_lat | |
| location_lng | |
| recipient_name | null |
| recipient_gender | not_applicable |
| recipient_privacy | not_applicable |
| medical_diagnosis | null |
| cure_details | [only if the phenomenon itself involves a scientific finding, e.g. blood type/tissue analysis] |
| cure_characteristics | not_applicable |
| was_medically_verified | [true | false — true if forensic/scientific analysis was performed on the host] |
| medical_verification_date | |
| intercessory_medium | not_applicable |
| approval_authority | [vatican_dicastery | local_bishop | nihil_obstat | none] |
| vatican_decree_date | |
| vatican_medical_board_verdict | |
| used_for_beatification | false |
| used_for_canonization | false |
| content_tier | core |
| miracle_saints | (none — standalone record) |

---

## Notes

[Disputed facts, sourcing caveats, cross-links to other Eucharistic miracles with matching findings (e.g. the AB blood + stressed cardiac tissue cluster — see Priority Additions.md), anything to double-check before publishing.]

---

## Sources

1. URL: | Title: | Type: [vatican_decree | news_article | book | academic | other]

=======================================================================
