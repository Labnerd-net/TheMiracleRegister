Miracles Project - Proposed Tech Stack

CONCEPT: A data-driven, searchable website documenting miracles attributed to recent Catholic saints, with medical/Vatican documentation, narrative synopses, source trails, and public API endpoints.

DOMAIN: themiracleregister.org (registered May 2026)

PRIMARY STACK:

Language: TypeScript
- Already Brian's primary language. Used across Astro frontend, Pages Functions API, Drizzle schemas, and tests.
- Type safety across the full stack: DB schema → API responses → frontend rendering.

Frontend: Astro
- Static site generation + server-side rendering via Cloudflare Pages
- Great SEO out of the box
- Content collections for structured data
- Islands architecture for interactive elements (search, filters, maps)
- Excellent developer experience
- First-class Cloudflare adapter

Hosting/Deployment: Cloudflare Pages
- Still actively maintained and developed. Has NOT been replaced by Workers.
- Pages Functions (server-side code) run on Workers under the hood, managed through Pages' deployment pipeline.
- Free tier: generous free plan (500 deploys/month), global CDN, automatic HTTPS
- Git-based continuous deployment from any provider
- Custom domain easily configurable

API Layer: Pages Functions (Workers-based)
- API endpoints live in functions/api/*.ts files alongside the Astro project
- Automatically deployed with the rest of the site
- Edge-distributed, no cold start concerns

Database: Neon (Serverless Postgres)
- Postgres-compatible, full SQL
- Works with Cloudflare Workers via HTTP (no persistent connections)
- Branching for dev/staging/prod
- Free tier: 0.5GB storage
- Automatic scaling, no ops

ORM: Drizzle
- Lightweight, SQL-first TypeScript ORM
- Database schema as TypeScript types (single source of truth)
- First-class Neon support via drizzle-orm/neon-http
- Zod schemas for input validation on API endpoints

Planned API Endpoints:
GET /api/v1/saints - List all saints
GET /api/v1/saints/:slug - Single saint with linked miracles
GET /api/v1/miracles - Search/filter (query: saint_id, type, country, year_from, year_to, page, limit)
GET /api/v1/miracles/:slug - Single miracle with full details
GET /api/v1/types - List miracle types
GET /api/v1/search - Full-text search

Response format: Consistent JSON envelope with data, meta (pagination), error fields.
API will be documented with an OpenAPI 3.0 spec alongside the code (separate YAML file, updated as endpoints evolve).

Local Development: Docker Compose
- Services: Astro dev server (with hot reload), local Postgres (or Neon proxy), Wrangler (for local Workers/Pages Functions testing)
- Single docker compose up to get everything running
- Ensures reproducible dev environment

CI/CD: GitHub Actions
- On push: TypeScript type checking, linting, unit tests (Vitest), Playwright e2e tests
- On merge to main: Auto-deploy to Cloudflare Pages
- Also runs API endpoint contract checks against the OpenAPI spec

Testing:
- Vitest for unit tests (API endpoint logic, Drizzle queries, data transformations)
- Playwright for e2e tests (search flow, filter by saint, map interaction, mobile layout)
- Runs in CI on every PR

DATA MODEL (revised after researching 10 saints):

saints:
- id (integer, primary key)
- slug (URL-friendly, e.g., "john-paul-ii")
- name (display name, e.g., "John Paul II")
- birth_name (e.g., "Karol Jozef Wojtyla")
- birth_date, death_date
- feast_day
- religious_order (e.g., "Diocesan Priest", "Franciscan", "Missionaries of Charity")
- nationality (primary)
- birth_place, death_place
- beatification_date, beatified_by
- canonization_date, canonized_by
- canonization_type (enum: confessor, martyr, virgin, married_couple, other)
  - Added: distinguishes Kolbe (martyr, 1 miracle needed) from JPII (confessor, 2 needed)
- canonization_stage (enum: saint, blessed, venerable, servant_of_god)
  - Added: handles saints at various stages (Carlo is "blessed", Frassati is "venerable")
- patronage (text array)
- biography_short (300 word summary)
- total_attributed_miracles (integer, optional)
  - Added: Brother Andre had thousands, Padre Pio had hundreds - good for context
- saint_group_id (self-referential FK, optional)
  - Added: handles canonized pairs like Louis & Zelie Martin
- image_url
- wikipedia_url
- created_at, updated_at

miracles:
- id (integer, primary key)
- saint_id (foreign key to saints)
- slug
- title
- miracle_category (enum: intercessory, associated)
  - Added: intercessory = posthumous prayer/healing attributed to saint's intercession (primary focus). associated = miracle that happened to/through the saint during life, like the Tilma of Guadalupe or Padre Pio's stigmata (only for famous cases)
- type (enum: healing, nature, eucharistic, stigmata, incorruptibility, apparition, miraculous_image, prophecy, bilocation, other)
  - Added: miraculous_image for cases like the Tilma
- subtype (enum: cancer, neurological, infectious, obstetric, orthopedic, gastrointestinal, cardiovascular, dermatological, respiratory, other)
  - Added: enables medical specialty filtering within "healing" type
- date_of_event (date, can be null if not precisely known)
- date_precision (enum: exact_day, month, year, decade, century, unknown)
  - Added: some older miracles have vague dates
- timing_relative_to_saint_death (enum: during_lifetime, posthumous, not_applicable)
  - Added: important distinction - some miracles happened while the saint was still alive. not_applicable for apparitions/images
- location_name
- location_lat, location_lng (for maps)
- country
- region (optional, for sub-national regions like "Quebec", "Sicily")
- recipient_name (null for associated miracles)
- recipient_privacy (enum: public, first_name_only, confidential, not_applicable)
  - Added: not_applicable for associated miracles with no recipient
- recipient_age_at_event (integer, optional)
- recipient_gender (enum: male, female, unknown, not_applicable)
- medical_diagnosis (null for associated non-healing miracles)
- cure_details (free text, 500 words)
- cure_characteristics (enum: instant_complete, gradual_complete, instant_partial, gradual_partial, not_applicable)
  - Added: not_applicable for non-healing miracles
- was_medically_verified (boolean)
- medical_verification_date (date, optional)
- intercessory_medium (enum: prayer_only, relic, blessed_oil, medallion, visitation, tomb_prayer, saint_image, not_applicable, other)
  - Added: not_applicable for associated miracles
- vatican_recognized (boolean)
- vatican_decree_date (date, optional)
- vatican_medical_board_verdict (text, optional)
  - Added: the Vatican's Consulta Medica issues formal verdicts
- used_for_beatification (boolean)
- used_for_canonization (boolean)
- synopsis (narrative text, 500-1000 words)
- source_references (JSON array of {url, title, type})
- has_primary_sources (boolean)
  - Added: distinguishes well-sourced from less-documented cases
- created_at, updated_at

ALTERNATIVES CONSIDERED:
- SQLite + static JSON: Too limited for search/filter
- Dokploy self-hosted: User wants to avoid for public-facing work
- Netlify: Good but fewer edge function capabilities
- PlanetScale: MySQL, less serverless-friendly on free tier
- Turso: Edge SQLite, less proven for this use case
- AWS: Considered for resume value but rejected as excessive complexity for this project's needs

SCHEMA GAPS FOUND DURING RESEARCH:
1. canonization_type & canonization_stage - Not all saints are the same type (martyr vs confessor) or at same stage (blessed vs saint)
2. date_precision - Many older miracles don't have exact dates
3. timing_relative_to_saint_death - Miracles during vs after saint's life
4. recipient_privacy - Some recipients are named, others are confidential
5. cure_characteristics - Two axes: instant/gradual × complete/partial
6. intercessory_medium - Prayer, relic, oil, medallion, etc.
7. miracle_subtype - Medical specialty within healing type
8. saint_group_id - Canonized pairs like Louis & Zelie
9. total_attributed_miracles - Lifetime miracle count for context
10. has_primary_sources - Documentation quality varies significantly
11. miracle_category - Intercessory vs associated miracles (Tilma, stigmata, etc.)

FUTURE ENHANCEMENTS:
- Maps integration (miracle locations via lat/lng)
- Timeline view (saint life + miracles)
- Full-text search across all fields
- User submissions (moderated)
- Downloadable data (CSV/JSON export)
- API rate limiting and authentication for high-volume consumers
- OpenAPI / Swagger documentation for the API