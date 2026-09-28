---
name: verify-sources
description: Audits `miracle_sources` and `saint_sources` rows on published (live) records — fetches each URL and checks it actually documents the miracle/saint it's attached to, and that `source_type` is categorized correctly. Use when the user asks to verify, audit, or sanity-check sources/links/citations, check for a source pointing at the wrong miracle/saint, or re-check `source_type` categorization. Produces a markdown report in `context/Notes/` for manual review — never edits records itself.
---

# verify-sources

Checks two things about every source row attached to a **published** miracle
or saint, since those are the only ones actually live on the site:

1. **Content match** — does the URL actually document *this* miracle/saint,
   not a different one by the same saint, or an unrelated page entirely?
2. **Categorization** — is `source_type` (`vatican_decree`, `news_article`,
   `book`, `academic`, `other`) the right bucket for what the URL actually is?

This never edits the database. It produces a report; the user fixes flagged
rows by hand in the admin panel (source rows are edited on the miracle/saint
edit page — add/delete pattern, same as sources have always worked).

## Step 0 — parse scope from `$ARGUMENTS`

- Empty → full audit of every published miracle's and saint's sources.
- A saint slug (e.g. `john-paul-ii`) → pass `--saint=<slug>` to the dump
  script — only that saint's sources and the sources of miracles linked to
  them.
- A miracle slug → pass `--miracle=<slug>` — just that one miracle's sources.
- A bare number (e.g. "check 20") → pass `--limit=<n>` for a quick sample run.

Don't guess slugs — if the user names a saint/miracle in prose ("check John
Paul II's sources"), resolve it to the slug via the dump script's own output
or a quick DB lookup rather than assuming spelling.

## Step 1 — dump the data

Run from the repo root:

```bash
npx tsx .claude/skills/verify-sources/scripts/dump-sources.ts [flags]
```

This is a read-only script (`SELECT` only, no writes) that hits the same
`DATABASE_URL` as the app via `createDb`. It prints JSON:
`{ miracle_sources: [...], saint_sources: [...] }`, each row already joined
with the identifying context needed to judge a match — miracle title,
recipient name, location, date, and the linked saint(s)' `name`/`saint_name`/
`birth_name` for `miracle_sources`; the saint's own names and
`wikipedia_url` for `saint_sources`.

Redirect to a temp file rather than reading the raw output inline if it's a
full run — it can be 150–250KB across ~240 rows, and you don't need to hold
all of it in your own context (see Step 2).

## Step 2 — verify each source

Combine `miracle_sources` and `saint_sources` into one list. **Do not fetch
every URL yourself in the main context** — each fetched page's content adds
up fast across hundreds of sources and this is exactly the kind of
parallelizable, context-heavy research that belongs in subagents.

- **≤ 8 sources total** (a scoped single-saint or single-miracle run): just
  fetch and check them directly with `WebFetch` — spinning up a subagent for
  a handful of URLs is overhead for no benefit.
- **More than 8**: split into batches of ~15 sources and dispatch one
  `general-purpose` agent per batch, **all in a single message** (parallel,
  `run_in_background: false` on each, since you need every batch's findings
  back before writing the report). For ~240 sources that's roughly 16 agents
  in one batch of parallel calls.

Give each subagent this exact task shape (fill in its slice of the JSON):

> For each source object below, fetch its `url` with WebFetch. Determine:
>
> 1. **reachable** — did it load? A 404, DNS failure, or redirect to an
>    unrelated homepage (e.g. a news site's root page instead of the
>    article) is `dead`, not `ok`.
> 2. **content match** — does the fetched page's content plausibly document
>    the specific `record` it's attached to? For a miracle source, look for
>    the `recipient_name` (allow reasonable name variants/transliterations),
>    or the linked saint's name plus enough circumstantial detail (location,
>    date, diagnosis) to confirm it's *this* case and not another healing by
>    the same saint. For a saint source, look for the saint's `name` /
>    `saint_name` / `birth_name`. If none of the identifying details appear
>    anywhere in the page, that's a `mismatch`. If the page loaded but is too
>    thin/generic to judge either way (e.g. a bare index page, a paywall
>    stub), that's `needs_review`, not a confirmed mismatch — don't guess.
> 3. **category match** — is `source_type` right for what this actually is?
>    Use this as a starting heuristic, then adjust based on the actual page
>    content (a heuristic can be wrong):
>    - `vatican.va`, `press.vatican.va`, or an actual Holy See dicastery
>      decree/positio → `vatican_decree`. A Vatican News *press release*
>      summarizing a decree is borderline — prefer `vatican_decree` only if
>      it's the primary Vatican-authored document, not a third party
>      reporting on one.
>    - Catholic press (catholicnewsagency.com, ewtn/ewtnnews.com,
>      ncregister.com, aleteia.org, zenit.org, cruxnow.com,
>      americamagazine.org, ncronline.org, osvnews.com, romereports.com,
>      diocesan newsrooms) → `news_article`.
>    - `.edu`, journal publishers (jstor.org, springer, wiley, tandfonline),
>      `doi.org` → `academic`.
>    - Google Books, archive.org book scans, a publisher/ISBN listing →
>      `book`.
>    - `wikipedia.org` on a **saint** source is always worth flagging
>      separately as `wikipedia_duplicate` regardless of its `source_type` —
>      the saint's own `wikipedia_url` field already covers this and a
>      `saint_sources` row for it renders as a duplicate reference. (Not an
>      issue on miracle sources.)
>    - Anything else (miraclehunter.com, a parish/diocese page that isn't a
>      decree, a local bishop's recognition letter, a blog) → `other` is
>      usually correct as-is; only flag if it was mis-tagged as one of the
>      more specific categories above.
>
> Return **only** a JSON array, one object per input source:
> `{ source_id, kind, status, current_source_type, suggested_source_type, note }`
> where `status` is one of `ok`, `dead`, `mismatch`, `type_mismatch`,
> `wikipedia_duplicate`, `needs_review`. Set `suggested_source_type` only
> when `status` is `type_mismatch`; otherwise omit it. Keep `note` to one
> sentence — the reason, not a restatement of the status.

## Step 3 — merge and write the report

Collect every batch's JSON array (or your own direct-fetch results for small
runs) into one list keyed by `source_id`. Write a markdown report to
`context/Notes/source-verification-<YYYY-MM-DD>.md` (today's date), structured as:

1. **Summary** — counts: total checked, `ok`, and each issue status. Note the
   scope (full audit vs. the saint/miracle/limit the user asked for).
2. **Flagged sources**, grouped by status, most actionable first
   (`dead`, `mismatch`, `wikipedia_duplicate`, `type_mismatch`,
   `needs_review`). Each entry: the miracle or saint slug (link target for
   the admin panel), the URL, current vs. suggested category if relevant,
   and the one-line note. Skip the `ok` rows in the body — they're already
   covered by the summary count.
3. Nothing else — no "ok" listing, no recommendations beyond what's in the
   notes. This is a checklist for the user to work through in the admin
   panel, not a narrative report.

## Step 4 — tell the user

Report the file path, the headline counts (e.g. "212 ok, 9 flagged: 3 dead
links, 4 mismatches, 2 wikipedia duplicates"), and remind them nothing was
changed in the database — every fix happens by hand in the admin panel.
