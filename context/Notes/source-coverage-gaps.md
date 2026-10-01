# Source Coverage Gaps

Living tracker for records whose sourcing doesn't yet meet the standard defined in the `verify-sources` skill's coverage mode (`.claude/skills/verify-sources/SKILL.md`). Unlike `dead-links-archive.md`, gaps here don't decay with time — a record stays open until someone adds the missing source in the database. Consolidates and supersedes the now-deleted `Missing Primary Sources.md` and `Source Requirements Audit - 2026-09-29.md`; their content is folded in below.

**When re-running coverage mode:** anything below no longer reproducing moves to `## Resolved` with today's date. Anything new gets added under the relevant heading with today's date as "first flagged." Don't re-open a `## Resolved` entry unless it's genuinely regressed (note why, if apparent).

## Open

### Core miracles used for beatification/canonization — missing Tier 1 (`vatican_decree` on vatican.va) — 41

First flagged 2026-09-28 (33) / 2026-09-29 (8, see tags below). All have `approval_authority: vatican_dicastery`, so the bar is a `vatican_decree` source hosted on vatican.va. Three of the 2026-09-29 additions (tagged "newly resolved mismatch") are a direct result of fixing tier-1 content-match findings — recategorizing a thematic homily out of `vatican_decree` correctly exposed that no real replacement exists, per the new heuristic now documented in `SKILL.md`. The other 5 (tagged "confirmed durable gap") were the miracles that lost their vatican_decree row in the 2026-09-28 dedup cleanup — each saint's shared homily was individually re-checked on 2026-09-29 and confirmed not to name the recipient, and no Escrivá-style case-specific vatican.va page could be found for any of them, so these are genuine, confirmed gaps rather than an open policy question.

- `healing-of-angela-testoni` — Maximilian Kolbe (beat) — existing: other
- `healing-of-anne-theresa-oneill` — Elizabeth Ann Seton (beat) — existing: news_article, academic, other, other, news_article
- `healing-of-audrey-toguchi` — Father Damien (canon) — existing: news_article, news_article, news_article
- `healing-of-benedicta-mccarthy-from-acetaminophen-poisoning` — Edith Stein (canon) — existing: other, news_article, news_article
- `healing-of-carl-kalin` — Elizabeth Ann Seton (canon) — existing: news_article, news_article
- `healing-of-carmen-valencia` — Louis Martin, Zélie Martin (canon) — existing: other, news_article, other
- `healing-of-charles-anne` — Thérèse of Lisieux (beat) — existing: other, news_article
- `healing-of-consiglia-de-martino` — Padre Pio (beat) — existing: other, other, news_article
- `healing-of-deacon-jack-sullivan` — John Henry Newman (beat) — existing: news_article, news_article, other, other
- `healing-of-domenico-sellan` — Pier Giorgio Frassati (beat) — existing: news_article
- `healing-of-eva-benassi-from-peritonitis` — John Neumann (beat) — existing: other, other
- `healing-of-floribeth-mora-diaz` — Pope John Paul II (canon) — existing: news_article
- `healing-of-fr-ronald-pytel` — Faustina Kowalska (canon) — existing: other, other, news_article
- `healing-of-francis-ranier` — Maximilian Kolbe (beat) — existing: other
- `healing-of-giuseppe-carlo-audino` — Brother Andre (beat) — existing: news_article, news_article — **2026-09-29: confirmed durable gap.** Lost its only `vatican_decree` row 2026-09-28 as an exact-URL duplicate of Brother André's saint-page homily; re-checked that homily on 2026-09-29, it doesn't name Audino or Rochester, so no substitute exists.
- `healing-of-henri-boisselet` — Bernadette Soubirous (beat) — existing: academic
- `healing-of-jake-finkbonner` — Kateri Tekakwitha (canon) — existing: news_article ×4
- `healing-of-james-fulton-engstrom` — Fulton Sheen (beat) — existing: news_article ×3, other
- `healing-of-juan-jose-barragan-silva` — Juan Diego (canon) — existing: news_article — **2026-09-29: confirmed durable gap**, same cause as Audino above; Juan Diego's saint-page homily re-checked, doesn't name Barragán Silva or Querétaro.
- `healing-of-juan-manuel-gutierrez` — Pier Giorgio Frassati (canon) — existing: news_article ×3 — **2026-09-29: confirmed durable gap.** Its `vaticannews.va` source was correctly recategorized `vatican_decree` → `news_article` 2026-09-28 (it's press coverage of the decree, not the decree). Searched for an Escrivá-style case-specific vatican.va page (Frassati's is a very recent, high-profile 2025 canonization) — none found; only press coverage exists.
- `healing-of-kent-lenahan-from-traumatic-injuries` — John Neumann (beat) — existing: other, academic, other
- `healing-of-lucas-maeda-de-oliveira` — Francisco Marto, Jacinta Marto (canon) — existing: news_article ×3, other ×2, news_article
- `healing-of-lucia-sylvia-cirilo` — Gianna Beretta Molla (beat) — existing: other — **2026-09-29: confirmed durable gap**, same cause; both of Gianna Beretta Molla's saint-page vatican_decree sources re-checked, neither names Cirilo or Grajaú.
- `healing-of-marcilio-haddad-andrino` — Mother Teresa (canon) — existing: news_article — **2026-09-29: confirmed durable gap**, same cause; Mother Teresa's saint-page homily re-checked, doesn't name Andrino or Santos.
- `healing-of-maria-emilia-santos` — Francisco Marto, Jacinta Marto (beat) — existing: other
- `healing-of-matheus` — Carlo Acutis (beat) — existing: news_article
- `healing-of-matteo-pio-colella` — Padre Pio (canon) — existing: news_article, other, news_article
- `healing-of-maureen-digan` — Faustina Kowalska (beat) — existing: news_article
- `healing-of-melissa-villalobos` — John Henry Newman (canon) — existing: news_article ×3, other, news_article
- `healing-of-michael-flanigan-from-bone-cancer` — John Neumann (canon) — existing: other ×3
- `healing-of-monica-besra` — Mother Teresa (beat) — existing: other, news_article — **2026-09-29: newly resolved mismatch.** Its `vatican_decree` (Mother Teresa's beatification homily) was recategorized to `other` after content-match confirmed it never names Besra; a case-specific `news_article` (Washington Post) was added in its place. No vatican.va page names Besra specifically, so this is a genuine, durable Tier 1 gap, not a data-quality bug.
- `healing-of-native-american-boy` — Kateri Tekakwitha (beat) — existing: **none at all** — investigate from scratch, not just a missing decree.
- `healing-of-pietro-schiliro` — Louis Martin, Zélie Martin (beat) — existing: other, news_article
- `healing-of-sister-louise-of-saint-germain` — Thérèse of Lisieux (beat) — existing: other, news_article
- `healing-of-sister-marie-de-saint-fidele` — Bernadette Soubirous (canon) — existing: academic
- `healing-of-sister-marie-melanie-meyer` — Bernadette Soubirous (beat) — existing: academic
- `healing-of-sr-concepcion-boullon-rubio` — Josemaría Escrivá (beat) — existing: other ×2 — **2026-09-29: newly resolved mismatch**, same pattern as Besra above. No vatican.va page names her specifically (the real CCS decree text exists but only mirrored on `opusdei.org`, which doesn't satisfy the vatican.va hosting rule), so this is a durable Tier 1 gap.
- `healing-of-sr-gertrude-korzendorfer` — Elizabeth Ann Seton (beat) — existing: news_article
- `healing-of-sr-marie-simon-pierre` — Pope John Paul II (beat) — existing: news_article ×2, other — **2026-09-29: newly resolved mismatch**, same pattern as Besra above. A case-specific `news_article` (NCR, her own first-person account) was added; fetch was blocked so content wasn't independently re-confirmed, worth a manual spot-check.
- `healing-of-sr-simplicia-hue` — Father Damien (beat) — existing: news_article
- `healing-of-valeria-valverde` — Carlo Acutis (canon) — existing: news_article

### Catalog-tier miracles with no Tier 2 source — 13

First flagged 2026-09-29. The 12 that were zero-source got an official shrine/parish/vatican.va source added 2026-09-29 (see `## Resolved` for what and why) — moved from "nothing on file" to "something," but every added source is `source_type: other` (official sites, not Catholic press/book/academic), so none of them actually clear the catalog tier's Tier 2 bar yet. Same shape as the pre-existing `beatification-miracle-of-catherine-laboure` gap, so folding them into the same bucket rather than closing it out.

Has a source, but it's `other` not Tier 2 (13): `beatification-miracle-of-catherine-laboure`, `our-lady-of-la-salette`, `our-lady-of-pontmain`, `our-lady-of-knock`, `our-lady-of-siluva`, `our-lady-of-banneux`, `our-lady-of-medjugorje`, `our-lady-of-beauraing`, `our-lady-of-laus`, `our-lady-of-philippsdorf`, `our-lady-of-gietrzwald`, `our-lady-of-kibeho`, `canonization-miracle-of-catherine-laboure`.

### Core apparitions/phenomena (not used for beat/canon) — bundle rule gaps — 11

First flagged 2026-09-29. Per the standard's fallback rule for `approval_authority: none`-shaped cases (applied here regardless of the DB's actual `approval_authority` value, since these rarely have a real dicastery decree): needs an official shrine/diocesan account **and** an independent Tier 2 source.

Missing the official/shrine leg (has press, no official account):
- `bilocation-of-padre-pio` — only EWTN + a devotional blog; no San Giovanni Rotondo friary/shrine source
- `incorruptibility-of-bernadette-soubirous` — no source from the Convent of St. Gildard (Nevers), where her body rests
- `our-lady-of-akita` — no copy of Bishop Ito's 1988 declaration itself, only press about it
- `eucharistic-miracle-of-buenos-aires` — no parish/archdiocesan source for the event location
- `incorruptibility-of-pier-giorgio-frassati` — single news article only

Missing the corroborating leg (has official account, no independent press/academic):
- `tilma-of-guadalupe` — 3 shrine-type sources, zero press/academic despite substantial published material on the tilma's fiber analysis
- `our-lady-of-the-miraculous-medal` — 2 official org sources, zero press
- `our-lady-of-lourdes` — single official sanctuary link, zero press
- `divine-mercy-revelations` — 2 devotional-org sources, zero press, and no vatican.va document despite JPII's well-documented direct involvement

Missing both:
- `stigmata-of-padre-pio` — single source is an obscure devotional blog; no shrine/friary source, no press, despite this being one of the best-documented phenomena on the site

Borderline / already tracked in `dead-links-archive.md` or the 2026-09-28 content-match audit, not re-litigated here: `vanishing-of-smallpox-scars`, `our-lady-of-guadalupe-apparitions`, `miracle-of-the-sun-fatima`, `incorruptibility-of-catherine-laboure`, `eucharistic-miracle-of-tixtla` (this last one's own source says the miracle "has yet to be approved by Rome" — sits oddly with `content_tier: core`, worth a policy look beyond just sourcing).

### Saints missing the status leg (a vatican.va document) — 11

First flagged 2026-09-29. Several currently only have a `vaticannews.va` article — press coverage of the decree, not the decree.

`pier-giorgio-frassati`, `francisco-marto`, `jacinta-marto`, `fulton-sheen`, `catherine-laboure`, `damien-of-molokai`, `elizabeth-ann-seton`, `bernadette-soubirous`, `carlo-acutis`, `john-henry-newman`, `john-neumann`.

### Saints missing the biography leg (a non-devotional-blog source) — 6

First flagged 2026-09-29.

- `francisco-marto` / `jacinta-marto` — an EWTN news article is the *only* source on either record (also missing the status leg above — double gap)
- `elizabeth-ann-seton` — only a general reference site + an unreachable NYT link. `setonshrine.org` (her own official shrine) is already used as a source on one of *her miracle records* (`healing-of-anne-theresa-oneill`) but was never added to her own saint record — likely the easiest fix here
- `bernadette-soubirous` — EWTN + Britannica (already flagged in the 2026-09-28 content-match audit as unreachable/miscategorized); no Lourdes sanctuary or Nevers convent source
- `padre-pio` — the vatican.va canonization homily is the *only* source; zero independent biographical source at all
- `carlo-acutis` — single source (`carloacutis.com`) already flagged in the 2026-09-28 content-match audit as a thin JS-shell that couldn't be content-verified

## Resolved

- **`healing-of-maria-pellemans` / `healing-of-sister-gabriella-trimusi`** — flagged 2026-09-29 as a "categorization bug" (their `vatican_decree` source points at `papalencyclicals.net`, not vatican.va). Resolved 2026-09-29 as **no change needed** — this was a false positive in the coverage-mode rule, not a DB error. Fetched the actual page: it's the genuine 1925 canonization bull for Thérèse of Lisieux (*Vehementer Exultamus Hodie*), and it names both Maria Pellemans and Sister Gabriella Trimusi individually with detailed clinical accounts — stronger content-match than most vatican.va-hosted homilies get. No vatican.va equivalent exists (the document predates vatican.va's online archive) and papalencyclicals.net is a neutral, long-established historical-document archive, not a devotional or postulator site with a stake in the cause. Added a narrow exception for this situation to `SKILL.md`'s Tier 1 table rather than leave the rule to keep producing false positives on old bulls.
