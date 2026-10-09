# Project Backlog

> Generated: 2026-10-09
> Focus: Full audit

Note: the code scan did not read `scripts/`, `tests/`, drizzle migrations, or the saints index, calendar, topics, themes and patronage pages. Items marked "uncertain" are partly inference.

---

## Security

### High
_None identified._

### Medium
- **#1 src/api/index.ts (18-24), src/pages/search.astro (16)**: Rate limiting keys on `CF-Connecting-IP ?? "unknown"` (and `Astro.clientAddress ?? "unknown"`). If the header is absent, all clients share one bucket. Fix: skip limiting explicitly or return 400 when the IP is missing; keep fail-open only for limiter outages.
- **#2 src/middleware.ts, pages**: Only `/api/v1/*` and `/search` are rate limited. `/miracles`, `/saints/[slug]`, `/map` and `/random` hit Neon on every edge-cache miss, and random query strings bypass the cache. Fix: apply a rate-limit binding in middleware for non-asset requests, ignore unknown params in cache keys, or add a Cloudflare WAF rule. Confirm the `SEARCH_RATE_LIMITER` binding in wrangler.jsonc is actually used.

### Low
- **#3 src/middleware.ts (3-8)**: CSP is only `frame-ancestors 'none'`; no HSTS or Permissions-Policy. Fix: add `Strict-Transport-Security` now (or in Cloudflare). A real CSP needs inline scripts moved to files first (depends on #24, #35).
- **#4 miracles/[slug].astro (415), saints/[slug].astro (370), map.astro (143)**: `MAPTILER_API_KEY` is serialized into page HTML. Fix: restrict the key by HTTP origin in the MapTiler dashboard.
- **#5 miracles/[slug].astro (391), saints/[slug].astro**: `href={s.url}`, `wikipedia_url` and `sameAs` are rendered from DB values with no scheme check; only `check:data` blocks `javascript:`. Fix: add a `safeHttpUrl()` helper (http/https only) as defense in depth.

---

## Bugs

### High
- **#6 src/api/index.ts (26-38)**: The cache middleware sets `public, s-maxage=900, stale-while-revalidate=3600` regardless of status, so 404s, validation errors and 500s are edge-cached. A just-published record can keep returning a cached 404. Fix: set the header only when `c.res.status === 200`, `no-store` otherwise.
- **#7 miracles/[slug].astro (63), saints/[slug].astro (29)**: `Astro.redirect("/404")` returns a 302, so unknown slugs never return 404 at their own URL (soft 404; whether `/404` itself returns 404 is uncertain). Fix: `Astro.response.status = 404` and render, or `Astro.rewrite("/404")`.
- **#8 src/api/schemas.ts (205-228), miracles/index.astro (22-27)**: Numeric params have no upper bounds (`saint_id=99999999999`, `year_from=1e12`, `page=1e19`); Postgres overflow produces an unhandled 500. The page uses `parseInt(...) || undefined` with the same flaw. Fix: add `.max()` bounds (years, page, saint_id) and clamp in the page; reject `year_from > year_to`.

### Medium
- **#9 src/api/index.ts**: No `app.onError`; DB errors return Hono's plain-text 500, breaking the `{data, meta, error}` envelope. Fix: add `onError` returning the JSON envelope plus a zod `defaultHook` for 400s; use or remove the unused `invalid` in `src/api/errors.ts`.

### Low
- **#10 src/api/routes/search.ts (26-28)**: Missing `q` and `topic` returns 200 with `error: "Provide q or topic"`. Fix: return 400 via `invalid`.
- **#11 src/api/schemas.ts (212-213)**: `used_for_beatification`/`used_for_canonization` are free strings where only `"1"` counts as true; other values silently mean no filter. Fix: `z.enum(["1"])` or boolean coercion, and document it.
- **#12 src/api/routes/saints.ts (19)**: `nationality` uses exact `eq`, `religious_order` uses `ilike '%..%'`. Fix: pick one and document it.
- **#13 src/api/routes/search.ts (31-36), src/lib/search.ts**: Pagination is in memory over up to 100 saints + 100 miracles with no `ORDER BY`; `meta.total` caps at 200 and results are arbitrary. With both `q` and `topic` results are unioned, not intersected (uncertain if intended). Fix: add deterministic ordering, push limit/offset and a true count into SQL, decide union vs AND.

---

## Performance

### High
_None identified._

### Medium
- **#14 miracles/index.astro (77-78)**: Every cache miss loads all published saints (id, name) and `SELECT DISTINCT country` to fill filter dropdowns (4 parallel neon-http queries). Fix: cache filter options separately (`CACHE_CONTENT`) or serve from a cached metadata endpoint; use typeahead for saints as the table grows. The same applies to the ad-hoc countries/orders/nationalities queries on saints/index.astro.
- **#15 src/pages/sitemap.xml.ts (62-64)**: Five DB queries per request and no `Cache-Control`. Fix: set `CACHE_CONTENT` from `src/lib/cache.ts`.

### Low
- **#16 src/lib/browse.ts**: `getTopicCounts`/`getThemeCounts` pull every published row and tally in JS; topics, themes, patronage and sitemap recompute the same tallies. Fine now; move to `unnest()` + `GROUP BY` as data grows.
- **#17 miracles/[slug].astro (106-113)**: The `saintLinked` related-miracles query has no `limit`/`orderBy`; it is capped to 5 only in JS. Fix: `.limit(5)` with an order.
- **#18 src/lib/search.ts**: `ILIKE '%q%'` across four text columns forces a sequential scan. Fix: `pg_trgm` GIN index or tsvector when data grows.
- **#19 src/pages/random.astro (18, 27)**: `ORDER BY RANDOM()` scans the table. Fix: random offset from a count, or `TABLESAMPLE`, if it grows.
- **#20 saints/[slug].astro (22)**: `db.select()` pulls every column. Fix: list only the used fields.

---

## Improvements & Refactors

### High
- **#21 Components and layout**: Only one component exists (`Pagination.astro`). Saint card markup is duplicated in saints/index, patronage/[term], themes/[theme], index and miracles/[slug]; `Base.astro` (463 lines) repeats nav links three times (lines 77-81, 119-123, 137-144). Fix: extract `SaintCard`, `MiracleCard`, `Lightbox`, `FilterSidebar`, and drive nav from one array.

### Medium
- **#23 createDb repetition**: `createDb(env.DATABASE_URL)` is repeated in 17 page files plus API routes. Fix: set `context.locals.db` in `src/middleware.ts` and type it in `src/env.d.ts`.
- **#24 miracles/index.astro (637 lines), saints/index.astro (469 lines)**: Client scripts hand-build HTML strings (`escHtml`/`esc` re-implemented, `any` payloads at miracles/index 344, 345, 390, 411, 421 and saints/index 259, 279, 299, 309), duplicating server rendering. Pagination HTML is also duplicated (~lines 397-399). Fix: type payloads with `z.infer` from `src/api/schemas.ts`, share one render path (HTML fragment endpoint or shared module in `src/scripts/`). Prerequisite for a strict CSP.
- **#25 miracles/[slug].astro (611 lines)**: Mixes ~9 queries with Leaflet and lightbox inline scripts. Leaflet bootstrap, `escHtml` and tile setup are copied into saints/[slug] and map.astro; the Leaflet version and SRI hash appear in 6 places. Fix: extract `getMiracleDetail(db, slug, isPreview)` into `src/lib/queries/miracles.ts`, a `MiracleMap`/`LeafletMap` component or `src/scripts/map.ts`, and one version/SRI constant.
- **#26 Accessibility items**: miracles/[slug].astro:251 hero image has `alt=""` (use `images[0].caption ?? miracle.title`); pagination puts `aria-current="page"` on a non-link span; lightbox (`#lb-img`) needs verification of `role="dialog"`, `aria-modal`, focus trap, Esc and focus return; theme toggle should expose its state. Run the existing `context/specs/accessibility-pass.md`.
- **#27 Color contrast**: `--text-4: #666664` and `--text-5: #6c6c6a` used at 0.65-0.7rem on tinted backgrounds are borderline. Fix: axe/Lighthouse pass in both themes.
- **#28 Prettier**: ESLint is set up (`npm run lint`, CI step). Prettier is not; the code is not Prettier-formatted, so adding it means a repo-wide reformat. Fix: add Prettier and reformat once the refactors (#21, #23-#25) land, to avoid merge conflicts.
- **#29 Playwright**: CLAUDE.md lists Playwright but none exists. Fix: build a smoke suite (home, saint page, miracle filters with and without JS, search, preview token, redirects, lightbox) or update the docs.
- **#30 SEO structured data**: Add `BreadcrumbList` on detail/browse pages, `WebSite` + `SearchAction` on home, `ItemList` on browse pages. Paginated `?page=N` URLs are noindex via the query-string rule; make sure page 1 links reach the content.
- **#31 Migration and environment safety**: The only Neon branch is production and `npm run db:migrate` hits it directly. Fix: confirmation wrapper or a dev branch; add `.nvmrc`/`engines` (CI uses Node 24).
- **#32 Browse and search UX**: Add clear-filters and active-filter chips, sort options (event date, recently added) and per-facet counts on miracles/index.astro; confirm filters work fully without JS. On search.astro add result highlighting, saint/miracle grouping, and a notice when `meta.capped` is true.

### Low
- **#33 Dead code**: `RelatedSaintSchema` imported but unused in src/api/routes/saints.ts (9); `invalid` in src/api/errors.ts unused (unless #9/#10 use it).
- **#34 src/api/routes/miracles.ts (168-169), saints.ts (167-168)**: `data as z.infer<...>` casts bypass type checking and can hide drift (`recipient_age_approximate` is not exposed). Fix: type the 404 helper return so the casts are unnecessary.
- **#35 Inline styles**: Widespread `style="..."` (miracles/[slug].astro, 404.astro and others) despite Tailwind/global.css. Fix: shared classes or components for eyebrow labels and repeated font combos.
- **#36 Page cleanup**: `slug!` assertions repeated, `fmt` is a pointless alias for `humanizeSnakeCase`, stray blank lines at miracles/[slug].astro 142-143. Fix: guard once, use the helper directly.
- **#37 saints/[slug].astro (104-116)**: `sourceTypeLabel` and `relationTypeLabel` are local constants. Fix: move to `src/lib/format.ts` keyed by the enums in `src/db/schema/enums.ts`.
- **#38 src/pages/404.astro**: All-inline styles, no search box or random-saint link. Fix: restyle, add both, ensure 404 status and `noindex`.
- **#39 External images**: Wikimedia URLs are stored directly (`thumbUrl` in `src/lib/image.ts`). Fix: optional HEAD check for `image_url`/`miracle_images.url` in `check:data` and an `onerror` placeholder.
- **#40 Print and share**: Add a `@media print` stylesheet and a copy-permalink button on miracle pages.
- **#41 Documentation drift**: CLAUDE.md still mentions admin-form editing of saint_locations/sources, Docker Compose (does not exist), a lint step (does not exist), and an incomplete endpoint table (`/types`, filters). `context/features/admin-panel.md` is obsolete. Fix: refresh the docs and archive the file.
- **#42 Scheduled data check**: Run `check:data` on a schedule. It needs a read-only DB credential, which conflicts with the "CI holds no secrets" design; alternatively run it from the sibling `catholic-research` repo.

---

## Feature Ideas

### High
- **#43 API docs page and cite block**: The OpenAPI spec exists at `/api/v1/doc` but nothing renders it. Add a Scalar/Swagger UI page and short `/api` usage page linked from the footer in `Base.astro` and `/verification`. Add a "Cite" block (APA/Chicago text, permalink, access date) on miracle and saint pages.
- **#44 API gaps**: Add `GET /saints/:slug/miracles`, sources and locations (pages already query `saint_locations`/`saint_sources`); `/api/v1/feast/{month}/{day}` and `/feast/today` backed by `src/lib/feasts.ts`, `easter.ts` and `feastDays.ts`; `ETag`/`Last-Modified` from `updated_at`; `/api/v1/export` (JSON/CSV); missing filters (`topic`, `approval_authority`, `used_for_*`, country on `/saints`) in the OpenAPI schema.

### Medium
- **#45 Miracle feast-day linkage**: `miracles.feast_month`, `feast_day_of_month`, `feast_easter_offset` are write-only. Wire into an "On this day" block on index.astro and calendar.astro and show the date on the miracle page, or drop the columns.
- **#46 `/stats` page**: Counts by type, decade, country, approval authority and cure characteristics, reusing the `tally()` pattern in `src/lib/browse.ts`. No schema work.
- **#47 Source-verification badges**: Add `last_verified_at` to the source tables and show "sources checked on" publicly, fed by the `verify-sources` skill.
- **#48 Feeds and ICS**: `/feed.xml` (Atom, recently published via `updated_at`), `/calendar.ics` and per-saint add-to-calendar using `getEaster(year)` and `src/lib/feasts.ts`.
- **#49 Unified subject hub**: Cross-link topics, themes and patronage where aliases match, via a subject-alias map in `src/db/topics.ts` validated by `scripts/check-data.ts`. Cheap first stage, no schema change.

### Low
- **#50 Calendar and map**: Year picker on `/calendar` (uses `getEaster(year)`), `/map?saint=` deep links.
- **#51 Dispensation display**: Show `beatification_miracle_dispensed`, `canonization_miracle_dispensed` and `dispensation_reason` on saints/[slug].astro.
- **#52 content_tier**: Render a tier badge or filter on miracles/index.astro, or drop the column.
- **#53 Similar miracles**: Extend the related logic in miracles/[slug].astro (77-137) to shared `medical_diagnosis`, `type` or `country`.
- **#54 Accent-insensitive search**: `unaccent`/`pg_trgm` so "Andre" finds "André" and "Zelie" finds "Zélie" (pairs with #18).

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 2 | 3 | 5 |
| Bugs | 3 | 1 | 4 | 8 |
| Performance | 0 | 2 | 5 | 7 |
| Improvements & Refactors | 1 | 10 | 10 | 21 |
| Feature Ideas | 2 | 5 | 5 | 12 |
| **Total** | **6** | **20** | **27** | **53** |
