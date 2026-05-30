# Plan: Drizzle Schema and Neon Setup

## Context

This is the foundational step for TheMiraclesRegister. The project has no code yet — only documentation. This step establishes the TypeScript project structure, all database tables and enums, migration tooling, and wires up the Neon dev branch. Everything else (Astro, Hono, API) builds on top of this.

The user confirmed: **schema split per table** (not a single schema.ts file).

---

## Implementation Steps

### 1. Project initialization

Create the following files at the repo root:

**`package.json`** — with scripts:
- `db:generate` → `drizzle-kit generate`
- `db:migrate` → `drizzle-kit migrate`
- `db:studio` → `drizzle-kit studio`

**`tsconfig.json`** — strict TypeScript, targeting ESNext, module resolution `bundler`.

**`.gitignore`** — exclude `.env`, `node_modules/`, `drizzle/` output is fine to commit.

**`.env.example`** — document `DATABASE_URL` with a placeholder Neon connection string.

Install dependencies:
- `drizzle-orm`, `@neondatabase/serverless` (runtime)
- `drizzle-kit`, `typescript`, `tsx`, `dotenv` (dev)

---

### 2. Drizzle config

**`drizzle.config.ts`** at repo root:
- dialect: `postgresql`
- schema: `./src/db/schema/index.ts`
- out: `./drizzle`
- uses `process.env.DATABASE_URL`

---

### 3. Schema files

All files under `src/db/schema/`. One file per table. `index.ts` re-exports everything.

#### `src/db/schema/enums.ts`
Define all shared Postgres enums using `pgEnum`:

| Enum name | Values |
|---|---|
| `canonizationType` | confessor, martyr, virgin, married_couple, other |
| `canonizationStage` | saint, blessed, venerable, servant_of_god |
| `relationTypeEnum` | canonized_together, same_order |
| `miracleCategory` | intercessory, associated |
| `miracleType` | healing, nature, eucharistic, stigmata, incorruptibility, apparition, miraculous_image, prophecy, bilocation, other |
| `miracleSubtype` | cancer, neurological, infectious, obstetric, orthopedic, gastrointestinal, cardiovascular, dermatological, respiratory, other |
| `datePrecision` | exact_day, month, year, decade, century, unknown |
| `timingRelativeToSaintDeath` | during_lifetime, posthumous, not_applicable |
| `recipientPrivacy` | public, first_name_only, confidential, not_applicable |
| `recipientGender` | male, female, unknown, not_applicable |
| `cureCharacteristics` | instant_complete, gradual_complete, instant_partial, gradual_partial, not_applicable |
| `intercessoryMedium` | prayer_only, relic, blessed_oil, medallion, visitation, tomb_prayer, saint_image, not_applicable, other |
| `sourceType` | vatican_decree, news_article, book, academic, other |

#### `src/db/schema/saints.ts`
- `id` — serial PK
- `slug` — text, not null, unique
- `name` — text, not null
- `birth_name` — text, nullable
- `birth_date`, `death_date` — date, nullable
- `feast_day` — text, nullable
- `religious_order` — text, nullable
- `nationality` — text, nullable
- `birth_place`, `death_place` — text, nullable
- `beatification_date` — date, nullable
- `beatified_by` — text, nullable
- `canonization_date` — date, nullable
- `canonized_by` — text, nullable
- `canonization_type` — `canonizationType` enum, nullable
- `canonization_stage` — `canonizationStage` enum, not null
- `patronage` — text array, nullable
- `biography_short` — text, nullable
- `total_attributed_miracles` — integer, nullable
- `image_url` — text, nullable
- `wikipedia_url` — text, nullable
- `created_at` — timestamptz, defaultNow(), not null
- `updated_at` — timestamptz, defaultNow(), not null (use `$onUpdate` for auto-update)

#### `src/db/schema/saint-relations.ts`
- `saint_id` — integer, FK → saints.id, not null
- `related_saint_id` — integer, FK → saints.id, not null
- `relation_type` — `relationTypeEnum`, not null
- Composite PK on `(saint_id, related_saint_id, relation_type)`

#### `src/db/schema/miracles.ts`
All columns per CLAUDE.md. Key nullable fields: `date_of_event`, `recipient_name`, `medical_diagnosis`, `medical_verification_date`, `vatican_decree_date`, `vatican_medical_board_verdict`, `recipient_age_at_event`. All enums as defined above.

- `id` — serial PK
- `saint_id` — integer, FK → saints.id, not null
- `slug` — text, not null, unique
- `title` — text, not null
- `miracle_category` — `miracleCategory` enum, not null
- `type` — `miracleType` enum, not null
- `subtype` — `miracleSubtype` enum, nullable
- `date_of_event` — date, nullable
- `date_precision` — `datePrecision` enum, not null
- `timing_relative_to_saint_death` — `timingRelativeToSaintDeath` enum, not null
- `location_name` — text, nullable
- `location_lat`, `location_lng` — numeric, nullable
- `country` — text, nullable
- `region` — text, nullable
- `recipient_name` — text, nullable
- `recipient_privacy` — `recipientPrivacy` enum, not null
- `recipient_age_at_event` — integer, nullable
- `recipient_gender` — `recipientGender` enum, not null
- `medical_diagnosis` — text, nullable
- `cure_details` — text, nullable
- `cure_characteristics` — `cureCharacteristics` enum, not null
- `was_medically_verified` — boolean, not null
- `medical_verification_date` — date, nullable
- `intercessory_medium` — `intercessoryMedium` enum, not null
- `vatican_recognized` — boolean, not null
- `vatican_decree_date` — date, nullable
- `vatican_medical_board_verdict` — text, nullable
- `used_for_beatification` — boolean, not null
- `used_for_canonization` — boolean, not null
- `synopsis` — text, nullable
- `has_primary_sources` — boolean, not null
- `created_at` — timestamptz, defaultNow(), not null
- `updated_at` — timestamptz, defaultNow(), not null (use `$onUpdate`)

#### `src/db/schema/miracle-sources.ts`
- `id` — serial PK
- `miracle_id` — integer, FK → miracles.id, not null
- `url` — text, not null
- `title` — text, nullable
- `source_type` — `sourceType` enum, not null
- `accessed_date` — date, nullable

#### `src/db/schema/index.ts`
Re-export all tables and enums.

---

### 4. DB client

**`src/db/index.ts`** — creates and exports the Drizzle client using `@neondatabase/serverless` + `drizzle-orm/neon-http`. Reads `DATABASE_URL` from `process.env`.

---

### 5. Generate and apply migration

After implementation, run:
```
npm run db:generate   # produces drizzle/XXXX_init.sql
npm run db:migrate    # applies to Neon dev branch
```

---

## Verification

1. `npm run db:generate` completes with no errors and produces a migration file in `drizzle/`
2. `npm run db:migrate` applies successfully to the Neon dev branch (requires real `DATABASE_URL` in `.env`)
3. Schema smoke test: `tests/schema.test.ts` imports all four table exports and asserts they are defined objects
4. No `.env` file committed (verify via `git status`)
