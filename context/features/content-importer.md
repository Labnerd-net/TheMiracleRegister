# Plan: Content Importer

Spec: `context/specs/content-importer.md` · Branch: `claude/feature/content-importer` (already created)

## Context
Saint and miracle records are written straight into production Neon with ad hoc SQL. The spec makes `catholic-research/TheMiracleRegister/Content/*.json` the source of truth and adds `npm run import:content` (dry run by default, `--apply` to write, one transaction, never publishes, never deletes saints or miracles) and `npm run export:content` (one-off backfill). CI in `catholic-research` and the CLAUDE.md updates are out of scope.

## Findings from the code that change or sharpen the spec

1. **The app's Neon driver cannot do transactions.** `drizzle-orm/neon-http` throws on `db.transaction()` (this already bit the admin panel, backlog #10). `db.batch()` is atomic but cannot read back IDs or run `runChecks` mid-way. So the importer must not use `src/db`'s `createDb`. Decision: use `drizzle-orm/neon-serverless` (`Pool` over WebSocket, `ws` set via `neonConfig.webSocketConstructor`) in the scripts only. `@neondatabase/serverless` is already installed; `ws` is present transitively and becomes an explicit devDependency (plus `@types/ws`). The core takes any Drizzle Postgres db, so tests use PGlite (which supports transactions) and the CLI uses the pool. **Unverified:** that a transaction works through the Neon endpoint in `.env`; step 1 proves it with `BEGIN; ROLLBACK` before anything else is built.
2. **The schema has columns the spec's tables omit:** `miracles.location_2_name/lat/lng`, `saints.feast_scope`, `saints.feast_scope_detail`. The file schema must cover every column except `id`, `published`, `created_at`, `updated_at` (and the FK columns of child rows). A test asserts this against `getTableColumns()` so a future migration that adds a column fails the suite until the file schema is updated.
3. **`saint_relations` is stored in both directions** (PK is `saint_id, related_saint_id, relation_type`; `check:data` requires mirrored rows). Decision: the file schema allows a relation only if the other saint's file lists the reverse (load-time error otherwise), and the importer writes both rows. Relations to DB-only saints get both rows written too.
4. **`updated_at` is a BEFORE UPDATE trigger that fires on every UPDATE**, even a no-op. The importer must therefore diff first and only issue UPDATE for rows that actually changed, or every run bumps every row and churns sitemap `lastmod`. Child-only changes do not touch the parent row, so when children changed, the importer issues an explicit `updated_at = now()` on the parent.
5. **Slug redirects are already one hop** (trigger `record_slug_redirect` collapses chains), so the spec's open question is answered: export `previous_slugs` = all `old_slug` where `new_slug` = current slug, no chain handling. The importer inserts missing `(entity_type, old_slug, current)` rows. If a row exists for that `old_slug` pointing somewhere else, that is a validation error, never an overwrite. A previous slug equal to the file's own slug or to any other entity's current slug is also an error.
6. **`numeric` columns return padded strings** (`numeric(10,7)` gives `"45.1234500"`). A hand-written `45.12345` would diff forever. The file schema accepts a number or string and canonicalizes by string padding to the column scale (7 for miracle coordinates, 6 for `saint_locations`), rejecting extra digits. No float arithmetic.
7. **`runChecks` is database-wide, not per-record.** A pre-existing error elsewhere (an earlier run showed #49 failing) would block every import. Mitigation: run `runChecks` once before writing (baseline) and again before commit; roll back only on errors not in the baseline, and print the baseline errors. This is a deliberate narrowing of "errors roll back" in the spec; confirm.
8. **Acceptance criterion wording:** "no row is ever deleted" contradicts replace-wholesale of child rows. Restated as: no `saints`, `miracles` or `slug_redirects` row is ever deleted, and `published` is never set to true. Tests assert exactly that.
9. **The "unknown theme" rollback test cannot reach `runChecks`**, because the Zod schema rejects it first. Use a rule only `runChecks` enforces: an em dash in `synopsis`.
10. **Export cannot bootstrap into an empty directory** if it must satisfy the loader's "zero entity files" hard fail. Export requires `.content-root` to exist (created by hand once: `touch .../Content/.content-root`), creates `saints/` and `miracles/` if missing, and does not run the zero-file check.

## Approach

### 1. Driver spike (no commit)
Run a throwaway script that opens a `neon-serverless` Pool against `DATABASE_URL`, runs `BEGIN; SELECT 1; ROLLBACK`, and exits. If it fails, stop and report (fallback: `pg` over TCP). Then add `ws` and `@types/ws` as devDependencies.

### 2. File schema: `scripts/content-schema.ts`
- Zod 4 strict objects. Enums from the Drizzle `pgEnum(...).enumValues`; arrays checked against `MIRACLE_TOPICS`, `SAINT_THEMES`; patronage against sentence-case and `PATRONAGE_GROUPS` aliases the same way `check:data` does (reuse `patronageKey`/`patronageSlug` from `src/lib/patronage.ts`; do not copy the rules).
- Shared pieces: `slug` (same regex as `check-data-core.ts`), `isoDate` (`YYYY-MM-DD`, real calendar date, kept as a string), `scaledDecimal(scale)`, `source` and `image` and `location` row schemas.
- `saintFile` and `miracleFile` with nested `sources[]`, `locations[]`, `relations[{ saint, type }]`, `images[]`, `saints[]` (slugs), `previous_slugs[]`. No `published`, `id`, timestamps.
- Omitted optional key means NULL. `[]` and omitted are distinct for the nullable `text[]` columns (`topics`, `themes`, `patronage`), so round-trip is exact.
- Exports `type SaintFile`, `type MiracleFile`.

### 3. Loader: `scripts/content-load.ts`
- `resolveContentDir({ flag, env, defaultPath })` returns `{ path, source }` in the spec's order (flag, `CONTENT_DIR`, default `../catholic-research/TheMiracleRegister/Content` relative to the repo root).
- `loadContent(dir)`: hard-fail (typed error carrying path, source, order, clone command `git clone https://github.com/Labnerd-net/catholic-research`) when the directory is missing, `.content-root` is absent or no entity files exist. Reads `saints/*.json` and `miracles/*.json`, requires file name = `slug`, parses with the schema, collects all errors before failing (not first-error).
- Cross-file checks: duplicate slugs, relation symmetry among file saints, relation to a saint in neither files nor DB, miracle `saints[]` likewise, `previous_slugs` rules from finding 5. Checks that need the DB (slug exists there) run in the importer; the loader takes a `dbSaintSlugs` set supplied later so the loader itself opens no connection.
- `contentGit(dir)`: HEAD short sha, dirty flag, and whether HEAD is an ancestor of `origin/main` via `git -C`. Best-effort `git fetch origin main` first; a failed fetch is a warning. Whether "dirty" covers the whole repo (spec) or just `Content/`: **recommend `Content/` only**, since research notes in the same repo change constantly and would block every apply. Confirm.

### 4. Importer core: `scripts/import-content-core.ts`
`runImport(db, content, opts)` where `db` is any Drizzle Postgres database (`PgDatabase`), `opts = { apply, updatePublished }`. Returns a structured report; printing lives in the CLI.
1. Read existing saints, miracles and children into normalized form (same normalizer as the file side: padded decimals, dates as strings, arrays as-is, NULL for omitted). Build slug to id/published maps, and the redirect set.
2. Classify each file: `new`, `unchanged`, `changed` (field-level old to new, plus child-list diffs), `refused` (changed + published + no `--update-published`, naming the flag). Also list `unmanaged` (DB slugs with no file) and "columns the file omits but the DB holds non-null" per entity.
3. Dry run stops here.
4. Apply, inside `db.transaction`:
   - baseline `runChecks`;
   - saints in file order (insert with `published: false`, or update changed fields only, never the `published` key), then miracles; child rows deleted and re-inserted in file order (so ids ascend in file order, which the exporter reproduces); relations both directions; `miracle_saints` resolved from slugs after saint upserts; missing `slug_redirects` inserted; explicit `updated_at = now()` on parents whose children changed;
   - any `refused` entry aborts the whole apply (spec says refuse; partial application would defeat the single-commit guarantee). Confirm: refusal blocks the run rather than skipping that file;
   - `runChecks` through an adapter over `tx.execute(sql.raw(...))` (the existing PGlite test adapter shows the shape: `runChecks` queries take no parameters); new errors vs baseline throw and roll back; warnings returned.
5. Write payloads are typed as `Omit<..., "id" | "published" | "created_at" | "updated_at">` for update, so `published: true` cannot be expressed, and the insert path sets `published: false` literally.

### 5. CLIs
- `scripts/import-content.ts` (`npm run import:content`): order is parse args, resolve and load content (no DB yet), print dir + source + git sha + file count, then require `DATABASE_URL`, print `describeTarget`, run. `--apply` guards: git checks unless `--allow-dirty`; confirmation prompt unless `--yes`; non-TTY without `--yes` exits 2 (same shape as `db-migrate.ts`; small helper in `scripts/confirm.ts`, `db-migrate.ts` left untouched). Flags: `--content-dir`, `--apply`, `--update-published`, `--allow-dirty`, `--yes`. Exit 1 on validation/refusal/check failure.
- `scripts/export-content.ts` (`npm run export:content`): read-only, writes via the same schema (`schema.parse` on the way out, so an unrepresentable row fails loudly, which answers the "do the 63 images and sources fit the strict schema" open question). Fixed key order, 2-space JSON, trailing newline, children ordered by id (images by `display_order, id`, relations and `saints[]` by slug). Refuses to overwrite without `--force`; skips and reports the files it did not write. Core is `exportContent(db)` returning `{ path, json }[]` so it tests on PGlite.
- `package.json`: add `import:content` and `export:content` scripts.

### 6. Tests (PGlite, per-file DB, no network)
Reuse `createTestDb`/`setupDb` and `tests/helpers/fixtures.ts`.
- `content-schema.test.ts`: every non-excluded Drizzle column is covered (`getTableColumns`); unknown key rejected; `published` rejected; decimal canonicalization and over-scale rejection; invalid date; `[]` vs omitted.
- `content-load.test.ts` (temp dirs): missing dir, missing marker, zero files each fail with path + source + clone command; resolution order flag > env > default; file name vs slug mismatch; duplicate slug; asymmetric relation; unknown saint reference; bad `previous_slugs`; no DB import in the module (loader takes plain data).
- `import-content.test.ts`: dry run writes nothing (row counts and `updated_at` identical) and reports new/changed/unchanged/unmanaged and omitted-column nulling; apply inserts unpublished saint + miracle and `runChecks` clean; update of unpublished row replaces children; published row refused, applied with `--update-published` with `published` unchanged; `updated_at` advances on a changed row and does not on an unchanged one; child-only change bumps the parent; relations written in both directions; redirects inserted, conflicting redirect rejected; rollback leaves the DB unchanged (em dash synopsis); baseline error does not block an unrelated import but a new error does; invariants: `published` never true after any import, `saints`/`miracles`/`slug_redirects` counts never decrease.
- `export-content.test.ts`: export then dry-run import reports zero changes over the seeded fixtures (including published, unpublished, relations, images, redirects, padded decimals, `[]` vs null arrays); refuses to overwrite without `--force`; deterministic output (export twice, identical bytes).
- `import-cli.test.ts` (one spawn test): bad content dir exits non-zero before `DATABASE_URL` is consulted (run with it unset and assert the message is the content error, not the env error).
- Fixtures may need a saint with locations, a miracle with two locations and images, and a redirect row; update `tests/helpers/fixtures.ts` additively.

### 7. Docs and workflow
- Spec stays as is except the corrected acceptance wording (finding 8) and the answered open questions (redirect chains, `created_at`, strict-schema fit after the export step).
- `context/current-feature.md`: set plan file path to `context/features/content-importer.md` (this change).
- Not in this feature: CLAUDE.md updates in either repo, `catholic-research` CI, vendoring the schema. Add a one-line note to the history entry at completion listing them as follow-ups.

## Files
- New: `scripts/{content-schema,content-load,import-content-core,import-content,export-content,confirm}.ts`, `tests/{content-schema,content-load,import-content,export-content,import-cli}.test.ts`.
- Modified: `package.json`, `package-lock.json`, `tests/helpers/fixtures.ts` (additive), `context/specs/content-importer.md`, `context/current-feature.md`.
- No `src/` changes. No migrations.

## Reuse
- `describeTarget` (`scripts/db-target.ts`), `runChecks` and its `Sql` type (`scripts/check-data-core.ts`), `patronageKey`/`patronageSlug` (`src/lib/patronage.ts`), `MIRACLE_TOPICS`/`SAINT_THEMES`/`PATRONAGE_GROUPS` (`src/db/topics.ts`), enums (`src/db/schema/enums.ts`), `createTestDb`/`setupDb`, the confirmation-prompt pattern in `db-migrate.ts`.

## Risks
- Transaction support through the Neon endpoint is unverified until step 1. If the pooled endpoint misbehaves with `BEGIN`, switch to the direct endpoint or `pg`.
- PGlite and Neon differ in result shape for `execute`; the `runChecks` adapter is exercised only on PGlite in CI. First real run is a dry run against production, then `--apply` of one record.
- Replace-wholesale resets child ids. Confirmed from the schema that nothing references `miracle_images`, `miracle_sources`, `saint_sources` or `saint_locations` ids; only `saint_relations` and `miracle_saints` use composite keys with no serial id.
- A published saint's mirrored relation row changes when an unpublished saint's file edits a relation to it. Rule: such an edit counts as a change to both saints, so it is refused if either is published without `--update-published`.
- Strict-schema fit of existing data is unknown until the export runs; expect to adjust the schema (not the data) for oddities, then re-run.

## Verification
1. `npm run lint`, `npm run typecheck` (CI-style `.dev.vars` placeholder), `npm test`, `npm run build`.
2. Mutation checks: add `published: true` to an update payload, remove the baseline diff, skip the updated-at diff guard; each must fail a test.
3. Against production, read-only: `npm run export:content` into a scratch directory, then `npm run import:content -- --content-dir <scratch>` (dry run) shows zero changes.
4. Against production, write: one new unpublished record via `--apply`, then `npm run check:data` and a `?preview=` page load. Report separately what was and was not run.
