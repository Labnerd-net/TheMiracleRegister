# Spec for Drizzle Schema and Neon Setup

Title: Drizzle Schema and Neon Setup
Branch: claude/feature/drizzle-schema-neon-setup
Spec file: context/specs/drizzle-schema-neon-setup.md

## Summary

Initialize the full database layer for TheMiraclesRegister. This includes installing and configuring Drizzle ORM with the Neon serverless Postgres driver, defining all schema tables as specified in CLAUDE.md, and setting up migration tooling. The Neon project will use separate dev and prod branches to prevent schema accidents. No application code is written in this step — only the database foundation.

## Functional Requirements

- Initialize a Node.js / TypeScript project with `package.json` and `tsconfig.json`
- Install `drizzle-orm`, `drizzle-kit`, and `@neondatabase/serverless`
- Define Drizzle schema for all four tables: `saints`, `saint_relations`, `miracles`, `miracle_sources`
- All enums defined in CLAUDE.md must be implemented as Postgres enums via Drizzle
- `updated_at` columns must auto-update on row modification
- Schema file(s) must be in `src/db/schema.ts` (or split by table under `src/db/schema/`)
- Drizzle config (`drizzle.config.ts`) must point to the dev Neon branch connection string
- `.env.example` must document required environment variables (`DATABASE_URL`)
- `.gitignore` must exclude `.env` and `node_modules`
- `package.json` scripts: `db:generate` (generate migrations), `db:migrate` (run migrations), `db:studio` (Drizzle Studio)
- Migrations output to `drizzle/` directory

## Possible Edge Cases

- Neon dev branch URL must never be committed — only `.env.example` with a placeholder
- `saint_relations` is a self-referential many-to-many on the `saints` table — both FKs point to `saints.id`
- `canonization_stage` is mutable (saints can be promoted), so it must not be treated as static
- `subtype` enum is only meaningful when `miracle_category` is `healing` — this is a data-layer concern, not enforced by the schema, but worth noting
- `date_of_event` and several other columns are nullable — nullable vs optional must be explicit in Drizzle column definitions
- Drizzle Kit requires `DATABASE_URL` at migration time; document this clearly

## Acceptance Criteria

- All four tables exist in the schema with correct column types, nullability, and foreign keys
- All enums from CLAUDE.md are defined and used
- `db:generate` produces a valid migration file with no errors
- `db:migrate` applies the migration to the Neon dev branch successfully
- No secrets committed to the repo

## Open Questions

- Should the schema be a single `schema.ts` file or split per table? (Recommend split for maintainability as the project grows)
- Do we seed any data in this step, or defer that to a later feature?

## Testing Guidelines

No unit tests for raw schema definitions — correctness is validated by a successful `db:migrate` against the real Neon dev branch. Add a smoke test that imports the schema and confirms all table exports are defined objects (guards against accidental undefined exports).

- Test file: `tests/schema.test.ts`
- Assert each table export (`saints`, `saintRelations`, `miracles`, `miracleSources`) is a non-null object

## Personal Opinion

This is the right first step and the scope is well-contained. The data model in CLAUDE.md is thorough enough to implement directly without ambiguity. The only mild concern is the number of enums — there are ~15 across the two main tables. Drizzle handles this fine, but the migration file will be large. Not a problem, just something to expect. Splitting the schema by table is worth doing now rather than refactoring later.
