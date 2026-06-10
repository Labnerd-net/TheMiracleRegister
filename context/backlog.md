# Project Backlog

> Generated: 2026-06-04 — Last updated: 2026-06-10
> Focus: Full audit

---

## Data — Next Up

### Eucharistic Miracles

These are standalone miracle records (no associated saint). Each needs research notes and a DB seed. Priority order based on documentation strength and historical significance.

4. **Legnica** (Poland, 2013) — Same tissue/blood findings as Sokolka. Bishop of Legnica approved 2016.
5. **Tixtla** (Mexico, 2006) — Substance emerged from within the host during a retreat. Bishop of Chilpancingo-Chilapa formally recognized. AB blood, cardiac tissue.
6. **Bolsena / Orvieto** (Italy, 1263) — Doubting priest; host bled on the corporal. Pope Urban IV approved — directly prompted institution of Corpus Christi. Corporal of Bolsena still preserved in Orvieto cathedral.
7. **Siena** (Italy, 1730) — Consecrated hosts stolen, recovered 3 days later, still incorrupt 295+ years on. Pius VI and Pius X both examined and approved.

**Note on Buenos Aires + Sokolka + Legnica + Tixtla:** Independent labs on different continents found the same result as Lanciano — AB blood and stressed left-ventricular cardiac tissue. Worth cross-linking these records thematically.

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

### Low
- **#32 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import for admin — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#33 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#34 [src/pages/]** Custom 404 page. Astro falls back to a generic page; create one matching the site design.
- **#40 [src/layouts/Base.astro]** Mobile nav and footer are getting cramped as links have been added (Saints, Miracles, Map, Timeline). Consider a hamburger menu or collapsed nav for small screens. Footer may also need a stacked layout at narrow widths.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 1 | 1 |
| Performance | 0 | 0 | 0 | 0 |
| Improvements & Refactors | 0 | 0 | 0 | 0 |
| Feature Ideas | 0 | 0 | 4 | 4 |
| **Total** | **0** | **0** | **5** | **5** |
