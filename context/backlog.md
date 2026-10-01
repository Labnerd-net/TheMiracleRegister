# Project Backlog

> Generated: 2026-09-30
> Focus: Full audit
> Completed and removed (numbering kept stable): #1, #10, #11, #21, #22, #47
> Obsolete after the admin panel removal: #4, #5, #6, #12, #13, #24, #38 (and #30, replaced by `npm run check:data`)

---

## Security

### High
_None identified._

### Medium
- **#2 Unpublished saints exposed** (`src/pages/miracles/[slug].astro` ~69-94; `src/pages/saints/[slug].astro` ~49-55; `src/api/routes/saints.ts` ~155-167; `src/pages/miracles/index.astro` ~85): Linked and related saint queries do not filter on `saints.published`, so unpublished saint name, slug, image and stage appear publicly. Fix: add `eq(saints.published, true)` to these joins, keeping unpublished rows only in preview mode.

### Low
- **#3 Preview token handling** (`miracles/[slug].astro:13`, `saints/[slug].astro:14`): `PREVIEW_TOKEN` is a never-expiring shared secret in the query string (logs, history, Referer) compared with `===`; an empty `PREVIEW_TOKEN` env value would match `?preview=`. Now only used manually, so lower risk. Fix: constant-time compare, reject an empty token, send `Referrer-Policy: no-referrer` and noindex on preview responses, optionally an HMAC per slug.
- **#7 No security headers** (no `src/middleware.ts` since the admin removal): No CSP, X-Frame-Options/`frame-ancestors`, Referrer-Policy or X-Content-Type-Options on any page. Matters because `marked` + `xss` HTML is rendered. Fix: add a new middleware (or `public/_headers`) setting them; use `Referrer-Policy: no-referrer` at least on `?preview=` responses.
- **#8 ILIKE wildcards unescaped** (`src/lib/search.ts:36`, `src/api/routes/miracles.ts:68`): `%` and `_` in `q`/`country` are not escaped, so `%` matches everything; `SearchQuerySchema` and `country` lack a max length. Fix: escape `\`, `%`, `_` and add `.max(100)`.
- **#9 Crawler exclusions** (`public/robots.txt`, preview responses): robots.txt allows everything, and `?preview=` pages carry no noindex. Fix: `Disallow: /random`, `/search?`, and send `X-Robots-Tag: noindex` on `?preview=` responses.
- **#50 Unused Cloudflare secrets**: `ADMIN_PASSWORD` and `SESSION_SECRET` are still set on the Worker after the admin removal. Fix: `npx wrangler secret delete ADMIN_PASSWORD` and `npx wrangler secret delete SESSION_SECRET`.

---

## Bugs

### High
- **#48 Full recipient name in synopsis** (`healing-of-matheus`): recipient_privacy is `first_name_only`, but the synopsis contains "Matheus Vianna" and is served by the page and the API. `npm run check:data` flags it. Fix: edit the synopsis to first name only (data edit in Neon), then re-run the check.

### Medium
- **#49 Published miracle without sources** (`healing-of-native-american-boy`): `npm run check:data` flags it as having no sources. Fix: add sources (data edit in Neon), then re-run the check.

### Low
- **#14 Stale "Today's Feast" from cache** (`src/pages/index.astro:9`, `calendar.astro:10`): 1h `s-maxage` plus 24h SWR can show yesterday's feast for up to a day after midnight UTC. Fix: shorter `s-maxage`, drop SWR on this section, or fetch the feast client-side.
- **#15 Timezone-fragile year extraction** (`src/pages/miracles/timeline.astro:33`): `new Date(date).getFullYear()` parses UTC but reads local time. Fix: `getUTCFullYear()`.

---

## Performance

### High
_None identified._

### Medium
- **#16 KV rate limiter** (`src/lib/rateLimit.ts`; used in `src/api/index.ts` 20-30 and `src/pages/search.astro:19`): Every API request/search does a KV read plus write on the same key. KV limits writes to ~1/s per key and bills them, errors are uncaught (public 500s), and read-then-write is non-atomic. Fix: use the Workers Rate Limiting binding or WAF rate-limit rules; keep KV only for login lockout; at minimum try/catch and fail open.
- **#17 Missing indexes** (`src/db/schema/*`): `miracle_saints` has only the composite PK, so lookups by `saint_id` cannot use it. No indexes on `miracle_sources.miracle_id`, `miracle_images.miracle_id`, `saint_sources.saint_id`, `saint_locations.saint_id`, `saint_relations.saint_id`, `published` on saints/miracles, or `miracles.date_of_event`. Fix: add them (partial indexes `WHERE published`), then `db:generate` and `db:migrate`.
- **#18 Cache-Control and invalidation** (`saints/[slug].astro:23`, `miracles/[slug].astro:54`, API): Edge caches stay stale 30-60 min after data edits, and `public, max-age` lets browsers cache for the full TTL. Edits now happen in Neon, so there is no save hook to purge from. Fix: shorter `s-maxage` with SWR, a lower browser `max-age`, or a manual purge step after bulk edits; confirm the preview branch is `no-store`.

### Low
- **#19 Search has no index** (`src/lib/search.ts` 46-63; `src/api/routes/search.ts` 31-34): ILIKE `%q%` across `biography_short`, `synopsis`, `cure_details` forces sequential scans, and the API fetches up to 200 rows then slices in memory. Fix: `pg_trgm` GIN indexes or a `tsvector` column (consider `unaccent` for names like André/Zélie) and push limit/offset into SQL.
- **#20 Filter option lists queried on every request** (`miracles/index.astro` 78-79; `saints/index.astro` 57-66): Full saint list and distinct countries/orders/nationalities are fetched per request to fill dropdowns. Fix: module-level TTL cache or edge cache.

---

## Improvements & Refactors

### High
- **#23 No structured data or rel=canonical** (`src/layouts/Base.astro`): No JSON-LD anywhere, and `canonicalUrl` is only used for `og:url` (no `<link rel="canonical">`). No default og:image/og:site_name; paginated and filtered URLs are not canonicalized or noindexed; sitemap omits `/verification`, `/contact`. Fix: add a `jsonLd` prop (Person for saints, Article/CreativeWork for miracles, BreadcrumbList, Dataset for home/API), add rel=canonical and a default social card.

### Medium
- **#25 Oversized files mixing concerns**: `miracles/index.astro` (637 lines), `miracles/[slug].astro` (547), `saints/index.astro` (444), `Base.astro` (425), `calendar.astro` (396), `saints/[slug].astro` (370). These mix data fetching, markup, inline scripts and per-page styles. Fix: extract `Lightbox`; move inline scripts to `src/scripts`; move shared CSS out of per-page `<style>` blocks.
- **#26 Duplicated query and filter logic**: API routes and Astro pages each build the same miracle/saint WHERE clauses, and the saint-names-by-miracle Map loop is repeated in `saints.ts`, `miracles/index.astro`, `miracles/[slug].astro`. Pages also re-render cards client-side from the API. Fix: `src/lib/queries/{miracles,saints}.ts`, mirroring the existing `searchContent` extraction.
- **#27 Duplicated feast-day logic** (`index.astro`, `calendar.astro`, `miracles/[slug].astro` MONTHS/`formatFeastDay`): Fix: `src/lib/feasts.ts` (`getFeastsForDate/Month`) plus month names in `lib/format`, with unit tests.
- **#28 Pure logic has no unit tests**: `src/lib/easter.ts`, `rateLimit.ts`, `feastDays.ts` invariants, `src/lib/privacy.ts` (`redactRecipient`), and the pure parts of `scripts/check-data.ts`. `tests/schema.test.ts` only asserts exports exist. Fix: add targeted tests (known Easter dates would have caught the old Today's Feast off-by-one).
- **#29 Playwright documented but absent**: Add a smoke suite (home, saint page, miracle filters, search, preview token) or correct CLAUDE.md/README.
- **#31 Accessibility gaps**: Few or no `aria-*` attributes on saint page, index pages, map, timeline; no skip link or `<main id>`; lightbox and map lack `role="dialog"`/`aria-modal`/Escape/focus trap; no `aria-live` for client-fetched results; no `prefers-reduced-motion` or `focus-visible` handling; images lack `loading="lazy"` and `width`/`height`; fonts not preloaded. Fix: pass with the `a11y-reviewer` agent and Lighthouse, then address findings.

### Low
- **#32 Inline styles** (`404.astro`, public pages): Heavy `style="..."` use despite Tailwind and CSS variables. Fix: move repeated styles to classes in `global.css`; this also enables a stricter CSP.
- **#33 Minor cleanup**: `any` hits in `miracles/index.astro`, `saints/index.astro`, `verification.astro`; `used_for_*` typed as string compared to `"1"`; `SaintsQuerySchema` defined inline and duplicating `PaginationQuerySchema`; `escHtml` re-implemented in inline scripts; `@types/marked` is a stale stub (marked ships types); `resolveMovableFeast` imported but apparently unused in `index.astro:7`; README/CLAUDE.md list only some `/api/v1/miracles` params.
- **#34 Unused or write-only fields**: `content_tier` is not used by any page; miracle `feast_*` columns are write-only. Fix: wire them up or drop them.
- **#35 Dev environment safety**: `npm run db:migrate` runs against production (single Neon branch); no `.nvmrc`/`engines`; Docker Compose is absent. Fix: add a Neon dev branch or a pre-migrate confirmation, and `.env.example` guidance.
- **#36 `createDb()` boilerplate**: Called per request in most pages. Fix: set `Astro.locals.db` in a new `src/middleware.ts`.

---

## Feature Ideas

### High
- **#37 Patronage and topic/theme browse pages**: `/patronage/[term]` and `/topics/[topic]` using the existing GIN indexes, no migration needed. Strong long-tail SEO landing pages.

### Medium
- **#39 Human-readable API docs**: Scalar or Swagger UI at `/api/v1/docs`, plus an API usage page and a "Cite this record" button (APA/Chicago with permalink and access date).
- **#40 API expansion**: Expose saint sources, locations and related miracles; add `?fields=`, `?published_since=`, `ETag`/`Last-Modified` from `updated_at`, and bulk JSON/CSV export (`/api/v1/export`).
- **#41 Public source-verification status**: Add `last_verified_at`/`verification_status` to source tables, show a "sources checked on" badge, tie into `/verification`, and optionally run a scheduled Worker cron for dead-link checks.
- **#42 Discovery on existing data**: Similar miracles (shared topic/diagnosis/type/country), statistics page (by type, decade, country, approval authority), recently canonized/beatified feed, show dispensation fields on saint pages, "On this feast day" block from miracle `feast_*` columns.
- **#45 Backup and rename safety**: With the admin gone, all edits are direct SQL against the single production branch, and a slug rename silently breaks public URLs and SEO. Fix: set a Neon snapshot schedule (`set_snapshot_schedule`), and add a slug redirect table checked on 404 for `/saints/[slug]` and `/miracles/[slug]`.

### Low
- **#43 RSS/Atom feed and ICS calendar export** (per-saint "add to calendar"), reusing `updated_at` and Easter logic.
- **#44 Map and calendar polish**: Map filter by location type, `/map?saint=` deep links, year picker on `/calendar` (`getEaster(year)` already supports it).
- **#46 i18n groundwork**: Plan `hreflang` and translatable fields; large effort, defer.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 0 | 1 | 5 | 6 |
| Bugs | 1 | 1 | 2 | 4 |
| Performance | 0 | 3 | 2 | 5 |
| Improvements & Refactors | 3 | 7 | 5 | 15 |
| Feature Ideas | 1 | 5 | 3 | 9 |
| **Total** | 5 | 17 | 17 | 39 |
