# Plan: Unpublished Saints on Public Pages (backlog #2, remaining locations)

Spec: `context/specs/unpublished-saints-pages.md` · Branch: `claude/fix/unpublished-saints-pages`

## Context
Several Astro pages join to `saints` without filtering on `saints.published`, so an unpublished saint linked to a published miracle (or related to a published saint) would show its name, slug, link, and on one page its image and stage, on the public site. The saint-detail API route was already fixed in the isolated-test-database work; the three pages below remain.

A read-only query against production found **0 unpublished saints**, so nothing is exposed today. The leak is latent and would appear with the first draft saint, which means verification needs a throwaway database, not production data. Every other page that reads `saints` (map, random, calendar, saints list, sitemap, homepage, search) was checked and already filters.

## Changes (no schema, API or other-page changes)
All four queries are in `src/pages/`. The two detail pages already compute `isPreview` (valid `?preview=<PREVIEW_TOKEN>`); reuse it, do not add a new check. Pattern, mirroring the existing `isPreview ? ... : and(..., eq(x.published, true))` style already used on both pages:

1. `miracles/[slug].astro` `miracleSaintRows` query (about line 70): when not previewing, add `eq(saints.published, true)` to the `where`. The template already guards with `miracleSaintRows.length > 0`, so a miracle with only unpublished saints renders with no saint block.
2. `miracles/[slug].astro` `relatedSaintsMap` query (about line 121): same condition. Entries are only created when a link exists, so the template's `relatedSaintsMap.get(r.id)?.length &&` renders nothing for an empty case.
3. `saints/[slug].astro` related-saints query (about line 53): when not previewing, add `eq(saints.published, true)` alongside `eq(saintRelations.saint_id, saint.id)`. The template already guards with `relatedRows.length > 0`.
4. `miracles/index.astro` `saintLinks` query (about line 85): always filter `eq(saints.published, true)` (no preview mode on this page). Known cosmetic quirk, unchanged from how saint-less miracles already render: the card shows an empty name span followed by a separator dot.

Not changed: the `saint_id` filter on the miracle list and API (it reveals no saint data), and `saintLinked` related-miracle selection (it shows no saint data). Both are recorded in the spec as open questions, left as is.

Docs: `context/backlog.md` mark #2 done (header line, remove the entry); `context/current-feature.md` plan path now, history entry at completion.

## Verification
Pages cannot be unit tested (they import `cloudflare:workers`), and production has no unpublished saint, so verify with a temporary Neon branch:
1. With your OK, create a temporary Neon branch from production (read-write copy, separate from prod).
2. On that branch only, via SQL: insert one unpublished fictional saint, link it to one published miracle that also has a published saint, link it as the only saint of another published miracle, and add an unpublished related saint to one published saint.
3. Run the dev server pointed at the branch (`DATABASE_URL` override; `.dev.vars` already holds `PREVIEW_TOKEN`). Check, with `curl` or Playwright:
   - Miracle page and miracle list do not contain the unpublished saint's name or link; the published saint still shows.
   - The miracle linked only to the unpublished saint renders 200 with no saint block.
   - The published saint's page does not list the unpublished related saint.
   - With `?preview=<token>` the unpublished saint appears on both detail pages; with a wrong token it does not.
   - Related-miracle cards on a miracle page do not show the unpublished saint's name.
4. Run the same checks against the code before the change (git stash) to confirm the leak reproduces, then after.
5. With your OK, delete the temporary Neon branch afterward. No writes are made to the production branch.
6. `npm test`, `npm run typecheck`, `npm run build`: all pass; existing API non-leakage tests unchanged.
7. Open a PR; `check` passes. Optionally view the Workers Builds preview URL for a smoke check of a miracle page, saint page and list.

## Risks
- A missed query would not be caught automatically (no page tests). Mitigation: the dev-server matrix above, and the grep audit already done across all `saints` joins.
- Preview rule must not show unpublished saints without a valid token. Mitigation: reuse the existing `isPreview` constant.
- Cached pages may take up to their cache lifetime to reflect a later publish (existing behavior).
- Creating and deleting a Neon branch needs your approval; the plan does not touch production data.
