# Current Feature

## Current Feature Spec File

_None_

## Current Feature Plan File

_None_

## History

### Deduplicate Search Logic Between API and Page (backlog #9)
`src/api/routes/search.ts` and `src/pages/search.astro` independently ran near-identical `ilike` queries against `saints`/`miracles`, maintained as two separate code paths. Extracted a shared `searchContent()` into `src/lib/search.ts`, parameterized by `excerptLength`/`perEntityLimit` so each caller's existing visible behavior is preserved exactly (200-char excerpt/100 per-entity cap for the API, 220-char/200-cap for the page — no behavior change). Both the API route and the Astro page now call the same function; the page filters the unified result list by `type` to render its Saints/Miracles sections. Topic search remains API-only (page has no topic UI) — not part of this dedup. Verified build, tests, and manual queries against both entry points render identically to before.

### Single Source of Truth for Miracle Types (backlog #8)
`MIRACLE_TYPES` was hardcoded independently in three places — `src/api/routes/metadata.ts`, `src/api/routes/types.ts`, and `src/pages/miracles/index.astro` — each a manual copy of the 10 values in the canonical `miracleType` enum (`src/db/schema/enums.ts`). Any new miracle type required updating all four locations in sync. Replaced all three with derivations from `miracleType.enumValues`, using the existing `humanizeSnakeCase()` helper for labels (verified it reproduces the old hardcoded labels exactly, e.g. "Miraculous Image"). Verified `/api/v1/types`, `/api/v1/metadata`, and the `/miracles` filter dropdown all render identical output to before. Build, tests, and preview all pass.

### Constant-Time Admin Password Comparison (backlog #2)
Replaced the plain `===` comparison of the submitted login password against `env.ADMIN_PASSWORD` with a constant-time check. Added `verifyPassword()` to `src/lib/auth.ts`, which HMACs the expected password and verifies the submitted password's HMAC against it via `crypto.subtle.verify` (constant-time by spec). Wired into `src/pages/admin/login.astro`. Verified locally: wrong password still shows "Incorrect password," correct password redirects to `/admin` with a valid session cookie.

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

### Miracles Timeline Page (#30)
Added `/miracles/timeline` showing all miracles with usable dates (exact_day, month, or year precision) grouped by decade. 50 miracles across 21 decades from the 1530s to 2020s. Decade markers on the left, miracle cards on the right with colored category dots, formatted date, country, and type. Timeline link added to main nav alongside Map. No schema changes.

### Miracle Detail Filter Links
Made the type label and approval badge in the miracle detail page eyebrow clickable links to the filtered miracles list (`/miracles?type=X`, `/miracles?approval_authority=X`). The miracle category label stays plain text since no category filter exists on the list page.

### Related Miracles by Topic (#27)
Added a Related Miracles section to the miracle detail page showing up to 5 miracles with overlapping topics (excluding self). Uses a PostgreSQL array overlap query with explicit `ARRAY[...]::text[]` syntax via Drizzle's `sql` template tag. Only renders when the current miracle has topics. Topic tags on the detail page now link to `/search?q=<topic>` for discovery.

### Miracle Topics Expansion
Queried DB to find topic coverage gaps (29/58 miracles had topics). Expanded `MIRACLE_TOPICS` with `clergy`, `veterans`, `conversion`. Bulk-tagged 17 miracles via DB transaction. Coverage reached 46/58 — remaining 12 intentionally empty (phenomena, Eucharistic miracles, unknown recipients).

### Miracle Topics Cleanup
Removed ambiguous or unused topics (`fathers`, `financial-hardship`, `workplace`, `pro-life`). Renamed `clergy` → `religious-life` to accurately cover nuns, brothers, and priests. Updated 9 DB records via transaction. Tagged incorruptibility miracles (Bernadette, Catherine Labouré) with `religious-life` and Miracle of the Sun with `children`. CLAUDE.md updated.

### API Metadata Endpoint (#28)
Added `GET /api/v1/metadata` returning canonical filter options in a single call: miracle types, miracle categories, approval authorities, `MIRACLE_TOPICS`, and `SAINT_THEMES`. Static response (no DB query) cached at 24h via Cache-Control middleware. Wired into the Hono app alongside the existing routes and documented in CLAUDE.md.

### Vatican Decree Source Highlight (#35)
Vatican decree sources on miracle detail pages are now sorted to the top of the sources list and rendered as a pill badge (accent background, accent text) matching the Vatican Approved approval badge. All other source types remain as plain uppercase labels.

### Related Miracles — Saint-Linked Priority
Extended the related miracles query to run two queries in parallel: saint-linked miracles (via shared `miracle_saints` entries) and topic-linked miracles. Results are merged with saint-linked first, deduplicated, and capped at 5. This ensures canonically related records (e.g. Miracle of the Sun on the Our Lady of Fatima page) always surface regardless of topic overlap count.

### Custom 404 Page (#34)
Added `src/pages/404.astro` matching the site design — logo, nav, footer, and three navigation links (Browse Saints, Browse Miracles, Home). Astro serves this automatically for unmatched routes.

### Mobile Nav and Footer (#40)
Header nav links (Saints, Miracles, Map, Timeline) are now hidden on mobile behind a hamburger button. Clicking the hamburger reveals a dropdown panel; the icon switches to an X and toggles back. Search icon and theme toggle remain always visible. Footer links changed from a single-column stack to a 2-column grid on mobile, matching the desktop row layout more compactly.

### Markdown HTML Sanitization (#2)
Added `xss` (pure JS, Workers-compatible) to sanitize `marked.parse()` output in `src/lib/markdown.ts` before it reaches `set:html={}`. Unknown tags stripped (`stripIgnoreTag: true`), script/style tag bodies fully removed (`stripIgnoreTagBody`), event attributes stripped, `javascript:` hrefs blocked. Allowlist covers all tags `marked` legitimately emits (p, strong, em, a, ul, ol, li, blockquote, code, pre, br, h1-h6). 9 tests added in `tests/markdown.test.ts`. All 3 callsites (`biography_short`, `cure_details`, `synopsis`) covered automatically via the shared helper.

### Open Graph Meta Tags (#23)
Added OG and Twitter Card meta tags to `Base.astro` via two new optional props: `ogImage` and `ogType`. Always-rendered tags: `og:title`, `og:type` (defaults to `"website"`), `og:url` (canonical, query-param-free), `twitter:card`, `twitter:title`. Conditional tags (only when props provided): `og:description`, `og:image`, `twitter:description`, `twitter:image`. Saint detail pages pass `ogType="profile"`, the saint's `image_url`, and a bio excerpt. Miracle detail pages pass `ogType="article"`, the miracle's `image_url`, and a synopsis excerpt. Excerpts are generated by `ogDescription()` in `src/lib/format.ts`, which strips markdown syntax and truncates at a word boundary near 160 chars. No fallback site image — pages without a specific image omit the image tags cleanly.

### Pagination Component and Refactor Extractions
Extracted duplicate pagination markup into `src/components/Pagination.astro` — removed inline pagination HTML from saints list, miracles list, admin saints list, admin miracles list, and timeline. Added `formatDate()` to `src/lib/format.ts`. Extracted API error factory functions into `src/api/errors.ts` (notFound, badRequest, etc.) and updated miracles and saints API routes to use them. No behavior changes.

### Sitemap and robots.txt
Added `src/pages/sitemap.xml.ts` as an Astro endpoint that generates a sitemap from all published saints and miracles in the DB. Added `public/robots.txt` pointing crawlers to the sitemap.

### Family Relation Type and Related Saints Labels
Added `family` to the `relation_type` enum (migration 0024) to handle Thérèse's parents (Louis and Zélie Martin) and sibling relations. Saint detail pages now render the relation type as a label alongside each related saint link. Corrected Mother Teresa's beatification and canonization miracle synopses (removed inaccurate coma/life support detail, added illness timeline, eight abscesses, relic placement, operating room waking).

### Preview Token for Unpublished Pages
Added preview token support to `src/pages/saints/[slug].astro` and `src/pages/miracles/[slug].astro`. Pages with `published = false` are accessible via `?preview=<token>` matching the `PREVIEW_TOKEN` environment variable, allowing draft records to be reviewed in production without publishing them. Token validated against `env.PREVIEW_TOKEN`; missing or mismatched token falls through to the normal 404 path.

### Miracle Images Table
Replaced `miracles.image_url` (single text column) with a `miracle_images` join table supporting multiple ordered images per miracle with caption and attribution fields. Migration 0025 data-migrates any existing `image_url` values then drops the column. Admin miracle edit page gains add/delete image management (matching sources pattern, with thumbnail preview). Public miracle detail page renders all images in `display_order` sequence with caption and attribution below each. OG image uses `images[0]`. API detail response includes an `images` array (`MiracleImageSchema`). 23 tests pass, build clean.

### Feast Day Backfill and Miracle Page Display
Backfilled `feast_month`, `feast_day_of_month`, and `feast_easter_offset` on both saints and miracles tables (columns already existed from a prior migration). Added feast day display to the Full Record sidebar on `src/pages/miracles/[slug].astro` — renders only when `feast_month` is set, keeping healing and intercessory miracles uncluttered. A `formatFeastDay()` helper converts month/day integers to a display string. Added backlog items #42 (Today's Feast homepage widget) and #43 (Easter calculation utility prerequisite). Branch `claude/feature/feast-day-miracle-page` merged to main and deleted.

### Miracle Detail Page — Image Display Layout
Iterated on how miracle images render on the detail page. Split images into a primary hero (full-width below the header) and a below-synopsis gallery grid. Then included all images in the gallery so none are hidden. Finally promoted the primary image to a true full-width hero spanning the content area for maximum visual impact.

### Saints List Filter UI (#25)
Added a filter bar to `/saints` with three controls: Canonization Stage (dropdown), Theme (dropdown from `SAINT_THEMES`), and Religious Order (text input with ilike). SSR on first load with no-JS fallback via form submit; with JS, filter changes fetch `/api/v1/saints` and swap the card grid in-place via `history.pushState`. Pagination carries active filters forward. "Clear filters" link appears when any filter is active. Empty state renders when no saints match. `GET /api/v1/saints` extended with `canonization_stage`, `theme`, and `religious_order` optional query params validated via `SaintsQuerySchema`. Build clean.

### Miracle Image Lightbox (#44)
Added a lightbox to the miracle detail page gallery. Clicking any image in the Images section opens a full-size `<dialog>` overlay with caption and attribution. Dismissed via Escape key, backdrop click, or close button — all handled natively by `<dialog>` + `showModal()` with no dependencies. Hero image at the top of the page is intentionally excluded (it also appears in the gallery below). Fixed `display: block; width: 100%` on the trigger button for cross-browser click target reliability. Follow-up fixes: added prev/next navigation with arrow-key support and image counter; fixed dialog rendering in upper-left corner by removing `position: relative` override on the dialog element; fixed page scroll-to-top on open by saving and restoring `window.scrollY`; fixed lightbox image persisting on page after close by scoping `display: flex` to `#lb[open]` only.

### Backlog Quick Fixes — Security, Bugs, Admin UX
Worked through 10 backlog items in a single batch. Security: Leaflet popup strings escaped via `escHtml()` to prevent stored XSS; `published = true` filter added to `fetchSaintsForMiracles` and `relatedRows`; `Secure` flag added to `clearSessionCookieHeader()`. Bugs: phantom `birth_place`/`death_place` fields removed from `SaintDetailSchema`; `.limit(200)` added to SSR search queries. Code quality: `humanizeSnakeCase()` now capitalises each word; `approvalBadge()` extracted to `format.ts`; `escHtml()` added to `format.ts`. Admin: published status badge shown on saints and miracles list pages; `?preview=TOKEN` appended to "View public page" links on edit pages. Sitemap: `/map`, `/miracles/timeline`, and `/search` added as static entries.

### Code Quality and Admin UX Cleanup
Second cleanup batch. HMAC verification replaced `safeEqual()` with `crypto.subtle.verify()` for genuine constant-time comparison. Zod enum schemas in `schemas.ts` now derived directly from Drizzle enum values to eliminate duplication. `typeColors` map extracted to `src/lib/mapConstants.ts` and passed via `define:vars` to map and saint detail pages. Confirm dialogs added to Remove buttons on miracle source and image rows in admin edit page. Miracles admin list default sort changed from title to `date_of_event asc nulls last`.

### Admin Form Missing Fields
Added fields that existed in the schema but were absent from admin forms. `MiracleForm` gains: `content_tier` select (core/catalog/stub), `location_lat`/`location_lng` inputs, and feast day fields (`feast_month`, `feast_day_of_month`, `feast_easter_offset`). `SaintForm` gains feast day fields. All new fields wired into their respective edit page POST handlers.

### Miracles Topic and Category Filters
Added Topic and Category dropdowns to the miracles list filter bar. Topics use the canonical `MIRACLE_TOPICS` list; category covers intercessory, associated, and apparition. Both wired through the API query schema, route condition, SSR filter logic, and client-side `buildApiUrl`/`buildPageUrl` functions so filters carry through pagination.

### Topic Tag Filter Links, Loading Indicators, Search Capped Flag
Topic tags on the miracles list and miracle detail pages link directly to the filtered miracles list (`/miracles?topic=X`). Client-side filter fetches show a loading indicator while the API call is in flight. Search results page displays a "results capped" notice when the query hits the 200-record limit.

### Editable Slugs, Saint Names on Related Miracles, Leaflet SRI
Admin saint and miracle edit pages now allow editing the slug field (previously read-only). Related miracle cards on the saint detail page show the linked saint names alongside the miracle title. Leaflet CSS/JS SRI hashes updated and then reverted after unpkg served content that did not match the expected hashes — Leaflet loaded without integrity attributes.

### Cascade FK Deletes on Sources Tables
Added `onDelete: 'cascade'` to the `saint_id` FK on `saint_sources` and the `miracle_id` FK on `miracle_sources`. Migration 0026 applied. Deleting a saint or miracle now automatically removes their orphaned source rows.

### Saint Relations Admin UI
Added add/delete relations section to the saint edit page, matching the existing sources/locations pattern. Add form shows a dropdown of all other saints and a relation type selector. Both directions of the `saint_relations` join row are inserted/deleted together so the public detail page sees the link from either saint.

### KV-Backed Login Rate Limiting
Replaced the 300ms failed-login delay with a Cloudflare KV counter keyed to client IP. After 5 failures within 15 minutes the login form is locked out; the KV TTL handles expiry automatically. Counter cleared on successful login. `RATE_LIMIT` KV namespace created and added to `wrangler.jsonc`; `KVNamespace` type added to `env.d.ts`.

### API Docs Link in Footer
Added an "API" link to the public site footer pointing to `/api/v1/doc` (the Swagger UI), making the REST API discoverable to visitors.

### Religious Order Filter — Dropdown
Replaced the free-text religious order input on `/saints` with a `<select>` populated dynamically from distinct `religious_order` values on published saints. Filter logic changed from `ilike` fuzzy match to exact equality. Debounce logic for the text input removed; `change` event now fires immediately on selection.

### Today's Feast Widget (#38 + #39)
Added `src/lib/easter.ts` with Meeus/Jones/Butcher Easter algorithm (`getEaster(year)`, `resolveMovableFeast(offset, year)`). Homepage queries published saints matching today's fixed feast (`feast_month` + `feast_day_of_month`) or movable feast (`feast_easter_offset` = today's offset from Easter). Renders a "Today's Feast" section between the stats strip and featured carousel; hidden when no saints match.

### Feast Day Reference — Gap Analysis and Static Data File
Completed full 12-month liturgical calendar reference at `context/Notes/Research/Catholic Feast Day Reference.md`. For each gap day, researched and either confirmed a feast entry (universal GRC, martyrologium, US, or national) or flagged uncertain days as options with notation. Added 18+ confirmed entries across all months. Promoted 7 option entries to confirmed: Walburga (Feb 25), Agnes of Montepulciano (Apr 20), Zita (Apr 27), Simon Stock (May 16), Our Lady of Mercy (Sep 24), Sergius of Radonezh (Sep 25), Edmund the Martyr (Nov 20). Built `src/data/feastDays.ts` — static TypeScript array of 280+ confirmed fixed feast entries (month/day) and 8 Easter-relative movable feasts with scope annotations (us, national, martyrologium, diocesan). DB saints commented out with `// [in DB]` markers to avoid calendar duplication. Helper functions `getFixedFeasts()` and `getMovableFeast()` exported for page use.

### Feast Day Calendar Grid (#45)
Added `/calendar` page — monthly grid showing liturgical feasts for each day. DB saints with feast dates appear as clickable links; static entries from `src/data/feastDays.ts` fill remaining days as plain text. Handles both fixed feasts and Easter-relative movable feasts. Month/year navigation via `?month=N&year=N` query params. Today's date highlighted in accent color. Legend at bottom distinguishing saint links from static feast text. Calendar link added to desktop nav, mobile menu, and footer.

### Typography and Layout — Font Size and Margin Improvements
Increased UI chrome text sizes across the board: nav links (0.72 → 0.8rem), eyebrows (0.65 → 0.72rem), tags (0.63 → 0.7rem), stage/used/approval badges (0.58 → 0.65rem), meta-grid labels (0.62 → 0.7rem), meta-grid values (0.85 → 0.9rem). Calendar cell text bumped significantly (feast/saint text 0.6–0.62 → 0.68–0.72rem; cell min-height increased). Side margins reduced from `sm:px-8` to `sm:px-6` across all public pages and layouts for more horizontal content space.
