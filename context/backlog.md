# Project Backlog

> Generated: 2026-06-27
> Focus: Full audit

---

## Security

### High
_None identified._

### Medium
- **#3 [src/db/schema/miracle-sources.ts, src/db/schema/saint-sources.ts]** FK references on `miracle_id` and `saint_id` have no `{ onDelete: "cascade" }`, unlike `miracle-images.ts`. The admin delete flow for miracles manually deletes sources first then the miracle in sequential awaits with no transaction — if the miracle delete fails, sources are gone. Deleting a saint directly at the DB level will cause a FK violation on `saint_sources`. Fix: add `{ onDelete: "cascade" }` to both FKs, generate and apply a migration, then simplify the miracle delete to a single call.
- **#4 [src/pages/admin/login.astro]** Admin login brute-force protection is a 300ms delay only, allowing ~200 guesses/minute. No lockout, no attempt counter, no IP throttling. Fix: add a Cloudflare Rate Limiting binding or a KV-backed counter keyed to `Astro.clientAddress` (e.g. 5 failures per 15 minutes).

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
- **#13 [src/pages/admin/saints/[slug]/edit.astro]** The `saint_relations` join table is used by the public saint detail page and the API, but the admin saint edit page has no way to add or remove relations. There's no UI for the table at all. Fix: add an add/delete relations section to the saint edit page, matching the existing sources/locations pattern.

### Low
- **#22 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** `buildApiUrl()`, `buildPageUrl()`, and `renderPagination()` are structurally identical across both list pages — only the field names differ. Fix: extract into a reusable client-side utility module.
- **#23 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** Each list page has an Astro server-rendered card template and a nearly identical hand-rolled string-concatenation version inside the client-side `renderCard()` JS. A card design change requires updating both. Fix: generate card HTML server-side and serve it via an SSR partial endpoint, or accept the duplication and keep both in sync.
- **#24 [src/components/Pagination.astro]** The `Pagination` component is used in admin list pages but the public list pages build pagination HTML manually in both the Astro template and the client-side JS string. Fix: use the component on public pages or document why each path needs its own implementation.

---

## Feature Ideas

### High
_None identified._

### Medium
- **#28 [src/pages/]** The OpenAPI spec is generated and served at `/api/v1/doc` but nothing on the public site links to it or explains the API exists. Fix: add an API page or section in the footer/about area pointing to `/api/v1/doc` with a brief description of available endpoints.

### Low
- **#32 [src/pages/saints/index.astro, src/api/routes/saints.ts]** Nationality and patronage are prominent discovery axes (`saints_patronage_gin_idx` already exists) but neither is filterable. Low priority given the small current saint count, but worth adding when saints reach 30+.
- **#34 [src/pages/]** No RSS/Atom feed. A `GET /feed.xml` returning recently published miracles and saints would serve devotional users and aggregators.
- **#37 [src/api/routes/search.ts, src/pages/search.astro]** Full-text search upgrade — replace `ilike` with `pg_trgm` trigram indexes or `tsvector`/`tsquery` for better performance and stemming. Long-term consideration once the dataset justifies it.
- **#38 [src/pages/index.astro]** Today's Feast — surface the matching saint on the homepage when today matches a feast day. DB columns (`feast_month`, `feast_day_of_month`, `feast_easter_offset`) already populated. Requires #39 first for movable feasts.
- **#39 [src/lib/easter.ts]** Easter calculation utility — compute Easter Sunday for a given year (Meeus/Jones/Butcher algorithm) and expose a `resolveMovableFeast(offset: number, year: number): Date` helper. Prerequisite for #38.
- **#40 [src/pages/index.astro, src/pages/saints/index.astro]** Mobile LCP optimization — add explicit `width`/`height` to saint images, `fetchpriority="high"` on the first carousel image, and `loading="lazy"` on below-fold images. LCP is ~7.5s on mobile driven by external Wikimedia Commons images with no size hints.
- **#41 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import — CSV/JSON paste to bulk-create `miracle_sources` records. Currently one-by-one only.
- **#42 [src/pages/admin/index.astro]** Admin analytics dashboard — extend beyond total counts with aggregations by country, type, topic, canonization stage.
- **#43 [src/pages/miracles/index.astro, src/pages/saints/index.astro]** Random page — `/random` redirects to a random published saint or miracle via `ORDER BY RANDOM() LIMIT 1`. Low-effort discovery feature.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 2 | 0 | 2 |
| Bugs | 0 | 0 | 0 | 0 |
| Performance | 0 | 0 | 1 | 1 |
| Improvements & Refactors | 0 | 1 | 3 | 4 |
| Feature Ideas | 0 | 1 | 9 | 10 |
| **Total** | **0** | **4** | **13** | **17** |
