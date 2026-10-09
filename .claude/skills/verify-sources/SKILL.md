---
name: verify-sources
description: Audits `miracle_sources` and `saint_sources` on published (live) records, in two modes. Content-match mode fetches each URL to check it actually documents the miracle/saint it's attached to and that `source_type` is categorized correctly. Coverage mode (no fetching) checks whether each record's source *set* meets the sourcing standard — e.g. a canonization miracle missing its vatican.va decree, or a saint with zero biographical sourcing. Use when the user asks to verify, audit, or sanity-check sources/links/citations; check for a source pointing at the wrong miracle/saint; re-check `source_type` categorization; re-check previously dead links; or check source coverage/completeness/whether something is "properly sourced." Produces/updates `context/Notes/source-coverage-gaps.md` (coverage mode) or a dated report (content-match mode), plus `context/Notes/dead-links-archive.md` — never edits DB records itself.
---

# verify-sources

Two independent checks live here, sharing one data dump because they read the
same underlying fact (what sourcing does this record currently have?) but
answer different questions:

1. **Content-match mode** — fetches every URL. Expensive (one request per
   source, ~240 today), and results decay over time as pages die or move —
   this is why it has a cheaper `recheck` mode for previously-dead links.
   Run this periodically (monthly/quarterly) or when asked to verify links.
2. **Coverage mode** — no fetching at all, pure structural check against the
   fields already in the DB (`content_tier`, `approval_authority`,
   `used_for_beatification`/`canonization`, source_type mix). Cheap enough to
   run after every batch of data entry, or whenever asked whether
   something is "properly sourced" / "has enough sources."

This never edits the database. Both modes produce output for manual review;
the user fixes flagged rows or gaps by hand in the database (source rows
are edited on the miracle/saint edit page — add/delete pattern).

## Step 0 — parse scope and mode from `$ARGUMENTS`

- Mentions **coverage**, **requirements**, **completeness**, "enough
  sources," "properly sourced," or similar → **coverage mode**, skip to that
  section below.
- `recheck`, "check dead links," or similar → **recheck mode** (content-match
  side), skip to that section below.
- Otherwise → **content-match mode**, full audit by default.
- A saint slug (e.g. `john-paul-ii`) → pass `--saint=<slug>` to the dump
  script — only that saint's sources and the sources of miracles linked to
  them.
- A miracle slug → pass `--miracle=<slug>` — just that one miracle's sources.
- A bare number (e.g. "check 20") → pass `--limit=<n>` for a quick sample run
  (content-match mode only — coverage mode is cheap enough to always run in
  full).

Don't guess slugs — if the user names a saint/miracle in prose ("check John
Paul II's sources"), resolve it to the slug via the dump script's own output
or a quick DB lookup rather than assuming spelling.

## Dump the data (shared by every mode)

Run from the repo root:

```bash
npx tsx .claude/skills/verify-sources/scripts/dump-sources.ts [flags]
```

Read-only (`SELECT` only). Prints `{ miracles: [...], saints: [...] }` —
every published miracle/saint, each with its full `sources` array nested
inline, plus the fields both modes need: `content_tier`,
`approval_authority`, `used_for_beatification`/`used_for_canonization`,
`has_medical_board_verdict`, linked `saints` (for miracles), and
`canonization_stage`/`wikipedia_url` (for saints). Redirect to a temp file
rather than reading the raw output inline for a full run — it's large enough
that you don't need to hold all of it in your own context (see below).

---

## Coverage mode

Checks whether each record's *set* of sources meets the sourcing standard —
not whether any individual URL is reachable or correctly categorized (that's
content-match mode's job).

### The standard

**Miracles.** Tier 1 = the adjudication record itself, mapped from
`approval_authority`:

| `approval_authority` | Tier 1 requirement |
|---|---|
| `vatican_dicastery` | A source with `source_type: vatican_decree` **hosted on vatican.va** (hostname `vatican.va` or ending `.vatican.va`). `vaticannews.va` is a different domain — that's press coverage of a decree, not the decree, and should be `news_article` instead. **Narrow exception:** a pre-internet-era papal document (e.g. a 1920s–1950s canonization bull) that vatican.va simply never put online can be satisfied by a well-established, disinterested historical archive — `papalencyclicals.net` is the confirmed example — but only when content-match independently confirms the archived text actually names *this* case's recipient. This is different from the piercedhearts.org/opusdei.org mirrors below: those were reposts of *modern* documents that have (or should have) a real vatican.va original, hosted by a party with a stake in the cause (a shrine, the postulating organization); a neutral archive filling a genuine vatican.va gap for a 100-year-old bull is a different situation. Don't extend this exception to devotional/postulator sites re-hosting something modern — it's specifically for filling vatican.va's historical gaps via a neutral source. |
| `lourdes_bureau` | Bureau des Constatations Médicales / CMIL documentation |
| `local_bishop` / `nihil_obstat` | The issuing ordinary's own decree or tribunal announcement, if publicly findable |
| `none` | No decree exists by definition (most apparitions/phenomena). Fall back to the **bundle rule**: an official shrine/diocesan account of the case *plus* at least one independent Tier 2 source. Don't keep hunting for a primary document that was never published. |

**A beatification/canonization homily attached to a *miracle* record is
`other`, not `vatican_decree`, unless it explicitly names that miracle's
recipient.** Homilies are thematic — they praise the new Blessed/Saint in
general terms and almost never name the specific case, even when hosted on
vatican.va. The same homily is legitimately `vatican_decree` when it's
attached to the *saint's* own record (there it's confirming the status leg,
not standing in as proof of a specific miracle). Vatican does occasionally
publish a page naming an individual recipient — e.g.
`vatican.va/latest/documents/<name>_miracolo-canoniz_en.html` for
Escrivá's canonization miracle — so check for a case-specific page before
concluding none exists, but don't accept a generic homily as satisfying this
row just because it's genuinely vatican.va-hosted. Coverage mode can't catch
this on its own (it doesn't fetch, so it can't tell a case-specific decree
from a thematic homily by source_type alone) — this is exactly what
content-match mode's per-source fetch is for, so treat any `vatican_decree`
row on a miracle record as worth re-confirming during a content-match pass.

Tier 2 = corroborating, not proof on its own: Catholic press by name
(`news_article`), books, academic retrospectives (`academic`). Reference
only, doesn't count toward the standard: Wikipedia, devotional/apologetics/
advocacy blogs (these are fine as `other` but shouldn't be the only source on
a `core` record).

**Don't task coverage or content-match work with finding "the primary medical
record."** It isn't published, for any case, by either adjudicating body: the
Vatican's Consulta Medica findings are sealed inside the cause's Positio
(Dicastery for the Causes of Saints' own archive, Rome); Lourdes' Bureau des
Constatations Médicales / CMIL hold their files at the Sanctuary, accessible
only with special episcopal authorization (confirmed via the one academic
retrospective that got in — see
`../catholic-research/TheMiracleRegister/Notes/Source Requirements Standard.md`). This is
also why no Vatican decree or homily ever names a miracle's recipient — the
document that would is exactly the sealed one. Tier 2 corroboration is
accepted as the standard's ceiling, not a stand-in for a primary record that
future work should keep hunting for.

Minimum bar by `content_tier`:
- `core` + (`used_for_beatification` or `used_for_canonization`): must have
  the Tier 1 source for its `approval_authority` (or the bundle, for `none`).
- `core`, not used for beat/canon (apparitions, stigmata, incorruptibles,
  Eucharistic miracles): apply the bundle rule regardless of
  `approval_authority`, since these rarely have a clean dicastery decree even
  when the field says `vatican_dicastery`.
- `catalog`: at least one Tier 2 source.
- `stub`: no hard requirement; note but don't flag as a gap.

**Saints.** No biographical decree exists — the canonization decree confirms
the miracle, not the life. Two separate legs, both required:
- **Status leg**: a source hosted on vatican.va (any `source_type`) —
  confirms the beatification/canonization act itself. A `vaticannews.va`
  source does not satisfy this (same distinction as above).
- **Biography leg**: at least one source with editorial accountability
  beyond a personal devotional blog — the saint's own religious order,
  a diocesan archive, an official shrine/postulator site, or a scholarly
  book/academic source. Don't require a published biography be hunted down
  when a decent order/diocesan/shrine site exists.
- Wikipedia never counts toward either leg, and should never appear as a
  `saint_sources` row at all — it's already surfaced via `wikipedia_url`, and
  a duplicate row renders twice on the saint page.

### Running the check

This is pure data analysis on the dump's JSON — no fetching, no subagents
needed. For each miracle, check its `sources` array's `source_type`/`url`
mix against the table above given its `content_tier`/`approval_authority`/
`used_for_*`. For each saint, check for a vatican.va source (status leg) and
a substantive non-devotional source (biography leg). Judgment calls (is this
domain an "official shrine"? does this bundle satisfy the fallback rule?) are
expected — flag borderline cases rather than silently deciding either way.

### Recording findings — `context/Notes/source-coverage-gaps.md`

Unlike content-match mode, coverage gaps don't decay with time — a record
either has adequate sourcing or it doesn't, and it stays that way until
someone fixes it in the database. So this is a **living file**, updated in
place, not a new dated snapshot per run:

- Create the file with `## Open` and `## Resolved` headings if it doesn't
  exist yet.
- Group open items under `## Open` by check type (e.g. "Core miracles
  missing Tier 1," "Catalog miracles with no Tier 2 source," "Saints missing
  the status leg," "Saints missing the biography leg"), one line per record
  with slug, what's missing, and what's already on file.
- On each run: anything newly resolved (a gap from a prior run no longer
  reproduces) moves to `## Resolved` with today's date. Anything still open
  keeps its original "first flagged" date if the file already has one for
  that record; otherwise it's new. Don't re-flag something already sitting
  in `## Resolved` unless it's newly regressed — if it has, move it back to
  `## Open` with a note that it regressed and why, if apparent (e.g. "a
  duplicate-source cleanup removed the only vatican_decree row").
- Tell the user a short summary (e.g. "14 open gaps: 6 miracles missing
  Tier 1, 12 catalog miracles with zero sources, 5 saints missing biography
  sourcing — see source-coverage-gaps.md") — no separate narrative report.

---

## Content-match mode

Checks two things about every source row:

1. **Content match** — does the URL actually document *this* miracle/saint,
   not a different one by the same saint, or an unrelated page entirely?
2. **Categorization** — is `source_type` (`vatican_decree`, `news_article`,
   `book`, `academic`, `other`) the right bucket for what the URL actually is?

### Recheck mode

For "recheck the dead links" style requests, don't run the full dump/audit
pipeline. Instead:

1. Read `context/Notes/dead-links-archive.md` and take every entry listed
   under **Active**.
2. Fetch each URL directly with `WebFetch` (batch into `general-purpose`
   subagents only if there are more than ~15 — this list is usually small).
3. For each: if it now loads and still documents the record it's attached
   to (same content-match check as below) → move the entry to **Resolved**
   with today's date and a one-line note on what confirmed it (don't just
   delete it — the resolution itself is worth keeping). If still dead →
   update `Last checked` to today; update the note only if the failure
   reason changed.
4. Rewrite `dead-links-archive.md` in place with these updates.
5. Tell the user a short summary (e.g. "2 of 6 came back: X, Y — moved to
   Resolved. 4 still dead.") and stop — no dated audit report is needed for
   a recheck-only run.

### Full audit — verify each source

Flatten `miracles[].sources` and `saints[].sources` into one list, keeping
each source's parent record fields (`recipient_name`, `location_name`,
`country`, `date_of_event`, `saints`/`wikipedia_url`) attached as its
`record` context. **Do not fetch every URL yourself in the main context** —
each fetched page's content adds up fast across hundreds of sources and this
is exactly the kind of parallelizable, context-heavy research that belongs
in subagents.

- **≤ 8 sources total** (a scoped single-saint or single-miracle run): just
  fetch and check them directly with `WebFetch` — spinning up a subagent for
  a handful of URLs is overhead for no benefit.
- **More than 8**: split into batches of ~15 sources and dispatch one
  `general-purpose` agent per batch, **all in a single message** (parallel,
  `run_in_background: false` on each, since you need every batch's findings
  back before writing the report). For ~240 sources that's roughly 16 agents
  in one batch of parallel calls.

Give each subagent this exact task shape (fill in its slice of the flattened
list):

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
>      reporting on one. `vaticannews.va` specifically is a different domain
>      **On a miracle record specifically**: a beatification/canonization
>      homily is `vatican_decree` only if it names *this* recipient — if it's
>      generic praise of the new Blessed/Saint with no mention of the actual
>      case (the common case), that's a content `mismatch`, and the fix is
>      recategorizing to `other`, not finding a replacement URL. The same
>      homily is correctly `vatican_decree` when it's attached to the saint's
>      own record instead.
>      from `vatican.va` and is almost always `news_article`, not
>      `vatican_decree`.
>    - Catholic press (catholicnewsagency.com, ewtn/ewtnnews.com,
>      ncregister.com, aleteia.org, zenit.org, cruxnow.com,
>      americamagazine.org, ncronline.org, osvnews.com, romereports.com,
>      diocesan newsrooms) → `news_article`.
>    - `.edu`, journal publishers (jstor.org, springer, wiley, tandfonline),
>      `doi.org` → `academic`. A general encyclopedia (Britannica, New
>      Advent) or a `.edu` devotional/campus-ministry profile is `other`, not
>      `academic`, despite the domain.
>    - Google Books, archive.org book scans, a publisher/ISBN listing →
>      `book`.
>    - `wikipedia.org` on a **saint** source is always worth flagging
>      separately as `wikipedia_duplicate` regardless of its `source_type` —
>      the saint's own `wikipedia_url` field already covers this and a
>      `saint_sources` row for it renders as a duplicate reference. (Not an
>      issue on miracle sources.)
>    - Anything else (miraclehunter.com, an apologetics/advocacy nonprofit
>      blog, a diocesan historical/archival center page, a retailer's
>      devotional blog, a parish/diocese page that isn't a decree, a local
>      bishop's recognition letter) → `other` is usually correct as-is; only
>      flag if it was mis-tagged as one of the more specific categories
>      above.
>
> Return **only** a JSON array, one object per input source:
> `{ source_id, kind, status, current_source_type, suggested_source_type, note }`
> where `status` is one of `ok`, `dead`, `mismatch`, `type_mismatch`,
> `wikipedia_duplicate`, `needs_review`. Set `suggested_source_type` only
> when `status` is `type_mismatch`; otherwise omit it. Keep `note` to one
> sentence — the reason, not a restatement of the status.

### Merge, update the dead-links archive, and write the report

Collect every batch's JSON array (or your own direct-fetch results for small
runs) into one list keyed by `source_id`.

**First, reconcile `dead` findings against `context/Notes/dead-links-archive.md`**
(create the file with an `## Active` and `## Resolved` heading if it doesn't
exist yet):

- Any source with `status: dead` this run: if a matching **Active** entry
  (same `source_id`) already exists, just bump its `Last checked` date. If
  it's new, add an entry with `First flagged: <today>` and `Last checked: <today>`.
- Any URL currently listed under **Active** that came back `ok` in *this*
  run (it can happen if a full audit re-covers a previously dead source) —
  move it to **Resolved** with today's date, same as recheck mode does.
- Leave everything else in the archive untouched.

Then write a markdown report to `context/Notes/source-verification-<YYYY-MM-DD>.md`
(today's date), structured as:

1. **Summary** — counts: total checked, `ok`, and each issue status. Note the
   scope (full audit vs. the saint/miracle/limit the user asked for).
2. **Flagged sources**, grouped by status, most actionable first. For `dead`,
   don't repeat the full detail — one line pointing at the archive (e.g.
   "`dead` (3) — see `dead-links-archive.md`, N new this run, M carried
   over"). Then `mismatch`, `wikipedia_duplicate`, `type_mismatch`,
   `needs_review` in full, same as before. Skip `ok` rows entirely — they're
   already covered by the summary count.
3. Nothing else — no "ok" listing, no recommendations beyond what's in the
   notes. This is a checklist for the user to work through directly in the
   database, not a narrative report.

### Tell the user

Report the file path, the headline counts (e.g. "212 ok, 9 flagged: 3 dead
links, 4 mismatches, 2 wikipedia duplicates"), mention the dead-links archive
was updated (N new / M still active / K resolved), and remind them nothing
was changed in the database — every fix happens by hand in the database.
