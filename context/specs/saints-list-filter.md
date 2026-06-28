# Spec for Saints List Filter UI

Title: Saints List Filter UI
Branch: claude/feature/saints-list-filter
Spec file: context/specs/saints-list-filter.md

## Summary

The saints list page (`/saints`) currently has only a text search box. Add a filter bar matching the miracles list pattern — SSR on first load, JS-powered in-place list swap with `history.pushState` on change. Initial filters: canonization stage, themes, and religious order. The saints list API endpoint needs corresponding query params added.

## Functional Requirements

- Add a filter bar above the saints card grid with the following controls:
  - **Canonization Stage** dropdown: saint, blessed, venerable, servant_of_god (enum values)
  - **Themes** dropdown: values from `SAINT_THEMES` canonical list
  - **Religious Order** text input (or select populated from distinct DB values)
- Filters render server-side on first load (no-JS fallback works)
- With JS enabled, any filter change fetches `/api/v1/saints` with the active params and swaps the list in-place via `history.pushState` (matching the miracles list filter pattern)
- Pagination carries active filters forward
- A "Clear filters" control resets all filters when any are active
- The saints API endpoint (`GET /api/v1/saints`) gains optional query params: `canonization_stage`, `theme`, `religious_order`, `page`, `limit`

## Possible Edge Cases

- No results after filtering — show an empty state message ("No saints match your filters") rather than a blank grid
- `religious_order` is free text in the DB — filtering should be case-insensitive `ilike` to avoid mismatches
- Theme filter must validate against `SAINT_THEMES` to prevent arbitrary input reaching the DB query
- Pagination: page number resets to 1 when any filter changes (same as miracles list)
- Filter params must survive the URL (bookmarkable, shareable)

## Acceptance Criteria

- Selecting a canonization stage shows only saints at that stage
- Selecting a theme shows only saints tagged with that theme
- Entering a religious order filters the list case-insensitively
- All three filters can be active simultaneously
- Clearing filters restores the full list
- Filtered results paginate correctly (page controls reflect the filtered count)
- Works without JS (form submit reloads the page with filtered results)
- Filter state is reflected in the URL

## Open Questions

- Religious order: dropdown of distinct DB values vs. text input? A dropdown avoids misspellings but requires a DB query; text input with ilike is simpler and more flexible as saint count grows. Prefer text input for now.
- Nationality filter (in the original backlog item): useful eventually but low value at 11–20 saints — leave out of this iteration.

## Testing Guidelines

No unit tests needed for this feature (DOM interaction + API filtering). Manual browser testing covers the acceptance criteria. If any filter param validation logic is extracted to a helper, add a lightweight vitest unit test for the valid/invalid input cases.

## Personal Opinion

Good feature. The miracles filter pattern is already built and proven — this is essentially the same thing applied to saints. The main risk is over-building for a small dataset (11 saints today), but implementing the pattern now while the miracles filter is fresh is cheaper than doing it later. Themes and canonization stage are the two filters with immediate value; religious order is a nice-to-have. Straightforward and low-risk.
