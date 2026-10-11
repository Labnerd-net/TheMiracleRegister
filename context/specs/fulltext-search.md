# Full-Text Search (backlog #55, #13)

Branch: `claude/feature/fulltext-search`

## Problem
- #55: search is `ILIKE '%q%'` over saint name/biography and miracle title/synopsis/diagnosis/cure details. Sequential scan on every search, unranked results, multi-word queries only match the exact phrase ("child cancer" misses "cancer ... child"), no stemming ("healed" misses "healing"), no accent folding ("Andre" misses "André", "Zelie" misses "Zélie").
- #13: pagination is in memory over up to 100 saints + 100 miracles with no `ORDER BY`; `meta.total` caps at 200; with both `q` and `topic` results were unioned.

## Scope
- Migration 0037: `unaccent` extension, an `immutable_unaccent` wrapper (unaccent is STABLE, which generated columns and indexes reject), stored generated `search_vector` on `saints` (name A, biography C) and `miracles` (title A, diagnosis B, cure details C, synopsis C) using the `english` config, and a GIN index on each. The column is deliberately not in the Drizzle schema: the app never selects or writes it, and the content schema test would otherwise demand it in the content files.
- `src/lib/search.ts`: one SQL statement over saints UNION ALL miracles. `websearch_to_tsquery` (all words, `"phrases"`, `OR`, `-exclusion`) plus a substring match on the saint name / miracle title so partial names still work. Order: name/title contains the query, then `ts_rank_cd`, then title, type, slug. Page and total come from the same statement.
- `q` + `topic` now means AND (was union).
- API: `meta.total` is the true count; `meta.capped` removed. `/search` page asks for the top 200 and says when there are more matches.
- Tests: PGlite loads the `unaccent` contrib extension; new `tests/search-fts.test.ts`.

## Not in scope
- Widening the indexed fields (patronage, themes, topics, location, country, source titles): #56, needs a trigger because `array_to_string` is not immutable.
- Highlighting and snippets (#32), typo tolerance (`pg_trgm`), synonyms.
- Autocomplete.

## Rollout
The migration is additive: the old code ignores the new columns, but the new code needs them. Apply to production (`npm run db:migrate`) before merging, so the deploy of `main` finds them. Rehearsal: the migration and the queries were run inside a transaction on production and rolled back.

## Verification
Tests for stemming, any-order multi-word, all-words, accents both ways, partial name, title-first ranking, phrases and exclusions, q+topic AND, true total past the last page, stable paging, edits reflected (generated column), unpublished excluded; each ranking/fallback/stemming behaviour fails when its code is mutated. Lint, typecheck, build.
