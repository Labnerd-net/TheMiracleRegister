# Source Requirements — Decisions & Rationale

Records *why* the sourcing standard is shaped the way it is. The operative rules an agent actually checks against live in `.claude/skills/verify-sources/SKILL.md` (coverage mode) — this file is not re-checked by the skill and exists for human context only. If the two ever disagree, `SKILL.md` wins; update it first, then update this file's rationale to match.

Agreed 2026-09-29, in discussion prompted by: "what would skeptics or researchers need for proof of miracles" and "there's nothing official for saints, so what do we need."

## Why miracles and saints need different standards

Canonization miracles go through an actual adjudication process (diocesan tribunal → Consulta Medica → dicastery decree, or the Lourdes Bureau/CMIL equivalent) — there's a real document to point to. A saint's *biography*, by contrast, is never adjudicated — the canonization decree confirms the miracle used for the cause, not the accuracy of the life story. Treating both the same way (e.g. "needs a Vatican source") would either under-demand rigor on miracles or chase a kind of document that doesn't exist for saints.

## Decision: non-dicastery miracles (apparitions, stigmata, incorruptibles, Eucharistic miracles)

Considered three options for the ~20+ core miracles with no dicastery decree: (a) require the local ordinary's own approval document where findable, falling back to an official-account-plus-corroboration bundle where no such document exists; (b) treat the official shrine/custodial org's own account as sufficient primary evidence without searching for a bishop document; (c) formally accept these as permanently lower-tier evidence.

**Chose (a).** Reasoning: some of these do have a real, findable ordinary's declaration (Akita's Bishop Ito, for instance) and defaulting straight to (b) would mean settling for weaker evidence than actually exists in those cases. But for the majority — where no formal decree was ever published because none was required (most Marian apparitions) — demanding one is a search for something that doesn't exist, so the bundle rule catches those without blocking the case indefinitely.

## Decision: saint biography sourcing

Considered requiring a scholarly biography (book/academic press) be tracked down for every saint, vs. accepting a credible order/diocesan/shrine site as sufficient.

**Chose the latter.** Reasoning: a religious order's or diocese's own archive has real editorial accountability and is usually easier to verify than chasing down out-of-print biographies for saints who may not have a widely available scholarly treatment (e.g. lesser-known 20th-century beatifications). Reserve the extra research effort for cases where a scholarly source is genuinely easy to find, rather than making it a blocking requirement everywhere.

## Open gaps against this standard

Tracked as a living list in [`source-coverage-gaps.md`](./source-coverage-gaps.md), not here — that file gets updated in place each time coverage mode runs, rather than accumulating a new dated snapshot per audit.
