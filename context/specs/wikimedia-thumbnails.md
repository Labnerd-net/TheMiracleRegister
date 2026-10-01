# Spec for Wikimedia Thumbnails

Title: Wikimedia Thumbnails
Branch: claude/feature/wikimedia-thumbnails
Spec file: context/specs/wikimedia-thumbnails.md

## Summary
Saint and miracle images are hotlinked from Wikimedia Commons, and most of them are the full-size originals. A measurement of the 63 published images (53 of them sized; 10 were rate-limited by Wikimedia and could not be measured) found 57 full-size originals, 11 over 1 MB and a largest file of 6.7 MB, while the 6 images that already use thumbnail URLs weigh 50 to 80 KB. Saint grid tiles display at about 300px wide yet download the original. Lighthouse runs on the live Lanciano page varied from 0.6 s to 1.8 s Speed Index across identical runs, which fits oversized remote files. This feature adds a small helper that rewrites a Wikimedia original URL to a standard-width thumbnail URL at render time, used wherever an image is displayed as a tile, card, hero or gallery thumbnail, while the lightbox keeps the original for full-size viewing. Stored data does not change, so there is no schema change and no data edit.

## Functional Requirements
- Add a helper in `src/lib` that takes an image URL and a target display width and returns the URL to use.
- For a full-size `upload.wikimedia.org` Commons URL, return the equivalent thumbnail URL at the smallest standard width that is at least the requested width. Standard widths are 330, 500, 960 and 1280, which are on Wikimedia's list of served thumbnail widths (a test showed 320 and 640 return HTTP 400).
- Return the URL unchanged when it is not on `upload.wikimedia.org`, is already a thumbnail URL, or cannot be parsed into the expected Commons pattern. The helper never throws and never returns an empty string for a non-empty input.
- Handle `null` or empty input by returning `null`, so callers can keep their existing "no image" branches.
- Use the helper for saint images on the home page (feast cards and carousel), `/saints` (server-rendered and the client-rendered cards), `/themes/[theme]`, `/patronage/[term]`, the saint page header, and the saint thumbnail on the miracle page.
- Use the helper for the miracle page hero image and the Images grid thumbnails.
- The lightbox continues to load the original URL from the stored data, and the "View larger" behaviour is unchanged.
- `og:image` and JSON-LD image fields use a 1280px thumbnail instead of the original, to keep crawler fetches light, unless a social card needs the original.
- API responses keep returning the stored original URLs unchanged, since the API is a data contract.
- Choose the requested width for each use from the rendered size (including a 2x allowance for high-density screens) and give the grid and hero images a `srcset` where it is straightforward, without changing the existing width/height and aspect-ratio reservations.
- Where the client-side filter script renders saint cards in the browser, it must produce the same thumbnail URLs as the server-rendered cards, so the helper must be usable from both.

## Possible Edge Cases
- Wikimedia only serves a fixed list of thumbnail widths and rejects others with HTTP 400. For an original smaller than the requested width it serves an upscaled thumbnail that can be larger than the original (tested: a 13 KB original became 67 KB at 960px). Nothing breaks, but the helper should request only the width the display needs, and original dimensions are not stored.
- Wikimedia rate-limits clients (HTTP 429); thumbnails must not increase the request count per page, and a failed thumbnail should not leave a broken image.
- Non-raster files (SVG, PDF, TIFF, PNG with transparency) have different thumbnail rules and URL suffixes; for example an SVG thumbnail is a PNG, and a PDF or TIFF thumbnail needs a page or format prefix.
- Original URLs with encoded characters, parentheses, apostrophes or non-ASCII characters in the filename must round-trip correctly.
- URLs that are already `/thumb/` URLs, including ones at a width that is not in the standard set.
- URLs from other hosts (for example a saint image stored on another domain) must pass through untouched.
- The existing aspect-ratio and `width`/`height` attributes must keep working so layout shift does not return.
- The hero frame uses a 4:3 box with a 480px cap, so the requested width should come from the container width, not from the cap.
- An image that is cropped with `object-cover` in a 3:4 tile needs a thumbnail wide enough for the shorter dimension, not just the displayed width.
- Public-domain attribution must not be affected: thumbnails are the same Commons files, so captions and source credits stay as they are.

## Acceptance Criteria
- On the saints grid, no tile downloads an image larger than the 500px thumbnail, and the grid's total image weight drops from tens of megabytes to a few megabytes.
- On a miracle page, the hero and gallery thumbnails load thumbnails, and opening the lightbox still loads the original.
- A Wikimedia original URL maps to a working thumbnail URL at each standard width, checked against a sample of real stored URLs, including ones with unusual characters.
- Non-Wikimedia, already-thumbnail and unparseable URLs are returned unchanged, and `null` or empty input is handled.
- API responses and stored data are unchanged.
- Layout shift is unchanged or better (CLS stays at or below the current post-fix values), and accessibility and SEO scores do not regress.
- Repeated Lighthouse runs on the Lanciano page show a smaller spread in Speed Index than the 0.6 s to 1.8 s seen before.
- Typecheck, build and tests pass, and `npm run check:data` is unaffected.

## Open Questions
- Should social images (`og:image`, JSON-LD) use the original or a 1280px thumbnail? Crawlers and some social cards prefer large images, but a 1280px thumbnail is usually enough.
- Resolved by testing: Wikimedia serves 250, 330, 500, 960 and 1280 (and others on its fixed list) but rejects 320 and 640, so the standard set is 330, 500, 960 and 1280. A check against a sample of the real stored URLs is still part of verification.
- Is a `srcset` worth the added markup on every grid, or is a single well-chosen width enough for this pass?
- If Wikimedia still rate-limits thumbnail requests in practice, is that the trigger to move to Cloudflare Images (stored copies with known dimensions) as a separate follow-up?
- Should the helper also be used in the lightbox for a mid-size preview before the original loads?

## Testing Guidelines
Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:
- A full-size Commons URL maps to the expected thumbnail URL for each standard width (330, 500, 960, 1280), and a requested width between two standard widths rounds up to the next one.
- A requested width above 1280 is capped at 1280.
- Non-Wikimedia URLs, existing thumbnail URLs and unparseable strings are returned unchanged.
- `null`, `undefined` and the empty string return `null`.
- Filenames with encoded characters, parentheses, apostrophes and non-ASCII characters produce a well-formed thumbnail URL.
- Non-raster extensions (for example SVG and PDF) follow the correct thumbnail suffix rules, or are passed through unchanged if that is the decision.
- The helper is usable in a browser context (no server-only imports), so the client-rendered saint cards can share it.
- Manual verification list recorded in the history entry: image byte weight on `/saints` and a miracle page before and after, a check that each mapped thumbnail URL on a sample of stored images returns 200, and repeated Lighthouse runs on the live Lanciano page.

## Personal Opinion
This is a good idea and worth doing now. It is low risk, needs no migration and addresses the largest measured cause of slow, inconsistent loads: 57 of 63 images are originals, 11 are over 1 MB, and the existing thumbnail URLs show the target size is tiny. It is also easy to reverse, because stored data is untouched.

Complexity is low to moderate. The helper itself is small, but it is used in many templates, including client-rendered markup in `/saints`, so the risk is in missing a spot or breaking the existing size reservations.
- Wikimedia's thumbnail rules are the main unknown: some file types and widths behave differently, and I could not measure 10 images because of rate limiting. Verify each mapped URL against the real stored data before merging, and fall back to the original when a thumbnail cannot be produced.
- It does not remove the dependency on Wikimedia or its rate limits. Cloudflare Images remains the better long-term answer and would also give exact image dimensions, which would let the 4:3 hero guess be replaced with a precise ratio. Treat that as a separate backlog item.
- Thumbnail requests for widths Wikimedia has not generated yet can be slow the first time, since the thumbnail is created on demand; this should not matter after the first request, but it could make the first measurements after deploy noisier.
