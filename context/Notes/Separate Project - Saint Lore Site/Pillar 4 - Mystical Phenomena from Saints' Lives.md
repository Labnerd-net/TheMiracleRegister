First pass — working list, not final. See Overview.md for scope guardrails (Catholic only,
not dark). Confirmed as a pillar 2026-10-03, prompted by a question about whether Padre Pio's
bilocation stories belong here rather than on TheMiracleRegister.

## Why these fit here (and sometimes on the Register too)

TheMiracleRegister's own research notes
(`context/Notes/Research/Miraculous and Saintly Phenomena/Miraculous and Saintly Phenomena —
Overview.md`) say it directly: these phenomena are "not 'approved' as a category in the way
apparitions or Eucharistic miracles are" — no Vatican dicastery process, no medical board
verdict, no decree. They're testimonial accounts woven into canonization causes and popular
devotion, not documented evidence the way an intercessory healing is. That's exactly the
"here's a story people tell" posture this site is built around.

**Decided 2026-10-03: this doesn't mean exclusive to the lore site.** Padre Pio's bilocation
is now published on both sites, each in its own voice — resolved below under Bilocation. The
general rule that came out of that decision: a phenomenon can live on the Register too if the
write-up is honest about the evidence type (testimony vs. physical examination), rather than
implying it carries the same weight as stigmata or incorruptibility. Decide case by case.

## Categories (pulled from the existing research note, retold in lore-site voice)

### Bilocation (being in two places at once)

- **St. Padre Pio** — the case that prompted this pillar. **RESOLVED, dual-site 2026-10-03:**
  now published on the Register as `bilocation-of-padre-pio` (General Cadorna's 1917 account,
  WWII bomber pilots over San Giovanni Rotondo), with a closing paragraph there explicitly
  noting the evidence is eyewitness testimony only, unlike his medically-examined stigmata. The
  lore-site version can reuse the same two anecdotes and sources (EWTN, padrepio.org) but tell
  them in pure narrative voice, no evidentiary caveat needed.
- **St. Martin de Porres** — reported bilocating to China, Japan, and Africa to help the poor
- **St. Francis Xavier** — reported preaching ashore while physically at sea
- **St. Anthony of Padua** — reported preaching in two places simultaneously
- **St. Gerard Majella**, **Ven. Maria of Agreda**, **St. Alphonsus Liguori** — further
  reported cases, good for a "this phenomenon has centuries of reported cases" framing

### Levitation

- **St. Joseph of Cupertino** — far and away the most famous; dozens of reported incidents
  during Mass and prayer, reportedly rising high enough that others had to pull him down. Great
  anchor story for this category.
- **St. Teresa of Avila**, **St. John of the Cross**, **St. Francis of Assisi**,
  **St. Philip Neri** (reportedly into tree branches — a nice specific detail), **St. Alphonsus
  Liguori**, **St. Gemma Galgani**, **Bl. Anne Catherine Emmerich**

### Inedia (living without ordinary food)

- **St. Catherine of Siena**, **St. Nicholas of Flue** (reportedly 19 years), **St. Lidwina of
  Schiedam**, **St. Rose of Lima**, **Bl. Anne Catherine Emmerich** — classic-era cases
- **Therese Neumann**, **Marthe Robin**, **Bl. Alexandrina da Costa**, **Luisa Piccarreta** —
  20th-century cases, some with physician observation reported at the time. Good candidates for
  "here's what was reported and by whom," since these are more recent and better-documented as
  *claims* even though not Vatican-verified as miracles.

### Luminosity / supernatural light ("photisms")

- Saints reported surrounded by or emitting light during prayer or ecstasy: **St. Francis of
  Assisi**, **St. Padre Pio**, **St. Teresa of Avila**, **St. Philip Neri**, **St. Martin de
  Porres**, **St. John Bosco**. Short, visual, easy devotional content.

### Odor of sanctity

- Supernatural fragrance reported at death or from relics: **St. Teresa of Avila** (lily-like),
  **St. John Bosco**, **St. Padre Pio** (his stigmata wounds reportedly smelled of violets,
  contrasted with the usual smell of a wound — tell this fact without dwelling on the wound
  itself, per the "not dark" guardrail), **St. Gerard Majella**. **St. Charbel Makhlouf**'s case
  involves a blood-like exudate from his body — flag as a borderline/skip candidate, since
  describing bodily fluid risks tipping past "warm," not "dark."

## Borderline categories — need a case-by-case call, not a blanket include

- **Weeping/bleeding statues and images** (Our Lady of Akita, Our Lady of Syracuse, Our Lady of
  Civitavecchia, etc.) — some of these actually carry real local-bishop approval and even
  scientific examination (Civitavecchia had DNA testing done on the blood). That approval
  history arguably makes them a better fit for *the Register* (which already has a
  `miraculous_image` type and a `local_bishop` approval-authority value) than for this lore
  site. Decide per-case rather than routing the whole category here by default.
- **Prophecy / private revelations** — the Register's `type` enum already includes `prophecy`,
  and some revelations in this space are formally Church-recognized (the Sacred Heart
  revelations to St. Margaret Mary Alacoque, the Divine Mercy revelations to St. Faustina).
  Formally recognized ones likely belong on the Register if the saint is covered there;
  unrecognized/in-progress ones (e.g. Luisa Piccarreta's Divine Will messages, still not fully
  approved) are better lore-site material.

## Research source

All of the above is pulled from the project's own prior research note at
`context/Notes/Research/Miraculous and Saintly Phenomena/Miraculous and Saintly Phenomena —
Overview.md` (compiled June 6, 2026, sourced from Miracle Hunter, Catholic Encyclopedia, and
saint biographies) — that note was written for the Register and never used, since none of this
category fits the Register's verification bar. Worth treating as the starting bibliography for
this pillar rather than re-researching from scratch.
