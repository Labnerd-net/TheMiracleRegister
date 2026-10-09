# The Miracle Register — Claude Code Reference

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
- **Tertiary:** Feast day calendar as a discovery layer — every published saint is reachable by feast date, with the full liturgical calendar as context. Only canonized saints have universal feast days; Blessed, Venerable, and Servants of God do not appear on the calendar unless a local feast day has been specifically recorded.
- Public-facing website with REST API from day one
- No admin panel — data is edited directly in the database (Neon console or SQL). Unpublished records can be previewed at `/saints/<slug>?preview=<PREVIEW_TOKEN>` and `/miracles/<slug>?preview=<PREVIEW_TOKEN>`.
- **Style:** use plain hyphens (`-`), never em dashes (`—`), in page copy, UI strings, and any text written into the database (biographies, synopses, cure details, etc.). `check:data` flags em dashes in DB free-text columns, but it can't catch source files — check your own output before writing copy or SQL.
- **No self-reference (decided):** free-text DB fields that read as narrative content —
  `saints.biography_short`, `miracles.synopsis`, `miracles.cure_details`,
  `miracles.medical_diagnosis`, `miracles.vatican_medical_board_verdict` — must never refer to
  "this site," "this database," "this register," "this page," or any other site-structure
  framing. A saint or miracle record gets quoted, screenshotted, or cited out of context (a
  journalist pulling one case, a shared link), and anything that only makes sense next to the
  site around it breaks on the way out. Referencing *other* records (another saint, another
  miracle by slug/name) or naming a sibling site (HallowedTales, UnhallowedTales) is fine — the
  rule is about not leaning on this site's own scaffolding to make sense. Same rule as
  HallowedTales' "Stories stand alone" and UnhallowedTales' "No site self-reference." Audited
  2026-10-09: no violations found in current data. UI copy/static pages (About, Verification
  methodology) are exempt — those pages are inherently about the site.

---

## Data Model

### `saints`

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| slug | text | URL-friendly, e.g. `john-paul-ii` |
| name | text | Common/recognizable devotional name — e.g. "Mother Teresa", "Padre Pio", "Brother Andre". This is the primary display name. |
| birth_name | text | Legal name given at birth — e.g. "Anjezë Gonxhe Bojaxhiu" |
| saint_name | text | Formal Vatican/devotional title — e.g. "Saint Teresa of Calcutta", "Saint André of Montreal". Nullable. Shown where the formal title is appropriate. |
| birth_date, death_date | date | Both use a placeholder (YYYY-01-01) when only the year/decade/century is known — see `birth_date_precision`/`death_date_precision`. Convention mirrors `miracles.date_of_event`. |
| birth_date_precision, death_date_precision | enum | exact_day, month, year, decade, century, unknown — same `date_precision` enum as `miracles`. Default `exact_day`. Govern how `birth_date`/`death_date` are displayed (`formatApproxDate` in `src/lib/format.ts`) and whether they're emitted in JSON-LD (`saintJsonLd` only asserts `birthDate`/`deathDate` at `exact_day` precision) and the public API (`SaintDetailSchema`); when `unknown`, no date is shown even if the underlying date happens to be set. |
| feast_day | text | |
| feast_month | integer | nullable — numeric month (1–12) for structured feast day queries |
| feast_day_of_month | integer | nullable — day of month; null for movable feasts |
| feast_easter_offset | integer | nullable — days from Easter Sunday for movable feasts (e.g. Divine Mercy = 7, Corpus Christi = 60) |
| religious_order | text | e.g. "Franciscan" |
| nationality | text | |
| ministry_country | text | country where the saint primarily served — may differ from nationality |
| beatification_date | date | |
| beatified_by | text | |
| canonization_date | date | |
| canonized_by | text | |
| canonization_type | enum | confessor, martyr, virgin, married_couple, other |
| canonization_stage | enum | saint, blessed, venerable, servant_of_god — **mutable, not static** |
| patronage | text[] | GIN indexed — sentence case: first letter capitalized, then lowercase except proper nouns and acronyms ("Unborn children", "Catholic families", "HIV/AIDS"). `check:data` enforces the capital first letter. Equivalent strings are merged into browse pages by `PATRONAGE_GROUPS` in `src/db/topics.ts`. |
| themes | text[] | GIN indexed — standardized spiritual/devotional tags. Canonical list in `src/db/topics.ts` (`SAINT_THEMES`). |
| biography_short | text | ~300 words |
| gender | enum | male, female, group |
| lay_person | boolean | true if not a religious or clergy |
| beatification_miracle_dispensed | boolean | nullable — true when beatification miracle requirement was waived |
| canonization_miracle_dispensed | boolean | nullable — true when canonization miracle requirement was waived |
| dispensation_reason | enum | nullable — martyr, equipollent, papal_exception; only set when a dispensation boolean is true |
| image_url | text | |
| wikipedia_url | text | Rendered separately on the saint page as a hardcoded "Reference" label — never add Wikipedia as a `saint_sources` row or it will appear twice |
| published | boolean | default false — controls public visibility |
| created_at, updated_at | timestamptz | |

### `saint_relations` (replaces saint_group_id)

Many-to-many join table. Handles pairs, groups, and future edge cases.

| Column | Type | Notes |
|---|---|---|
| saint_id | FK → saints | |
| related_saint_id | FK → saints | |
| relation_type | enum | canonized_together, same_order, family, etc. |

Saint pages show related saints as links. API response includes a `related_saints` array when relations exist.

### `miracles`

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| slug | text | |
| title | text | |
| miracle_category | enum | intercessory, associated, apparition |
| type | enum | healing, nature, eucharistic, stigmata, incorruptibility, apparition, miraculous_image, prophecy, bilocation, other |
| topics | text[] | GIN indexed — descriptive tags for the miracle event, recipient, or context. Used for discovery ("show miracles involving veterans", "show miracles for mothers"). Canonical list in `src/db/topics.ts` (`MIRACLE_TOPICS`). |
| date_of_event | date | nullable |
| date_precision | enum | exact_day, month, year, decade, century, unknown |
| timing_relative_to_saint_death | enum | during_lifetime, posthumous, not_applicable |
| location_name | text | |
| location_lat, location_lng | numeric | |
| country | text | |
| region | text | optional, e.g. "Quebec" |
| recipient_name | text | null for associated miracles |
| recipient_gender | enum | male, female, not_applicable |
| recipient_country | text | country recipient is from (may differ from miracle location) |
| recipient_privacy | enum | public, first_name_only, confidential, not_applicable |
| recipient_age_at_event | integer | optional |
| recipient_age_approximate | boolean | nullable — true when age is an estimate rather than exact |
| medical_diagnosis | text | null for non-healing |
| cure_details | text | |
| cure_characteristics | enum | instant_complete, gradual_complete, instant_partial, gradual_partial, not_applicable |
| was_medically_verified | boolean | |
| medical_verification_date | date | optional |
| intercessory_medium | enum | prayer_only, relic, blessed_oil, medallion, visitation, tomb_prayer, saint_image, not_applicable, other |
| approval_authority | enum | vatican_dicastery, lourdes_bureau, local_bishop, nihil_obstat, none — replaces vatican_recognized boolean |
| vatican_decree_date | date | optional |
| vatican_medical_board_verdict | text | optional |
| witness_count | integer | nullable — for apparitions with a known number of witnesses |
| used_for_beatification | boolean | |
| used_for_canonization | boolean | |
| synopsis | text | 300–500 words narrative; longer only if the case warrants it |
| content_tier | enum | `core` (full narrative), `catalog` (short synopsis + external links), `stub` — default core |
| feast_month | integer | nullable — numeric month (1–12); set for miracles tied to a feast day |
| feast_day_of_month | integer | nullable — day of month; null for movable feasts |
| feast_easter_offset | integer | nullable — days from Easter Sunday for movable feasts |
| published | boolean | default false — controls public visibility |
| created_at, updated_at | timestamptz | |

### Topics & Themes

Both lists are defined in `src/db/topics.ts` as `text[]` (not enums) so values can be added without a schema migration — update the const and redeploy.

**`MIRACLE_TOPICS`** — descriptive tags on miracle records covering the event, recipient, and context. Used for discovery by any dimension: life stage, vocation, circumstance, or outcome type ("show miracles involving veterans", "show miracles for mothers", "show conversion miracles").

| Category | Topics |
|---|---|
| Life stages & roles | `children`, `mothers`, `pregnancy-and-childbirth`, `marriage`, `youth`, `elderly` |
| Life circumstances & vocation | `addiction`, `prisoners`, `loss-grief`, `native-and-indigenous`, `veterans`, `religious-life`, `conversion` |

Medical conditions are **not** topics — use `medical_diagnosis` (free text). Phenomena (stigmata, bilocation, etc.) are **not** topics — use the `type` enum.

**`SAINT_THEMES`** — tags on saint records describing spiritual/devotional character. Used for biography pages and saint discovery.

`hope`, `perseverance`, `conversion`, `eucharistic`, `marian`, `martyrs`, `missionaries`, `saints-of-everyday-life`, `spiritual-direction`, `technology`

### `miracle_images`

Ordered images per miracle. Replaces the old `miracles.image_url` single column.

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| miracle_id | FK → miracles | cascade delete |
| url | text | Wikimedia Commons public domain image URL |
| caption | text | nullable |
| source_attribution | text | nullable — photographer/source credit |
| display_order | integer | ascending; first image used as OG image |

### `miracle_saints`

Many-to-many junction table linking miracles to saints. Replaces the old `miracles.saint_id` FK. A miracle can be attributed to one saint (typical) or multiple saints jointly (e.g. Louis & Zélie Martin). Both FKs cascade on delete — deleting a saint removes their junction rows but not the miracles themselves.

| Column | Type | Notes |
|---|---|---|
| miracle_id | FK → miracles | cascade delete |
| saint_id | FK → saints | cascade delete |

Composite PK on `(miracle_id, saint_id)`. API responses expose linked saints as `saints: [{id, slug, name}]`.

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

### `saint_sources`

Mirrors `miracle_sources` for saint biography sources.

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| saint_id | FK → saints | |
| url | text | |
| title | text | |
| source_type | enum | vatican_decree, news_article, book, academic, other |
| accessed_date | date | optional |

### `saint_locations`

Multiple geocoded locations per saint for map display. Managed via the saint edit page (add/delete pattern matching sources).

| Column | Type | Notes |
|---|---|---|
| id | integer PK | |
| saint_id | FK → saints | cascade delete |
| location_name | text | required, e.g. "St. Joseph's Oratory" |
| lat, lng | numeric(9,6) | optional coordinates |
| location_type | enum | tomb, birthplace, death_place, shrine, relic, major_devotional_center, other |

### Static Feast Day Data (`src/data/feastDays.ts`)

Static TypeScript arrays covering all fixed and movable Catholic feast days for the `/calendar` page. Not in the DB — this is a build-time reference layer.

- **`FIXED_FEASTS`** — 280+ fixed-date entries with `month`, `day`, `name`, and optional `scope` (`universal`, `us`, `national`, `martyrologium`, `diocesan`, `observance`) and `scopeDetail`.
- **`MOVABLE_FEASTS`** — 8 Easter-relative entries with `easterOffset` matching the values used in `saints.feast_easter_offset` and `src/lib/easter.ts`.
- Helper functions: `getFixedFeasts(month, day)` and `getMovableFeast(easterOffset)`.

**`// [in DB]` convention:** When a saint is added to the DB, their corresponding entry in `FIXED_FEASTS` must be commented out with a `// [in DB]` marker. This prevents the calendar from showing both a linked saint card (from the DB) and a duplicate plain-text feast entry (from the static array). When a saint is removed from the DB, uncomment their entry. Do not delete `// [in DB]` entries — they preserve the feast day data for future use.

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
| GET | `/api/v1/metadata` | Canonical filter options: types, categories, approval authorities, topics, themes |
| GET | `/api/v1/search` | Full-text search |

**Response envelope:** `{ data, meta (pagination), error }`

---

## Database

- The single Neon branch is **production** (`br-proud-block-aptdevzb`). `DATABASE_URL` in `.env` points to it directly.
- Data is managed directly in the database (Neon console or SQL; the admin panel was removed). There is no seed script. Always run `npm run check:data` after a change — it replaces the validation the admin forms used to do. `updated_at` is bumped by a DB trigger (`drizzle/0030_updated_at_trigger.sql`), so raw edits are safe.
- Schema changes: `npm run db:generate` → `npm run db:migrate`
- Data integrity: `npm run check:data` (`scripts/check-data.ts`) is a read-only check — slug format, topics/themes vs `src/db/topics.ts`, published records have sources, intercessory miracles have a published saint, `saint_relations` mirrored, feast field validity, `// [in DB]` feast entries match a saint, URL schemes, restricted recipient names not leaking into free text, duplicate/copy-pasted `saint_locations` coordinates, and no em dashes in free-text columns (biography_short, synopsis, cure_details, etc. — see style note below). Run it after any data change; exits 1 on errors.
- **Publishing workflow (decided 2026-10-09):** research and drafting happens in the sibling
  `catholic-research` repo (`../catholic-research/TheMiracleRegister/Notes/`,
  `github.com/Labnerd-net/catholic-research` — if the sibling-directory path doesn't resolve,
  clone from there), not here. Claude
  writes finished saint/miracle records directly into the production Neon DB from that research
  — no file hand-off step, no admin panel in between. New records are always inserted with
  `published: false`. `npm run check:data` must run immediately after every write, before the
  record is reported as ready — this stands in for the PR-review gate the file-based sibling
  sites (HallowedTales, UnhallowedTales) get from git, since direct DB writes have no git
  history to review or revert. A human reviews the draft via
  `/saints/<slug>?preview=<PREVIEW_TOKEN>` or `/miracles/<slug>?preview=<PREVIEW_TOKEN>` and
  flips `published` to `true` once satisfied. This repo is pure application code under this
  model — it has no obligation to track content changes in git, since content was never
  checked in here.

---

## CI/CD

- `.github/workflows/ci.yml` runs `npm run types` (generates the gitignored `worker-configuration.d.ts`), `npm run typecheck` (`astro check`), `npm test` and `npm run build` on every pull request and push to `main`. It is check-only and holds no Cloudflare credentials.
- **Deploys** happen through the Cloudflare Workers Builds connector on push to `main`, not through GitHub Actions.
- **PR flow:** work on `claude/feature/*` branches and merge via pull request. `main` has branch protection requiring the `check` job to pass, so the connector only deploys code that passed CI. Repo settings (not in code): branch protection on `main` with required status check `check`; repository secret `DATABASE_URL`.
- Tests need no secrets and never touch Neon: each test file gets its own in-process PGlite database built from the real `drizzle/` migrations and seeded from `tests/helpers/fixtures.ts`. `tests/setup.ts` swaps `createDb` for it, and `vitest.config.ts` sets an unreachable `DATABASE_URL` so anything that bypasses the swap fails fast. Fork PRs therefore pass CI. When adding a table or required column, update the fixtures.
- Lint (ESLint/Prettier) is not set up yet.

## Implementation Order

1. Drizzle schema + Neon setup (dev branch + prod branch)
2. Astro + Cloudflare Workers base
3. Hono API layer wired up with `@hono/zod-openapi`
4. Static pages rendering from DB
5. API endpoints + OpenAPI spec (generated, always in sync)
6. ~~Admin panel for data entry~~ (built, later removed in favor of direct DB edits + `npm run check:data`)
7. Vitest unit tests
8. Playwright e2e tests
9. GitHub Actions CI/CD
10. Docker Compose for local dev (last — only after everything works)

---

## Research Notes

Claude handles both coding and research for this project — there are no separate AI handoffs.
As of 2026-10-09, research and drafting happens in the sibling `catholic-research` repo (see
Database → Publishing workflow), not here. This repo's own `context/Notes/` no longer holds
research content — it was removed (2026-10-09) now that `catholic-research` is the single
source of truth and can be kept private, unlike this repo (public, for portfolio/resume
purposes). `context/Notes/` still holds this repo's own QA output (`proofreading-*.md`,
`source-verification-*.md`, `source-coverage-gaps.md`, `dead-links-archive.md`, written by the
`proofread`/`verify-sources` skills auditing already-*live* DB content) — that stays here since
it's a report on this repo's own data, not drafting material.

---

## Research Sources

Full source list, tiering, and per-category research links: `../catholic-research/TheMiracleRegister/Notes/Research Resources.md`. Sourcing standard (what counts as Tier 1/Tier 2, minimum bar per `content_tier`): `.claude/skills/verify-sources/SKILL.md`, which cites specifics from `../catholic-research/TheMiracleRegister/Notes/Source Requirements Standard.md`.

---

## Key Decisions & Rationale

- **Cloudflare Workers over self-hosting:** Avoids downtime when homelab is offline; Workers is Cloudflare's forward-looking full-stack platform (Pages is frozen — no new investment)
- **Hono for API layer:** Native Cloudflare Workers support, first-class `@hono/zod-openapi` integration
- **Drizzle over Prisma:** SQL-first, lighter, better Neon compatibility
- **`miracle_sources` table over JSON blob:** Enables filtering and full-text search on sources
- **`saint_relations` join table over self-FK:** Handles pairs and groups, extensible
- **Zod as single source of truth:** Drives runtime validation, TypeScript types, and OpenAPI spec
- **Neon dev branch:** Separate dev and prod database branches to avoid schema accidents
- **`MIRACLE_TOPICS` vs `SAINT_THEMES`:** Topics tag miracle records with any descriptive dimension of the event — recipient role, vocation, life circumstance, or context (e.g. `religious-life`, `veterans`, `mothers`, `conversion`). Themes tag saint records with spiritual/devotional character. Medical conditions belong in `medical_diagnosis`; miracle phenomena belong in the `type` enum.
- **`noted_for` removed:** Was redundant with `themes` (structured) and `biography_short` (narrative). Saints have two tag fields: `patronage` (formal Catholic designation) and `themes` (standardized spiritual tags).
- **Carlo Acutis' Eucharistic miracle exhibition** (miracolieucaristici.org) is the primary source for individual Eucharistic miracle records (`type: eucharistic`) — but replicating its full 153-case catalog as original core content is out of scope. Cite it as a source; don't rebuild it.
- **Easter calculation:** `src/lib/easter.ts` implements Meeus/Jones/Butcher algorithm. `getEaster(year)` returns Easter Sunday UTC; `resolveMovableFeast(offset, year)` adds the offset. Used by the homepage Today's Feast widget to resolve `feast_easter_offset` values against the current year.
