# Project Backlog

> Generated: 2026-06-27
> Focus: Full audit

---

## Security

### High
_None identified._

### Medium
_None identified._

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
_None identified._

### Low
- **#12 [src/api/routes/search.ts, src/pages/search.astro]** Search is implemented as `ilike(field, \`%${q}%\`)` against multiple text columns. No index can accelerate a leading-wildcard pattern. Fix: add PostgreSQL `pg_trgm` trigram indexes on synopsis, biography_short, medical_diagnosis, and cure_details for substring-match acceleration, or migrate to `tsvector`/`tsquery` for full stemming support.

---

## Improvements & Refactors

### High
_None identified._

### Medium
_None identified._

### Low
- **#22 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** `buildApiUrl()`, `buildPageUrl()`, and `renderPagination()` are structurally identical across both list pages — only the field names differ. Fix: extract into a reusable client-side utility module.
- **#23 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** Each list page has an Astro server-rendered card template and a nearly identical hand-rolled string-concatenation version inside the client-side `renderCard()` JS. A card design change requires updating both. Fix: generate card HTML server-side and serve it via an SSR partial endpoint, or accept the duplication and keep both in sync.
- **#24 [src/components/Pagination.astro]** The `Pagination` component is used in admin list pages but the public list pages build pagination HTML manually in both the Astro template and the client-side JS string. Fix: use the component on public pages or document why each path needs its own implementation.

---

## Feature Ideas

### High
_None identified._

### Medium
_None identified._

### Low
- **#32 [src/pages/saints/index.astro, src/api/routes/saints.ts]** Nationality and patronage are prominent discovery axes (`saints_patronage_gin_idx` already exists) but neither is filterable. Low priority given the small current saint count, but worth adding when saints reach 30+.
- **#34 [src/pages/]** No RSS/Atom feed. A `GET /feed.xml` returning recently published miracles and saints would serve devotional users and aggregators.
- **#37 [src/api/routes/search.ts, src/pages/search.astro]** Full-text search upgrade — replace `ilike` with `pg_trgm` trigram indexes or `tsvector`/`tsquery` for better performance and stemming. Long-term consideration once the dataset justifies it.
- **#40 [src/pages/index.astro, src/pages/saints/index.astro]** Mobile LCP optimization — add explicit `width`/`height` to saint images, `fetchpriority="high"` on the first carousel image, and `loading="lazy"` on below-fold images. LCP is ~7.5s on mobile driven by external Wikimedia Commons images with no size hints.
- **#41 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#44 [src/db/schema/saints.ts, src/db/schema/miracles.ts, src/pages/admin/]** R2 image storage — replace external Wikimedia URLs with images uploaded to Cloudflare R2, served via the Cloudflare Images binding for WebP/AVIF conversion, resizing, and CDN caching. Fixes the 7.5s mobile LCP (#40). Requires image upload UI in admin saint/miracle edit forms and a migration of existing `image_url` values. Near-term alternative: proxy existing Wikimedia URLs through `/cdn-cgi/image/width=400,format=auto/` with no schema changes. Worth doing at 30+ saints or when hosting images without a clean Wikimedia URL.
- **#42 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#43 [src/pages/miracles/index.astro, src/pages/saints/index.astro]** Random page — `/random` redirects to a random published saint or miracle via `ORDER BY RANDOM() LIMIT 1`. Low-effort discovery feature.
- **#45 [src/pages/calendar.astro]** Liturgical calendar view — monthly grid showing saints whose feast day falls on each day. Feast day data (`feast_month`, `feast_day_of_month`, `feast_easter_offset`) already on saints table; `src/lib/easter.ts` handles movable feasts. Hold until 40–50 saints are published — sparse data makes a grid feel broken. Nav placement alongside Map and Timeline.
- **#46 [src/pages/feast-days.astro]** Feast day list page — all 366 days of the year populated from the Franciscan Media Saint of the Day data (saved at `context/Notes/Research/Franciscan Media — Saint of the Day.md`). Each entry shows the FM saint name(s); entries where we have a published saint matching on `feast_month` + `feast_day_of_month` become links to our saint page. Solves the density problem of a sparse calendar — every day has content, our saints are just elevated. Build as a simple list first; can be reskinned into a grid (#45) later.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 0 | 0 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 1 | 1 |
| Improvements & Refactors | 0 | 0 | 3 | 3 |
| Feature Ideas | 0 | 0 | 10 | 10 |
| **Total** | **0** | **0** | **14** | **14** |
