# Slug Redirects (backlog #45, second half)

Branch: `claude/feature/slug-redirects`

## Problem
All edits are raw SQL against the single production branch. Renaming a saint or miracle slug silently breaks every public URL, inbound link and sitemap entry for it, and nothing records the old slug.

## Done separately
Neon snapshot schedule on production (`br-proud-block-aptdevzb`): daily 08:00 UTC, 14 day retention. Set via the Neon MCP, not code.

## Scope
- New table `slug_redirects`: `id`, `entity_type` (`saint` | `miracle`), `old_slug`, `new_slug`, `created_at`. Unique on `(entity_type, old_slug)`.
- DB triggers on `saints` and `miracles` (`AFTER UPDATE OF slug`, when the slug changed) so a rename records the redirect automatically; nobody has to remember to insert a row:
  - repoint existing rows whose `new_slug` is the old slug to the new slug (rename chains stay one hop)
  - insert `(entity_type, OLD.slug, NEW.slug)`
  - delete any row whose `old_slug` is the new slug (renaming back removes the loop)
- `/saints/[slug]` and `/miracles/[slug]`: when no record is found and no preview token is valid, look up `slug_redirects`; if found, `301` to the new path. Otherwise keep the existing `/404` redirect.
- Migration, schema export, test fixtures (new table needs no seed rows), tests for the trigger and the lookup helper.
- `npm run check:data`: error if a `slug_redirects.old_slug` also exists as a live slug of that type, or `new_slug` has no live record.

## Not in scope
- Redirect rows for slugs renamed before this migration (no history exists).
- Redirecting the API (`/api/v1/*/:slug`); it keeps returning 404 for old slugs.
- Preserving `?preview=` across a redirect.
- Redirects to unpublished records: the target page decides visibility.

## Verification
Unit tests on PGlite for the trigger (rename, chain, rename-back, unchanged slug no-op) and the lookup helper; `npm run build`, typecheck and tests; one real rename on a temporary Neon branch checked against the dev server, then branch deleted.
