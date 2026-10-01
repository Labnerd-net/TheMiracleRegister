# Project Backlog

> Generated: 2026-09-30
> Focus: Full audit
> Completed and removed (numbering kept stable): #10, #11

---

## Security

### High
- **#1 recipient_privacy not enforced** (`src/api/routes/miracles.ts` ~90,147; `src/api/routes/saints.ts` ~134; `src/pages/saints/[slug].astro` ~37,236; `src/pages/miracles/[slug].astro` ~197): The public API returns `recipient_name` unconditionally. The miracle page hides it only for `confidential`, and the saint page does not check at all. `first_name_only` and `confidential` records leak full names. Fix: add a `redactRecipient(name, privacy)` helper (null for confidential, first token for first_name_only), select `recipient_privacy` wherever `recipient_name` is selected, and apply it in the API and all three pages.

### Medium
- **#2 Unpublished saints exposed** (`src/pages/miracles/[slug].astro` ~69-94; `src/pages/saints/[slug].astro` ~49-55; `src/api/routes/saints.ts` ~155-167; `src/pages/miracles/index.astro` ~85): Linked and related saint queries do not filter on `saints.published`, so unpublished saint name, slug, image and stage appear publicly. Fix: add `eq(saints.published, true)` to these joins, keeping unpublished rows only in preview mode.
- **#3 Static preview token in URL** (`miracles/[slug].astro:12`, `saints/[slug].astro:13`, `admin/*/[slug]/edit.astro:175`): `PREVIEW_TOKEN` is a never-expiring shared secret in the query string, so it lands in logs, history and Referer, and it is compared with `===`. Fix: allow preview only with a valid `tmr_session` cookie (`validateSessionToken`) and drop the token from URLs.
- **#4 Login lockout and session revocation** (`src/pages/admin/login.astro` 12-40; `src/lib/auth.ts` 41-57): Lockout is per-IP using a non-atomic KV counter, so rotating IPs bypasses it. Session tokens are stateless, so a stolen cookie is valid for 7 days and logout cannot revoke it. Fix: use a long random `ADMIN_PASSWORD`, consider Cloudflare Access in front of `/admin/*`, and embed a session version/id in the token (or shorten the lifetime).

### Low
- **#5 URL fields lack scheme validation** (admin miracle/saint edit pages; `image_url`, `wikipedia_url`, source and image URLs): `javascript:` URLs would be stored and rendered as href/src. Admin-only. Fix: server-side Zod `z.string().url().refine(u => /^https?:/.test(u))`.
- **#6 Weak server-side form validation** (`src/lib/form-schemas.ts` 3-11; admin handlers): Only a few fields are validated. Slug is not passed through `slugify`, so a slug with `/`, `?` or spaces breaks routes and the edit redirect. Month, day, lat/lng, ages, `witness_count` are unchecked, and raw Postgres `e.message` is shown to the admin. Fix: expand the Zod schemas (slug regex, month 1-12, day 1-31, lat/lng ranges, non-negative ints) and show generic errors.
- **#7 No security headers** (`src/middleware.ts`): No CSP, X-Frame-Options/`frame-ancestors`, Referrer-Policy or X-Content-Type-Options. Matters for admin delete forms and for rendered `marked` + `xss` HTML. Fix: set headers in middleware; at minimum `frame-ancestors 'none'` and `Referrer-Policy: same-origin` on `/admin`.
- **#8 ILIKE wildcards unescaped** (`src/lib/search.ts:36`, `src/api/routes/miracles.ts:68`): `%` and `_` in `q`/`country` are not escaped, so `%` matches everything; `SearchQuerySchema` and `country` lack a max length. Fix: escape `\`, `%`, `_` and add `.max(100)`.
- **#9 Admin and preview not excluded from crawlers** (`public/robots.txt`, preview responses): robots.txt allows everything. Fix: `Disallow: /admin/`, `/random`, `/search?`, and send `X-Robots-Tag: noindex` for `/admin` and `?preview` responses.

---

## Bugs

### High
_None identified._

### Medium
- **#12 Create handlers drop form fields** (`src/pages/admin/miracles/new.astro` 36-66; `src/pages/admin/saints/new.astro` 26-56): Miracle create ignores `location_lat/lng`, `recipient_gender`, `recipient_country`, `content_tier`, `feast_month`, `feast_day_of_month`, `feast_easter_offset`; saint create ignores the three feast fields. Edit saves them, so data entered on create is silently lost. Fix: shared `buildMiracleValues`/`buildSaintValues` used by both create and edit (see #24).
- **#13 Non-atomic multi-statement admin writes** (`admin/miracles/[slug]/edit.astro` 99-145; `admin/saints/[slug]/edit.astro` 89-100): Saint-link ids are not de-duplicated or validated, and saint relation add/delete writes two mirror rows in separate statements, so a failure leaves a one-way relation. Fix: de-duplicate with `new Set`, and batch the mirror-row writes with `db.batch`.

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
- **#18 Cache-Control and invalidation** (`saints/[slug].astro:23`, `miracles/[slug].astro:54`, API): Edge caches stay stale 30-60 min after admin edits, and `public, max-age` lets browsers cache for the full TTL. Fix: purge after admin saves or use shorter `s-maxage` with SWR, a lower browser `max-age`, and confirm the preview branch and admin responses are `no-store`.

### Low
- **#19 Search has no index** (`src/lib/search.ts` 46-63; `src/api/routes/search.ts` 31-34): ILIKE `%q%` across `biography_short`, `synopsis`, `cure_details` forces sequential scans, and the API fetches up to 200 rows then slices in memory. Fix: `pg_trgm` GIN indexes or a `tsvector` column (consider `unaccent` for names like André/Zélie) and push limit/offset into SQL.
- **#20 Filter option lists queried on every request** (`miracles/index.astro` 78-79; `saints/index.astro` 57-66): Full saint list and distinct countries/orders/nationalities are fetched per request to fill dropdowns. Fix: module-level TTL cache or edge cache.

---

## Improvements & Refactors

### High
- **#21 No CI** (`.github/workflows` missing): CLAUDE.md specifies GitHub Actions (typecheck, lint, test, deploy) but none exists, `@astrojs/check`, ESLint and Prettier are not installed, and there is no `typecheck` or `lint` script. Fix: add a workflow running `astro check`, `npm test`, `astro build`, then `wrangler deploy` on main; add the scripts.
- **#22 Tests depend on the production DB** (`vitest.config.ts`, `tests/api.test.ts`): Tests load the real `DATABASE_URL` (the single Neon branch is production) and assert mostly status codes and envelope shape. Untested: filters, `published=false` non-leakage, the 429 path, cache headers, `/api/v1/search`. Fix: per-run Neon branch in CI or a mocked `createDb` with fixtures, and add those assertions.
- **#23 No structured data or rel=canonical** (`src/layouts/Base.astro`): No JSON-LD anywhere, and `canonicalUrl` is only used for `og:url` (no `<link rel="canonical">`). No default og:image/og:site_name; paginated and filtered URLs are not canonicalized or noindexed; sitemap omits `/verification`, `/contact`. Fix: add a `jsonLd` prop (Person for saints, Article/CreativeWork for miracles, BreadcrumbList, Dataset for home/API), add rel=canonical and a default social card.

### Medium
- **#24 Duplicated admin field-mapping** (`admin/miracles/[slug]/edit.astro` 99-137, `miracles/new.astro` 36-66, `admin/saints/[slug]/edit.astro` 109-142, `saints/new.astro` 26-56): The parseInt-IIFE is repeated ~10 times, and create/edit drift apart (see #12). Fix: `getInt` in `formHelpers`, shared `parseMiracleForm`/`parseSaintForm` using Zod tied to `MIRACLE_TOPICS`/`SAINT_THEMES` and URL validation, shared by new and edit.
- **#25 Oversized files mixing concerns**: `miracles/index.astro` (637 lines), `miracles/[slug].astro` (547), `saints/index.astro` (444), `Base.astro` (425), `calendar.astro` (396), `saints/[slug].astro` (370), `admin/saints/[slug]/edit.astro` (356). Admin edit pages run 5-7 actions in one if/else chain with copy-pasted source/location/image markup. Fix: extract `SourcesEditor`, `ImagesEditor`, `LocationsEditor`, `Lightbox`; move inline scripts to `src/scripts`; split actions into `src/lib/admin/` handlers.
- **#26 Duplicated query and filter logic**: API routes and Astro pages each build the same miracle/saint WHERE clauses, and the saint-names-by-miracle Map loop is repeated in `saints.ts`, `miracles/index.astro`, `admin/miracles/index.astro`, `miracles/[slug].astro`. Pages also re-render cards client-side from the API. Fix: `src/lib/queries/{miracles,saints}.ts`, mirroring the existing `searchContent` extraction.
- **#27 Duplicated feast-day logic** (`index.astro`, `calendar.astro`, `miracles/[slug].astro` MONTHS/`formatFeastDay`): Fix: `src/lib/feasts.ts` (`getFeastsForDate/Month`) plus month names in `lib/format`, with unit tests.
- **#28 Pure logic has no unit tests**: `src/lib/easter.ts`, `slugify.ts`, `form-utils.ts`, `form-schemas.ts`, `auth.ts` (expiry/tamper), `rateLimit.ts`, `feastDays.ts` invariants. `tests/schema.test.ts` only asserts exports exist. Fix: add targeted tests (known Easter dates would have caught the old Today's Feast off-by-one).
- **#29 Playwright documented but absent**: Add a smoke suite (home, saint page, miracle filters, search, admin login and save) or correct CLAUDE.md/README. It would have caught the old `db.transaction()` failure on miracle edit.
- **#30 Data-integrity checks only by convention**: Add a script/CI check that `// [in DB]` entries in `FIXED_FEASTS` match real saints, published records have at least one source, and topics/themes belong to `src/db/topics.ts`.
- **#31 Accessibility gaps**: Few or no `aria-*` attributes on saint page, index pages, map, timeline, forms; no skip link or `<main id>`; lightbox and map lack `role="dialog"`/`aria-modal`/Escape/focus trap; no `aria-live` for client-fetched results; no `prefers-reduced-motion` or `focus-visible` handling; images lack `loading="lazy"` and `width`/`height`; fonts not preloaded. Fix: pass with the `a11y-reviewer` agent and Lighthouse, then address findings.

### Low
- **#32 Inline styles** (admin pages, `404.astro`, public pages): Heavy `style="..."` use despite Tailwind and CSS variables. Fix: move repeated styles to classes in `AdminBase`/`global.css`; this also enables a stricter CSP.
- **#33 Minor cleanup**: `catch (e: any)` across admin pages (use `unknown` + `instanceof Error`), `any` hits in `miracles/index.astro`, `saints/index.astro`, `verification.astro`; `used_for_*` typed as string compared to `"1"`; `SaintsQuerySchema` defined inline and duplicating `PaginationQuerySchema`; `escHtml` re-implemented in inline scripts; `@types/marked` is a stale stub (marked ships types); `resolveMovableFeast` imported but apparently unused in `index.astro:7`; README/CLAUDE.md list only some `/api/v1/miracles` params.
- **#34 Unused or write-only fields**: `content_tier` is not used by any page; miracle `feast_*` columns are write-only. Fix: wire them up or drop them.
- **#35 Dev environment safety**: `npm run db:migrate` runs against production (single Neon branch); no `.nvmrc`/`engines`; Docker Compose is absent. Fix: add a Neon dev branch or a pre-migrate confirmation, and `.env.example` guidance.
- **#36 `createDb()` boilerplate**: Called per request in ~25 pages. Fix: set `Astro.locals.db` in `middleware.ts`.

---

## Feature Ideas

### High
- **#37 Patronage and topic/theme browse pages**: `/patronage/[term]` and `/topics/[topic]` using the existing GIN indexes, no migration needed. Strong long-tail SEO landing pages.
- **#38 Admin list search and filter**: `?q=`, draft-only toggle, and data-quality filters (missing sources/feast/image) on admin index pages.

### Medium
- **#39 Human-readable API docs**: Scalar or Swagger UI at `/api/v1/docs`, plus an API usage page and a "Cite this record" button (APA/Chicago with permalink and access date).
- **#40 API expansion**: Expose saint sources, locations and related miracles; add `?fields=`, `?published_since=`, `ETag`/`Last-Modified` from `updated_at`, and bulk JSON/CSV export (`/api/v1/export`); admin export.
- **#41 Public source-verification status**: Add `last_verified_at`/`verification_status` to source tables, show a "sources checked on" badge, tie into `/verification`, and optionally run a scheduled Worker cron for dead-link checks.
- **#42 Discovery on existing data**: Similar miracles (shared topic/diagnosis/type/country), statistics page (by type, decade, country, approval authority), recently canonized/beatified feed, show dispensation fields on saint pages, "On this feast day" block from miracle `feast_*` columns.

### Low
- **#43 RSS/Atom feed and ICS calendar export** (per-saint "add to calendar"), reusing `updated_at` and Easter logic.
- **#44 Map and calendar polish**: Map filter by location type, `/map?saint=` deep links, year picker on `/calendar` (`getEaster(year)` already supports it).
- **#45 Admin audit and safety**: `delete.astro` hard-deletes with no undo on a single production branch. Add soft delete, revision history/`updated_by`, a slug redirect table (renaming a slug breaks public URLs), and Neon snapshot schedule.
- **#46 i18n groundwork**: Plan `hreflang` and translatable fields; large effort, defer.

---

## Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Security | 1 | 3 | 5 | 9 |
| Bugs | 0 | 2 | 2 | 4 |
| Performance | 0 | 3 | 2 | 5 |
| Improvements & Refactors | 3 | 8 | 5 | 16 |
| Feature Ideas | 2 | 4 | 4 | 10 |
| **Total** | 6 | 20 | 18 | 44 |
