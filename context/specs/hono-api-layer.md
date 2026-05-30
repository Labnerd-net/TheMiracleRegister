# Spec for Hono API Layer

Title: Hono API Layer
Branch: claude/feature/hono-api-layer
Spec file: context/specs/hono-api-layer.md

## Summary

Wire up Hono as the API layer mounted at `/api/v1/*` using `@hono/zod-openapi`. This step establishes the full API foundation — Hono app structure, Zod schema definitions, all six endpoints returning stubbed/empty responses, and auto-generated OpenAPI spec. No real database queries yet — that comes in step 4 when pages render from the DB. The goal is a fully routed, type-safe API skeleton with an OpenAPI spec that is always in sync.

## Functional Requirements

- Install `hono` and `@hono/zod-openapi`
- Mount the Hono app as a Cloudflare Pages Function at `/api/v1/*` via `src/pages/api/v1/[...route].ts` (Astro catches all API routes and delegates to Hono)
- Define Zod schemas for all API response shapes: saint list item, saint detail (with `related_saints` array and `miracles` array), miracle list item, miracle detail (with `sources` array), miracle types list, search results
- Implement all six endpoints with stubbed empty/placeholder responses:
  - `GET /api/v1/saints` — list all saints
  - `GET /api/v1/saints/:slug` — single saint with related saints and miracles
  - `GET /api/v1/miracles` — list with query params: `saint_id`, `type`, `country`, `year_from`, `year_to`, `page`, `limit`
  - `GET /api/v1/miracles/:slug` — single miracle with sources
  - `GET /api/v1/types` — list miracle types (can be static data from enums)
  - `GET /api/v1/search` — full-text search (stubbed, returns empty results)
- All responses use the envelope: `{ data, meta, error }`
- `meta` includes pagination fields (`page`, `limit`, `total`) for list endpoints
- OpenAPI spec accessible at `/api/v1/doc` (Swagger UI or raw JSON)
- Zod schemas must be the single source of truth — TypeScript types and OpenAPI spec both derived from them
- No CORS or auth required at this stage

## Possible Edge Cases

- Astro's file-based routing and Hono's router must coexist — the catch-all route file must not conflict with Astro page routes
- `@hono/zod-openapi` requires schemas to be defined with `.openapi()` — plain Zod schemas won't generate OpenAPI docs
- The Cloudflare Pages adapter passes the request through Astro's SSR handler first — the Hono mount must intercept before Astro tries to render a page
- Query parameter validation on `GET /api/v1/miracles` (types, ranges) must be defined in Zod and reflected in the OpenAPI spec
- `page` and `limit` defaults: `page=1`, `limit=20`, max `limit=100`

## Acceptance Criteria

- `npm run build` passes with no errors
- `npm test` passes
- `GET /api/v1/saints` returns `{ data: [], meta: { page: 1, limit: 20, total: 0 }, error: null }`
- `GET /api/v1/types` returns the full list of miracle types from the enum
- `GET /api/v1/doc` serves the OpenAPI spec
- All route paths and query params appear correctly in the OpenAPI spec

## Open Questions

- Should the OpenAPI UI be Swagger UI (via a CDN script) or raw JSON only? (Recommend raw JSON at `/api/v1/doc` for now — UI can be added later)
- Should `/api/v1/[...route].ts` use Astro's API route format or a Cloudflare Pages Function in `functions/`? (Recommend Astro API route — keeps everything in `src/` and consistent with the Astro adapter)

## Testing Guidelines

- Test file: `tests/api.test.ts`
- Unit test the Hono app directly (import the app, call `app.request(...)`) — no HTTP server needed
- Test cases:
  - `GET /api/v1/saints` returns 200 with correct envelope shape
  - `GET /api/v1/miracles` returns 200 with pagination defaults
  - `GET /api/v1/miracles?page=2&limit=10` returns correct meta
  - `GET /api/v1/types` returns 200 with non-empty data array
  - `GET /api/v1/saints/unknown-slug` returns 404
  - `GET /api/v1/miracles/unknown-slug` returns 404

## Personal Opinion

This is the right scope for step 3 — get the API shape locked in before wiring real data. The only real risk is the Astro + Hono routing integration: Astro's SSR adapter intercepts all requests, so the Hono catch-all must be set up correctly or API calls will 404. Worth verifying the routing works locally before moving on. The `@hono/zod-openapi` approach is solid — schemas defined once, types and docs flow from there automatically.
