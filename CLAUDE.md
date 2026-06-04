# The Miracles Register — Claude Code Reference

## Project Overview

A data-driven website documenting miracles attributed to Catholic saints. Focused on canonization miracles (Vatican-confirmed) with medical documentation, narrative synopses, source trails, and a public REST API. No existing site covers saint intercession miracles as a structured, searchable database — this fills that gap.

**Domain:** themiracleregister.org (registered May 2026) — no "s" in "miracle"

---

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (full stack) |
| Frontend | Astro with Cloudflare adapter |
| API layer | Hono (mounted as Cloudflare Worker at `/api/v1/*`) |
| Hosting | Cloudflare Workers (with static assets) |
| Database | Neon (serverless Postgres) — dev branch for local, prod branch for production |
| ORM | Drizzle (`drizzle-orm/neon-http`) |
| Validation + types + OpenAPI | Zod schemas via `@hono/zod-openapi` — single source of truth |
| Testing | Vitest (unit), Playwright (e2e) |
| CI/CD | GitHub Actions (typecheck → lint → test → deploy) |
| Local dev | Docker Compose (Astro + Postgres + Wrangler) |

**Architecture split:**
- Astro renders all public-facing pages (SSR)
- Hono handles all `/api/v1/*` routes
- Zod schemas are shared between Astro pages and Hono API routes

---

## Scope

- **Primary:** Intercessory miracles — posthumous healings attributed to a saint's intercession
- **Secondary:** Associated miracles for famous cases only (Tilma of Guadalupe, stigmata, incorrupt bodies)
- **Starting set:** 11 saints (last 50 years + Juan Diego)
- Public-facing website with REST API from day one
- Admin panel for data entry (to be designed)

---

## Data Model

### `saints`

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| slug | text | URL-friendly, e.g. `john-paul-ii` |
| name | text | |
| birth_name | text | |
| birth_date, death_date | date | |
| feast_day | text | |
| religious_order | text | e.g. "Franciscan" |
| nationality | text | |
| birth_place, death_place | text | |
| beatification_date | date | |
| beatified_by | text | |
| canonization_date | date | |
| canonized_by | text | |
| canonization_type | enum | confessor, martyr, virgin, married_couple, other |
| canonization_stage | enum | saint, blessed, venerable, servant_of_god — **mutable, not static** |
| patronage | text[] | GIN indexed |
| themes | text[] | GIN indexed — standardized spiritual/devotional tags. Canonical list in `src/db/topics.ts` (`SAINT_THEMES`). |
| biography_short | text | ~300 words |
| total_attributed_miracles | integer | optional |
| image_url | text | |
| wikipedia_url | text | |
| created_at, updated_at | timestamptz | |

### `saint_relations` (replaces saint_group_id)

Many-to-many join table. Handles pairs, groups, and future edge cases.

| Column | Type | Notes |
|---|---|---|
| saint_id | FK → saints | |
| related_saint_id | FK → saints | |
| relation_type | enum | canonized_together, same_order, etc. |

Saint pages show related saints as links. API response includes a `related_saints` array when relations exist.

### `miracles`

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| saint_id | FK → saints | |
| slug | text | |
| title | text | |
| miracle_category | enum | intercessory, associated |
| type | enum | healing, nature, eucharistic, stigmata, incorruptibility, apparition, miraculous_image, prophecy, bilocation, other |
| topics | text[] | GIN indexed — life circumstance/role tags for the miracle recipient or context. Canonical list in `src/db/topics.ts` (`MIRACLE_TOPICS`). |
| date_of_event | date | nullable |
| date_precision | enum | exact_day, month, year, decade, century, unknown |
| timing_relative_to_saint_death | enum | during_lifetime, posthumous, not_applicable |
| location_name | text | |
| location_lat, location_lng | numeric | |
| country | text | |
| region | text | optional, e.g. "Quebec" |
| recipient_name | text | null for associated miracles |
| recipient_privacy | enum | public, first_name_only, confidential, not_applicable |
| recipient_age_at_event | integer | optional |
| medical_diagnosis | text | null for non-healing |
| cure_details | text | |
| cure_characteristics | enum | instant_complete, gradual_complete, instant_partial, gradual_partial, not_applicable |
| was_medically_verified | boolean | |
| medical_verification_date | date | optional |
| intercessory_medium | enum | prayer_only, relic, blessed_oil, medallion, visitation, tomb_prayer, saint_image, not_applicable, other |
| vatican_recognized | boolean | |
| vatican_decree_date | date | optional |
| vatican_medical_board_verdict | text | optional |
| used_for_beatification | boolean | |
| used_for_canonization | boolean | |
| synopsis | text | 500–1000 words narrative |
| has_primary_sources | boolean | |
| created_at, updated_at | timestamptz | |

### Topics & Themes

Both lists are defined in `src/db/topics.ts` as `text[]` (not enums) so values can be added without a schema migration — update the const and redeploy.

**`MIRACLE_TOPICS`** — tags on miracle records describing the recipient or context. Used for filtering ("show miracles for mothers", "show miracles involving youth").

| Category | Topics |
|---|---|
| Life stages & roles | `children`, `mothers`, `fathers`, `pregnancy-and-childbirth`, `marriage`, `youth`, `elderly` |
| Life circumstances | `addiction`, `prisoners`, `loss-grief`, `financial-hardship`, `workplace`, `native-and-indigenous`, `pro-life` |

Medical conditions are **not** topics — use `medical_diagnosis` (free text). Phenomena (stigmata, bilocation, etc.) are **not** topics — use the `type` enum.

**`SAINT_THEMES`** — tags on saint records describing spiritual/devotional character. Used for biography pages and saint discovery.

`hope`, `perseverance`, `conversion`, `eucharistic`, `marian`, `martyrs`, `missionaries`, `saints-of-everyday-life`, `spiritual-direction`, `technology`

### `miracle_sources` (replaces JSON blob)

Separate table for scalability and search. Enables filtering by source type.

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| miracle_id | FK → miracles | |
| url | text | |
| title | text | |
| source_type | enum | vatican_decree, news_article, book, academic, other |
| accessed_date | date | optional |

---

## API Endpoints

All routes under `/api/v1/`. Hono + `@hono/zod-openapi` — OpenAPI spec generated from Zod schemas automatically.

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/saints` | List all saints |
| GET | `/api/v1/saints/:slug` | Single saint with related saints and linked miracles |
| GET | `/api/v1/miracles` | Search/filter (params: saint_id, type, country, year_from, year_to, page, limit) |
| GET | `/api/v1/miracles/:slug` | Single miracle with full details and sources |
| GET | `/api/v1/types` | List miracle types |
| GET | `/api/v1/search` | Full-text search |

**Response envelope:** `{ data, meta (pagination), error }`

---

## Implementation Order

1. Drizzle schema + Neon setup (dev branch + prod branch)
2. Astro + Cloudflare Workers base
3. Hono API layer wired up with `@hono/zod-openapi`
4. Static pages rendering from DB
5. API endpoints + OpenAPI spec (generated, always in sync)
6. Admin panel for data entry
7. Vitest unit tests
8. Playwright e2e tests
9. GitHub Actions CI/CD
10. Docker Compose for local dev (last — only after everything works)

---

## Starter Saints

| # | Saint | Miracles | Notes |
|---|---|---|---|
| 1 | John Paul II | 2 | Parkinson's, brain aneurysm |
| 2 | Mother Teresa | 2 | Abdominal tumor, brain abscesses |
| 3 | Padre Pio | 2 + lifetime | Peritonitis, meningitis/coma |
| 4 | Faustina Kowalska | 2 | Lymphedema, heart condition |
| 5 | Gianna Beretta Molla | 2 | Breast tumor, placental abruption |
| 6 | Kateri Tekakwitha | 2 | Flesh-eating bacteria, older healing |
| 7 | Andre Bessette | 2 + thousands | Tuberculosis, foot fracture |
| 8 | Maximilian Kolbe | 2 | Intestinal TB, peritoneal calcification — martyr |
| 9 | Louis & Zelie Martin | 2 | Respiratory, respiratory — married couple, linked via saint_relations |
| 10 | Carlo Acutis | 2 | Pancreatic, head trauma — canonized September 7, 2025 |
| 11 | Juan Diego | 1 + Tilma | Fall/coma, equipollent beatification |

Research notes in Nextcloud: `MiraclesProject/Research/`

---

## Research Sources

- **Vatican:** vatican.va for canonization decrees (primary)
- **Catholic press:** Catholic News Agency, EWTN, National Catholic Register
- **Reference:** Wikipedia (verify against Vatican sources), Miracle Hunter (miraclehunter.com — dated but useful)
- **Vatican medical board:** Consulta Medica — their verdicts are primary sources

---

## Key Decisions & Rationale

- **Cloudflare Workers over self-hosting:** Avoids downtime when homelab is offline; Workers is Cloudflare's forward-looking full-stack platform (Pages is frozen — no new investment)
- **Hono for API layer:** Native Cloudflare Workers support, first-class `@hono/zod-openapi` integration
- **Drizzle over Prisma:** SQL-first, lighter, better Neon compatibility
- **`miracle_sources` table over JSON blob:** Enables filtering and full-text search on sources
- **`saint_relations` join table over self-FK:** Handles pairs and groups, extensible
- **Zod as single source of truth:** Drives runtime validation, TypeScript types, and OpenAPI spec
- **Neon dev branch:** Separate dev and prod database branches to avoid schema accidents
- **`MIRACLE_TOPICS` vs `SAINT_THEMES`:** Topics tag miracle records with life circumstances/roles (who the recipient was, what their situation was). Themes tag saint records with spiritual/devotional character. Medical conditions belong in `medical_diagnosis`; phenomena belong in the `type` enum — neither should appear as topics.
- **`noted_for` removed:** Was redundant with `themes` (structured) and `biography_short` (narrative). Saints have two tag fields: `patronage` (formal Catholic designation) and `themes` (standardized spiritual tags).
- **Carlo Acutis' Eucharistic miracle site** (miracolieucaristici.org) is out of scope — different focus entirely
