# Spec for unpublished-saints-pages

Title: Unpublished Saints on Public Pages
Branch: claude/fix/unpublished-saints-pages
Spec file: context/specs/unpublished-saints-pages.md

## Summary
Backlog #2. Some public pages show saints that are not published. Where a published miracle or saint is linked to an unpublished saint, that saint's name, slug and link, and on one page its image and canonization stage, appear on the public site. The saint-detail API route was already fixed in the isolated test database work; this fix covers the three remaining public pages. Unpublished saints must stay visible only to someone holding a valid preview token, on the two detail pages that support previewing.

## Functional Requirements
- Miracle detail page: the list of saints linked to the miracle shows only published saints, unless the preview token is valid.
- Miracle detail page: the saint names shown on each related-miracle card show only published saints, unless the preview token is valid.
- Saint detail page: the related saints list shows only published saints, unless the preview token is valid.
- Miracle list page: the saint names shown on each miracle card show only published saints. This page has no preview mode, so the filter always applies.
- A miracle whose only linked saints are unpublished still renders without error, with no saint section or an empty one, in the same way a miracle with no saints does today.
- A valid preview token continues to show unpublished saints on the miracle and saint detail pages, so drafts can be reviewed together with their relations.
- Cache behavior is unchanged: preview responses stay uncached and normal responses keep their current caching.
- No changes to the data model, the API or any other page.
- Update `context/backlog.md` to mark #2 done.

## Possible Edge Cases
- A published miracle linked to both a published and an unpublished saint shows only the published one.
- A published miracle linked only to an unpublished saint has no visible saint, and the page layout must not break or show an empty heading.
- A published saint related only to unpublished saints shows no related-saints section.
- An unpublished saint's page itself, viewed with a valid preview token, still shows its own related and linked records.
- An invalid or missing preview token is treated as no preview, so unpublished saints stay hidden.
- Filtering the miracle list by the id of an unpublished saint still returns that saint's published miracles. This reveals no saint data, but it is a way to detect that the saint exists; decide whether to leave it.
- The miracle list "related miracles" and shared-saint queries rely on saint links but do not display saint data, so they are not affected.
- Publishing a saint later makes it appear on all these pages without further changes, but cached pages may take up to their cache lifetime to update.

## Acceptance Criteria
- With a published miracle linked to an unpublished saint, the miracle detail page does not contain that saint's name or link, and shows the published saints.
- The same miracle's related-miracle cards on other pages, and its card on the miracle list, do not show the unpublished saint's name.
- A published saint with an unpublished related saint does not show that saint on its page.
- With a valid preview token, the unpublished saints appear on the detail pages as before.
- A miracle linked only to unpublished saints renders cleanly with no saint shown.
- The saint-detail API behavior is unchanged and its tests still pass.
- `npm test`, `npm run typecheck` and `npm run build` pass.
- A read-only check of the production data records whether any published record is currently linked to an unpublished saint, so the real-world impact is known.

## Open Questions
- Should the saint-id filter on the miracle list and API ignore unpublished saints, so the unpublished saint's existence is not discoverable? It leaks no content, so leaving it is acceptable, but it is inconsistent.
- Should the shared saint-visibility rule live in one place instead of repeating the condition in each query? That is a refactor beyond this fix; backlog #26 covers duplicated query logic.
- How should the fix be verified without unit tests for the pages? Candidates are a temporary fixture in a throwaway database, or the preview deployment checked against a read-only production query.

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- The pages import the Cloudflare runtime module and cannot be loaded in the test runner, so no page-level automated tests are expected for this change.
- Keep the existing API tests for unpublished saint non-leakage passing.
- Manual verification: run the dev server, check a miracle detail page, a saint detail page and the miracle list for a record linked to an unpublished saint, with and without the preview token.
- Read-only SQL against production to list published miracles or saints linked to unpublished saints, as evidence of real impact.

## Personal Opinion
Good idea and a small, low-risk change: it adds a missing condition to four queries and closes a real information leak. It is simple, with one decision worth making deliberately, which is the preview behavior.
- Page queries cannot be unit tested, so a missed query or a regression would not be caught automatically. Mitigation: verify with the dev server and a read-only SQL check now, and consider extracting the saint queries into shared helpers under backlog #26, which would also make them testable with the new PGlite harness.
- The condition is repeated across many queries, which is how it was missed in the first place. Mitigation: after this fix, grep for every saints join once more, as I did while writing this spec, and record that the others already filter.
- The preview rule must not accidentally show unpublished saints without a token. Mitigation: reuse the existing preview flag on the two detail pages rather than introducing a new check.
