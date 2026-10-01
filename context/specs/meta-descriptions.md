# Spec for Meta Descriptions

Title: Meta Descriptions
Branch: claude/feature/meta-descriptions
Spec file: context/specs/meta-descriptions.md

## Summary
Backlog #52. Five public index pages send no meta description: `/saints`, `/miracles`, `/map`, `/miracles/timeline` and `/search`. `Base.astro` only writes the description, `og:description` and `twitter:description` tags when a page supplies a description, so these pages have none of the three. A live Lighthouse run on `/saints` scored SEO 92 for this single failing audit, and local runs of the other index pages scored 83 to 85. Search engines and social previews therefore pick their own snippet from page text, which for index pages is a list of cards. This work gives each of the five pages a short, specific description and adds a default site description in the shared layout so a new page cannot ship without one. The 404 page is excluded.

## Functional Requirements
- Give `/saints`, `/miracles`, `/map`, `/miracles/timeline` and `/search` each a page-specific description of about 150 characters (a hard ceiling around 160, so search results do not truncate it).
- Where it reads naturally, build a description from data the page already loads (for example the number of saints or miracles) without adding a database query.
- Use plain, factual wording in the same register as the existing home-page and calendar descriptions: what the page lists and what a visitor can do with it.
- Add a default site description to the shared layout, used when a page passes none, so every page that renders through the layout emits the three description tags.
- A page-supplied description always overrides the default.
- The `/search` page uses one static description regardless of the query. Query-string URLs are already `noindex`, so a per-query description adds nothing.
- Filtered or paginated variants of `/saints` and `/miracles` use the same description as the base page, since they are `noindex` and not separate documents.
- The 404 page keeps working and may use the default; it must not claim to be a content page.
- Existing pages that already pass a description (home, calendar, saint and miracle detail, browse pages, and similar) are unchanged.

## Possible Edge Cases
- A count in the description could be wrong or awkward if the page loads zero rows (empty database or all filtered out); the wording must still read correctly or fall back to a static sentence.
- Counts that reflect a filter (for example a filtered `/saints?theme=hope`) should not leak into the description, because the same canonical page should have a stable snippet.
- Singular and plural wording for counts of one.
- Descriptions containing quotes, ampersands or non-ASCII characters must be escaped correctly in the tag attributes.
- A very long description from a future page should not break the tags; whether to truncate or leave it to the author is a decision to make.
- `og:description` and `twitter:description` must match the meta description and not appear twice.
- Preview URLs and `noindex` pages still render the tags harmlessly.
- The default description should not make unrelated pages (such as a thin browse page flagged `noindex`) look like duplicates of each other in tools that compare descriptions.

## Acceptance Criteria
- Each of the five pages emits a non-empty meta description, `og:description` and `twitter:description`, each about 150 characters and no more than 160.
- Live Lighthouse SEO for `/saints`, `/miracles`, `/map`, `/miracles/timeline` and `/search` reaches 100 or has no remaining failing audit other than ones unrelated to descriptions.
- The default description appears on a page that passes none, and is not used on a page that passes its own.
- The 404 page still renders and returns a 404 status.
- No new database queries are added, and page behaviour is otherwise unchanged.
- Typecheck, build and tests pass, and `npm run check:data` is unaffected.

## Open Questions
- Should counts appear in the descriptions at all? They go stale in cached search snippets as records are added, but they make the snippet concrete. A static sentence is safer and simpler.
- What should the default site description say? The home-page description could be reused or shortened, but then the home page and every unlabelled page share one snippet.
- Should the layout truncate an over-long description, or is that left to page authors?
- Should `check:data` or a test flag any published page route that renders without a description? Today nothing would catch a new page that omits it.
- Should the 404 page suppress the description tags entirely?

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Any extracted pure helper that builds a description (for example from a count) returns the expected text for zero, one and many, and stays within the length limit.
- The default description is used when none is passed and a passed description overrides it (rendered-output or string-level test if the project can support rendering the layout; otherwise record it as a manual check).
- Quotes and ampersands in a description are escaped in the rendered attributes.
- Manual verification list recorded in the history entry: view-source on each of the five pages for the three tags and their lengths, and live Lighthouse SEO scores before and after.

## Personal Opinion
This is a good idea and worth doing now. It is small, low risk and fixes the only failing SEO audit on the main browse pages, and the default fallback closes the gap for future pages. It is slightly more than a one-line fix because of the fallback and the wording decisions, but it is still simple.
- I would keep descriptions static where possible. Counts add little value, go stale in cached snippets and add an edge case for empty results, so I would use them only if there is a clear reason.
- A fallback description helps Lighthouse but can hide a missing page-specific one; a test or `check:data` rule that flags routes without their own description would keep quality up, and could be a small follow-up.
- The default description will repeat across any page that falls back to it, so use it as a safety net and not as the plan for real pages.
- Search snippets are chosen by the engine anyway, so the visible gain is mostly the Lighthouse score and tidier social previews; do not expect a ranking change.
