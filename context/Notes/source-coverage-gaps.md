# Source Coverage Gaps

Living tracker for records whose sourcing doesn't yet meet the standard defined in the `verify-sources` skill's coverage mode (`.claude/skills/verify-sources/SKILL.md`). Unlike `dead-links-archive.md`, gaps here don't decay with time — a record stays open until someone adds the missing source in the admin panel. Consolidates and supersedes the now-deleted `Missing Primary Sources.md` and `Source Requirements Audit - 2026-09-29.md`; their content is folded in below.

**When re-running coverage mode:** anything below no longer reproducing moves to `## Resolved` with today's date. Anything new gets added under the relevant heading with today's date as "first flagged." Don't re-open a `## Resolved` entry unless it's genuinely regressed (note why, if apparent).

## Open

### Core miracles used for beatification/canonization — missing Tier 1 (`vatican_decree` on vatican.va) — 40

First flagged 2026-09-28 (33) / 2026-09-29 (7, see tags below). All have `approval_authority: vatican_dicastery`, so the bar is a `vatican_decree` source hosted on vatican.va.

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
- `healing-of-giuseppe-carlo-audino` — Brother Andre (beat) — existing: news_article, news_article — **2026-09-29: regressed.** Lost its only `vatican_decree` row 2026-09-28 when it was deleted as an exact-URL duplicate of Brother André's saint-page source. Needs either a case-specific vatican.va document or a policy decision to accept the shared saint-page homily.
- `healing-of-henri-boisselet` — Bernadette Soubirous (beat) — existing: academic
- `healing-of-jake-finkbonner` — Kateri Tekakwitha (canon) — existing: news_article ×4
- `healing-of-james-fulton-engstrom` — Fulton Sheen (beat) — existing: news_article ×3, other
- `healing-of-juan-jose-barragan-silva` — Juan Diego (canon) — existing: news_article — **2026-09-29: regressed**, same cause as Audino above (dedup'd against Juan Diego's saint source 2026-09-28).
- `healing-of-juan-manuel-gutierrez` — Pier Giorgio Frassati (canon) — existing: news_article ×3 — **2026-09-29: regressed.** Its `vaticannews.va` source was correctly recategorized `vatican_decree` → `news_article` 2026-09-28 (it's press coverage of the decree, not the decree), which correctly exposed that no real vatican.va document was ever on file.
- `healing-of-kent-lenahan-from-traumatic-injuries` — John Neumann (beat) — existing: other, academic, other
- `healing-of-lucas-maeda-de-oliveira` — Francisco Marto, Jacinta Marto (canon) — existing: news_article ×3, other ×2, news_article
- `healing-of-lucia-sylvia-cirilo` — Gianna Beretta Molla (beat) — existing: other — **2026-09-29: regressed**, same cause (dedup'd against Gianna Beretta Molla's saint source 2026-09-28).
- `healing-of-marcilio-haddad-andrino` — Mother Teresa (canon) — existing: news_article — **2026-09-29: regressed**, same cause (dedup'd against Mother Teresa's saint source 2026-09-28).
- `healing-of-maria-emilia-santos` — Francisco Marto, Jacinta Marto (beat) — existing: other
- `healing-of-maria-pellemans` — Thérèse of Lisieux (canon) — existing: vatican_decree, news_article, other — **2026-09-29: categorization bug**, not just a gap. The `vatican_decree` row points at `papalencyclicals.net`, a third-party site, not vatican.va. Recategorize or replace.
- `healing-of-matheus` — Carlo Acutis (beat) — existing: news_article
- `healing-of-matteo-pio-colella` — Padre Pio (canon) — existing: news_article, other, news_article
- `healing-of-maureen-digan` — Faustina Kowalska (beat) — existing: news_article
- `healing-of-melissa-villalobos` — John Henry Newman (canon) — existing: news_article ×3, other, news_article
- `healing-of-michael-flanigan-from-bone-cancer` — John Neumann (canon) — existing: other ×3
- `healing-of-native-american-boy` — Kateri Tekakwitha (beat) — existing: **none at all** — investigate from scratch, not just a missing decree.
- `healing-of-pietro-schiliro` — Louis Martin, Zélie Martin (beat) — existing: other, news_article
- `healing-of-sister-gabriella-trimusi` — Thérèse of Lisieux (canon) — existing: vatican_decree, news_article — **2026-09-29: categorization bug**, same `papalencyclicals.net` issue as Pellemans above.
- `healing-of-sister-louise-of-saint-germain` — Thérèse of Lisieux (beat) — existing: other, news_article
- `healing-of-sister-marie-de-saint-fidele` — Bernadette Soubirous (canon) — existing: academic
- `healing-of-sister-marie-melanie-meyer` — Bernadette Soubirous (beat) — existing: academic
- `healing-of-sr-gertrude-korzendorfer` — Elizabeth Ann Seton (beat) — existing: news_article
- `healing-of-sr-simplicia-hue` — Father Damien (beat) — existing: news_article
- `healing-of-valeria-valverde` — Carlo Acutis (canon) — existing: news_article

### Catalog-tier miracles with no Tier 2 source — 13

First flagged 2026-09-29 (`canonization-miracle-of-catherine-laboure` originally flagged 2026-09-28 as zero-source). Every one of these is a Marian apparition with an obvious official-shrine source available — probably the cheapest fix in this whole file.

Zero sources at all (12): `our-lady-of-la-salette`, `our-lady-of-pontmain`, `our-lady-of-knock`, `our-lady-of-siluva`, `our-lady-of-banneux`, `our-lady-of-medjugorje`, `our-lady-of-beauraing`, `our-lady-of-laus`, `our-lady-of-philippsdorf`, `our-lady-of-gietrzwald`, `our-lady-of-kibeho`, `canonization-miracle-of-catherine-laboure`.

Has one source, but it's `other` not Tier 2 (1): `beatification-miracle-of-catherine-laboure`.

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

(none yet)
