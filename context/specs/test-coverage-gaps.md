# Test Coverage Gaps (backlog #22)

Add tests for the untested modules that guard publishing, headers and data quality.

## Scope
- `src/middleware.ts`: security headers set, existing headers not overwritten, `?preview=` adds `Referrer-Policy: no-referrer` and `X-Robots-Tag: noindex, nofollow`, no preview headers otherwise.
- `src/pages/sitemap.xml.ts`: unpublished saints/miracles excluded, published included, static pages present, thin topic/theme pages excluded.
- `src/lib/format.ts`: `formatApproxDate` for every precision, plus the other pure helpers.
- `scripts/check-data.ts`: move the checks into an importable `runChecks(sql)` (CLI behaviour unchanged) and test each rule against PGlite.

## Already covered (no work)
- `fetchSaintsByMiracle` published filter and `includeUnpublished` preview flag: `tests/queries.test.ts`.

## Out of scope
- Astro page rendering (needs the container API or Playwright, backlog #29).

## Done when
`npm test`, `npm run typecheck`, `npm run build` and `npm run check:data` pass.
