---
name: proofread
description: Proofreads the narrative free-text columns in the Neon DB (miracles.synopsis, miracles.cure_details, miracles.medical_diagnosis, saints.biography_short) for spelling, grammar, run-on sentences, and structural issues (paragraph length, repetitive sentence openers, passive-voice overuse, pacing), plus cross-record spelling consistency for saint/recipient/location names. Use when asked to proofread, copyedit, check writing quality, or check for run-ons on one or more miracle/saint records. Produces a dated report under `context/Notes/` - never edits DB records itself. Does not check em dashes (`npm run check:data` already enforces that) or tone (this site's clinical/evidentiary voice is correct as written, not a defect).
---

# proofread

Checks prose quality on this site's case-narrative and biography text, read
from the Neon DB - not markdown files (see `CLAUDE.md`: "Data is managed
directly in the database"). This is a judgment pass, not a mechanical lint -
run-ons, pacing, and spelling-consistency are read, not regex-matched, so do
the check yourself rather than reaching for a script.

**Report only.** This skill never writes to the database. It writes findings
to a dated report; the user applies fixes by hand via the Neon console/SQL,
same workflow as `verify-sources`.

## Scope notes specific to this site

- **Don't flag clinical/evidentiary phrasing as a tone problem.** Unlike a
  narrative-lore site, this site's correct voice *is* measured and
  fact-forward ("the attending physician documented...", "the tribunal
  concluded..."). Only flag actual writing defects (run-ons, passive-voice
  overuse, repetitive openers), never a lean toward precision/clinical
  language.
- **Don't check em dashes.** `npm run check:data` already flags them in
  every free-text column and exits non-zero - this skill would just
  duplicate that check with worse coverage (it only looks at what's in
  scope for a given run). If you notice one anyway, mention it in passing,
  but don't make it a category.
- **`medical_diagnosis` is often a short clinical phrase, not full prose**
  (e.g. "stage IV glioblastoma") - still check spelling, but don't flag it
  for pacing/structure the way `synopsis`/`biography_short` paragraphs get
  checked.
- **`vatican_medical_board_verdict` is out of scope entirely** - it
  paraphrases a sealed Vatican document rather than site-authored
  narrative, so rewriting it for style would risk misrepresenting what the
  board actually said. The dump script excludes it.
- **Compare paragraph length within the same `content_tier`, not across
  tiers.** `catalog` records intentionally run shorter (per `CLAUDE.md`:
  "short synopsis + external links") than `core` records' 300-500 word
  narratives - a short `catalog` synopsis is by design, not a pacing defect.

## Step 0 - scope from `$ARGUMENTS`

- A saint slug (e.g. `john-paul-ii`) -> pass `--saint=<slug>` to the dump
  script - only that saint's biography.
- A miracle slug -> pass `--miracle=<slug>` - just that one miracle's text.
- "published" / "published only" -> default behavior (see below) - no flag
  needed.
- "include unpublished" / "drafts too" -> pass `--include-unpublished`.
- A bare number (e.g. "check 20") -> pass `--limit=<n>` for a sample run.
- Nothing specified -> full scan, published only (86 miracles + 28 saints
  as of this writing - unpublished drafts are excluded by default here,
  unlike the HallowedTales version of this skill, because most unpublished
  rows are incomplete stubs mid-entry rather than finished drafts awaiting
  a proofread pass; pass `--include-unpublished` explicitly if that's what's
  wanted).

Don't guess slugs - if the user names a saint/miracle in prose, resolve it
to the slug via a quick DB lookup rather than assuming spelling.

## Dump the data

Run from the repo root:

```bash
npx tsx .claude/skills/proofread/scripts/dump-text.ts [flags]
```

Read-only (`SELECT` only). Prints `{ miracles: [...], saints: [...] }`, each
record with its prose fields plus `slug`/`title`/`name`/`content_tier`/
`recipient_name`/`location_name` for context. Each miracle also carries a
`saints` array (`slug`/`name`/`saint_name`/`birth_name`) for the saint(s)
actually linked to it via `miracle_saints` - use that, not the top-level
`saints` list, to cross-check a name mentioned in a miracle's `synopsis`
against the saint it belongs to. `--miracle`/`--saint` each zero out the
other top-level list (the miracle's embedded `saints` still carries what a
`--miracle` run needs for the name check). Redirect to a temp file rather
than reading the raw output inline for a full run.

## Reading the data

At full scope this is ~120 records - well past the point of reading
everything directly. For a **scoped run** (single `--saint`/`--miracle`, or
`--limit` under ~15), just read the dump's JSON directly, no subagents
needed. For a **full or large-sample run**, split into batches of ~20-25
records and dispatch `general-purpose` agents in parallel (one message,
multiple calls, `run_in_background: false` since the report needs every
batch back), each returning findings as structured text rather than full
record content.

## What to check

**Spelling and grammar.** Typos, tense consistency within a paragraph,
subject-verb and pronoun-antecedent agreement, basic punctuation.
Cross-check a saint/recipient/place name's spelling
against its own `name`/`saint_name`/`birth_name`/`recipient_name`/
`location_name` field and against other records mentioning the same
person or place (e.g. a saint's name spelled one way in their own
`biography_short` and differently inside a linked miracle's `synopsis` -
use the miracle's embedded `saints` array, which reflects the actual
`miracle_saints` link, to find the right saint record rather than guessing
from the name alone) - inconsistent spelling of the same name across
records is still a spelling issue even if each instance is internally
consistent on its own.

**Date formatting.** House style is month-day-year, spelled out
("September 19, 1846"). Flag a stray day-month-year ("19 September 1846")
or numeric form ("9/19/1846") inside the prose fields as an inconsistency,
not a tone issue.

**Run-on sentences.** A sentence stacking more than two independent
clauses, or a comma splice joining two complete thoughts without a
conjunction. Quote the sentence and suggest where it would split.

**Structure and pacing.**
- Paragraphs noticeably longer than the entry's others, or a wall of text
  with no natural break - compared within the same `content_tier` (see
  scope note above).
- Repetitive sentence openers (three-plus sentences in a row starting the
  same way) within one record.
- Passive voice used often enough to flatten the narrative, as opposed to
  occasional deliberate use (e.g. "the cure was independently confirmed by
  three physicians" is a legitimate passive when the agent genuinely isn't
  the point).
- Pacing: does the entry front-load setup and rush the actual event/cure,
  or vice versa?

## Writing the report

Write to `context/Notes/proofreading-<YYYY-MM-DD>.md` (today's date; create
`context/Notes/` if it doesn't exist - it already exists in this repo).
Structure:

1. **Summary** - records checked, scope, and a one-line count per category
   (e.g. "22 records checked: 3 run-ons, 2 name-spelling mismatches, 1
   pacing note").
2. **Findings grouped by record** (slug + whether miracle/saint), each as a
   short list: `[category] quote or location - the issue - suggested fix`.
   Keep the quote short. Skip records with nothing to flag entirely rather
   than listing them as clean.
3. Nothing else - no restating what's already correct, no general writing
   advice not tied to a specific record.

## Tell the user

Report the file path and the headline counts from the summary, and remind
them nothing was changed in the database - fixes happen by hand via the
Neon console/SQL, same as `verify-sources`. If the user asks to apply the
fixes afterward, that's a normal follow-up (update the row directly), not a
re-run of this skill.
