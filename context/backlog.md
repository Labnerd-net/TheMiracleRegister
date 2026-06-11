# Project Backlog

> Generated: 2026-06-10
> Focus: Full audit

---

## Performance

### High
- **#16 [src/api/routes/saints.ts:78]** The saint detail API endpoint performs `SELECT *` on the saints table (30+ columns including large text fields) then validates through Zod. The over-fetched columns are loaded into Worker memory unnecessarily. Fix: enumerate specific columns matching exactly what `SaintDetailSchema` exposes.

### Medium
- **#17 [src/api/routes/search.ts:96–101]** Search fetches all matching rows from the DB with no server-side LIMIT, then paginates in memory with `results.slice(offset, offset + limit)`. For a common search term matching many records, all rows are returned over the network before slicing. Fix: apply LIMIT/OFFSET at the query level.

### Low
- **#18 [src/pages/miracles/index.astro:65]** All published saints are fetched on every miracles index page load to populate the filter dropdown — unconditional full-table scan on every request. Acceptable at current scale but grows linearly. Fix: acceptable for now; consider caching if saint count exceeds ~200.

---

## Improvements & Refactors

### High
_None identified._

### Medium
- **#19 [src/pages/saints/index.astro, src/pages/miracles/index.astro, src/pages/admin/saints/index.astro, src/pages/admin/miracles/index.astro]** Pagination logic is duplicated across four pages. Fix: extract to `src/components/Pagination.astro`.
- **#20 [src/api/index.ts:14]** Cache middleware types `c` as `any`, losing all Hono context type safety. Fix: import `Context` from `hono` and type as `Context<ApiEnv>`.
- **#21 [multiple pages]** `replace(/_/g, " ")` is scattered across timeline, map, search, and admin pages. Fix: extract to `src/lib/format.ts` as `humanizeSnakeCase()`.
- **#22 [src/api/routes/*.ts]** Error responses are inconsistent across routes (sometimes `error: "Not found"`, sometimes null). Fix: create an error response factory in `src/api/errors.ts` with `notFound()`, `invalid()` helpers.
- **#23 [src/layouts/Base.astro]** No Open Graph or Twitter Card meta tags on any page. Saint and miracle detail pages shared on social media show no image or description preview. Fix: add `og:title`, `og:description`, `og:image`, `og:type` props to the Base layout and pass them from detail pages.

### Low
- **#24 [src/components/MiracleForm.astro, src/components/SaintForm.astro]** Form styles are defined with inline `<style>` blocks. Fix: extract shared `.field`, `.btn`, `.two-col` etc. to a global stylesheet.

---

## Feature Ideas

### High
_None identified._

### Medium
- **#25 [src/pages/saints/index.astro, src/api/routes/saints.ts]** Saints list has no filter UI — only a search box. Miracles list has filters (type, country, approval, year). Saints could have the same for: canonization stage, themes, religious order, nationality. API would need query params added to the saints list endpoint.
- **#26 [src/pages/index.astro or src/pages/saints/[slug].astro]** Sitemap at `/sitemap.xml` listing all published saints and miracles. Needed for SEO as content grows. Simple Astro endpoint, no schema changes.

### Low
- **#42 [src/pages/index.astro]** Today's Feast — if today's date matches any saint's `feast_day`, surface that saint's card on the homepage with a "Feast Day Today" note. Hold off on a full calendar page until saint count reaches 40–50.
- **#41 [src/pages/index.astro, src/pages/saints/index.astro]** Mobile LCP optimization — add explicit `width`/`height` to saint images, `fetchpriority="high"` on the first carousel image, and `loading="lazy"` on below-fold images. LCP is 7.5s on mobile, driven by external Wikipedia Commons images with no size hints.
- **#32 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import for admin — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#33 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#27 [src/pages/miracles/index.astro, src/pages/saints/index.astro]** Random page — `/random` redirects to a random published saint or miracle via `ORDER BY RANDOM() LIMIT 1`. Low-effort discovery feature.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 1 | 1 | 1 | 3 |
| Improvements & Refactors | 0 | 5 | 1 | 6 |
| Feature Ideas | 0 | 2 | 5 | 7 |
| **Total** | **1** | **8** | **7** | **16** |
