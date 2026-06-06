# Spec for Explicit Field Selects on Detail Pages

Title: Explicit Field Selects on Detail Pages
Branch: claude/feature/explicit-field-selects
Spec file: context/specs/explicit-field-selects.md

## Summary

Three locations use `db.select()` (SELECT *) which fetches all columns including large text fields like `synopsis`, `biography_short`, and `cure_details` even when only a subset of fields is needed. Replace with explicit field lists to reduce data transfer.

Affected locations:
- `src/api/routes/miracles.ts` — `GET /api/v1/miracles/:slug` detail route
- `src/pages/miracles/[slug].astro` — miracle detail public page
- `src/pages/saints/[slug].astro` — saint detail public page (saint_sources fetch)

## Functional Requirements

- Replace `db.select()` with `db.select({ field: table.field, ... })` in each affected location
- Selected fields must match exactly what the page or API response actually uses — no more, no less
- The API response schema (Zod) for the miracle detail route defines the authoritative field list; the select must match it
- No change to rendered output or API response shape

## Possible Edge Cases

- A field used in a conditional render (e.g. `{miracle.location_lat && ...}`) must still be included even if it's nullable
- The `saint_sources` fetch in `saints/[slug].astro` already uses `db.select()` — check all fields used in the footnote template and include them explicitly

## Acceptance Criteria

- No `db.select()` calls without an explicit field list in the three affected files
- Build passes with no type errors
- Public pages render identically to before
- API response for `GET /api/v1/miracles/:slug` matches the existing Zod schema

## Open Questions

- None — scope is clear and bounded.

## Testing Guidelines

No new test files needed. This is a query optimization with no behavior change. Verify via build passing and a manual spot-check of the affected pages.

## Personal Opinion

Good, straightforward cleanup. The affected queries hit detail pages that fetch the heaviest text fields in the schema (`synopsis` up to 1000 words, `biography_short` ~300 words, `cure_details`). Worth doing before data volume grows. Low risk since it's purely subtractive — no logic changes, just fewer columns returned.
