# API Docs Page and Cite Block (backlog #43)

Branch: `claude/feature/api-docs-cite`

## Problem
The OpenAPI spec exists at `/api/v1/doc` and the footer "API" link points straight at the JSON. Nothing explains the API or renders the spec, and records cannot be cited in a standard format.

## Scope
- `/api`: static usage page (quick start, envelope, endpoint list, limits and caching, data notes), linked from the footer in place of `/api/v1/doc`.
- `/api/reference`: Scalar API reference rendered from `/api/v1/doc`. Pinned `@scalar/api-reference@1.71.0` from jsDelivr with an SRI hash; telemetry, AI agent, developer-tools toolbar and Scalar-hosted fonts disabled.
- `src/lib/cite.ts` and `src/components/Cite.astro`: collapsed "Cite this record" block (APA and Chicago text, permanent link) on miracle and saint pages, hidden on preview. The access date is filled in by a small script, because cached HTML would carry the render date; without JS it is omitted.
- `/api` and `/api/reference` added to the sitemap, with a description in `PAGE_DESCRIPTIONS`.
- Middleware: the page rate limiter's bypass narrowed from `/api/` to `/api/v1/`, so the new pages are limited like other pages.

## Not in scope
- Copy buttons, BibTeX/MLA, per-section citations (backlog #40 covers a copy-permalink button).
- Moving the OpenAPI spec path or adding API endpoints (#44).
- A CSP (#3).

## Verification
Tests for `citations()` and the middleware change; lint, typecheck, build. In a browser: citation text with date, Scalar renders the spec with only localhost, jsDelivr and the site analytics host requested.
