# Project Backlog

> Generated: 2026-06-04 — Last updated: 2026-06-05
> Focus: Full audit

---

## Security

### Low
- **#6 [src/layouts/Base.astro:19, src/pages/index.astro:19]** Umami analytics `data-website-id` and script host are hard-coded in source. Low risk (Umami IDs are public by design), but consider moving to an env var if staging/fork support is needed.

---

## Bugs

### Low
- **#9 [src/pages/admin/miracles/[slug]/edit.astro, src/pages/admin/saints/[slug]/edit.astro]** Post-save re-fetch is unconditional on every request including GETs. `allSaints` also fetched regardless of outcome. Minor — acceptable for now.

---

## Performance

### Low
- **#15 [src/api/routes/miracles.ts:91, src/pages/miracles/[slug].astro:11, src/pages/saints/[slug].astro:11]** Detail pages use `db.select()` (`SELECT *`), pulling all columns including large text fields. Fix: replace with explicit field lists matching the response schema.

---

## Improvements & Refactors

### Medium
- **#19 [src/pages/admin/]** Admin list pages render all records with no pagination. Fix: add `LIMIT`/`OFFSET` with page controls.

### Low
- **#22 [src/db/update-images.ts]** One-off migration script committed permanently. Has served its purpose; remove or replace with batched `CASE WHEN` approach if needed again.

---

## Feature Ideas

### Medium
- **#26 [src/pages/miracles/index.astro]** Interactive filtering UI on the miracles list page. API supports `saint_id`, `type`, `country`, `year_from`, `year_to` but the frontend has no filter controls.
- **#27 [src/pages/miracles/[slug].astro]** Related miracles by topic on the miracle detail page. GIN index on `topics` already exists. Show 3–5 miracles with overlapping topics (excluding self).
- **#28 [src/api/routes/]** API metadata endpoint at `/api/v1/metadata` returning canonical filter options: types, countries, `MIRACLE_TOPICS`, `SAINT_THEMES`.
- **#29 [src/db/schema/miracles.ts:30–31]** Map view using existing `location_lat`/`location_lng` coordinates. Add a marker to miracle detail pages (Leaflet, no API key needed). Optionally a `/miracles/map` browse page.
- **#30 [src/db/schema/miracles.ts]** Timeline/chronological browse at `/miracles/timeline` grouping by decade using `date_of_event`.

### Low
- **#31 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import for admin — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#32 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#33 [src/pages/]** Custom 404 page. Astro falls back to a generic page; create one matching the site design.
- **#34 [src/pages/miracles/[slug].astro:129–145]** Highlight Vatican decree sources distinctly on miracle detail pages instead of rendering them identically to news articles.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 1 | 1 |
| Bugs | 0 | 0 | 1 | 1 |
| Performance | 0 | 0 | 1 | 1 |
| Improvements & Refactors | 0 | 1 | 1 | 2 |
| Feature Ideas | 0 | 5 | 4 | 9 |
| **Total** | **0** | **6** | **8** | **14** |
