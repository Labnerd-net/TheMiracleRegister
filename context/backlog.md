# Project Backlog

> Generated: 2026-09-30
> Focus: Full audit
> Completed and removed (numbering kept stable): #1, #2, #3, #9, #8, #14, #15, #18, #27, #28, #10, #11, #16, #17, #21, #22, #45, #47, #48, #50, #49, #37, #51, #31
> Obsolete after the admin panel removal: #4, #5, #6, #12, #13, #24, #38 (and #30, replaced by `npm run check:data`)

---

## Security

### High
_None identified._

### Medium
_None identified._

### Low
- **#7 No Content-Security-Policy** (`src/middleware.ts`): Basic headers (X-Content-Type-Options, X-Frame-Options, `frame-ancestors`, Referrer-Policy) now ship from middleware, but there is no script/style CSP. Matters because `marked` + `xss` HTML is rendered. Fix: a CSP with nonces or hashes for the inline scripts; blocked by inline styles/scripts (#32, #25).

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
_None identified._

### Low
- **#19 Search has no index** (`src/lib/search.ts` 46-63; `src/api/routes/search.ts` 31-34): ILIKE `%q%` across `biography_short`, `synopsis`, `cure_details` forces sequential scans, and the API fetches up to 200 rows then slices in memory. Fix: `pg_trgm` GIN indexes or a `tsvector` column (consider `unaccent` for names like André/Zélie) and push limit/offset into SQL.
- **#20 Filter option lists queried on every request** (`miracles/index.astro` 78-79; `saints/index.astro` 57-66): Full saint list and distinct countries/orders/nationalities are fetched per request to fill dropdowns. Fix: module-level TTL cache or edge cache.

---

## Improvements & Refactors

### High
- **#23 No default og:image** (`src/layouts/Base.astro`): rel=canonical, og:site_name, noindex on query-string URLs, JSON-LD and the sitemap entries are done. Still open: pages without their own image have no `og:image`/`twitter:image`. Needs a 1200x630 PNG social card in `public/`, then a fallback in `Base.astro`.

### Medium
- **#25 Oversized files mixing concerns**: `miracles/index.astro` (637 lines), `miracles/[slug].astro` (547), `saints/index.astro` (444), `Base.astro` (425), `calendar.astro` (396), `saints/[slug].astro` (370). These mix data fetching, markup, inline scripts and per-page styles. Fix: extract `Lightbox`; move inline scripts to `src/scripts`; move shared CSS out of per-page `<style>` blocks.
- **#26 Duplicated query and filter logic**: API routes and Astro pages each build the same miracle/saint WHERE clauses, and the saint-names-by-miracle Map loop is repeated in `saints.ts`, `miracles/index.astro`, `miracles/[slug].astro`. Pages also re-render cards client-side from the API. Fix: `src/lib/queries/{miracles,saints}.ts`, mirroring the existing `searchContent` extraction.
- **#29 Playwright documented but absent**: Add a smoke suite (home, saint page, miracle filters, search, preview token) or correct CLAUDE.md/README.

### Low
- **#32 Inline styles** (`404.astro`, public pages): Heavy `style="..."` use despite Tailwind and CSS variables. Fix: move repeated styles to classes in `global.css`; this also enables a stricter CSP.
- **#33 Minor cleanup**: `any` hits in `miracles/index.astro` and `saints/index.astro` (inline scripts); `used_for_*` typed as string compared to `"1"`; `escHtml` re-implemented in inline scripts; README/CLAUDE.md list only some `/api/v1/miracles` params.
- **#34 Unused or write-only fields**: `content_tier` is not used by any page; miracle `feast_*` columns are write-only. Fix: wire them up or drop them.
- **#35 Dev environment safety**: `npm run db:migrate` runs against production (single Neon branch); no `.nvmrc`/`engines`; Docker Compose is absent. Fix: add a Neon dev branch or a pre-migrate confirmation, and `.env.example` guidance.
- **#36 `createDb()` boilerplate**: Called per request in most pages. Fix: set `Astro.locals.db` in a new `src/middleware.ts`.

---

## Feature Ideas

### High

### Medium
- **#39 Human-readable API docs**: Scalar or Swagger UI at `/api/v1/docs`, plus an API usage page and a "Cite this record" button (APA/Chicago with permalink and access date).
- **#40 API expansion**: Expose saint sources, locations and related miracles; add `?fields=`, `?published_since=`, `ETag`/`Last-Modified` from `updated_at`, and bulk JSON/CSV export (`/api/v1/export`).
- **#41 Public source-verification status**: Add `last_verified_at`/`verification_status` to source tables, show a "sources checked on" badge, tie into `/verification`, and optionally run a scheduled Worker cron for dead-link checks.
- **#42 Discovery on existing data**: Similar miracles (shared topic/diagnosis/type/country), statistics page (by type, decade, country, approval authority), recently canonized/beatified feed, show dispensation fields on saint pages, "On this feast day" block from miracle `feast_*` columns.

### Low
- **#43 RSS/Atom feed and ICS calendar export** (per-saint "add to calendar"), reusing `updated_at` and Easter logic.
- **#44 Map and calendar polish**: Map filter by location type, `/map?saint=` deep links, year picker on `/calendar` (`getEaster(year)` already supports it).
- **#46 i18n groundwork**: Plan `hreflang` and translatable fields; large effort, defer.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 1 | 1 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 2 | 2 |
| Improvements & Refactors | 1 | 3 | 5 | 9 |
| Feature Ideas | 0 | 4 | 3 | 7 |
| **Total** | 1 | 7 | 11 | 19 |
