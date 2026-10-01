# Topic and Theme Browse Pages (backlog #37, partial)

Branch: `claude/feature/browse-pages`

## Problem
`/miracles?topic=x` and `/saints?theme=x` filter on the GIN-indexed arrays, but every query-string URL is `noindex`, so none of it is a search landing page. Topic tags on miracle pages link to `/search?q=...`, not to a browse page.

## Approach
Path-based, indexable pages over the existing controlled lists in `src/db/topics.ts`. No migration.

- `/topics` (index) and `/topics/[topic]`: published miracles where `topics @> ARRAY[topic]`.
- `/themes` (index) and `/themes/[theme]`: published saints where `themes @> ARRAY[theme]`.
- Unknown slug (not in `MIRACLE_TOPICS` / `SAINT_THEMES`): redirect to `/404`, matching the slug pages.
- Index pages list every value with its published count; values below the threshold are shown but not linked-for-SEO (see below).
- **Thin-content threshold:** a constant `MIN_BROWSE_RECORDS = 3` in `src/lib/`. A page with fewer records renders normally but sends `noindex,follow` and is omitted from the sitemap. Current data: topics `conversion` (2), `addiction`, `marriage`, `veterans` (1 each) and theme `martyrs` (2), `technology` (1) fall below it.
- Humanized labels (`pregnancy-and-childbirth` -> "Pregnancy and childbirth") via `src/lib/format.ts`.
- Reuse the existing miracle and saint card markup; no refactor of the shared cards (#25/#26 stay open).
- Links: topic tags on `miracles/[slug].astro` and miracle cards on `miracles/index.astro` point at `/topics/[topic]`; saint themes link to `/themes/[theme]` where themes are shown. Add `/topics` and `/themes` to the nav/footer only if a fitting slot already exists.
- `sitemap.xml.ts`: add `/topics`, `/themes` and every value at or above the threshold.
- `src/lib/jsonld.ts`: `CollectionPage` + `BreadcrumbList`.
- Cache: `CACHE_CONTENT`.
- Tests on PGlite: unknown slug, unpublished records excluded, threshold gating (noindex + sitemap), count query.

## Not in scope
- Patronage browse pages (free text, 55 of 70 terms on one saint, near-duplicate terms). Tracked as backlog #51.
- Refactoring shared card markup or the duplicated filter queries (#25, #26).
- Medical-diagnosis browse pages.

## Behaviour changes to accept
- Below-threshold pages exist but are `noindex`; a value crossing the threshold becomes indexable and enters the sitemap on the next cache expiry, with no deploy.
- Counts and the threshold are computed per request; at the current size this is two small aggregate queries.

## Verification
Typecheck, build, tests. On the dev server: each page renders, a thin value sends `noindex`, an unknown slug redirects, sitemap lists only qualifying values. Not verifiable here: indexing by search engines.
