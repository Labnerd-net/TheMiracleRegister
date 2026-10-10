# Spec for Content Importer

Title: Content Importer
Branch: claude/feature/content-importer
Spec file: context/specs/content-importer.md

## Summary
Saint and miracle records are currently written straight into the production Neon DB with ad hoc SQL or Drizzle code, with `check:data` run afterward. Nothing enforces `published: false`, nothing can be reviewed as a diff, a failed write is not rolled back, and the DB is the only copy of the content. This feature makes the `catholic-research` repo the source of truth: one JSON file per saint and per miracle under `TheMiracleRegister/Content/`, reviewed by pull request there. An importer in this repo (`npm run import:content`) reads those files, validates them, and upserts them into the DB in a single transaction, as a dry run unless `--apply` is passed. The DB becomes a one-way projection of the files. The importer never sets `published: true` and never deletes. Flipping `published` stays a separate human step after the `?preview=` review.

This spec covers the importer, the content-file schema, and the backfill export of existing published rows. It does not cover the CI check in `catholic-research` or the CLAUDE.md updates in either repo, which follow as separate steps.

## Functional Requirements

### Content files (live in `catholic-research`, `TheMiracleRegister/Content/`)
- `Content/saints/<slug>.json` and `Content/miracles/<slug>.json`, one entity per file. The file name must equal the `slug` field.
- A marker file `Content/.content-root` identifies a valid content directory.
- A saint file nests its child rows: `sources[]`, `locations[]`, and `relations[]` (related saint and relation type, by slug).
- A miracle file nests `sources[]`, `images[]`, and `saints[]` (saint slugs).
- Files do not contain `published`, `id`, `created_at` or `updated_at`.
- Slug history is part of the files: an optional `previous_slugs[]` on each saint and miracle maps to `slug_redirects` rows (entity type, old slug, new slug = the file's slug). The importer inserts missing redirects for the entity and never deletes any. A previous slug that equals another entity's current slug is a validation error.

### Content schema (`scripts/content-schema.ts`)
- Zod schemas built from the existing Drizzle pgEnums, `MIRACLE_TOPICS`, `SAINT_THEMES` and `PATRONAGE_GROUPS`, so the file format cannot drift from the DB schema.
- Strict objects: unknown keys are an error.
- Cross-file checks at load time: duplicate slugs, a miracle referencing a saint slug that exists in neither the files nor the DB, a relation to an unknown saint.

### Content directory resolution
- Resolved in this order, and the source is reported: the `--content-dir <path>` flag, then the `CONTENT_DIR` env var (from the git-ignored `.env`), then the default `../catholic-research/TheMiracleRegister/Content`.
- Hard fail (non-zero exit) when the directory does not exist, lacks `.content-root`, or contains zero entity files. The error prints the path tried, which source supplied it, the order the sources are checked, and the `git clone` command for `Labnerd-net/catholic-research`.
- All files are read and validated before a DB connection is opened.

### Import behaviour
- Default is dry run. `--apply` is required to write.
- Before anything else the run prints the resolved content directory, its source, the content repo's current git commit, and the file count.
- `--apply` refuses to run if the content directory (`Content/`) has uncommitted changes or its HEAD is not contained in `origin/main`. `--allow-dirty` overrides both checks.
- One transaction per run. Any validation error, DB error, or `runChecks` error rolls the whole run back.
- New slug: insert with `published: false`.
- Existing slug, unpublished row: update it, and replace its child rows wholesale.
- Existing slug, published row: refuse, unless `--update-published` is passed. With the flag, update fields and replace child rows, leaving `published` unchanged.
- Never sets `published: true`. Never deletes a saint or miracle. A slug in the DB with no file is reported as "unmanaged" and left alone.
- A file whose slug differs from the DB row's slug for the same entity is not possible (slug is the key); a rename must go through `slug_redirects` by hand, and the importer reports a DB-only slug that looks like a rename candidate only as "unmanaged".
- After the writes and before commit, `runChecks` runs inside the transaction. Errors roll back; warnings are printed.
- The dry run prints a per-entity diff: new, changed fields (old to new), unchanged, refused, unmanaged. It also reports DB columns holding a non-null value that the file omits, since `--apply` would null them.
- Uses Drizzle, not raw SQL, so `updated_at` is maintained by `$onUpdate`.
- Prints the target host and database through `describeTarget`, and under `--apply` asks for confirmation unless `--yes` is passed, matching `db:migrate`. Non-interactive `--apply` without `--yes` is refused.

### Backfill export (`npm run export:content`)
- Read-only. Writes one file per existing saint and miracle, published and unpublished, into the resolved content directory, in the same format the importer reads.
- Refuses to overwrite an existing file unless `--force` is passed.
- Used once to seed `catholic-research`. Afterwards a round-trip test (export, then dry-run import) must show zero changes.

## Possible Edge Cases
- Postgres arrays (`patronage`, `themes`, `topics`) and `numeric` columns (lat and lng) must round-trip as exact values, with no float formatting drift.
- `date` columns: dates are plain `YYYY-MM-DD` strings, not JS Dates, to avoid timezone shifts.
- Child rows have serial IDs and no natural key, so replace-wholesale changes their IDs. Nothing else references them, which must be confirmed against the schema before relying on it.
- `miracle_saints` and `saint_relations` reference rows by ID; the importer resolves them from slugs inside the transaction, in dependency order (saints before miracles).
- `saint_relations` is directional by row; whether the importer should write the inverse row for pairs must match how existing data is stored.
- Two files referencing each other's saints must resolve within the same run.
- A file edited while published: refused by default, with a message naming `--update-published`.
- Windows/CRLF line endings and a trailing newline must not produce spurious diffs.
- An unreachable or wrong `DATABASE_URL` fails before any write.
- A stale `CONTENT_DIR` in `.env` pointing at an old checkout: the printed source and git commit make this visible.

## Acceptance Criteria
- A missing, empty, or marker-less content directory exits non-zero with the path, its source, and the clone command, and opens no DB connection.
- A dry run against prod writes nothing and prints a diff.
- `--apply` inserts a new file's saint and miracle as unpublished, then `check:data` passes.
- A deliberate `runChecks` failure (for example an unknown theme) leaves the DB unchanged.
- A file for a published row is refused without `--update-published`, and applied with it, with `published` unchanged.
- `published` is never set to `true` by any code path, and no `saints`, `miracles` or `slug_redirects` row is ever deleted (child rows are replaced wholesale). Both are covered by tests.
- `updated_at` changes on an updated row.
- Export followed by a dry-run import over the same DB reports zero changes.
- Unit tests run on PGlite like the rest of the suite, with no network and no Neon access.
- `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass.

## Open Questions
- Decided 2026-10-09: `slug_redirects` are represented as `previous_slugs[]` in the files (see Content files). Answered: the rename trigger keeps chains to one hop, so the export lists every `old_slug` whose `new_slug` is the current slug.
- Where should the Zod schema be consumed from for the CI check in `catholic-research`: fetched from this repo, or vendored? Deferred to the CI step.
- Decided: the importer does not manage `created_at`; the export omits it and imported rows keep their DB values.
- Do the 63 published images and the sources include any data that cannot be represented under the strict schema? Answered 2026-10-09: all 32 saints and 90 miracles in production export under the strict schema and round-trip with zero changes.
