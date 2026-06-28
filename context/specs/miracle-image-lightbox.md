# Spec for Miracle Image Lightbox

Title: Miracle Image Lightbox
Branch: claude/feature/miracle-image-lightbox
Spec file: context/specs/miracle-image-lightbox.md

## Summary

Clicking any image on a miracle detail page opens a full-size overlay showing the image, caption, and attribution. The overlay is dismissible by clicking outside it, pressing Escape, or clicking a close button. No JS framework required — implemented with a native `<dialog>` element and `showModal()`.

## Functional Requirements

- Every image on the miracle detail page is clickable (both the hero image and the gallery images below the synopsis)
- Clicking an image opens a `<dialog>` overlay in modal mode via `showModal()`
- The overlay displays the full-size image, caption (if present), and source attribution (if present)
- The overlay can be dismissed by:
  - Pressing Escape (native `<dialog>` behavior)
  - Clicking outside the image area (backdrop click)
  - Clicking an explicit close button
- The close button should be clearly visible (top-right corner of the overlay)
- Focus is trapped inside the dialog while open (native `<dialog>` behavior)
- The lightbox should work without JavaScript gracefully — images remain viewable on the page, lightbox simply does not activate
- Overlay background should be semi-transparent dark backdrop

## Possible Edge Cases

- Images with no caption or attribution — overlay still opens, fields simply omitted
- Very tall or very wide images — overlay should constrain image to viewport with `max-width`/`max-height` so it never overflows
- Rapid open/close — closing one and immediately clicking another should work correctly
- Screen readers — `<dialog>` provides native ARIA role; close button needs an accessible label

## Acceptance Criteria

- Clicking any miracle detail image opens the lightbox overlay
- Lightbox shows the full image, caption, and attribution
- All three dismiss methods work: Escape key, backdrop click, close button
- Image is constrained to viewport dimensions and does not overflow
- No layout shift or scroll jump when opening/closing
- Works on mobile (touch tap opens lightbox)
- Page remains functional if JS is disabled (images visible inline, no lightbox)

## Open Questions

- None — the `<dialog>` + `showModal()` approach is well-established and sufficient for this use case.

## Testing Guidelines

- Unit tests are not practical for a JS DOM interaction feature; manual browser testing covers the acceptance criteria
- If any helper functions are extracted (e.g. backdrop click detection), add a lightweight vitest unit test for the logic

## Personal Opinion

Good idea and straightforward to implement. The `<dialog>` element handles focus trapping, Escape key dismissal, and ARIA roles natively — no external dependencies needed. The existing gallery already renders ordered images with captions and attribution, so the lightbox just needs to surface that data in an overlay. Low risk, clear user value for image-heavy miracle records like the tilma and Padre Pio stigmata.
