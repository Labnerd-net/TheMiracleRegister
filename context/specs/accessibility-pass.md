# Spec for Accessibility Pass

Title: Accessibility Pass
Branch: claude/feature/accessibility-pass
Spec file: context/specs/accessibility-pass.md

## Summary
Backlog #31. The public site has few accessibility affordances: no skip link, no landmark target on `<main>`, almost no ARIA, a lightbox and map without dialog semantics or keyboard handling, client-fetched results that are silent to screen readers, no reduced-motion or visible-focus handling, and images without lazy loading or intrinsic dimensions. This work first audits the real site with the a11y-reviewer agent and Lighthouse so the fixes target actual findings, then fixes them in one pass across the shared layout, the index and detail pages, the map, the timeline and the lightbox.

## Functional Requirements
- Run a baseline audit before changing anything: the a11y-reviewer agent over the public templates, and Lighthouse accessibility scores for the home page, a saint page, a miracle page, `/saints`, `/miracles`, `/map`, `/miracles/timeline`, `/calendar` and `/search`. Record the findings and scores in the history entry so before and after can be compared.
- Add a "skip to main content" link as the first focusable element in the shared layout, visible on focus, targeting an identified `<main>` landmark.
- Give the lightbox on the miracle page dialog semantics (role, modal, accessible name), close on Escape, trap focus while open, and return focus to the element that opened it.
- Give the map's popup or detail panel the equivalent treatment where it behaves as a dialog; ensure map controls are keyboard-reachable and labelled.
- Add live-region announcements for results fetched client-side (filter and search updates on `/saints` and `/miracles`) so a change in result count or an empty state is announced.
- Add appropriate ARIA labelling to the saint page, index pages, map and timeline: labelled landmarks and sections, labelled filter controls, accessible names for icon-only or image-only controls, and `aria-current` for the active navigation and pagination items.
- Respect `prefers-reduced-motion` by disabling or shortening non-essential animations and transitions.
- Provide a consistent, visible `:focus-visible` style on all interactive elements that meets contrast requirements in both themes.
- Add `loading="lazy"` (except above-the-fold and first-card images) and intrinsic `width`/`height` (or an aspect-ratio equivalent) to content images to prevent layout shift.
- Preload the primary web fonts if the audit shows they delay text rendering.
- Add alternative text where images lack it, and mark purely decorative images as such.

## Possible Edge Cases
- The skip link must work with the sticky header and not scroll the target under it.
- Lightbox focus trap with a single image (no previous/next controls) and with images that fail to load.
- Escape pressed while a nested control (for example a caption link) has focus.
- Live-region announcements firing on initial page load or on every keystroke instead of once per completed update.
- Images with unknown dimensions (Wikimedia URLs of varying size): reserving space without distorting or cropping them, and without undoing the earlier aspect-ratio fixes.
- Lazy loading an image that is the LCP element, which would worsen performance.
- Duplicate landmarks or duplicate `id`s when a page template already defines its own `<main>` or headings.
- Colour-only distinctions (stage badges, approval badges) that need a text or icon equivalent.
- Dark and light themes both need passing focus and contrast values.
- Reduced-motion users on the map, where animated pans or zooms may be essential to understanding.

## Acceptance Criteria
- Lighthouse accessibility score is 95 or higher on every page in the audit list, and no page regresses on performance or SEO scores.
- The a11y-reviewer agent reports no unresolved high or medium findings on the changed templates.
- A keyboard-only user can reach main content from the first Tab, open and close the lightbox with Escape, never lose focus into the page behind an open dialog, and see where focus is at all times.
- A screen reader announces result-count changes after filtering or searching.
- With reduced motion enabled, no non-essential animation runs.
- Content images no longer shift layout as they load.
- Typecheck, build and tests pass, and `npm run check:data` is unaffected.

## Open Questions
- Is a 95 Lighthouse target right, or should the bar be 100 where achievable? (Assumed 95 because some third-party map tiles may cap the map page.)
- Should the map be given a text alternative (a list of locations), or is labelled controls sufficient for this pass?
- Do we want automated accessibility checks in CI (axe), which would depend on the Playwright suite from backlog #29, or keep this pass manual?
- Should colour contrast of the existing palette be audited as part of this pass, or split out if it needs design changes?
- Which fonts, if any, are worth preloading? That depends on the audit.

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- Any extracted pure helper (for example, building an accessible label or result-count announcement string) returns the expected text for zero, one and many results.
- The shared layout output contains the skip link as the first focusable element and a `<main>` whose id matches the link target (rendered-output or string-level test if the project can support it; otherwise note it as a manual check).
- Manual verification list recorded in the history entry: keyboard-only walkthrough, a screen reader pass on one index page and the miracle lightbox, reduced-motion emulation, and Lighthouse before/after scores.

## Personal Opinion
This is a good idea and worth doing now: it is high value for real users, it is relatively low risk, and doing it before the oversized-file refactors (#25, #26) means the markup is fixed once rather than twice. It also removes part of what blocks the CSP work (#7).

Complexity is moderate and the scope is wide rather than deep. It touches many templates, so the risk is a large, hard-to-review diff and visual regressions in the lightbox and image sizing.
- Splitting into two or three commits (layout and focus/motion, then dialogs and live regions, then images) would keep review manageable, though it should still land as one feature.
- Automated coverage is thin without Playwright, so most verification is manual and must be recorded honestly, including what was not tested with an actual screen reader.
- The map is the hardest part to make genuinely accessible; a text list of locations may be the better fix than retrofitting the map widget, and could be cut from this pass if it grows.
- Image dimensions for remote Wikimedia images are not stored, so reserving space may require an aspect-ratio approach rather than exact width and height.
