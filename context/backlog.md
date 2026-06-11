# Project Backlog

> Generated: 2026-06-10
> Focus: Full audit

---

---

## Improvements & Refactors

### High
_None identified._

### Medium
- **#23 [src/layouts/Base.astro]** No Open Graph or Twitter Card meta tags on any page. Saint and miracle detail pages shared on social media show no image or description preview. Fix: add `og:title`, `og:description`, `og:image`, `og:type` props to the Base layout and pass them from detail pages.

### Low
_None identified._

---

## Feature Ideas

### High
_None identified._

### Medium
- **#25 [src/pages/saints/index.astro, src/api/routes/saints.ts]** Saints list has no filter UI — only a search box. Miracles list has filters (type, country, approval, year). Saints could have the same for: canonization stage, themes, religious order, nationality. API would need query params added to the saints list endpoint.

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
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 1 | 0 | 1 |
| Feature Ideas | 0 | 1 | 5 | 6 |
| **Total** | **0** | **2** | **5** | **7** |
