# The Miracles Register

A data-driven website documenting miracles attributed to Catholic saints — canonization miracles with medical documentation, narrative synopses, source trails, and a public REST API.

**themiracleregister.org**

No existing site covers saint intercession miracles as a structured, searchable database. Miracle Hunter and similar sites collect case write-ups, but nothing exposes the underlying data as queryable, relational records — filterable by saint, medical diagnosis, approval authority, country, or time period, and consumable by anyone building on top of it.

This project treats each miracle as a structured record rather than a standalone article. A healing miracle links back to the saint's canonization case, the recipient's diagnosis and cure characteristics, the medical board verdict that examined it, the Vatican decree (or other approval authority) that recognized it, and the primary sources behind the write-up. That structure is what makes the site queryable and the API useful — you can ask "show me every medically verified instant-complete healing used for a canonization" and get an answer, not just browse a list.

The data itself is compiled from Vatican decrees, the Consulta Medica's medical board verdicts, Catholic press coverage, and other primary sources — cross-referenced and entered by hand, not scraped.

## Scope

- **Primary:** Intercessory miracles — posthumous healings attributed to a saint's intercession
- **Secondary:** Associated miracles for famous cases only (Tilma of Guadalupe, stigmata, incorrupt bodies)
- **Tertiary:** Feast day calendar as a discovery layer, spanning the full liturgical calendar

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (full stack) |
| Frontend | [Astro](https://astro.build) with the Cloudflare adapter |
| API layer | [Hono](https://hono.dev), mounted as a Cloudflare Worker at `/api/v1/*` |
| Hosting | Cloudflare Workers (with static assets) |
| Database | [Neon](https://neon.tech) (serverless Postgres) |
| ORM | [Drizzle](https://orm.drizzle.team) |
| Validation / types / OpenAPI | [Zod](https://zod.dev) via `@hono/zod-openapi` — single source of truth |
| Testing | Vitest (unit), Playwright (e2e) |

Astro renders all public-facing pages (SSR); Hono handles all `/api/v1/*` routes. Zod schemas are shared between the two.

## API

All routes live under `/api/v1/`, with the OpenAPI spec generated automatically from the Zod schemas.

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/saints` | List all saints |
| GET | `/api/v1/saints/:slug` | Single saint with related saints and linked miracles |
| GET | `/api/v1/miracles` | Search/filter (params: saint_id, type, country, year_from, year_to, page, limit) |
| GET | `/api/v1/miracles/:slug` | Single miracle with full details and sources |
| GET | `/api/v1/types` | List miracle types |
| GET | `/api/v1/metadata` | Canonical filter options: types, categories, approval authorities, topics, themes |
| GET | `/api/v1/search` | Full-text search |

Responses follow a `{ data, meta, error }` envelope.

## License

All rights reserved. Source is public for portfolio purposes; miracle and saint data is curated and maintained by the project author.
