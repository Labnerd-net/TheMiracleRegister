# Spec for Miracle Images Table

Title: Miracle Images Table
Branch: claude/feature/miracle-images-table
Spec file: context/specs/miracle-images-table.md

## Summary

Replace the single `miracles.image_url` column with a `miracle_images` table supporting multiple ordered images per miracle. Targeted at visually documented miracles (Eucharistic miracles, apparitions, incorrupt bodies, miraculous images) — not healing or intercessory miracles where no meaningful visual record exists.

## Functional Requirements

- Add a `miracle_images` table with: `id`, `miracle_id` (FK → miracles, cascade delete), `url` (text, not null), `caption` (text), `display_order` (integer), `source_attribution` (text)
- Drop `miracles.image_url` column after migrating any existing values to the new table as `display_order = 1` records
- Public miracle detail page renders all images for the miracle, ordered by `display_order`
- Admin miracle edit page gains an image management section matching the existing sources pattern: list current images (url, caption, order), delete individual images, add new images
- API miracle detail response includes an `images` array: `[{ url, caption, display_order, source_attribution }]`

## Possible Edge Cases

- Miracles with no images should render cleanly (empty array, no image section shown)
- Existing `image_url` values must be migrated to `miracle_images` before dropping the column — migration must be a single transaction
- `display_order` gaps after deletion are acceptable; re-ordering is out of scope
- Very long captions should not break layout

## Acceptance Criteria

- `miracle_images` table exists with correct FK and cascade behavior
- `miracles.image_url` column no longer exists
- Any pre-existing `image_url` values appear in `miracle_images` with `display_order = 1`
- Admin edit page allows adding and removing images
- Public miracle detail page displays images when present, shows nothing when absent
- API response includes `images` array on miracle detail endpoint
- Build passes with no TypeScript errors

## Open Questions

- None — scope is clear.

## Testing Guidelines

- Test that the miracle detail API response includes an `images` array (empty and non-empty cases)
- Test that adding an image via admin form persists correctly
- Test that deleting an image removes only that image, not others on the same miracle

## Personal Opinion

Good addition. Visual evidence is genuinely useful for a subset of miracles and having a proper table (rather than a single URL field) is the right approach given the data. The migration path from `image_url` is straightforward. No concerns — this is the right time to do it before more image-bearing miracles are added.
