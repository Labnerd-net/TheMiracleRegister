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
