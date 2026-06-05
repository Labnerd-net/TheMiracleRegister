# Project Backlog

> Generated: 2026-06-04
> Focus: Full audit

---

## Security

### High
- ~~**#1 [src/pages/admin/login.astro:12]** Open redirect on login~~ — **Fixed 2026-06-05.** `next` param now validated to start with `/` and not `//` before use as redirect target.
- ~~**#2 [src/api/index.ts]** No CORS configuration on the public Hono API~~ — **Fixed 2026-06-05.** Added `cors()` middleware from `hono/cors` to all `/api/v1/*` routes.
- ~~**#3 [admin form files]** Enum fields cast to `as any` bypassing TypeScript and server-side validation~~ — **Fixed 2026-06-05.** Created `src/lib/form-utils.ts` with a `parseEnum` helper; all 4 admin form files updated to validate against `pgEnum.enumValues` before insert/update.
- ~~**#4 [src/pages/admin/login.astro]** No rate limiting on login form~~ — **Fixed 2026-06-05.** Added 300ms delay on failed login attempts. Cloudflare WAF rules recommended for production.

### Medium
- ~~**#5 [src/api/routes/search.ts]** `topic` query param not validated against canonical topic lists~~ — **Fixed 2026-06-05.** `SearchQuerySchema.topic` now uses `z.enum([...MIRACLE_TOPICS, ...SAINT_THEMES])` — invalid values return a 400.

### Low
- **#6 [src/layouts/Base.astro:19, src/pages/index.astro:19]** Umami analytics `data-website-id` UUID and script host (`umami.labnerd.net`) are hard-coded in source, revealing analytics infrastructure. Low risk (Umami IDs are public by design), but would need to change for staging/forks. Consider moving to an env var if multi-environment.

---

## Bugs

### High
- **#7 [src/api/routes/search.ts:24–61]** The `q` (full-text search) parameter is defined in the OpenAPI spec and accepted by the route, but never implemented — it silently returns an empty result set for any text query. This is a broken API contract presented as functional. Fix: implement full-text search with Postgres `tsvector`/`to_tsquery` or ILIKE, or return a `501 Not Implemented` response with an explanatory message.

### Medium
- ~~**#8 [src/pages/miracles/[slug].astro]** Duplicate "Verified" label in miracle detail sidebar~~ — **Fixed 2026-06-05.** Second label changed to "Verified On".

### Low
- **#9 [src/pages/admin/miracles/[slug]/edit.astro, src/pages/admin/saints/[slug]/edit.astro]** Post-save re-fetch of the miracle/saint is unconditional on every request, including GETs where the data hasn't changed. Also, `allSaints` is fetched on every request regardless of success/failure. Acceptable now but worth noting for future optimization.

---

## Performance

### High
- ~~**#10 [src/db/schema/miracles.ts]** Missing indexes on miracles (saint_id, type, country)~~ — **Fixed 2026-06-05.** Added 3 btree indexes; migration `0005_melodic_moondragon.sql` applied to dev branch. Note: slug columns already indexed via unique constraints.

### Medium
- ~~**#11 [src/pages/index.astro]** Homepage featuredSaints query unbounded~~ — **Fixed 2026-06-05.** Added `.limit(8)` to the carousel query.
- **#12 [src/pages/saints/index.astro:9, src/pages/miracles/index.astro:9]** Both public list pages fetch all records with no pagination — full table dumps including joins. The API layer has pagination; the SSR pages don't use it. Fix: add `LIMIT`/`OFFSET` and pagination UI, or cache rendered pages at the Cloudflare edge.
- ~~**#13 [src/api/routes/search.ts]** Sequential topic queries + full synopsis loaded for 200-char excerpt~~ — **Fixed 2026-06-05.** Queries parallelized with `Promise.all`; excerpt now uses `LEFT(synopsis, 200)` in Postgres.
- ~~**#14 [src/api/index.ts]** No Cache-Control headers on API responses~~ — **Fixed 2026-06-05.** Route-level middleware added: saints 1h, miracles 30m, types 24h, search no-store.

### Low
- **#15 [src/api/routes/miracles.ts:91, src/pages/miracles/[slug].astro:11, src/pages/saints/[slug].astro:11]** Detail pages use `db.select()` (effectively `SELECT *`), pulling all columns including large text fields (`synopsis`, `cure_details`, `vatican_medical_board_verdict`) even when not all are needed. Also exposes future columns immediately. Fix: replace with explicit field lists matching the response schema.

---

## Improvements & Refactors

### High
- ~~**#16 [4 admin form files]** Inline form helpers duplicated across all admin forms~~ — **Fixed 2026-06-05.** Added `formHelpers(form)` factory to `src/lib/form-utils.ts`; all 4 admin files now import and destructure it.
- **#17 [src/pages/admin/*/new.astro, src/pages/admin/*/edit.astro]** Admin forms duplicate 150–200 lines of form UI between new/edit variants for both saints and miracles. Fix: extract `src/components/SaintForm.astro` and `src/components/MiracleForm.astro` accepting optional entity props, keeping POST logic in the `.astro` page files.

### Medium
- **#18 [src/pages/admin/*/new.astro, src/pages/admin/*/edit.astro]** Admin forms manually parse `form.get()` and type-cast enums without validation. Zod schemas already exist in `src/api/schemas.ts`. Fix: reuse existing Zod schemas to validate form data before insert/update, replacing manual parsing and `as any` casts.
- **#19 [src/pages/admin/]** Admin saint/miracle list pages have no pagination — they render all records. As the dataset grows this will degrade the admin experience. Fix: add `LIMIT`/`OFFSET` with page controls to admin list pages.
- ~~**#20 [src/pages/index.astro]** Carousel uses complex JS with card cloning and transform positioning~~ — **Fixed 2026-06-05.** Replaced with CSS scroll-snap; JS reduced to a minimal scrollBy setInterval (~12 lines vs 45).

### Low
- ~~**#21 [src/pages/admin/index.astro]** Admin dashboard pervasive inline styles~~ — **Fixed 2026-06-05.** Extracted to named classes in scoped `<style>` block.
- **#22 [src/db/update-images.ts]** One-off migration script committed permanently with sequential `await` calls in a loop rather than a batched `UPDATE`. It has served its purpose but remains in git. If future image updates are needed, use a `CASE WHEN` batched update. Low priority since the script is already run.
- ~~**#23 [src/db/seed.ts]** No warning about Lorem Ipsum placeholder content~~ — **Fixed 2026-06-05.** Added warning comment at top of file.
- ~~**#24 [src/layouts/Base.astro]** OpenAPI docs not linked from the site~~ — **Fixed 2026-06-05.** Added "API" link to public footer pointing to `/api/v1/doc`.

---

## Feature Ideas

### High
- **#25 [src/api/routes/search.ts — implement existing stub]** Full-text search on miracle synopses, medical diagnoses, and cure details. The `?q` parameter is already in the schema and OpenAPI spec but returns empty. Implement with Postgres `tsvector`/`to_tsquery` or `ILIKE` across `synopsis`, `medical_diagnosis`, `cure_details`, `saints.name`, and `saints.biography_short`. This is the most compelling public-facing feature gap.

### Medium
- **#26 [src/pages/miracles/index.astro]** Interactive filtering UI on the miracles list page. The API already supports filtering by `saint_id`, `type`, `country`, `year_from`, `year_to` (`src/api/schemas.ts:176–189`), but the frontend has no filter controls. Add a filter panel with dropdowns for miracle type, country, and year range.
- **#27 [src/pages/miracles/[slug].astro, src/db/schema/miracles.ts:24]** Related miracles by topic on the miracle detail page. The `topics` array has a GIN index (`src/db/schema/miracles.ts:58`). Query up to 3–5 miracles with overlapping topics (excluding self) and display in a sidebar or bottom section.
- **#28 [src/api/routes/]** API metadata endpoint at `/api/v1/metadata` returning canonical filter options: miracle types (reuse `/types`), countries (`SELECT DISTINCT country FROM miracles`), `MIRACLE_TOPICS`, `SAINT_THEMES`. Avoids clients hardcoding these values. Already duplicated in admin forms (`new.astro` hardcodes type lists).
- **#29 [src/db/schema/miracles.ts:30–31]** Map view using existing `location_lat`/`location_lng` coordinates, which are stored but not rendered anywhere. Add a location marker on the miracle detail page using Leaflet (lightweight, no API key required). Optionally add a `/miracles/map` page showing all miracles as pins.
- **#30 [src/db/schema/saints.ts, src/db/schema/miracles.ts]** Timeline/chronological browse at `/miracles/timeline`, grouping miracles by decade using `date_of_event`. Rich date metadata exists (`date_of_event`, `date_precision`, `canonization_date`) but is only used for display on detail pages. Particularly compelling given the historical nature of canonization.

### Low
- **#31 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import for admin — accept CSV/JSON paste to bulk-create multiple `miracle_sources` records for a miracle. Currently requires one-by-one entry.
- **#32 [src/pages/admin/index.astro]** Admin analytics dashboard extending the current minimal dashboard (only shows total counts). Add aggregations: miracles by country, by type, by topic, saints by canonization stage, timeline of canonizations. Use Chart.js or a comparable lightweight library.
- **#33 [src/pages/]** Custom 404 page — no `/src/pages/404.astro` found. Astro falls back to a generic page. Create one matching the site design with navigation links back to `/saints` and `/miracles`.
- **#34 [src/pages/miracles/[slug].astro:129–145]** Prominent Vatican decree display — Vatican decree sources (`source_type = 'vatican_decree'`) are rendered identically to news articles. Flag them with a distinct style (highlighted box or badge) on the miracle detail page to signal primary authority.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 4 | 1 | 1 | 6 |
| Bugs | 1 | 1 | 1 | 3 |
| Performance | 1 | 4 | 1 | 6 |
| Improvements & Refactors | 2 | 3 | 4 | 9 |
| Feature Ideas | 1 | 5 | 4 | 10 |
| **Total** | **9** | **14** | **11** | **34** |
