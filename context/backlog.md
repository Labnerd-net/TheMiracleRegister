# Project Backlog

> Generated: 2026-06-04 — Last updated: 2026-06-05
> Focus: Full audit

---

## Security

### Low
- **#6 [src/layouts/Base.astro:19, src/pages/index.astro:19]** Umami analytics `data-website-id` UUID and script host (`umami.labnerd.net`) are hard-coded in source, revealing analytics infrastructure. Low risk (Umami IDs are public by design), but would need to change for staging/forks. Consider moving to an env var if multi-environment.

---

## Bugs

### High
- ~~**#7 [src/api/routes/search.ts]** `?q` search silently returned empty — broken API contract~~ — **Fixed 2026-06-05.** Resolved by #25 implementation.

### Low
- **#9 [src/pages/admin/miracles/[slug]/edit.astro, src/pages/admin/saints/[slug]/edit.astro]** Post-save re-fetch of the miracle/saint is unconditional on every request, including GETs where the data hasn't changed. Also, `allSaints` is fetched on every request regardless of success/failure. Acceptable now but worth noting for future optimization.

---

## Performance

### Medium
- **#12 [src/pages/saints/index.astro:9, src/pages/miracles/index.astro:9]** Both public list pages fetch all records with no pagination — full table dumps including joins. The API layer has pagination; the SSR pages don't use it. Fix: add `LIMIT`/`OFFSET` and pagination UI, or cache rendered pages at the Cloudflare edge.

### Low
- **#15 [src/api/routes/miracles.ts:91, src/pages/miracles/[slug].astro:11, src/pages/saints/[slug].astro:11]** Detail pages use `db.select()` (effectively `SELECT *`), pulling all columns including large text fields (`synopsis`, `cure_details`, `vatican_medical_board_verdict`) even when not all are needed. Also exposes future columns immediately. Fix: replace with explicit field lists matching the response schema.

---

## Improvements & Refactors

### High
- ~~**#17 [admin form pages]** ~150–200 lines of form UI duplicated between new/edit variants~~ — **Fixed 2026-06-05.** Extracted `src/components/SaintForm.astro` and `src/components/MiracleForm.astro`. Each accepts an optional entity prop; presence determines pre-fill, button label, and slug field visibility. POST logic remains in the page files.

### Medium
- **#18 [src/pages/admin/*/new.astro, src/pages/admin/*/edit.astro]** Admin forms manually parse `form.get()` without full Zod validation. Zod schemas already exist in `src/api/schemas.ts`. Fix: reuse existing Zod schemas to validate form data before insert/update. Best tackled after #17.
- **#19 [src/pages/admin/]** Admin saint/miracle list pages have no pagination — they render all records. As the dataset grows this will degrade the admin experience. Fix: add `LIMIT`/`OFFSET` with page controls to admin list pages.

### Low
- **#22 [src/db/update-images.ts]** One-off migration script committed permanently with sequential `await` calls in a loop. It has served its purpose but remains in git. If future image updates are needed, use a `CASE WHEN` batched update.

---

## Feature Ideas

### High
- ~~**#25 [src/api/routes/search.ts]** `?q` full-text search silently returned empty~~ — **Fixed 2026-06-05.** Implemented ILIKE search across saints (name, biography_short) and miracles (title, synopsis, medical_diagnosis, cure_details). Parallel queries, deduplication, combinable with `?topic`. Min length 2 enforced.

### Medium
- **#26 [src/pages/miracles/index.astro]** Interactive filtering UI on the miracles list page. The API already supports filtering by `saint_id`, `type`, `country`, `year_from`, `year_to` (`src/api/schemas.ts:176–189`), but the frontend has no filter controls. Add a filter panel with dropdowns for miracle type, country, and year range.
- **#27 [src/pages/miracles/[slug].astro, src/db/schema/miracles.ts:24]** Related miracles by topic on the miracle detail page. The `topics` array has a GIN index (`src/db/schema/miracles.ts:58`). Query up to 3–5 miracles with overlapping topics (excluding self) and display in a sidebar or bottom section.
- **#28 [src/api/routes/]** API metadata endpoint at `/api/v1/metadata` returning canonical filter options: miracle types (reuse `/types`), countries (`SELECT DISTINCT country FROM miracles`), `MIRACLE_TOPICS`, `SAINT_THEMES`. Avoids clients hardcoding these values.
- **#29 [src/db/schema/miracles.ts:30–31]** Map view using existing `location_lat`/`location_lng` coordinates, which are stored but not rendered anywhere. Add a location marker on the miracle detail page using Leaflet (lightweight, no API key required). Optionally add a `/miracles/map` page showing all miracles as pins.
- **#30 [src/db/schema/saints.ts, src/db/schema/miracles.ts]** Timeline/chronological browse at `/miracles/timeline`, grouping miracles by decade using `date_of_event`. Rich date metadata exists but is only used for display on detail pages.

### Low
- **#31 [src/pages/admin/miracles/[slug]/edit.astro]** Batch source import for admin — accept CSV/JSON paste to bulk-create multiple `miracle_sources` records for a miracle. Currently requires one-by-one entry.
- **#32 [src/pages/admin/index.astro]** Admin analytics dashboard extending the current minimal dashboard (only shows total counts). Add aggregations: miracles by country, by type, by topic, saints by canonization stage, timeline of canonizations.
- **#33 [src/pages/]** Custom 404 page — no `/src/pages/404.astro` found. Astro falls back to a generic page. Create one matching the site design with navigation links back to `/saints` and `/miracles`.
- **#34 [src/pages/miracles/[slug].astro:129–145]** Prominent Vatican decree display — Vatican decree sources (`source_type = 'vatican_decree'`) are rendered identically to news articles. Flag them with a distinct style (highlighted box or badge) on the miracle detail page to signal primary authority.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 0 | 1 | 1 |
| Bugs | 1 | 0 | 1 | 2 |
| Performance | 0 | 1 | 1 | 2 |
| Improvements & Refactors | 1 | 2 | 1 | 4 |
| Feature Ideas | 1 | 5 | 4 | 10 |
| **Total** | **3** | **8** | **8** | **19** |
