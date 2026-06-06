# Plan: Explicit Field Selects on Detail Pages

Spec file: context/specs/explicit-field-selects.md
Branch: claude/feature/explicit-field-selects

## Overview

Four `db.select()` (SELECT *) calls to fix across three files. Changes are purely subtractive — no logic, no new fields, no schema changes. Build type-checking will catch any missed fields.

---

## Changes

### 1. `src/api/routes/miracles.ts` — line 91

Replace the miracle SELECT * with explicit fields matching `MiracleDetailSchema`:

```ts
db.select({
  id: miracles.id,
  slug: miracles.slug,
  title: miracles.title,
  miracle_category: miracles.miracle_category,
  type: miracles.type,
  topics: miracles.topics,
  date_of_event: miracles.date_of_event,
  date_precision: miracles.date_precision,
  timing_relative_to_saint_death: miracles.timing_relative_to_saint_death,
  location_name: miracles.location_name,
  location_lat: miracles.location_lat,
  location_lng: miracles.location_lng,
  country: miracles.country,
  region: miracles.region,
  recipient_name: miracles.recipient_name,
  recipient_privacy: miracles.recipient_privacy,
  recipient_age_at_event: miracles.recipient_age_at_event,
  medical_diagnosis: miracles.medical_diagnosis,
  cure_details: miracles.cure_details,
  cure_characteristics: miracles.cure_characteristics,
  was_medically_verified: miracles.was_medically_verified,
  medical_verification_date: miracles.medical_verification_date,
  intercessory_medium: miracles.intercessory_medium,
  vatican_recognized: miracles.vatican_recognized,
  vatican_decree_date: miracles.vatican_decree_date,
  vatican_medical_board_verdict: miracles.vatican_medical_board_verdict,
  used_for_beatification: miracles.used_for_beatification,
  used_for_canonization: miracles.used_for_canonization,
  synopsis: miracles.synopsis,
  has_primary_sources: miracles.has_primary_sources,
  saint_id: miracles.saint_id,
}).from(miracles).where(...)
```

Excluded (not in schema): `published`, `content_tier`, `created_at`, `updated_at`

The `sources` field in the response comes from the separate sources query, not this select.

---

### 2. `src/pages/miracles/[slug].astro` — line 12 (miracle select)

Replace the miracle SELECT * with explicit fields used in the template:

```ts
db.select({
  id: miracles.id,                        // used for: sources WHERE miracle.id
  saint_id: miracles.saint_id,            // used for: saint lookup
  title: miracles.title,
  miracle_category: miracles.miracle_category,
  type: miracles.type,
  date_of_event: miracles.date_of_event,
  date_precision: miracles.date_precision,
  location_name: miracles.location_name,
  location_lat: miracles.location_lat,
  location_lng: miracles.location_lng,
  country: miracles.country,
  recipient_privacy: miracles.recipient_privacy,
  recipient_name: miracles.recipient_name,
  recipient_age_at_event: miracles.recipient_age_at_event,
  used_for_beatification: miracles.used_for_beatification,
  used_for_canonization: miracles.used_for_canonization,
  topics: miracles.topics,
  vatican_medical_board_verdict: miracles.vatican_medical_board_verdict,
  medical_diagnosis: miracles.medical_diagnosis,
  cure_details: miracles.cure_details,
  synopsis: miracles.synopsis,
  timing_relative_to_saint_death: miracles.timing_relative_to_saint_death,
  cure_characteristics: miracles.cure_characteristics,
  intercessory_medium: miracles.intercessory_medium,
  was_medically_verified: miracles.was_medically_verified,
  medical_verification_date: miracles.medical_verification_date,
  vatican_recognized: miracles.vatican_recognized,
  vatican_decree_date: miracles.vatican_decree_date,
}).from(miracles).where(...)
```

Excluded: `slug` (WHERE clause only, not rendered), `region`, `has_primary_sources`, `published` (WHERE only), `content_tier`, `created_at`, `updated_at`

---

### 3. `src/pages/miracles/[slug].astro` — line 18 (miracleSources select)

Replace the sources SELECT * with explicit fields used in the template:

```ts
db.select({
  url: miracleSources.url,
  title: miracleSources.title,
  source_type: miracleSources.source_type,
  accessed_date: miracleSources.accessed_date,
}).from(miracleSources).where(...)
```

Excluded: `id` (not used), `miracle_id` (WHERE clause only)

---

### 4. `src/pages/saints/[slug].astro` — line 40 (saintSources select)

Replace the sources SELECT * with explicit fields used in the footnote template:

```ts
db.select({
  url: saintSources.url,
  title: saintSources.title,
  source_type: saintSources.source_type,
  accessed_date: saintSources.accessed_date,
}).from(saintSources).where(...).orderBy(asc(saintSources.id))
```

Excluded: `id` (not rendered), `saint_id` (WHERE clause only)

---

## Out of Scope

The main saint SELECT * in `saints/[slug].astro` (line 12) is not in this spec. The saint detail page uses nearly all saint columns (biography_short, themes, patronage, related saints join, etc.), making the optimization less impactful and the field list more fragile.

---

## Verification

- `npm run build` — TypeScript must pass with no errors
- Spot-check miracle detail page and saint detail page render correctly
- No new tests needed (behavior unchanged)
