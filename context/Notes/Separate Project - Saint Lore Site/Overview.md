NOT PART OF THE MIRACLE REGISTER

This folder is research scratch space only. Nothing here describes TheMiracleRegister.org,
its data model, or its content. Do not pull anything from this folder into the main
project's schema, copy, or sourcing standard. If this idea goes anywhere, it's a separate
site/repo, not a feature of this one.

---

## The idea

A companion-but-separate site exploring saint and miracle *lore* — legendary, apocryphal,
oral-tradition, or otherwise unverified stories — explicitly without the Vatican-documentation
/ medical-verification bar that TheMiracleRegister holds itself to. More narrative, more
"here's a story people tell," less "here's the decree and the medical board verdict."

Rationale for keeping it separate (see conversation 2026-10-03): the Register's value
proposition depends on "if it's on this site, it's rigorously sourced" holding without
exception. Mixing in unverifiable lore, even clearly labeled, erodes that over time. The two
projects also want different schemas (single-source-of-truth rows vs. multiple conflicting
variants of the same legend) and different tone.

## Positioning & audience (decided 2026-10-03)

The two sites are a complementary pair, but not two altitudes of the same credibility
question — they serve different purposes that happen to share subject matter:

- **The Miracle Register** — evidentiary reference. "Here's a documented case that holds up to
  scrutiny." Audience: skeptics, researchers, journalists citing a verified case.
- **This lore site** — cultural/heritage storytelling. "Here's the story people tell and where
  it came from — we're not claiming it's verified." Audience is explicitly *not* skeptics;
  someone who needs proof will bounce off this site by design.

Likely audience segments for the lore site, roughly by expected size:

1. **Practicing/cultural Catholics** wanting the "why do we do this" answer behind a tradition
   their family already observes (St. Joseph's Table, shoes out on Dec. 6, etc.) — closer to a
   heritage/lifestyle audience than a religious-studies one.
2. **Folklore/mythology enthusiasts generally** — readers of world-mythology and legend content
   who wouldn't necessarily seek out "Catholic" content specifically, but will read a good
   dragon-slaying or shapeshifting-stag story regardless of the tradition it comes from.
3. **Parents/educators** — homeschool co-ops, Catholic school teachers, Sunday school curricula
   already lean on this exact material (Francis and the wolf, Nicholas's gifts) as teaching
   content.
4. **Historians/sociologists of religion, folklorists** — smaller but real; most reliant on the
   provenance/variant-tracking approach being done carefully rather than flattened into a
   single "official" version.
5. **Believers seeking devotional/inspirational reading** — overlaps heavily with #1.

Cross-link story between the two sites: "Want the verified miracle record for this saint? →
Register. Want the folklore and traditions around them? → Lore site."

## Scope guardrails (decided 2026-10-03)

- **Catholic only.** No cross-religious syncretism content (e.g. Santeria, indigenous-religion
  blending, Day of the Dead as a syncretic case study). Folk traditions covered should be
  Catholic practice/custom, even where the historical record shows outside influence — don't
  go looking for or foregrounding that angle.
- **Not dark.** No horror framing, no gore, no dwelling on martyrdom detail, no
  exorcism/demonic content. Tone stays warm and devotional/curious, closer to "charming story
  behind a tradition" than "creepy unexplained phenomenon."
- These two rules override any individual content idea below — if a specific legend or
  tradition can't be told without crossing one of them, cut it rather than sanitize it into
  something misleading.

## Content pillars (the two the user wants to lead with)

### 1. Legendary biography material

The parts of saints' lives that are folklore/hagiography rather than historical record —
told as "here's the story, here's roughly how old it is, here's what's legend vs. attested."

- Saint-and-creature legends: St. Christopher carrying the Christ child, St. George and the
  dragon, St. Patrick and the snakes, St. Francis preaching to the birds / the Wolf of Gubbio,
  St. Jerome and the lion, St. Blaise and the wolf
- Origin stories for specific patronages — why a saint ended up patron of a surprisingly
  specific thing (e.g. Cecilia/music, Nicholas/sailors and children via the dowry-gift story,
  Apollonia/dentistry via her martyrdom account)
- Legendary rescue/protection episodes from a saint's own lifetime (pre-death), distinct from
  posthumous intercession miracles — Nicholas and the three girls' dowries, Nicholas calming a
  storm at sea
- Founding legends: how a specific shrine, church, or town got its name/location from a saint
  story (apparition-on-this-spot type legends, discovery-of-a-statue stories)
- *Golden Legend*-style medieval material generally — this is the original source genre for a
  lot of the above, good as both content and a "here's where these stories come from" frame

### 2. Catholic folk traditions and where they came from

Explaining the "why do we do that" behind customs people already observe, kept inside
Catholic practice (not comparative religion).

- Feast-day customs: St. Nicholas Day shoes/stockings, St. Lucy's Day crowns and candles,
  St. Joseph's Day altars/tables, St. Blaise throat blessing, St. Agnes' Eve folk customs
- Liturgical-object traditions: why palms on Palm Sunday, ashes on Ash Wednesday, candles at
  Candlemas — the folk practice layered on top of the liturgical meaning
- Food traditions tied to saints or seasons: king cake for Epiphany, pretzels in Lent,
  St. Joseph's Day zeppole/fave beans, fish on Fridays
- Regional patronal festivals as a genre (Italian feste, Spanish fiestas patronales, Irish
  pattern days) — covered as Catholic regional variation, not cross-tradition syncretism
- Naming traditions: saint's name days, naming children after saints, the custom's history
- Weather/agricultural folklore tied to saints (e.g. St. Swithin's Day rain lore) — fine as
  long as it stays folk-Catholic rather than drifting into unrelated folk-magic territory

## Relationship to existing-sites research

`context/Notes/Existing Miracle Websites.md` (TheMiracleRegister's competitive landscape doc)
is the reference point for checking whether this idea duplicates something already out there.
Quick read against that doc:

- **Closest existing match: Glenn Dallaire's network** (miraclesofthechurch.com /
  miraclesofthesaints.com, entry #9). Devotional blog, content curated from pre-existing
  hagiographic sources, organized by miracle type (stigmata, bilocation, incorrupt bodies,
  prophecy, etc.), explicitly not sourced to Vatican primary documents. This is the same
  *kind* of material a lore site would cover — the gap isn't the subject matter, it's the
  format: Dallaire's site is a static Blogger blog with no structure, search, filtering, or
  per-story metadata (date, region, saint, motif type).
- **Saintapedia** (#10) is wiki-style and user-editable but still aims at factual/biographical
  accuracy, not lore-as-lore — different posture even though it's unverified in practice.
- **The Miracle Hunter** (#2) and Carlo Acutis' exhibition (#1) are both narrower in scope
  (apparitions/Eucharistic) and don't frame themselves as legend/folklore at all.
- No site in that list treats "this is a traditional story, possibly embellished or
  regional-variant, here's what's known about its provenance" as the organizing principle.

Tentative read: a *structured, searchable* database of saint/miracle lore — with fields like
region, earliest known source, variant tracking, and explicit "unverified" framing as a
feature rather than an apology — would not be duplicating Dallaire's site any more than
TheMiracleRegister duplicates Vatican News. Same gap pattern as the Register: the subject
matter has coverage, the structured/searchable/filterable treatment doesn't.

## First-pass content drafts

- `Pillar 1 - Legendary Biography Material.md` — saint-and-creature legends, patronage origin
  stories, founding/shrine legends, "meta-legends" about how a cultus forms
- `Pillar 2 - Catholic Folk Traditions.md` — feast-day customs, liturgical-object traditions,
  food traditions, regional patronal festivals, naming traditions, weather folklore
- `Pillar 4 - Mystical Phenomena from Saints' Lives.md` — bilocation, levitation, inedia,
  luminosity, odor of sanctity. Confirmed 2026-10-03, prompted by a question about whether
  Padre Pio's bilocation stories belong here rather than on the Register. Resolved as
  **dual-site, not either/or**: `bilocation-of-padre-pio` is now published on the Register
  (with a closing paragraph noting the evidence is eyewitness testimony only, unlike his
  medically-examined stigmata) and will also get a narrative-voice version on the lore site.
  General rule going forward: a mystical phenomenon can live on both sites if the Register's
  write-up is explicit about testimony-only evidence rather than implying stigmata/
  incorruptibility-level documentation. Flags weeping/bleeding statues and formally-recognized
  private revelations as separate borderline cases still needing their own per-case decision.

## Possible future pillars (not started — need their own scope conversations)

- **Halloween and All Saints'/All Souls' Day** — rich territory (All Hallows' Eve lineage,
  praying for souls in purgatory, Day of the Dead-adjacent Catholic practice) but closer to
  "darker" than the current guardrails allow. Don't draft this until scope is explicitly
  revisited — see parked note at the end of Pillar 2.
- **UNDECIDED — Biblical artifacts and legendary relics** (Noah's Ark, Ark of the Covenant,
  Holy Grail, True Cross, etc.) — raised 2026-10-03, explicitly not yet approved. First-pass
  research in `Pillar 3 (UNDECIDED) - Biblical Artifacts and Legendary Relics.md`. Two open
  concerns flagged there: (1) pseudo-archaeology/sensationalism risk if not handled carefully,
  and (2) these stories predate Catholicism (shared Hebrew Bible material), which sits oddly
  against the "Catholic only" guardrail unless narrowed to the Catholic veneration/pilgrimage
  tradition around the object rather than the underlying Bible story. Do not treat this as a
  confirmed pillar — it needs an explicit decision before any content gets drafted.

## Open questions (not yet answered)

- Scope: all Catholic lore broadly, or just lore tied to saints/miracles already adjacent to
  the Register's subject matter?
- Data model shape for "conflicting variants of the same story" — is a variant its own row,
  or a parent legend with child variants?
- How much, if any, overlap in tech stack / reused code vs. the Register (see prior
  conversation: Astro/Hono/Drizzle stack and saints-table shape are plausibly reusable; the
  sourcing/verification schema is not).
- Name/branding — needs to read as clearly distinct from "The Miracle Register" so readers
  don't confuse the two projects' credibility bars.
