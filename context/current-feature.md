# Current Feature

## Current Feature Spec File

## Current Feature Plan File

## History

### Backlog — Security, Performance, Bug, and Refactor Batches
Worked through the generated backlog (context/backlog.md). Closed 20 items across four batches:
- **Security:** Open redirect on login fixed (next param validation); CORS middleware added to all /api/v1/* routes; enum `as any` casts replaced with typed `parseEnum` helper (src/lib/form-utils.ts) across all 4 admin forms; 300ms failed-login delay added; search `?topic` param restricted to canonical MIRACLE_TOPICS + SAINT_THEMES via z.enum.
- **Performance:** DB indexes added for miracles(saint_id, type, country) + migration applied; homepage carousel capped at 8 saints; search topic queries parallelized with Promise.all and synopsis excerpt moved to Postgres LEFT(); Cache-Control middleware added (saints 1h, miracles 30m, types 24h, search no-store).
- **Bug:** Duplicate "Verified" label on miracle detail page fixed ("Verified On").
- **Refactors:** `formHelpers(form)` factory extracted to form-utils.ts, removing inline helper duplication from all 4 admin forms; carousel replaced with CSS scroll-snap + minimal scrollBy JS; admin dashboard inline styles extracted to scoped classes; seed.ts warning comment added; API docs link added to public footer.

### Admin Panel
Password-protected admin panel at /admin/*. Auth via HMAC-SHA256 session tokens (Web Crypto API, no external deps), validated by Astro middleware. Secrets: ADMIN_PASSWORD and SESSION_SECRET as Cloudflare secrets. Pages: dashboard, saints list/create/edit, miracles list/create/edit. Topics shown as checkboxes from MIRACLE_TOPICS canonical list. .dev.vars has placeholder dev credentials. Production secrets must be set via wrangler secret put. Build clean, 11 tests pass.

### Static Pages Rendering from DB
Five Astro SSR pages query Neon via Drizzle and render real data: homepage (counts), /saints list, /saints/[slug] detail with miracles and related saints, /miracles list, /miracles/[slug] detail with sources. Shared Base.astro layout with minimal serif styling. DB accessed via `createDb(env.DATABASE_URL)` using `cloudflare:workers` env module (Astro v6 pattern). 11 tests pass, build clean.

### Patronage, Noted For, and Miracle Topics
Added `noted_for text[]` to saints and `topics text[]` to miracles (replacing the `subtype` medical-only enum). GIN indexes on `saints.patronage`, `saints.noted_for`, and `miracles.topics` for performant `= ANY()` queries. Canonical topic list in `src/db/topics.ts` as a TypeScript `as const` array for app-layer validation. `/api/v1/search?topic=X` implemented — returns matching saints (patronage OR noted_for) and miracles (topics). vitest.config.ts added with stub DATABASE_URL so API tests don't require a live DB. Build passes, 11 tests pass. Migration pending (`drizzle-kit generate` + `drizzle-kit migrate` — needs TTY).



### Cloudflare Workers Config Fix
Corrected wrangler.jsonc to use `binding: "ASSETS"` and `directory: "./dist/client"` (not the full dist dir). Added `observability` block. Added `deploy` script to package.json using the adapter-generated `dist/server/wrangler.json` which holds the correct post-build `main` path. Updated CLAUDE.md to reflect Workers (not Pages) throughout. Build passes.

### Hono API Layer
Wired up Hono with @hono/zod-openapi as the API layer at /api/v1/*. Defined all Zod schemas for response envelopes, saints, miracles, sources, types, and search. Implemented 6 endpoints with stubbed responses and an OpenAPI doc at /api/v1/doc. Mounted via Astro catch-all route. 11 tests pass, build clean.

### Astro Cloudflare Pages Base
Added Astro SSR with the Cloudflare Pages adapter to the existing project. Configured astro.config.mjs, wrangler.jsonc, updated tsconfig.json to extend astro/tsconfigs/strict, added dev/build/preview scripts, placeholder index page, and .dev.vars gitignore entry. Build and tests pass.

### Drizzle Schema and Neon Setup
Initialized the full TypeScript project and database layer. Defined all 4 tables (saints, saint_relations, miracles, miracle_sources) split per file, 13 Postgres enums, Drizzle config, Neon client, and migration tooling. Migration applied successfully to Neon dev branch.
