# Current Feature

## Current Feature Spec File

_None_

## Current Feature Plan File

_None_

## History

### Footer content license link
Added "Content licensed CC BY 4.0." to the site footer tagline in `Base.astro`, with "CC BY 4.0" linking to `/api#usage-terms` (the Usage terms section holds the full license, attribution string, image carve-out and AI/translation disclosure), so a visitor on any saint or miracle page can find the license without knowing to look under the API page. Replaces the idea of a separate `/terms` page. Verified: typecheck, lint, 481 tests and build; on the dev server the link is present on `/`, `/saints/fulton-sheen` and `/es/saints/fulton-sheen` and the `usage-terms` anchor exists on `/api`. Not verified: the footer layout in a browser at mobile width (the tagline is one sentence longer), the Spanish footer wording (the sentence is English on `/es`, like the rest of the footer).

### Format beatification and canonization dates
The saint page printed `beatification_date` and `canonization_date` as raw ISO strings ("2026-09-24") while birth and death were formatted ("May 8, 1895"). `saintDetail.ts` now returns `beatifiedDisplay` and `canonizedDisplay` (`formatApproxDate(date, "exact_day")`) and `SaintDetail.astro` uses them in all five places (mobile and desktop record cards and the header canonized date). Neither column has a precision field, so both are treated as exact days. Verified: typecheck, lint, 481 tests and build; on the dev server `/saints/fulton-sheen` showed "September 24, 2026" and `/saints/john-paul-ii` "May 1, 2011" and "April 27, 2014". Not verified: other saints with unusual dates (a placeholder YYYY-01-01 beatification date would print as "January 1"), and no new test (there is no test for the saint detail query). Not changed: Spanish pages still show English-formatted dates and an untranslated "Beatified" label on `/es/saints/fulton-sheen`, as born and died already did.

### README screenshots
Added `docs/screenshots/` (home light and dark, saint page, map; cropped from full-page captures and compressed to WebP, 43 to 94 KB each) and embedded them in the README: a light/dark `<picture>` hero plus a collapsed "More screenshots" block. README count line now reads "30 saints and 85 records (68 miracles and 17 apparitions)", matching the home page. Not verified: how the images render on GitHub. Screenshots are a snapshot of the site as of 2026-11-03 and go stale as the design changes.

### README for portfolio and licensing
Rewrote `README.md` for portfolio use: badges, live and API links, features, architecture diagram (Mermaid), engineering highlights, API example with a real trimmed response, getting started, project status and licensing. Replaced the all-rights-reserved `LICENSE` (PR #64) with MIT for the code. Decision: content (saint and miracle text and data, served by the site and API) is CC BY 4.0 with the attribution string "The Miracle Register, themiracleregister.org, CC BY 4.0"; this supersedes the "no attribution required" wording that PR #64 put in the `/api` Usage terms section, which now states CC BY with attribution, the AI-assisted/machine-translated disclosure and the Wikimedia image carve-out. Wikimedia images keep their own licenses. Verified: the API example was captured from a local dev server against production data; counts (30 saints, 85 miracles published) from a read-only query. Not verified: the CI badge URL renders, the Mermaid diagram on GitHub, the hero screenshot (placeholder comment left in the README), the `/api` page change in a browser. Not done: a dedicated `/terms` page and per-page license links. Counts in the README go stale as records are published.
