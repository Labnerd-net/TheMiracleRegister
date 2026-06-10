# Current Feature

## Current Feature Spec File

_None_

## Current Feature Plan File

_None_

## History

### Drizzle Schema and Neon Setup
Initialized the full TypeScript project and database layer. Defined all 4 tables (saints, saint_relations, miracles, miracle_sources) split per file, 13 Postgres enums, Drizzle config, Neon client, and migration tooling. Migration applied successfully to Neon dev branch.

### Astro Cloudflare Pages Base
Added Astro SSR with the Cloudflare Pages adapter to the existing project. Configured astro.config.mjs, wrangler.jsonc, updated tsconfig.json to extend astro/tsconfigs/strict, added dev/build/preview scripts, placeholder index page, and .dev.vars gitignore entry. Build and tests pass.

### Hono API Layer
Wired up Hono with @hono/zod-openapi as the API layer at /api/v1/*. Defined all Zod schemas for response envelopes, saints, miracles, sources, types, and search. Implemented 6 endpoints with stubbed responses and an OpenAPI doc at /api/v1/doc. Mounted via Astro catch-all route. 11 tests pass, build clean.

### Cloudflare Workers Config Fix
Corrected wrangler.jsonc to use `binding: "ASSETS"` and `directory: "./dist/client"` (not the full dist dir). Added `observability` block. Added `deploy` script to package.json using the adapter-generated `dist/server/wrangler.json` which holds the correct post-build `main` path. Updated CLAUDE.md to reflect Workers (not Pages) throughout. Build passes.

### Patronage, Noted For, and Miracle Topics
Added `noted_for text[]` to saints and `topics text[]` to miracles (replacing the `subtype` medical-only enum). GIN indexes on `saints.patronage`, `saints.noted_for`, and `miracles.topics` for performant `= ANY()` queries. Canonical topic list in `src/db/topics.ts` as a TypeScript `as const` array for app-layer validation. `/api/v1/search?topic=X` implemented — returns matching saints (patronage OR noted_for) and miracles (topics). vitest.config.ts added with stub DATABASE_URL so API tests don't require a live DB. Build passes, 11 tests pass. Migration pending (`drizzle-kit generate` + `drizzle-kit migrate` — needs TTY).

### Static Pages Rendering from DB
Five Astro SSR pages query Neon via Drizzle and render real data: homepage (counts), /saints list, /saints/[slug] detail with miracles and related saints, /miracles list, /miracles/[slug] detail with sources. Shared Base.astro layout with minimal serif styling. DB accessed via `createDb(env.DATABASE_URL)` using `cloudflare:workers` env module (Astro v6 pattern). 11 tests pass, build clean.

### Admin Panel
Password-protected admin panel at /admin/*. Auth via HMAC-SHA256 session tokens (Web Crypto API, no external deps), validated by Astro middleware. Secrets: ADMIN_PASSWORD and SESSION_SECRET as Cloudflare secrets. Pages: dashboard, saints list/create/edit, miracles list/create/edit. Topics shown as checkboxes from MIRACLE_TOPICS canonical list. .dev.vars has placeholder dev credentials. Production secrets must be set via wrangler secret put. Build clean, 11 tests pass.

### Backlog — Security, Performance, Bug, and Refactor Batches
Worked through the generated backlog (context/backlog.md). Closed 20 items across four batches:
- **Security:** Open redirect on login fixed (next param validation); CORS middleware added to all /api/v1/* routes; enum `as any` casts replaced with typed `parseEnum` helper (src/lib/form-utils.ts) across all 4 admin forms; 300ms failed-login delay added; search `?topic` param restricted to canonical MIRACLE_TOPICS + SAINT_THEMES via z.enum.
- **Performance:** DB indexes added for miracles(saint_id, type, country) + migration applied; homepage carousel capped at 8 saints; search topic queries parallelized with Promise.all and synopsis excerpt moved to Postgres LEFT(); Cache-Control middleware added (saints 1h, miracles 30m, types 24h, search no-store).
- **Bug:** Duplicate "Verified" label on miracle detail page fixed ("Verified On").
- **Refactors:** `formHelpers(form)` factory extracted to form-utils.ts, removing inline helper duplication from all 4 admin forms; carousel replaced with CSS scroll-snap + minimal scrollBy JS; admin dashboard inline styles extracted to scoped classes; seed.ts warning comment added; API docs link added to public footer.

### Public List Pagination (#12)
Added `?page=N` pagination to `/saints` and `/miracles`. Page size 20. Parallel `count()` + paginated data queries via Drizzle. Prev/next + "Page X of Y" UI renders only when total exceeds one page. Out-of-range page redirects to last valid page. No JS required.

### Admin Form Zod Validation (#18)
Created `src/lib/form-schemas.ts` with `SaintFormSchema` (name, canonization_stage required) and `MiracleFormSchema` (title required, saint_id must be digits). Wired `safeParse` into all 4 admin POST handlers before DB calls. Invalid input now shows a clean error message instead of a raw DB exception.

### Admin List Pagination (#19)
Added `?page=N` pagination (25 per page) to `/admin/saints` and `/admin/miracles`. Parallel count + data queries. Pagination controls render only when total exceeds one page. Out-of-range page redirects to last valid page.

### Mobile Responsiveness
Improved layout on small screens across all public pages. Nav gap and header height reduced on mobile; logo font-size scales down. All `px-8` content containers changed to `px-4 sm:px-8`. Stats strip stacks vertically on mobile with border-bottom between items (border-right on desktop). Hero and section vertical padding reduced on mobile. Sidebar `sticky` restricted to `lg:sticky` so it doesn't apply when stacked below content on mobile. Saint header image capped at 340px height on mobile. Miracle list metadata row wraps on small screens. Carousel viewport left padding adjusted for mobile.

### Homepage Stats Strip — Countries
Replaced the static "Vatican / Primary Sources" stat with a dynamic country count queried from `miracles.country`. All three homepage stats are now data-driven: saints documented, miracles recorded, countries represented.

### Miracle Location Map
Added a Leaflet map to the miracle detail page showing a single OpenStreetMap marker at the miracle's coordinates. Only renders when both `location_lat` and `location_lng` are non-null. Leaflet CSS injected via a new `<slot name="head" />` added to Base.astro; Leaflet JS and map init loaded via `<script is:inline>` inside the layout so scripts stay within `<body>`. Marker popup shows `location_name` and `country` when available. No API key required.

### Saints Location Coordinates
Added `birth_lat`, `birth_lng`, `death_lat`, `death_lng` columns (`numeric(9,6)`) to the saints table. Drizzle migration generated and applied to both dev and production Neon branches. Fields added to `SaintForm.astro` as `type="number" step="any"` inputs. POST handlers in `new.astro` and `edit.astro` updated to read and persist all four fields.

### Admin Form UX Improvements
Added live word count to biography (SaintForm) and synopsis (MiracleForm) textareas — synopsis shows "too short / good / too long" relative to 500–1000 word target. Changed `medical_diagnosis` and `vatican_medical_board_verdict` from single-line inputs to `<textarea>` for comfortable long-text entry. Increased `cure_details` textarea from 4 to 6 rows. Added sticky save button bar (position: sticky; bottom: 0) so the button is always visible on long forms.

### Admin Form Style Fix
Fixed admin form styling not applying to child components. Astro scopes `<style>` blocks to the component's own elements — styles in `AdminBase.astro` were not reaching form elements rendered via `<slot />` from `SaintForm.astro` and `MiracleForm.astro`. Changed `<style>` to `<style is:global>` in AdminBase so all admin layout styles apply correctly.

### Admin Delete
Added two-step delete flow for saints and miracles. Edit pages now have a "Delete" link in the top-right corner. Clicking it leads to a confirmation page showing what will be cascaded (associated miracles when deleting a saint, sources when deleting a miracle). POST on confirm executes the deletion and redirects to the list. Cancel returns to the edit page.

### Markdown Rendering
Added `marked` for markdown rendering of narrative fields. `biography_short`, `cure_details`, and `synopsis` now render as HTML on public pages via a shared `src/lib/markdown.ts` helper and a `.prose` CSS class in global.css (paragraph spacing, bold, italic, links, lists). Admin textareas for these fields show a compact cheat sheet above the input covering the most common syntax for each field type.

### Miracle Source Management
Added inline source management to the miracle edit page. A Sources section below the main form lists all existing sources (title linked to URL, type, accessed date) with a per-row Remove button. An Add Source form handles url, title, type (enum dropdown), and optional accessed date. Both add and delete use a `_action` hidden field to coexist with the main miracle save form on the same page.

### Published Flag
Added `published boolean NOT NULL DEFAULT false` to both `saints` and `miracles` tables (migration 0007, applied to Neon dev). Admin forms for both entities now include a "Published (visible on public site)" checkbox. All public-facing queries — homepage stats, list pages, detail pages, and all API endpoints including search — filter to `published = true` only, so unpublished records are invisible to visitors and API consumers until explicitly published.

### Content Tier
Added a `content_tier` enum (`core`, `catalog`, `stub`) to the miracles table to support the two-tier data model. Core entries get full narrative and medical documentation; catalog entries get short synopses and links to authoritative external sources. Defaults to `core` so existing data is unaffected. Migration 0008 applied. CLAUDE.md updated.

### saint_sources Table
Added `saint_sources` table (mirrors `miracle_sources`) for storing biography citation sources. Saint edit page gains a full Sources section (add/delete) matching the miracle edit page. Migration 0009 applied.

### Miracle Saints Junction Table
Replaced `miracles.saint_id` (single FK) with a `miracle_saints` many-to-many junction table. A miracle can now be attributed to one or more saints. Louis and Zélie Martin's two miracles (Pietro Schiliro, Carmen of Valencia) are linked to both saints in the seed. API responses expose `saints: [{id, slug, name}]` instead of `saint_id`. The public miracle detail page shows all linked saints as links. Admin miracle form uses a checkbox list for saint selection; edit page pre-checks existing links and does delete+reinsert on save. Saint delete confirmation updated to reflect that deletion removes junction rows, not the miracles themselves. Migration 0016 applied; data migration step preserved existing associations before dropping the column. Build clean, 11/11 tests pass.

### Miracle Dispensation Fields
Added three nullable fields to the `saints` table: `beatification_miracle_dispensed` (boolean), `canonization_miracle_dispensed` (boolean), and `dispensation_reason` (enum: martyr, equipollent, papal_exception). Covers cases where miracle requirements were waived — martyrs (Kolbe, Stein), equipollent canonization (Juan Diego), and explicit papal exception (John XXIII). Admin SaintForm updated with a new "Miracle Dispensation" fieldset. Migration 0017 applied. Build clean.

### Explicit Field Selects on Detail Pages (#15)
Replaced four `db.select()` (SELECT *) calls with explicit field lists across three files. `src/api/routes/miracles.ts` now selects exactly the 31 fields in `MiracleDetailSchema`. `src/pages/miracles/[slug].astro` selects 29 fields for the miracle query (excluding slug, published, and unused columns) and 4 fields for the miracle sources query. `src/pages/saints/[slug].astro` selects 4 fields for the saint sources query. Excluded in all cases: `published`, `content_tier`, `created_at`, `updated_at`, and any column used only in a WHERE clause. Build clean, no behavior change.

### Miracle Filter UI (#26)
Added filter bar to `/miracles` with saint, type, country, year range, and canonization-use controls. SSR on first load with no-JS fallback; with JS, filter changes fetch `/api/v1/miracles` and swap the list in-place via `history.pushState`. Pagination carries active filters forward. API list response extended with `cure_details`, `used_for_beatification`, `used_for_canonization`. Removed broken Lisieux sanctuary source from Louis and Zélie Martin.

### Full-Text Search (#36)
Public `/search` page with results grouped by Saints and Miracles, using `ilike` queries against saint name/biography and miracle title/synopsis/diagnosis/cure details. Desktop nav gets an inline search input that expands on focus; mobile gets a magnifying glass icon linking to `/search`. Minimum 2-char query guard. No schema changes needed.

### Approval Authority Schema
Replaced `vatican_recognized` (boolean) with `approval_authority` enum (`vatican_dicastery`, `lourdes_bureau`, `local_bishop`, `none`). Added `apparition` as a third `miracle_category` value alongside `intercessory` and `associated`. Added nullable `witness_count` integer for events with documented audience sizes (e.g. Miracle of the Sun). Migration 0019 applied. All 26 existing production miracles backfilled to `vatican_dicastery`. Build clean.

### Miracle image_url
Added `image_url text` column to the miracles table (migration 0020). Miracle detail page displays the image in the header sidebar when present.

### Homepage Stats — Apparitions Replace Countries
Replaced the Countries stat with Apparitions Documented. `miracleCount` now excludes apparitions (`miracle_category != 'apparition'`); a new `apparitionCount` query counts only apparition-category records. Three stats: Saints Documented, Miracles Recorded, Apparitions Documented.

### Miracle Detail Page — Hide Not-Applicable Fields
Timing and Cure rows in the Full Record sidebar now only render when their value is not `"not_applicable"`, matching the existing behaviour of the Medium row. Prevents "Timing: not applicable / Cure: not applicable" from cluttering apparition and associated miracle pages.

### nihil_obstat Approval Authority
Added `nihil_obstat` as a fourth value to the `approval_authority` enum (migration 0021) for apparitions with Vatican no-objection status but no declaration of supernatural origin.

### Homepage and About Copy Updates
Updated eyebrow ("Miracles of the Saints" → "Catholic Miracles & Apparitions"), hero description, meta description, and About section body copy to reflect the expanded scope of the register — now covering intercessory miracles, Marian apparitions, nature miracles, and associated miracles rather than canonization miracles only.

### Saint Locations Table
Replaced `birth_lat`, `birth_lng`, `death_lat`, `death_lng` columns on saints with a `saint_locations` many-to-many table supporting multiple named locations per saint (tomb, birthplace, death place, shrine, relic, major devotional center, other). Admin saint edit page gained an add/delete locations section matching the sources pattern. Leaflet map on saint detail page replaced the single birth-marker with pins for all locations, each with a popup showing name and type. Seed rewritten with corrected research data, sources, and coordinates for all starter saints.

### Saint Header Image Anchor Fix
Fixed portrait images on saint detail pages cropping faces. Changed `object-position` from `center` to `top` so the top of the image (typically the head) is anchored regardless of the container height.

### Marian Apparitions Seed
Added 15 Vatican-approved Marian apparitions as `miracle_category: apparition` records — including Guadalupe, Lourdes, Fatima, Knock, Miraculous Medal, and others. Each linked to the relevant saint via `miracle_saints` where applicable. Approval authority backfilled from `local_bishop` to `vatican_dicastery` for fully approved apparitions, `nihil_obstat` for Medjugorje.

### Miracle of the Sun
Added the Miracle of the Sun (Fátima, October 13, 1917) as a `miracle_category: associated, type: nature` record with `witness_count: 70000`. Linked to Our Lady of Fátima apparition via `miracle_saints`. First nature-type record in the database.

### Eucharistic Miracles Category
Added Eucharistic Miracles as a new data category under `miracle_category: associated, type: eucharistic`. Research notes organized under `context/Notes/Research/Eucharistic Miracles/`. Synopses include honest acknowledgment of methodological critiques (Kearse/Ligaj 2024 forensic review).

### Research Notes — Category Folder Organization
Moved associated miracle research notes out of saint folders into category-specific folders: `Stigmata/` (Padre Pio stigmata), `Miraculous and Saintly Phenomena/` (Padre Pio bilocation), `Incorruptibles/` (Bernadette, Catherine Labouré), `Miraculous Images/` (Tilma of Guadalupe). Original files in saint folders replaced with one-line pointers. Matches the existing Marian Apparitions and Eucharistic Miracles folder pattern.

### Miracle Detail Mobile Sidebar (#39)
Full Record sidebar now appears above the synopsis on mobile, matching the saints detail page behavior. Implemented by moving `<aside>` before the main content div in the DOM, with explicit `lg:col-start-2 lg:row-start-1` / `lg:col-start-1 lg:row-start-1` grid placement to maintain the two-column desktop layout.

### Approval Authority Badge
Added a visible approval authority badge to miracle cards on the list page and to the detail page header eyebrow. Four tiers with distinct styling: Vatican Approved (accent color), Lourdes Bureau (gold), Bishop Approved (text-2), Nihil Obstat (text-3). Records with `approval_authority: none` show no badge. CSS `.approval-badge` variants added to Base.astro.

### Approval Authority Filter
Added an Approval dropdown to the miracles list filter bar (Vatican Approved, Lourdes Bureau, Bishop Approved, Nihil Obstat). Wired through the Zod query schema, API route condition, SSR filter logic, and both JS `buildApiUrl` / `buildPageUrl` functions so filtered results and pagination carry the selection forward.

### Wikipedia Link — Sidebar to Sources
Moved the Wikipedia external link from the Record metadata sidebar on saint detail pages to the Sources section at the bottom of the page. Sources section now renders when either DB sources or a Wikipedia URL exist, with Wikipedia injected as the first entry under a "Reference" type label.

### Recipient Country Display (#38)
Shows recipient's country of origin on the miracle detail page when it differs from the miracle location country (e.g. "from Italy" beneath the recipient name for Lourdes pilgrims). No display for records where they match, keeping domestic miracles uncluttered.

### World Map Page (#37)
Added `/map` with a full Leaflet world map. Controls panel overlaid on the top-right of the map with two parent toggles — Saint Locations and Miracles — each with granular sub-toggles. Saint location sub-types: tomb, birthplace, shrine, death place, relic (color-coded). Miracle sub-categories: apparitions, intercessory, associated. Parent checkboxes show indeterminate state when children are mixed. Popups link to the relevant saint or miracle page. Map and Timeline links added to main nav and footer. 48 miracle pins and 64 saint location pins at launch.

### Miracle Detail Filter Links
Made the type label and approval badge in the miracle detail page eyebrow clickable links to the filtered miracles list (`/miracles?type=X`, `/miracles?approval_authority=X`). The miracle category label stays plain text since no category filter exists on the list page.

### Miracles Timeline Page (#30)
Added `/miracles/timeline` showing all miracles with usable dates (exact_day, month, or year precision) grouped by decade. 50 miracles across 21 decades from the 1530s to 2020s. Decade markers on the left, miracle cards on the right with colored category dots, formatted date, country, and type. Timeline link added to main nav alongside Map. No schema changes.
