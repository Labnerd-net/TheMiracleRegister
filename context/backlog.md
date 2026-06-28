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
- **#5 [src/pages/map.astro, src/pages/saints/[slug].astro, src/pages/miracles/[slug].astro]** Leaflet loaded from `unpkg.com` CDN with no `integrity` attribute on any of the six `<link>` and `<script>` tags. A compromised CDN response would execute arbitrary JS with no detection. Fix: add SRI `integrity="sha256-..."` hashes to all Leaflet resource tags.

### Low
- **#7 [src/lib/auth.ts]** `safeEqual()` performs an early-exit length check before the constant-time XOR loop, making it technically not constant-time. In practice HMAC-SHA256 always produces a 64-char string so the branch is never taken, but the "timing-safe" comment is misleading. Fix: use `crypto.subtle.verify("HMAC", key, sig, expected)` instead.

---

## Bugs

### High
_None identified._

### Medium
- **#8 [src/api/routes/search.ts]** The search route fetches up to 100 saints and 100 miracles, deduplicates in memory, then paginates with `results.slice()`. `meta.total` reflects only the in-memory capped count (max 200), not the actual DB match count. As the dataset grows, pagination will silently claim fewer results exist than actually do. Fix: either paginate at DB level or return a `capped: true` flag in meta so consumers know the count may be incomplete.

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
- **#13 [src/components/MiracleForm.astro, src/pages/admin/miracles/[slug]/edit.astro]** `content_tier` (core / catalog / stub) is defined in schema and defaults to `core` but is never exposed in `MiracleForm.astro`, never set by the edit handler, and never rendered on public pages. The field is completely inert — there's no way to mark a record as `catalog` or `stub` through the UI or to render it differently. Fix: add a `<select>` for `content_tier` in `MiracleForm.astro`, wire it into the edit handler, and conditionally render catalog/stub records with different layouts on the public detail page.
- **#14 [src/components/MiracleForm.astro, src/pages/admin/miracles/[slug]/edit.astro]** Miracle location coordinates (`location_lat`, `location_lng`) are not in the admin form or edit handler. The public miracle detail page renders a Leaflet map if those coordinates are populated, but there's no way to set them through the UI — requires a direct DB edit. Fix: add `lat`/`lng` number inputs to `MiracleForm.astro` and wire them into the edit handler's `.set({})` call.
- **#15 [src/components/MiracleForm.astro, src/components/SaintForm.astro]** `feast_month`, `feast_day_of_month`, and `feast_easter_offset` exist on both `miracles` and `saints` tables and are already displayed on public pages via `formatFeastDay()`. Neither admin form exposes these fields, so they can only be set via direct DB edit. Fix: add the three feast day inputs to both forms and wire them into both create and edit handlers.
- **#16 [src/pages/admin/saints/[slug]/edit.astro]** The `saint_relations` join table is used by the public saint detail page and the API, but the admin saint edit page has no way to add or remove relations. There's no UI for the table at all. Fix: add an add/delete relations section to the saint edit page, matching the existing sources/locations pattern.
- **#19 [src/api/schemas.ts]** Enum literals are hardcoded as string arrays throughout (e.g. `z.enum(["healing", "nature", ...])` at line 51). These duplicate `src/db/schema/enums.ts`. Adding a new miracle type to the Drizzle enum requires a separate manual update to `schemas.ts`. Fix: derive Zod enums from Drizzle enum values (e.g. `z.enum(miracleType.enumValues)`) throughout `schemas.ts`.
- **#20 [src/pages/map.astro, src/pages/saints/[slug].astro]** Identical `typeColors` object (mapping `location_type` to hex color) is copy-pasted in both files. A color change or new location type requires updating both. Fix: extract to a shared constant in `src/lib/` or a shared Astro component.

### Low
- **#22 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** `buildApiUrl()`, `buildPageUrl()`, and `renderPagination()` are structurally identical across both list pages — only the field names differ. Fix: extract into a reusable client-side utility module.
- **#23 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** Each list page has an Astro server-rendered card template and a nearly identical hand-rolled string-concatenation version inside the client-side `renderCard()` JS. A card design change requires updating both. Fix: generate card HTML server-side and serve it via an SSR partial endpoint, or accept the duplication and keep both in sync.
- **#24 [src/components/Pagination.astro]** The `Pagination` component is used in admin list pages but the public list pages build pagination HTML manually in both the Astro template and the client-side JS string. Fix: use the component on public pages or document why each path needs its own implementation.
- **#25 [src/pages/admin/miracles/[slug]/edit.astro]** Source and image "Remove" buttons POST directly with no confirmation step. A misclick permanently deletes a source or image. Fix: add `onclick="return confirm('Remove this source?')"` or a `<dialog>` confirm.
- **#26 [src/pages/saints/index.astro, src/pages/miracles/index.astro]** `applyFilters()` fires a fetch and replaces DOM content with no visual feedback while the request is in flight. On a slow edge response the user sees stale results with no indication an update is pending. Fix: add a loading class or spinner to the grid container during fetch.
- **#27 [src/components/SaintForm.astro, src/components/MiracleForm.astro]** The slug input is shown only on create (guarded by `!v`), not on edit. A typo in the initial slug is permanently locked in without a direct DB edit. Fix: expose slug on the edit form with a warning about URL breakage, or add a redirect rule on slug change.

---

## Feature Ideas

### High
_None identified._

### Medium
- **#28 [src/pages/miracles/index.astro, src/api/routes/miracles.ts]** Topic filter missing from `/miracles` filter bar. Topics are the primary discovery dimension (`MIRACLE_TOPICS` has 13 values, GIN index exists), displayed on list cards, but there's no Topic dropdown. The API `MiraclesQuerySchema` also has no `topic` param. Fix: add `topic` to the API schema with `sql\`${miracles.topics} @> ARRAY[${topic}]::text[]\`` condition, and add the dropdown to the filter bar and JS `buildApiUrl`/`buildPageUrl` functions.
- **#29 [src/pages/miracles/index.astro]** Miracle category filter (`intercessory`, `associated`, `apparition`) missing from filter bar. Users cannot browse only apparitions or only intercessory miracles. Fix: add a Category dropdown to the filter bar, wired through the API schema and JS swap logic.
- **#30 [src/pages/miracles/index.astro]** Miracles list default sort is alphabetical by title (`asc(miracles.title)`), which is the least useful default for a historical database. The API route already uses chronological order. Fix: change the Astro page default to `asc(miracles.date_of_event)` (nulls last) to match the timeline page expectations.
- **#31 [src/pages/]** The OpenAPI spec is generated and served at `/api/v1/doc` but nothing on the public site links to it or explains the API exists. Fix: add an API page or section in the footer/about area pointing to `/api/v1/doc` with a brief description of available endpoints.

### Low
- **#32 [src/pages/saints/index.astro, src/api/routes/saints.ts]** Nationality and patronage are prominent discovery axes (`saints_patronage_gin_idx` already exists) but neither is filterable. Low priority given the small current saint count, but worth adding when saints reach 30+.
- **#33 [src/pages/miracles/index.astro]** Topic tags on miracle list cards render as plain `<span>` elements. On the detail page they link to `/search?q=<topic>` (ilike text search), which will match the word "children" anywhere in the synopsis — not a topic filter. Fix: make card tags link to `/miracles?topic=<topic>` once #28 is implemented.
- **#34 [src/pages/]** No RSS/Atom feed. A `GET /feed.xml` returning recently published miracles and saints would serve devotional users and aggregators.
- **#35 [src/pages/miracles/[slug].astro]** The Related Miracles section shows title and type but not which saint the miracle is attributed to. Since related miracles come from both saint-linked and topic-linked queries, saint attribution clarifies why each entry is related. Fix: include saint name(s) in the related miracles query and render them on each related card.
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
| Security | 0 | 3 | 1 | 4 |
| Bugs | 0 | 1 | 0 | 1 |
| Performance | 0 | 0 | 1 | 1 |
| Improvements & Refactors | 0 | 8 | 6 | 14 |
| Feature Ideas | 0 | 4 | 11 | 15 |
| **Total** | **0** | **16** | **19** | **35** |
