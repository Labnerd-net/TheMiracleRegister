# Plan: Isolated Test Database (backlog #22)

Spec: `context/specs/isolated-test-database.md` · Branch: `claude/feature/isolated-test-database`

## Context
API tests load the real `DATABASE_URL`, which is the production Neon branch, and mostly assert status codes and envelope shape. Filters, unpublished-record non-leakage, privacy redaction, the 429 path, cache headers and search are untested, and fork PRs fail CI because they get no secrets.

Decided: run tests against an in-process Postgres (PGlite) with the real Drizzle migrations, one fresh database per test file, swapped in with `vi.mock("../src/db")`. A feasibility experiment already confirmed this works: all 31 migrations apply in about 2s (triggers and GIN indexes included), every query operator the API uses behaves correctly, and no production code change is needed. The experiment file is kept at `/tmp/claude-1000/-home-bladner-git-TheMiracleRegister/e9500d42-8796-4566-8b31-247a66e76b9e/scratchpad/pglite-experiment.test.ts` as a starting point.

## Approach

### 1. Dependency and config
- `npm i -D @electric-sql/pglite` (a plain devDependency; `drizzle-orm/pglite` already ships with `drizzle-orm`).
- `vitest.config.ts`: stop using the `.env` `DATABASE_URL`. Always set `DATABASE_URL` to an obviously fake value (`postgresql://test:test@invalid.invalid/test`), and set `hookTimeout` to 30s for the migration step. Remove the `loadEnv` use.

### 2. Test helpers (new, under `tests/helpers/`)
- `testDb.ts`: `createTestDb()` creates a `PGlite`, wraps it with `drizzle(pg, { schema })`, runs `migrate` from `drizzle/`, and returns the db. Also exports a `setupDb()` that registers `beforeAll`/`afterAll` and returns a getter, so each test file creates and closes its own database.
- `fixtures.ts`: `seed(db)` inserts the fixed dataset and returns ids. All names are clearly fictional.
  - Saints: two published (different `canonization_stage`, `religious_order`, `nationality`, `themes`, `patronage`), one unpublished.
  - Miracles: published ones covering different `type`, `miracle_category`, `country`, `topics`, `approval_authority`, `date_of_event` (fixed absolute dates), `used_for_*` flags and all three privacy levels (`public`, `first_name_only`, `confidential`), plus one unpublished miracle linked to a published saint and one published miracle linked only to an unpublished saint.
  - Junction rows (`miracle_saints`), `saint_relations` (both directions), `miracle_sources`, `miracle_images`.
- `apiApp.ts`: a small helper that imports the Hono app and returns `req(path, { ip? })`. It uses an in-memory KV stub with a controllable store and passes a unique `CF-Connecting-IP` per test so the rate limiter never leaks between tests.
- Each test file declares `vi.mock("../src/db", ...)` itself, because `vi.mock` hoisting needs it per file. Use `vi.hoisted` to hold the db reference (pattern proven in the experiment).

### 3. Tests (replace and extend; keep `markdown.test.ts` and `schema.test.ts`)
Rewrite `tests/api.test.ts` into focused files, preserving the existing assertions (envelope shape, 404s, `/types`, `/doc`):
- `api-miracles.test.ts`: list returns published only; each filter (`saint_id`, `type`, `topic`, `category`, `country` partial and case-insensitive, `year_from`/`year_to`, `used_for_*`, `approval_authority`); combined filters; pagination (`page`, `limit`, `total`, out-of-range page returns empty `data`); invalid params (`limit=101`, unknown `type`) return 400; detail returns saints, sources and images; unpublished slug returns 404; a miracle whose only saint is unpublished does not expose that saint.
- `api-saints.test.ts`: list filters (`canonization_stage`, `theme`, `religious_order`, `nationality`), ordering by name, pagination; detail includes linked published miracles and related saints; unpublished saint returns 404; unpublished miracles are absent from saint detail.
- `api-privacy.test.ts`: `recipient_name` is `null` for confidential, first token for first-name-only, full for public, on the miracle list, miracle detail and saint-detail miracles. Redaction applies to the `recipient_name` field only; free-text is covered by `npm run check:data`.
- `api-search.test.ts`: `q` matches saint name and biography and miracle title, synopsis, diagnosis and cure details, case-insensitively; excerpt is truncated; `topic` matches saints (themes/patronage) and miracles (topics); no results; neither `q` nor `topic` returns the "Provide q or topic" envelope; `q` under 2 chars returns 400; unpublished records excluded; pagination of results.
- `api-http.test.ts`: cache headers per route group (`saints` 3600, `miracles` 1800, `types` and `metadata` 86400 with `stale-while-revalidate=60`, `search` `no-store`); the 61st request from one IP returns 429 with `{ data: null, meta: null, error: "Too many requests" }` while a different IP is unaffected; CORS header present; `/metadata` and `/types` shape.
- `db-guard.test.ts`: fails loudly if `DATABASE_URL` is not the fake test value, and checks the DB created by `createTestDb()` is in-process (not a Neon host).
- Typing: use the loose `Body` JSON helper from the CI work. `tsc --noEmit` and `astro check` must stay at 0 errors (tests are in the tsconfig include).

### 4. CI and docs
- `.github/workflows/ci.yml`: remove `DATABASE_URL` from the Test step and delete its comment. Keep the placeholder `.dev.vars` step (still needed for types).
- Remove the `DATABASE_URL` repo secret from GitHub (manual, flagged to the user at the end).
- `CLAUDE.md`: update the CI/CD section (tests no longer read production; fork PRs now pass; remove the "fails on fork PRs" note) and mention `tests/helpers/` and the PGlite approach under Testing.
- `context/backlog.md`: mark #22 done (header line, remove the entry).
- `context/current-feature.md`: set the plan file path now; history entry at completion.

## Files
- New: `tests/helpers/{testDb,fixtures,apiApp}.ts`, `tests/api-{miracles,saints,privacy,search,http}.test.ts`, `tests/db-guard.test.ts`.
- Modified: `package.json`, `package-lock.json`, `vitest.config.ts`, `tests/api.test.ts` (replaced), `.github/workflows/ci.yml`, `CLAUDE.md`, `context/backlog.md`, `context/current-feature.md`.
- No `src/` changes expected. Optional (not planned): an injectable `createDb` factory, tracked under backlog #36.

## Reuse
- `redactRecipient` (`src/lib/privacy.ts`) behavior is the spec for the privacy tests.
- `searchContent` (`src/lib/search.ts`) is exercised through `/api/v1/search`.
- Existing `Body`/`json` helper and KV stub pattern from `tests/api.test.ts`.
- Enum values from `src/db/schema/enums.ts` and topic lists from `src/db/topics.ts` so fixtures cannot drift from valid values.

## Risks
- Per-file migration cost: about 2s each across about 6 files, run in parallel workers, so total added time is a few seconds.
- Fixtures must satisfy every NOT NULL column (`recipient_privacy`, `cure_characteristics`, `intercessory_medium` and others), which the experiment already surfaced.
- Test DB driver is PGlite, not Neon HTTP: connection-level behavior is untested. Accepted; documented in the spec.
- Fake `DATABASE_URL` in vitest config means any code path that bypasses the mock fails fast, which is the intended safety net.

## Verification
1. `npm test` on a clean checkout with `.env` and `.dev.vars` moved aside and no network: all pass.
2. Run with `DATABASE_URL` set to an invalid host: still passes.
3. Mutation checks, each reverted afterward: remove the `published` filter from one route, break `redactRecipient`, change a cache max-age, and break a filter. Each must make at least one test fail.
4. `npm run typecheck`, `npx tsc --noEmit` and `npm run build`: 0 errors.
5. Open a PR from the branch: `check` passes with no `DATABASE_URL` in the workflow. Fork-PR behavior is confirmed by the workflow no longer referencing any secret.
6. Confirm the user removes the `DATABASE_URL` repo secret after merge.
