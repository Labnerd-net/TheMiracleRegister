# Spec for Miracle Dispensation Fields

Title: Miracle Dispensation Fields
Branch: claude/feature/miracle-dispensation-fields
Spec file: context/specs/miracle-dispensation-fields.md

## Summary

Add three nullable fields to the `saints` table to capture cases where the normal miracle requirements for beatification or canonization were waived:

- `beatification_miracle_dispensed` — boolean, nullable
- `canonization_miracle_dispensed` — boolean, nullable
- `dispensation_reason` — enum (`martyr`, `equipollent`, `papal_exception`), nullable

Update `SaintForm.astro` to expose these fields in the admin edit form. Update `CLAUDE.md` to document the new columns.

## Functional Requirements

- Add `beatification_miracle_dispensed boolean` (nullable) to the `saints` table
- Add `canonization_miracle_dispensed boolean` (nullable) to the `saints` table
- Add a new Postgres enum `dispensationReason` with values: `martyr`, `equipollent`, `papal_exception`
- Add `dispensation_reason dispensationReason` (nullable) to the `saints` table
- Generate and apply a Drizzle migration for all three columns
- Add the three fields to `SaintForm.astro` as a grouped fieldset in the admin form:
  - Two checkboxes for the booleans
  - A dropdown for `dispensation_reason` (optional, only meaningful when a checkbox is checked)
- Wire the fields through the POST handlers in `new.astro` and `edit.astro`
- Update `CLAUDE.md` saints table documentation with the three new columns

## Possible Edge Cases

- A saint with `canonization_type = martyr` will typically have `beatification_miracle_dispensed = true` — this is expected and valid, not a data error
- `dispensation_reason` should remain null if neither boolean is set
- Equipollent canonization typically means both booleans are true with `dispensation_reason = equipollent` (e.g. Juan Diego)
- A saint could theoretically have different reasons at each stage, but in practice one reason covers both — a single `dispensation_reason` field is sufficient

## Acceptance Criteria

- Migration applies cleanly with no errors
- `SaintForm` displays the two checkboxes and reason dropdown grouped together
- Saving a saint with both booleans unchecked leaves all three fields null
- Existing saint records are unaffected (all three fields default to null)
- `npm run build` passes with no TypeScript errors

## Open Questions

- None — design agreed in conversation.

## Testing Guidelines

No new unit tests required. The fields follow the same pattern as existing boolean fields (`lay_person`, `published`) and the existing enum fields. Verify manually in the admin form that:
- Checkboxes persist correctly on save
- `dispensation_reason` saves and pre-selects on edit

## Personal Opinion

This is a good, well-scoped addition. The three-field approach avoids over-engineering while covering all real-world cases in the starting saint set (Juan Diego for equipollent, Kolbe/Stein for martyr, John XXIII for papal exception). The main risk is minor: `dispensation_reason` being set without either boolean checked, but that's a data discipline issue, not a schema flaw. No concerns.
