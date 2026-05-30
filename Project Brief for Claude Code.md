Miracles Project — Project Brief for Claude Code

DOMAIN: themiracleregister.org (registered May 2026)

OVERVIEW
A data-driven website documenting miracles attributed to Catholic saints, focused on canonization miracles (Vatican-confirmed) with medical documentation, narrative synopses, source trails, and public API endpoints. Fills the gap that no existing site covers saint intercession miracles as a structured, searchable database.

SCOPE
- Primary focus: Intercessory miracles (posthumous healings attributed to a saint's intercession)
- Secondary: Associated miracles for famous cases only (Tilma of Guadalupe, stigmata, incorrupt bodies)
- Starting set: 11 saints (last 50 years + Juan Diego)
- Public-facing website with REST API from day one
- All data types: healing, nature, eucharistic, stigmata, incorruptibility, apparition, miraculous_image, prophecy, bilocation

TECH STACK
- Language: TypeScript (full stack)
- Frontend: Astro with Cloudflare adapter
- Hosting: Cloudflare Pages (custom domain: themiracleregister.org) (still active, NOT replaced by Workers). Pages Functions (Workers-based) for API
- Database: Neon (serverless Postgres)
- ORM: Drizzle (drizzle-orm/neon-http)
- Validation: Zod for API input validation
- Testing: Vitest (unit), Playwright (e2e)
- CI/CD: GitHub Actions (typecheck → lint → test → deploy)
- API docs: OpenAPI 3.0 spec alongside endpoints
- Local dev: Docker Compose (Astro + Postgres + Wrangler)

KEY DECISIONS
- Cloudflare Pages was chosen over self-hosting (Dokploy) to avoid downtime when homelab is down
- AWS was considered for resume value but rejected as excessive complexity for this project
- Two-tier miracle model: intercessory (primary) vs associated (famous-only)
- APIs designed from day one, not retrofitted
- Drizzle vs Prisma: Drizzle is SQL-first, lighter, better with Neon

DATA MODEL

saints:
- id (integer, PK)
- slug (URL-friendly, e.g. "john-paul-ii")
- name
- birth_name
- birth_date, death_date
- feast_day
- religious_order (e.g., "Franciscan", "Missionaries of Charity")
- nationality
- birth_place, death_place
- beatification_date, beatified_by
- canonization_date, canonized_by
- canonization_type (enum: confessor, martyr, virgin, married_couple, other)
- canonization_stage (enum: saint, blessed, venerable, servant_of_god)
- patronage (text array)
- biography_short (300 words)
- total_attributed_miracles (integer, optional)
- saint_group_id (self-referencing FK, for canonized pairs)
- image_url
- wikipedia_url
- created_at, updated_at

miracles:
- id (integer, PK)
- saint_id (FK to saints)
- slug
- title
- miracle_category (enum: intercessory, associated) — intercessory = primary focus, associated = famous-only like Tilma
- type (enum: healing, nature, eucharistic, stigmata, incorruptibility, apparition, miraculous_image, prophecy, bilocation, other)
- subtype (enum: cancer, neurological, infectious, obstetric, orthopedic, gastrointestinal, cardiovascular, dermatological, respiratory, other) — for healing type
- date_of_event (date, nullable)
- date_precision (enum: exact_day, month, year, decade, century, unknown)
- timing_relative_to_saint_death (enum: during_lifetime, posthumous, not_applicable)
- location_name
- location_lat, location_lng
- country
- region (e.g., "Quebec", optional)
- recipient_name (null for associated)
- recipient_privacy (enum: public, first_name_only, confidential, not_applicable)
- recipient_age_at_event (integer, optional)
- recipient_gender (enum: male, female, unknown, not_applicable)
- medical_diagnosis (null for non-healing)
- cure_details (free text)
- cure_characteristics (enum: instant_complete, gradual_complete, instant_partial, gradual_partial, not_applicable)
- was_medically_verified (boolean)
- medical_verification_date (date, optional)
- intercessory_medium (enum: prayer_only, relic, blessed_oil, medallion, visitation, tomb_prayer, saint_image, not_applicable, other)
- vatican_recognized (boolean)
- vatican_decree_date (date, optional)
- vatican_medical_board_verdict (text, optional)
- used_for_beatification (boolean)
- used_for_canonization (boolean)
- synopsis (narrative text, 500-1000 words)
- source_references (JSON array of {url, title, type})
- has_primary_sources (boolean)
- created_at, updated_at

API ENDPOINTS (designed from day one)
GET /api/v1/saints — list all saints
GET /api/v1/saints/:slug — single saint with linked miracles
GET /api/v1/miracles — search/filter (query: saint_id, type, country, year_from, year_to, page, limit)
GET /api/v1/miracles/:slug — single miracle with full details
GET /api/v1/types — list miracle types
GET /api/v1/search — full-text search

Response format: consistent JSON envelope with { data, meta (pagination), error }

IMPLEMENTATION ORDER
1. Drizzle schema + Neon setup
2. Astro + Cloudflare Pages base
3. Static pages rendering from DB
4. API endpoints (alongside pages, not later)
5. OpenAPI spec (alongside endpoints)
6. Vitest unit tests
7. Playwright e2e tests
8. GitHub Actions CI/CD
9. Docker Compose for local dev (last — only after everything works)

STARTER SAINTS (research notes exist in Nextcloud MiraclesProject/Research/)
1. John Paul II — 2 miracles (Parkinson's, brain aneurysm)
2. Mother Teresa — 2 miracles (abdominal tumor, brain abscesses)
3. Padre Pio — 2 miracles (peritonitis, meningitis/coma) + lifetime healings
4. Faustina Kowalska — 2 miracles (lymphedema, heart condition)
5. Gianna Beretta Molla — 2 miracles (breast tumor, placental abruption)
6. Kateri Tekakwitha — 2 miracles (flesh-eating bacteria, older healing)
7. Andre Bessette — 2 miracles (tuberculosis, foot fracture) + thousands lifetime
8. Maximilian Kolbe — 2 miracles (intestinal TB, peritoneal calcification) — martyr
9. Louis & Zelie Martin — 2 miracles (respiratory, respiratory) — married couple
10. Carlo Acutis — 2 miracles (pancreatic, head trauma) — still blessed, canonization pending
11. Juan Diego — 1 canonization miracle (fall/coma) + Tilma — equipollent beatification

RESEARCH SOURCES
- Vatican News / vatican.va for canonization decrees
- Catholic News Agency, EWTN, National Catholic Register for news coverage
- Wikipedia for initial overviews (always verify against Vatican sources)
- Miracle Hunter (miraclehunter.com) for general reference (dated but useful)

NOTES
- Carlo Acutis' Eucharistic miracle website (miracolieucaristici.org) is still active — our project does NOT duplicate this (different focus entirely)
- No existing site covers saint intercession miracles in a structured database format — this is a genuine gap
- The Vatican's medical board (Consulta Medica) reviews each miracle — their verdicts are primary sources