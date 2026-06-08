# Spec for Miracle Saints Junction Table

Title: Miracle Saints Junction Table
Branch: claude/feature/miracle-saints-junction-table
Spec file: context/specs/miracle-saints-junction-table.md

## Summary

The `miracles` table currently holds a single `saint_id` FK, which assumes every miracle belongs to exactly one saint. Louis and Zelie Martin were canonized as a couple; both of their Vatican-recognized miracles (Pietro Schiliro, Carmen of Valencia) were attributed to their *joint* intercession — not to either saint individually. Splitting them into separate saint records while keeping a single `saint_id` on miracles would require duplicating both miracle records, which misrepresents the theological and historical reality and breaks filtering (a search by either saint would return the same miracle twice).

This feature replaces `saint_id` on `miracles` with a `miracle_saints` many-to-many junction table, enabling a single miracle record to be linked to one or more saints. The seed data for Louis and Zelie is updated accordingly. All API endpoints and admin UI that currently use `saint_id` are updated to join through the new table.

## Functional Requirements

- Add a `miracle_saints` junction table with columns `miracle_id` (FK → miracles) and `saint_id` (FK → saints), with a composite primary key.
- Remove `saint_id` from the `miracles` table.
- Generate and apply a Drizzle migration for these schema changes.
- Update the seed script (`src/db/seed.ts`) so that each miracle record links to one or more saints via `miracle_saints` inserts.
- Update the Drizzle queries in all API routes and Astro pages that previously filtered or joined on `miracles.saint_id` to use the junction table instead.
- Update the admin miracle form so that a miracle can be associated with one or more saints (the current single `saint_id` dropdown must become a multi-select or equivalent).
- The admin miracle list and the public saint detail page (`/saints/[slug]`) must continue to show the correct miracles for each saint after the change.
- The `GET /api/v1/saints/:slug` endpoint must continue to return associated miracles in its response.
- The `GET /api/v1/miracles` list endpoint must continue to support filtering by `saint_id` (a miracle is included if any of its linked saints matches).
- Louis and Zelie's two miracles must be linked to both saints in the seed data.

## Possible Edge Cases

- A miracle linked to zero saints — the junction table allows this; queries that filter by saint will simply omit orphaned miracles, which is acceptable.
- The admin form currently uses `saint_id` as a required field in form validation (`MiracleFormSchema`). With a multi-saint model, at least one saint must be selected — validation must be updated to enforce this.
- Cascade deletes: deleting a saint should remove their rows from `miracle_saints` but not delete the miracle itself (the miracle may still belong to another saint). Deleting a miracle should cascade-delete its `miracle_saints` rows.
- The existing `MiracleFormSchema` Zod validation and admin POST handler reference `saint_id` directly and will need updating.
- OpenAPI/Zod response schemas for miracles currently expose `saint_id`; these must be updated to expose a `saint_ids` array or a `saints` array of objects.

## Acceptance Criteria

- The `miracles` table has no `saint_id` column after migration.
- The `miracle_saints` table exists with `miracle_id` + `saint_id` composite PK and appropriate FK constraints.
- The seed runs cleanly (`npm run db:seed`) and links Louis and Zelie's two miracles to both saints.
- `/saints/louis-martin` and `/saints/zelie-martin` both show the two shared miracles (once each, not duplicated).
- `/api/v1/saints/louis-martin` and `/api/v1/saints/zelie-martin` both return the two miracles in their response.
- `/api/v1/miracles?saint_id=<id>` returns correct results for both Louis and Zelie.
- A miracle with multiple saints shows all linked saint names on the public miracle detail page.
- Admin miracle edit page allows selecting multiple saints; existing single-saint miracles continue to work.
- `npm run build` passes with no TypeScript errors.

## Open Questions

- Should the API response for a miracle expose the linked saints as a flat `saint_ids` array, or as an array of `{ id, slug, name }` objects? The latter is more useful to API consumers but requires a join.
- Should the admin multi-saint selector be a multi-select `<select multiple>` (simple, no JS) or a checkbox list (more legible for long lists)? Given the current saint count (~11), either works.
- Does the public miracle detail page need to list all linked saints as links, or just the primary one? For Louis & Zelie specifically, naming both is correct — this should be the default behavior.

## Testing Guidelines

Tests should cover the API layer since that is where the junction query logic lives. No heavy test suite needed:

- `GET /api/v1/saints/:slug` — verify miracles array is present when miracles exist for that saint.
- `GET /api/v1/miracles?saint_id=X` — verify filtering works; a miracle linked to multiple saints appears when filtering by any of them.
- `GET /api/v1/miracles/:slug` — verify the response includes a `saints` array (or equivalent) with the linked saint(s).

## Personal Opinion

This is the right call and the right time to do it. The single `saint_id` FK was always a simplification — the Louis & Zelie case makes the gap concrete. Doing it now with ~11 saints in the seed is far less painful than retrofitting it once more data is in. The migration is irreversible (dropping a column), so it's better to get it right once.

The main complexity is the admin form: a multi-saint selector is a bit more work than a single dropdown, but it's straightforward. The API schema change (exposing `saints` instead of `saint_id`) is the right design and worth the effort.

The only real risk is the migration on the production Neon branch — `saint_id` is `NOT NULL` today, so the migration must add the junction table rows before dropping the column (or the drop will silently orphan existing data if done in the wrong order). The seed handles this for dev; production will need careful ordering.
