# Missing Foreign-Key Indexes (backlog #17)

Branch: `claude/feature/missing-indexes`

## Problem
Child tables have no index on the column pages join or filter by, so those lookups and the cascade deletes from `saints`/`miracles` are sequential scans. `miracle_saints` has only the `(miracle_id, saint_id)` PK, which cannot serve `WHERE saint_id = ?`.

## Honest scope note
Production tables are tiny (largest is `miracle_sources`, 219 rows), so Postgres will keep choosing sequential scans and there is no measurable speedup today. This is future-proofing for the lookups the code already makes.

## Scope (migration 0033, additive only)
- `miracle_saints (saint_id)`: saint page, `saint_id` filter on miracles list/API
- `miracle_sources (miracle_id)`: miracle page
- `miracle_images (miracle_id, display_order)`: miracle page and API fetch images ordered by `display_order`
- `saint_sources (saint_id)`: saint page
- `saint_locations (saint_id)`: saint page, map

## Deliberately not added (differs from the backlog text)
- `saint_relations (saint_id)`: the PK already leads with `saint_id`. `related_saint_id` is never filtered on.
- `published` on saints/miracles (partial or not): boolean, low selectivity, no query benefits at this size.
- `miracles.date_of_event`: the year filters use `EXTRACT(YEAR FROM date_of_event)`, which a plain btree cannot serve; it would need an expression index. Revisit if the table grows.

## Verification
Typecheck, build, tests (PGlite applies the real migrations). After `npm run db:migrate` on production: confirm the five indexes in `pg_indexes`, then `npm run check:data`.
