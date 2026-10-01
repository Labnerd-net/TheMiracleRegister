# Spec for Shared Queries

Title: Shared Query and Filter Logic
Branch: claude/feature/shared-queries
Spec file: context/specs/shared-queries.md

## Summary
Backlog #26. The miracle and saint filter WHERE clauses are built twice, once in the API routes and once in the Astro index pages, and the "saint names by miracle" lookup (join `miracle_saints` to published `saints`, group in a Map) is repeated in five places. The two filter copies have already drifted. This extracts both into `src/lib/queries/{miracles,saints}.ts`, mirroring the existing `searchContent` extraction in `src/lib/search.ts`, and points the API routes and pages at them.

Current copies:
- Miracle filters: `src/api/routes/miracles.ts` 58-77 and `src/pages/miracles/index.astro` 43-58.
- Saint filters: `src/api/routes/saints.ts` 46-51 and `src/pages/saints/index.astro` 34-39.
- Saint-names-by-miracle: `api/routes/miracles.ts` (`fetchSaintsForMiracles`), `api/routes/saints.ts` 155-175, `pages/miracles/index.astro` 87-100, `pages/topics/[topic].astro` 38-50, `pages/miracles/[slug].astro` 132-145 (preview-aware).

## Drift found (must be decided, not silently picked)
- `country` filter: the API uses `likeContains` (substring match); `/miracles` SSR uses `escapeLike` with no wildcards (case-insensitive exact match). The page's client script fetches the API, so the same URL can give different results on first load and after a filter change. They differ only when one country is a substring of another.
- `religious_order` filter: the API uses `ilike` contains; `/saints` SSR uses `eq` (the dropdown supplies exact values).
- `nationality` is `eq` in both.
Recommendation: one shared implementation. Use exact (case-insensitive) match for `country` and `religious_order` in the shared builder? That changes the public API (a substring `country=ital` stops matching). The alternative is contains everywhere, which changes the page for substring-overlapping values. Decision needed; see Open Questions.

## Functional Requirements
- `src/lib/queries/miracles.ts`:
  - `miracleFilterConditions(filters)` returns the Drizzle condition array, always including `published = true`, covering saint_id, type, topic, category, country, year_from, year_to, used_for_beatification, used_for_canonization, approval_authority.
  - `fetchSaintsByMiracle(db, miracleIds, { includeUnpublished })` returns `Map<miracle_id, {id, slug, name}[]>`; default excludes unpublished saints.
- `src/lib/queries/saints.ts`: `saintFilterConditions(filters)` covering canonization_stage, theme, religious_order, nationality, always including `published = true`.
- Callers keep their own input parsing (Zod in the API, `searchParams` in pages) and their own select lists, ordering and pagination. Only the conditions and the saint-names lookup are shared.
- Pages that need only names derive them from the shared Map.
- `miracles/[slug].astro` keeps its preview behaviour through `includeUnpublished`; a valid preview token must still reveal unpublished saints and a missing or wrong one must not.
- No change to response shapes, status codes, cache headers, ordering or pagination.
- Out of scope: client-side card re-rendering from the API (the second half of the backlog text), `searchContent`, and the `saints/[slug].astro` miracle list.

## Possible Edge Cases
- Unpublished saint linked to a published miracle must stay hidden everywhere except a preview (regression of backlog #2).
- Empty `miracleIds` must return an empty Map without a query.
- Year filter with value 0 or non-numeric on the page path (`|| undefined` parsing stays in the page).
- `%` and `_` in `country` must remain escaped (backlog #8).
- A miracle with two saints keeps both, in the same order as today (no ORDER BY today; do not add one without noticing).
- `used_for_*` is the string `"1"` in the API schema and a boolean on the page; the shared filter takes booleans, and the API converts.

## Acceptance Criteria
- Each WHERE clause and the saint-names lookup exist once, in `src/lib/queries/`.
- API route and page output unchanged for the same inputs, except for the decided `country` / `religious_order` semantics.
- All existing tests pass unchanged except any that assert the old drifted behaviour.
- Typecheck, build and `npm run check:data` pass; spot-check `/miracles`, `/saints`, `/topics/children`, a miracle page, and a preview URL against the dev server before and after.

## Open Questions
- `country` / `religious_order`: exact or contains? Recommendation: keep the API as contains (public contract, documented as a filter), and make the page use the same function, since its client path already does. The dropdowns only emit full values, so users see no change; the only visible effect is the page matching "Niger" against "Nigeria" the way the client already does. Mitigation if that matters: an exact-match option on the shared builder used only by the dropdown pages.
- Should `miracles/[slug].astro` related-miracle names (preview-aware) move too, or stay since it is the only preview consumer? Recommendation: move it; `includeUnpublished` covers it.

## Testing Guidelines
Create `tests/queries.test.ts` using the existing PGlite fixtures (`tests/helpers/fixtures.ts`), without going heavy:
- `fetchSaintsByMiracle`: empty ids, a miracle with two saints, an unpublished saint excluded by default and included with `includeUnpublished`.
- `miracleFilterConditions`: each filter narrows results against fixtures; `%` in country does not match everything; unpublished miracles never returned.
- `saintFilterConditions`: stage, theme, order, nationality; unpublished excluded.
- Existing `api-miracles` and `api-saints` suites stay green and act as the regression check for the API routes. Astro pages cannot be unit tested (they import `cloudflare:workers`); record the manual before/after checks in the history entry.

## Personal Opinion
Worth doing, and the drift is the real reason: the same URL returning different results on first load versus after a filter change is a latent bug, not just duplication. Risk is low because the API side is covered by the isolated-DB tests. The page side is not testable, so the manual before/after diff matters. I would skip the client-side card re-render dedup: it is the larger change (shared card component or server-rendered fragments), touches #25, and is a separate feature.
