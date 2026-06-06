# Project Backlog

> Generated: 2026-06-04 — Last updated: 2026-06-06
> Focus: Full audit

---

## Bugs

### Low
- **#9 [src/pages/admin/miracles/[slug]/edit.astro, src/pages/admin/saints/[slug]/edit.astro]** Post-save re-fetch is unconditional on every request including GETs. `allSaints` also fetched regardless of outcome. Minor — acceptable for now.

---

## Performance

---

## Improvements & Refactors

---

## Feature Ideas

### Medium
- **#26 [src/pages/miracles/index.astro]** Interactive filtering UI on the miracles list page. API supports `saint_id`, `type`, `country`, `year_from`, `year_to` but the frontend has no filter controls.
- **#27 [src/pages/miracles/[slug].astro]** Related miracles by topic on the miracle detail page. GIN index on `topics` already exists. Show 3–5 miracles with overlapping topics (excluding self).
- **#28 [src/api/routes/]** API metadata endpoint at `/api/v1/metadata` returning canonical filter options: types, countries, `MIRACLE_TOPICS`, `SAINT_THEMES`.
- **#30 [src/db/schema/miracles.ts]** Timeline/chronological browse at `/miracles/timeline` grouping by decade using `date_of_event`.

### Low
- **#32 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import for admin — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#33 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#34 [src/pages/]** Custom 404 page. Astro falls back to a generic page; create one matching the site design.
- **#35 [src/pages/miracles/[slug].astro:129–145]** Highlight Vatican decree sources distinctly on miracle detail pages instead of rendering them identically to news articles.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 1 | 1 |
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 0 | 0 | 0 |
| Feature Ideas | 0 | 4 | 4 | 8 |
| **Total** | **0** | **4** | **5** | **9** |
