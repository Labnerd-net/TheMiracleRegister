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
- **#38 [src/pages/index.astro]** Today's Feast — surface the matching saint on the homepage when today matches a feast day. DB columns (`feast_month`, `feast_day_of_month`, `feast_easter_offset`) already populated. Requires #39 first for movable feasts.
- **#39 [src/lib/easter.ts]** Easter calculation utility — compute Easter Sunday for a given year (Meeus/Jones/Butcher algorithm) and expose a `resolveMovableFeast(offset: number, year: number): Date` helper. Prerequisite for #38.
- **#40 [src/pages/index.astro, src/pages/saints/index.astro]** Mobile LCP optimization — add explicit `width`/`height` to saint images, `fetchpriority="high"` on the first carousel image, and `loading="lazy"` on below-fold images. LCP is ~7.5s on mobile driven by external Wikimedia Commons images with no size hints.
- **#41 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#44 [src/db/schema/saints.ts, src/db/schema/miracles.ts, src/pages/admin/]** R2 image storage — replace external Wikimedia URLs with images uploaded to Cloudflare R2, served via the Cloudflare Images binding for WebP/AVIF conversion, resizing, and CDN caching. Fixes the 7.5s mobile LCP (#40). Requires image upload UI in admin saint/miracle edit forms and a migration of existing `image_url` values. Near-term alternative: proxy existing Wikimedia URLs through `/cdn-cgi/image/width=400,format=auto/` with no schema changes. Worth doing at 30+ saints or when hosting images without a clean Wikimedia URL.
- **#42 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#43 [src/pages/miracles/index.astro, src/pages/saints/index.astro]** Random page — `/random` redirects to a random published saint or miracle via `ORDER BY RANDOM() LIMIT 1`. Low-effort discovery feature.

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
