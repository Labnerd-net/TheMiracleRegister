# Plan: Hono API Layer

## Context

Astro + Cloudflare adapter is in place. This step adds Hono with `@hono/zod-openapi` as the API layer at `/api/v1/*`. The goal is a fully routed, type-safe API skeleton with stubbed responses and an auto-generated OpenAPI spec — no real DB queries yet. Zod schemas are the single source of truth for TypeScript types and OpenAPI docs.

Routing approach: **Astro catch-all API route** at `src/pages/api/v1/[...route].ts` delegates all `/api/v1/*` requests to the Hono app. This keeps everything in `src/` and avoids a separate `functions/` directory.

---

## File Structure

```
src/
  api/
    index.ts          ← Hono app export (importable for tests)
    schemas.ts        ← All Zod schemas with .openapi() annotations
    routes/
      saints.ts       ← GET /saints, GET /saints/:slug
      miracles.ts     ← GET /miracles, GET /miracles/:slug
      types.ts        ← GET /types
      search.ts       ← GET /search
  pages/
    api/
      v1/
        [...route].ts ← Astro catch-all → delegates to Hono app
```

---

## Implementation Steps

### 1. Install dependencies

```
npm install hono @hono/zod-openapi zod
```

### 2. Define Zod schemas — `src/api/schemas.ts`

All schemas use `z.object(...).openapi(...)` for OpenAPI doc generation.

**Shared:**
- `MetaSchema` — `{ page, limit, total }`
- `EnvelopeSchema<T>` — `{ data: T, meta: MetaSchema | null, error: string | null }`

**Saints:**
- `SaintListItemSchema` — id, slug, name, canonization_stage, feast_day, nationality, image_url, total_attributed_miracles
- `RelatedSaintSchema` — id, slug, name, relation_type
- `SaintDetailSchema` — all saint columns + `related_saints: RelatedSaintSchema[]` + `miracles: MiracleListItemSchema[]`

**Miracles:**
- `MiracleListItemSchema` — id, slug, title, type, subtype, country, date_of_event, date_precision, recipient_name, was_medically_verified, vatican_recognized, saint_id
- `SourceSchema` — id, url, title, source_type, accessed_date
- `MiracleDetailSchema` — all miracle columns + `sources: SourceSchema[]`

**Types:**
- `MiracleTypeItemSchema` — `{ type, label }` — derived from the `miracleType` enum values

**Search:**
- `SearchResultSchema` — `{ type: 'saint' | 'miracle', slug, title, excerpt }`

**Query params:**
- `MiraclesQuerySchema` — saint_id (optional int), type (optional enum), country (optional string), year_from/year_to (optional int), page (default 1), limit (default 20, max 100)
- `SearchQuerySchema` — q (required string), page, limit

### 3. Build Hono routes

Each route file creates a typed `OpenAPIHono` router and exports it.

**`src/api/routes/saints.ts`**
- `GET /saints` → returns `{ data: [], meta: { page: 1, limit: 20, total: 0 }, error: null }`
- `GET /saints/:slug` → returns 404 `{ data: null, meta: null, error: 'Not found' }` (stub)

**`src/api/routes/miracles.ts`**
- `GET /miracles` → validates query params, returns empty list envelope
- `GET /miracles/:slug` → returns 404 stub

**`src/api/routes/types.ts`**
- `GET /types` → returns static list of all `miracleType` enum values with human-readable labels

**`src/api/routes/search.ts`**
- `GET /search` → validates `q` param, returns empty results envelope

### 4. Wire up the app — `src/api/index.ts`

```ts
import { OpenAPIHono } from '@hono/zod-openapi'
import saints from './routes/saints'
import miracles from './routes/miracles'
import types from './routes/types'
import search from './routes/search'

const app = new OpenAPIHono().basePath('/api/v1')

app.route('/saints', saints)
app.route('/miracles', miracles)
app.route('/types', types)
app.route('/search', search)

app.doc('/doc', {
  openapi: '3.0.0',
  info: { title: 'The Miracles Register API', version: '1.0.0' },
})

export default app
```

### 5. Astro catch-all route — `src/pages/api/v1/[...route].ts`

```ts
import type { APIRoute } from 'astro'
import app from '../../../api/index'

export const ALL: APIRoute = ({ request }) => app.fetch(request)
```

This file must export `ALL` (not individual HTTP methods) so Hono handles routing internally.

### 6. Update `astro.config.mjs`

No changes needed — Astro catch-all routes work out of the box with the Cloudflare adapter.

---

## Tests — `tests/api.test.ts`

Test the Hono app directly via `app.request(...)` — no HTTP server needed:

- `GET /api/v1/saints` → 200, envelope shape correct, data is array
- `GET /api/v1/miracles` → 200, meta has page=1, limit=20
- `GET /api/v1/miracles?page=2&limit=10` → 200, meta has page=2, limit=10
- `GET /api/v1/types` → 200, data is non-empty array
- `GET /api/v1/saints/unknown-slug` → 404
- `GET /api/v1/miracles/unknown-slug` → 404
- `GET /api/v1/doc` → 200 (OpenAPI JSON)

---

## Verification

1. `npm run build` exits 0
2. `npm test` passes (existing schema tests + new API tests)
3. `GET /api/v1/doc` returns valid OpenAPI JSON with all 6 route paths visible
