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

## Decision: primary medical records are permanently unlinkable, not a gap to chase

Checked directly (2026-09-29) where the actual medical evidence behind a cause lives: for Vatican causes, the *Consulta Medica*'s findings are folded into the cause's **Positio**, held in the Dicastery for the Causes of Saints' own archive in Rome — never published. For Lourdes, the **Bureau des Constatations Médicales** and **CMIL** hold case files at the Sanctuary itself; the one peer-reviewed academic retrospective that got inside them (Francois & Sternberg, "The Lourdes Medical Cures Revisited," PMC/NIH) only did so with special authorization from the local bishop, and still couldn't get full detail on some recent cases.

**Decision:** treat this as a permanent structural fact, not an open sourcing gap. Don't task future work with "find the primary medical file" for any miracle — it isn't published, by design, for privacy and process reasons on both the Vatican and Lourdes sides. This is also *why* the Vatican's own decree bulletins and homilies (see `source-coverage-gaps.md`'s 41-item Tier 1 bucket) never name a specific miracle recipient: the document type that would identify the patient is exactly the sealed one. The site's sourcing standard already reflects this — Tier 2 corroboration (Catholic press, academic retrospectives, the shrine's own account) is accepted specifically because it's the best obtainable evidence, not a placeholder for something better that just hasn't been found yet.

## Open gaps against this standard

Tracked as a living list in [`source-coverage-gaps.md`](./source-coverage-gaps.md), not here — that file gets updated in place each time coverage mode runs, rather than accumulating a new dated snapshot per audit.
