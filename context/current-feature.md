# Current Feature

## Current Feature Spec File

_None_

## Current Feature Plan File

_None_

## History

### README for portfolio and licensing
Rewrote `README.md` for portfolio use: badges, live and API links, features, architecture diagram (Mermaid), engineering highlights, API example with a real trimmed response, getting started, project status and licensing. Replaced the all-rights-reserved `LICENSE` (PR #64) with MIT for the code. Decision: content (saint and miracle text and data, served by the site and API) is CC BY 4.0 with the attribution string "The Miracle Register, themiracleregister.org, CC BY 4.0"; this supersedes the "no attribution required" wording that PR #64 put in the `/api` Usage terms section, which now states CC BY with attribution, the AI-assisted/machine-translated disclosure and the Wikimedia image carve-out. Wikimedia images keep their own licenses. Verified: the API example was captured from a local dev server against production data; counts (30 saints, 85 miracles published) from a read-only query. Not verified: the CI badge URL renders, the Mermaid diagram on GitHub, the hero screenshot (placeholder comment left in the README), the `/api` page change in a browser. Not done: a dedicated `/terms` page and per-page license links. Counts in the README go stale as records are published.
