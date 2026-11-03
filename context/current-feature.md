# Current Feature

## Current Feature Spec File

_None_

## Current Feature Plan File

_None_

## History

### README screenshots
Added `docs/screenshots/` (home light and dark, saint page, map; cropped from full-page captures and compressed to WebP, 43 to 94 KB each) and embedded them in the README: a light/dark `<picture>` hero plus a collapsed "More screenshots" block. README count line now reads "30 saints and 85 records (68 miracles and 17 apparitions)", matching the home page. Not verified: how the images render on GitHub. Screenshots are a snapshot of the site as of 2026-11-03 and go stale as the design changes.

### README for portfolio and licensing
Rewrote `README.md` for portfolio use: badges, live and API links, features, architecture diagram (Mermaid), engineering highlights, API example with a real trimmed response, getting started, project status and licensing. Replaced the all-rights-reserved `LICENSE` (PR #64) with MIT for the code. Decision: content (saint and miracle text and data, served by the site and API) is CC BY 4.0 with the attribution string "The Miracle Register, themiracleregister.org, CC BY 4.0"; this supersedes the "no attribution required" wording that PR #64 put in the `/api` Usage terms section, which now states CC BY with attribution, the AI-assisted/machine-translated disclosure and the Wikimedia image carve-out. Wikimedia images keep their own licenses. Verified: the API example was captured from a local dev server against production data; counts (30 saints, 85 miracles published) from a read-only query. Not verified: the CI badge URL renders, the Mermaid diagram on GitHub, the hero screenshot (placeholder comment left in the README), the `/api` page change in a browser. Not done: a dedicated `/terms` page and per-page license links. Counts in the README go stale as records are published.
