# Project Backlog

> Generated: 2026-06-10
> Focus: Full audit

---

## Security

### High
_None remaining._

### Medium
- **#6 [src/pages/admin/login.astro:23]** The failed-login delay is 300ms per response in a stateless Worker. An attacker can fire hundreds of concurrent requests; the delay does not throttle globally. Fix: add a Cloudflare WAF rate-limiting rule on `/admin/login` — more reliable than application-level delay in a Worker environment.
- **#7 [src/lib/auth.ts:53]** Session cookie is missing the `Secure` flag. Cloudflare Workers always serve HTTPS in production, but the flag should be explicit. Fix: append `; Secure` to the cookie string in `sessionCookieHeader()`.
- **#8 [src/pages/admin/login.astro:7]** Open redirect guard checks `startsWith("/")` but not `startsWith("//")` or `/\`. A path like `/\evil.com` is interpreted as `//evil.com` by some browsers. Fix: tighten to require the second character is not `/` or `\`: `/^\/[^/\\]/`.
- **#9 [src/pages/miracles/index.astro:35,41]** Filter params `filterType` and `filterApproval` from URL query strings are cast directly to enum types (`as "healing"`, `as "vatican_dicastery"`) and passed to Drizzle without validation. An arbitrary string from a crafted URL bypasses TypeScript's enum check. Fix: validate against the allowed enum values before the Drizzle call, similar to `parseEnum` in form handlers.

### Low
- **#10 [src/api/index.ts:12]** `cors()` defaults to `Access-Control-Allow-Origin: *`. Acceptable for a read-only public API, but any future admin endpoints added under `/api/v1/` would be implicitly CORS-open. Fix: explicitly configure `origin` in `cors()` config, or document that admin endpoints must never be added under this path.

---

## Bugs

### High
_None identified._

### Medium
- **#11 [src/pages/admin/miracles/new.astro:50,59, src/pages/admin/miracles/[slug]/edit.astro:84,93]** `parseInt(get("recipient_age_at_event"))` and `parseInt(get("witness_count"))` have no `NaN` guard. Browser validation can be bypassed; `parseInt` on a non-numeric string returns `NaN`, which Drizzle passes to Postgres and causes a DB error — leaking the raw error message to the browser. Fix: `const age = parseInt(...); isNaN(age) ? null : age`.
- **#12 [src/pages/admin/saints/[slug]/edit.astro, src/pages/admin/miracles/[slug]/edit.astro]** After source add/delete and location add/delete POSTs, the code unconditionally re-fetches the full saint/miracle record even though those actions don't change the main record. Fix: only re-fetch when the action is the main form save (the `else` branch).

### Low
- **#13 [src/pages/miracles/[slug].astro:74]** Related miracles query uses a raw SQL subquery with hardcoded table name `miracle_saints` as a string literal. Risk if table is ever renamed. Fix: use Drizzle's `inArray` with a subquery.
- **#14 [src/pages/saints/[slug].astro]** `saint.total_attributed_miracles` is referenced in the template but this column does not exist in the saints schema. Silently renders nothing. Fix: remove the reference or add the column if intended.
- **#15 [src/pages/admin/saints/new.astro, src/pages/admin/miracles/new.astro]** Raw DB error messages (e.g. unique constraint violations) are surfaced directly to the browser via `error = e?.message`. Fix: catch known constraint errors (duplicate slug) and return a friendly message.

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
| Security | 0 | 4 | 1 | 5 |
| Bugs | 0 | 2 | 3 | 5 |
| Performance | 1 | 1 | 1 | 3 |
| Improvements & Refactors | 0 | 5 | 1 | 6 |
| Feature Ideas | 0 | 2 | 5 | 7 |
| **Total** | **1** | **14** | **11** | **26** |
