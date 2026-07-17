# Project Backlog

> Generated: 2026-07-17
> Updated: 2026-07-17 — #1, #2, #4, #8, #9, #10, #21 completed and removed
> Focus: Full audit

---

## Security

### High
_None identified._

### Medium
- **#3 Static, non-expiring preview token** (`src/pages/saints/[slug].astro:13`, `src/pages/miracles/[slug].astro:12`): `isPreview` is granted by a single static `PREVIEW_TOKEN` compared with `===` (non-constant-time), shared across all unpublished content indefinitely and un-revocable per record. Low priority for a small single-admin project, but consider scoping tokens per-record (HMAC of `slug + secret`) or requiring the admin session cookie instead.

### Low
_None identified._

---

## Bugs

### High
_None identified._

### Medium
_None identified._

### Low
_None identified._

---

## Performance

### High
_None identified._

### Medium
- **#5 `/random` forces a full table scan + sort** (`src/pages/random.astro:14-28`): `ORDER BY RANDOM()` scans and sorts the entire `saints`/`miracles` tables on every request (page sets `Cache-Control: no-store`, so this runs every hit). Fix: use `OFFSET floor(random() * count) LIMIT 1` with a pre-fetched count, or `TABLESAMPLE`.
- **#6 Missing index on `published` columns** (`src/db/schema/saints.ts`, `src/db/schema/miracles.ts`): Nearly every public-facing query filters on `eq(saints.published, true)` / `eq(miracles.published, true)`, but there's no index on either column. Currently masked by small data volume — add a btree (or partial) index once the dataset grows.

### Low
- **#7 Unbounded search results with no pagination** (`src/pages/search.astro:32,49`, `src/api/routes/search.ts`): Results are capped at 200 (page) / 100 (API) but rendered without pagination — a broad single-word query dumps the full capped set into the page at once. Fix: apply the same page/limit pattern already used on `/miracles` and `/saints`.

---

## Improvements & Refactors

### High
_None identified._

### Medium
- **#11 Feast-day resolution logic duplicated across three files** (`src/pages/index.astro:38-52`, `src/pages/calendar.astro:58-77`): The fixed-month/day-or-movable-Easter-offset match logic is reimplemented per page rather than centralized alongside `src/lib/easter.ts`. Fix: extract `getFeastsForDate()` / `getFeastsForMonth()` helpers in `src/lib/`.
- **#12 Client-side JS duplicates server-rendered card markup** (`src/pages/miracles/index.astro`, `src/pages/miracles/[slug].astro`): `renderCard`, `buildApiUrl`, `buildPageUrl`, and lightbox logic are inlined in `<script>` blocks (~180 lines) rather than extracted to a shared module, duplicating server-side rendering logic and risking drift. Fix: extract into a shared TS module (e.g. `src/lib/miracleCard.ts`).
- **#13 No lint/format tooling configured**: `package.json` has no `lint`/`format` script and no ESLint/Prettier config exists, despite `CLAUDE.md` documenting a `typecheck → lint → test → deploy` CI pipeline that doesn't appear to exist (no `.github/workflows` found). Fix: add `astro check` + ESLint as a script/CI stage to catch drift like #8–#10 before merge, or update docs to reflect actual pipeline.
- **#14 Testing docs overstate coverage; stray session artifacts committed**: `README.md`/`CLAUDE.md` describe "Vitest (unit), Playwright (e2e)" but only Vitest tests exist (`tests/api.test.ts`, `markdown.test.ts`, `schema.test.ts`) — no `playwright.config.ts`, no `e2e/` dir, no `playwright` devDependency. Separately, `.playwright-mcp/` (interactive MCP browser-session logs, not test code) appears to be committed rather than gitignored. Fix: either add minimal Playwright smoke tests for critical flows (miracle detail render, filter interaction, admin login) or correct the docs; gitignore `.playwright-mcp/`.

### Low
- **#15 `SaintsQuerySchema` duplicates `PaginationQuerySchema`** (`src/api/routes/saints.ts:17-24`): Hand-rolls `page`/`limit` fields identical to the unused `PaginationQuerySchema` in `src/api/schemas.ts:224-227`. Fix: `.merge()` or spread instead of duplicating.
- **#16 `miracles.feast_month`/`feast_day_of_month`/`feast_easter_offset` are write-only**: Editable in `MiracleForm.astro` and selected in `src/pages/miracles/[slug].astro:44-45`, but never rendered anywhere. Either wire into the detail page (e.g. "Commemorated with [Saint]'s feast on March 3") or drop the unused select.
- **#17 `content_tier` enum has no visible effect on rendering** (`src/db/schema/miracles.ts:56`, `MiracleForm.astro:308-312`): `core`/`catalog`/`stub` is captured in the admin form but no page branches on it to shorten rendering for lighter-weight entries, despite `CLAUDE.md` describing that intent. Confirm whether it's planned or should be removed to reduce admin-form surface.
- **#18 Admin form validation gaps for topics/themes/URLs** (`src/lib/form-utils.ts`, `src/pages/admin/miracles/new.astro`, `.../[slug]/edit.astro`): Only `title`/`saint_ids` or `name`/`canonization_stage` are Zod-validated; topics/themes aren't checked against the canonical `MIRACLE_TOPICS`/`SAINT_THEMES` lists, and URL fields aren't validated as URLs. Low risk (single trusted admin) but allows typo'd values into controlled-vocabulary columns, silently breaking topic filtering.
- **#19 Admin edit pages mix many unrelated form actions** (`src/pages/admin/miracles/[slug]/edit.astro`, `src/pages/admin/saints/[slug]/edit.astro`): 300+ line files handling `add_image`/`delete_image`/`add_source`/`delete_source`/main update (plus relations/locations on the saints version) in one file. Consider extracting each sub-resource action into shared `src/lib/` helpers.
- **#20 Inconsistent boolean query-param typing** (`src/api/schemas.ts:209-210`, `src/api/routes/miracles.ts:73-74`): `used_for_beatification`/`used_for_canonization` are typed `z.string().optional()` and checked with `=== "1"` rather than `z.coerce.boolean()` or `z.enum(["1"])`, showing as free-text in the generated OpenAPI spec.
- **#22 Admin middleware re-validates HMAC on every request** (`src/middleware.ts:8`): Not a bug at current scale — every `/admin` request pays the `crypto.subtle` HMAC verify cost, and auth is a single shared password. Just flagging as the one place session logic lives if multi-user admin accounts are ever added.

---

## Feature Ideas

### High
- **#23 Patronage / topic browse pages**: `saints.patronage` (GIN-indexed `text[]`) is only used for free-text display and search matching — there's no "Patron Saint of ___" browse/index page, a natural feature for a Catholic-saints site with zero migration needed. Same gap for `MIRACLE_TOPICS`/`SAINT_THEMES`: `/miracles?topic=veterans` works as a filter but there's no topic landing page combining matching saints + miracles in one curated view (the API's `search.ts` topic branch already does most of this join).
- **#24 Admin list filtering/search** (`src/pages/admin/saints/index.astro`, `src/pages/admin/miracles/index.astro`): Currently alphabetical, unfilterable tables with no search box or drafts-only toggle. With 30+ saints already researched (`context/Notes/Research/Saints/`), this is becoming the main data-entry bottleneck. A `?q=` text filter plus a published/draft toggle would reuse existing query-condition patterns from the public list pages.

### Medium
- **#25 Human-readable API docs page**: The footer's "API" link points to raw OpenAPI JSON at `/api/v1/doc` (`src/api/index.ts:36-39`). Given the public API is a stated day-one product, mounting `@hono/swagger-ui` (or Scalar/Redoc) at `/api/v1/docs` would turn it into a self-serve, testable reference for consumers.
- **#26 Expose `saint_sources`/`saint_locations` via the public API**: Both tables are fully used server-side (`src/pages/saints/[slug].astro:57-68`) but absent from `src/api/schemas.ts`/`src/api/routes/saints.ts` — `SaintDetailSchema` lacks `sources`/`locations` fields, unlike `MiracleDetailSchema` which includes both. API consumers building a map or citation trail from saint data currently can't.
- **#27 CSV/JSON export of admin data**: No seed script and all data is entered via the admin UI, so there's no way to back up or bulk-review the dataset outside the DB. A simple `/admin/export` (CSV/NDJSON dump) would be cheap insurance and useful for auditing data quality (e.g. saints missing `feast_month`, miracles lacking sources).

### Low
- **#28 Feast-day calendar export (iCal/ICS)**: `/calendar` already computes exact per-year movable feast dates via `src/lib/easter.ts`; a `/calendar.ics` route or per-saint "add to calendar" link would reuse that logic for a devotional audience.
- **#29 "On this day" widget reuse beyond the homepage**: Once the feast-day resolution logic is centralized (see refactor #11), it's cheap to also surface it on miracle detail pages, whose `feast_month`/`feast_day_of_month` fields exist but are never displayed (see #16).
- **#30 Draft preview links surfaced in admin**: Miracle/saint detail pages support a `?preview=PREVIEW_TOKEN` bypass for unpublished records, but admin edit pages don't surface a ready-made preview link — a "Preview" button next to the Live/Draft status would close the loop.
- **#31 RSS/Atom feed for newly published content**: The site has a sitemap but no feed. Given the target audience (Catholic press, researchers, devotional users), a `/feed.xml` of recently published/updated records (using existing `updated_at` columns) would support recurring visitors and inbound citations cheaply.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 1 | 0 | 1 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 2 | 1 | 3 |
| Improvements & Refactors | 0 | 4 | 7 | 11 |
| Feature Ideas | 2 | 3 | 4 | 9 |
| **Total** | 2 | 10 | 12 | 24 |
