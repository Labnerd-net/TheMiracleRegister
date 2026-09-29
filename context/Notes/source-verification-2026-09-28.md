# Source Verification — Full Audit — 2026-09-28

Scope: full audit of every `miracle_sources` and `saint_sources` row on **published** records — 179 miracle sources + 62 saint sources = 241 total.

Method: dumped via `dump-sources.ts`, checked with 17 parallel subagents (WebFetch per source) per the `verify-sources` skill heuristics. Source_id 275 was fixed in a prior, separately-requested scoped run and is reflected here as `ok`. All 28 `type_mismatch` findings were fixed on 2026-09-28 (source_type updated to the suggested value). Of the 8 original `mismatch` findings, 5 turned out to be exact-URL duplicates of a source already attached to the miracle's saint and were deleted from `miracle_sources` on 2026-09-28 (ids 249, 261, 263, 272, 280); the remaining 3 were fixed 2026-09-29 (see bottom). All fixed items have been moved to the bottom of this file — the sections up top (`dead`, `needs_review`) are what's still open and requires manual review in the admin panel.

## Summary

- Checked: 241
- ok: 201
- dead: 6 — removed from DB 2026-09-29, tracked in dead-links-archive.md
- mismatch: 0 — all 8 fixed (5 on 2026-09-28, 3 on 2026-09-29, see bottom)
- wikipedia_duplicate: 0
- type_mismatch: 0 — all 28 fixed 2026-09-28, see bottom
- needs_review: 26 — still open

## Highlights

- **The original 8 `mismatch` cases were the closest thing to your original concern** ("wrong miracle" links) — a vatican.va canonization/beatification *homily* was attached to a specific miracle record, but homilies are thematic and never name the private individual healed, so the page genuinely doesn't document that case. 5 of the 8 turned out to be the exact same URL already sitting on the linked saint's `saint_sources` — redundant on the miracle, so they were deleted from `miracle_sources`. The remaining 3 were a different homily than what's on the saint page and were recategorized to `other` on 2026-09-29 rather than replaced, since no vatican.va page names those specific recipients (see "Fixed" section at the bottom). This pattern — a genuine Vatican homily that's thematic rather than case-specific — is now documented directly in the `verify-sources` skill's categorization heuristics so future audits catch it without needing a fresh investigation each time.
- **Source_id 370 and 371 are the same URL attached to two different recipients** (Carl Kalin vs. Anne Theresa O'Neill) — worth a manual look, since at most one of those attributions can be right.
- No `wikipedia_duplicate` hits — no saint_sources row duplicates a saint's `wikipedia_url`.

## Open — needs manual review

### Dead / unreachable links (6) — removed from DB 2026-09-29

These 6 rows were deleted from `miracle_sources`/`saint_sources` on 2026-09-29 since they were broken on the live site. Full detail (URL, reason, source_id) is preserved in [`dead-links-archive.md`](./dead-links-archive.md) — a standalone tracker so they can be periodically re-checked, and re-added via the admin panel if the URL ever comes back.

### Needs manual review (inconclusive fetch) (26)

- **`healing-of-jake-finkbonner`** (miracle) — source_id 198
  `https://www.ncregister.com/news/pope-approves-miracle-of-kateri-tekakwitha`
  Current category: `news_article`
  Page loaded and covers the Vatican's approval of a miracle for Kateri Tekakwitha's canonization, but never names Jake Finkbonner, Ferndale WA, or the flesh-eating-bacteria diagnosis, so it can't be confirmed as documenting this specific case rather than being a generic announcement.

- **`eucharistic-miracle-of-lanciano`** (miracle) — source_id 227
  `https://pubmed.ncbi.nlm.nih.gov/4950729/`
  Current category: `academic`
  PubMed served a bot-check/CAPTCHA page instead of the article; could not confirm reachability or content match.

- **`eucharistic-miracle-of-lanciano`** (miracle) — source_id 228
  `https://www.miracolieucaristici.org/`
  Current category: `other`
  Only the bare homepage/language-selector loaded; no Lanciano-specific content was visible to confirm the match.

- **`our-lady-of-the-miraculous-medal`** (miracle) — source_id 203
  `https://amm.org/`
  Current category: `other`
  Official Association of the Miraculous Medal homepage; content is generic devotional/organizational material and doesn't specifically document Catherine Labouré or the 1830 apparition.

- **`eucharistic-miracle-of-sokolka`** (miracle) — source_id 236
  `https://www.miracolieucaristici.org/en/liste/scheda_c.html?nat=polonia&wh=sokolka`
  Current category: `other`
  Page loaded but only navigation chrome ('Miracles list', 'Visualizza Pdf') was retrievable, no substantive body content to confirm the Sokolka case is documented.

- **`lourdes-healing-of-antonietta-raco`** (miracle) — source_id 237
  `https://www.thecatholictelegraph.com/a-voice-told-me-not-to-be-afraid-the-story-of-lourdes-72nd-recognized-miracle/101501`
  Current category: `news_article`
  Fetch returned HTTP 403 Forbidden (likely bot-blocking), so reachability and content could not be confirmed either way.

- **`vanishing-of-smallpox-scars`** (miracle) — source_id 264
  `https://www.katerishrine.org/`
  Current category: `other`
  Reachable official shrine homepage that names Kateri Tekakwitha but is a thin/generic visitor-info page with no mention of her death or the smallpox scars vanishing.

- **`healing-of-sr-marie-simon-pierre`** (miracle) — source_id 276
  `https://www.archbalt.org/may-1-beatification-set-for-pope-john-paul-ii-after-miracle-approved/`
  Current category: `news_article`
  Page loaded but content was truncated to just the headline on fetch, so the body could not be checked against the record.

- **`beatification-miracle-of-catherine-laboure`** (miracle) — source_id 289
  `https://hozana.org/en/saints/saint-catherine-laboure`
  Current category: `other`
  Page is a general Catherine Labouré bio mentioning one posthumous healing anecdote, but the record has no recipient/date/location to confirm this is the specific beatification miracle.

- **`divine-mercy-revelations`** (miracle) — source_id 293
  `https://www.thedivinemercy.org/`
  Current category: `other`
  Bare org homepage with current news/nav content (Fulton Sheen beatification, livestream schedule); mentions Faustina only as a nav link, no actual documentation of the 1931 revelations.

- **`our-lady-of-guadalupe-apparitions`** (miracle) — source_id 306
  `https://www.virgendeguadalupe.org.mx/`
  Current category: `other`
  Official Basilica homepage references Juan Diego and the apparitions in nav/sections but the fetched homepage itself has no substantive account of the 1531 event, too thin to confirm case-specific content.

- **`tilma-of-guadalupe`** (miracle) — source_id 307
  `https://www.virgendeguadalupe.org.mx/`
  Current category: `other`
  Same official Basilica homepage as source 306; references Juan Diego/apparitions in navigation but homepage content is too thin to confirm tilma-specific details.

- **`healing-of-maria-pellemans`** (miracle) — source_id 323
  `https://archives.carmeldelisieux.fr/en/naissance-dune-sainte/la-beatification-et-la-canonisation/historique-de-la-beatification-et-de-la-canonisation/`
  Current category: `other`
  Page names the healed person 'Pius Pellemans' (Schaerbeek, Brussels) rather than 'Maria Pellemans'; disease (pulmonary tuberculosis), Lisieux tomb cure, and canonization timeline otherwise match, but the first-name conflict with the record and with the canonization bull text needs human judgment.

- **`healing-of-sr-caterina-capitani`** (miracle) — source_id 344
  `https://www.vatican.va/special/canonizzazione-27042014/index_en.html`
  Current category: `vatican_decree`
  Page confirms the 2014 canonization of John XXIII/John Paul II but is a general index of homilies/bios with no mention of Sister Caterina Capitani or her specific healing, so case-specific match can't be confirmed.

- **`healing-of-audrey-toguchi`** (miracle) — source_id 355
  `https://www.atlasobscura.com/articles/how-the-vatican-investigated-a-modern-miracle-at-a-leprosy-settlement-in-hawaii`
  Current category: `news_article`
  Server returned HTTP 403 Forbidden on repeated fetch attempts (likely bot-blocking), so content could not be verified either way.

- **`our-lady-of-akita`** (miracle) — source_id 362
  `https://www.ucanews.com/story-archive/?post_id=36862&post_name=%2F1988%2F08%2F17%2Fcardinal-ratzinger-said-to-approve-messages-of-blessed-mother-at-akita`
  Current category: `news_article`
  WebFetch returned HTTP 403 Forbidden (likely anti-bot blocking on ucanews.com); could not verify content match or confirm the link still resolves for normal users.

- **`our-lady-of-akita`** (miracle) — source_id 363
  `https://www.ucanews.com/story-archive/?post_name=/1988/09/14/bishop-ito-clarifies-cardinal-ratzingers-remarks-on-messages-of-mary&post_id=36975`
  Current category: `news_article`
  WebFetch returned HTTP 403 Forbidden (likely anti-bot blocking on ucanews.com); could not verify content match or confirm the link still resolves for normal users.

- **`healing-of-carl-kalin`** (miracle) — source_id 369
  `https://www.nytimes.com/1975/09/15/archives/the-miracle-occurs-daily-at-st-josephs.html`
  Current category: `news_article`
  WebFetch cannot access nytimes.com directly; a web search corroborates this Sept 15, 1975 article is about Carl Kalin's healing, but content was not directly verified on the page itself.

- **`healing-of-carl-kalin`** (miracle) — source_id 370
  `https://www.nytimes.com/1975/09/13/archives/mother-setons-day-will-be-his-too-mother-setons-day-will-be-special.html`
  Current category: `news_article`
  WebFetch cannot access nytimes.com directly and web search found no corroborating description of this article's actual content; cannot confirm it discusses Carl Kalin.

- **`healing-of-anne-theresa-oneill`** (miracle) — source_id 371
  `https://www.nytimes.com/1975/09/13/archives/mother-setons-day-will-be-his-too-mother-setons-day-will-be-special.html`
  Current category: `news_article`
  Same URL as source 370, attached here to a different record (O'Neill); WebFetch cannot access nytimes.com and no corroboration found, so it's unclear whether this article documents O'Neill's case specifically.

- **`healing-of-sr-gertrude-korzendorfer`** (miracle) — source_id 372
  `https://www.nytimes.com/1974/12/13/archives/for-mother-seton-sainthood-crowns-career-in-church-6-saints-are.html`
  Current category: `news_article`
  nytimes.com is blocked from fetching (and archive.org fallback also blocked), so content could not be verified against the Korzendorfer case.

- **`carlo-acutis`** (saint) — source_id 688
  `https://www.carloacutis.com/`
  Current category: `other`
  Page is a JS-rendered shell that only returns header/title text ("Carlo Acutis" / "San Carlo Acutis") on fetch, too thin to confirm biographical content actually documents him.

- **`bernadette-soubirous`** (saint) — source_id 694
  `https://www.britannica.com/biography/Saint-Bernadette-of-Lourdes`
  Current category: `academic`
  Britannica returned HTTP 403 Forbidden to the fetch tool (likely bot-blocking) so content could not be verified; also Britannica is a general encyclopedia, not an academic journal/publisher, so source_type academic is questionable regardless.

- **`juan-diego`** (saint) — source_id 703
  `https://www.virgendeguadalupe.org.mx/`
  Current category: `other`
  URL is the basilica's homepage, which only lists a 'San Juan Diego' menu link without substantive biographical content in the fetched page, too thin to confirm a specific match.

- **`pier-giorgio-frassati`** (saint) — source_id 711
  `https://frassatiusa.org/`
  Current category: `other`
  Returns HTTP 403 Forbidden via both WebFetch and a curl request with a browser user-agent; domain resolves so this looks like bot-blocking rather than a dead site, but content could not be verified.

- **`elizabeth-ann-seton`** (saint) — source_id 734
  `https://www.nytimes.com/1974/12/13/archives/for-mother-seton-sainthood-crowns-career-in-church-6-saints-are.html`
  Current category: `news_article`
  Returns HTTP 403 (bot-block/paywall) from both WebFetch and curl; Wayback Machine lookup was rate-limited, so content could not be verified.

## Fixed 2026-09-28

### Content mismatch — removed as saint-source duplicates (5)

Exact-URL duplicates of a source already attached to the miracle's linked saint — deleted from `miracle_sources`.

- **`healing-of-giuseppe-carlo-audino`** (miracle) — source_id 249 (deleted)
  `https://www.vatican.va/content/benedict-xvi/en/homilies/2010/documents/hf_ben-xvi_hom_20101017_canonizations.html`
  Duplicate of `andre-bessette` saint_sources id 676.

- **`healing-of-lucia-sylvia-cirilo`** (miracle) — source_id 263 (deleted)
  `https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20040516_beretta-molla_en.html`
  Duplicate of `gianna-beretta-molla` saint_sources id 671.

- **`healing-of-juan-jose-barragan-silva`** (miracle) — source_id 272 (deleted)
  `https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020731_juan-diego_en.html`
  Duplicate of `juan-diego` saint_sources id 689.

- **`healing-of-fr-ronald-pytel`** (miracle) — source_id 261 (deleted)
  `https://www.saint-faustina.org/`
  Duplicate of `faustina-kowalska` saint_sources id 670.

- **`healing-of-marcilio-haddad-andrino`** (miracle) — source_id 280 (deleted)
  `https://www.vatican.va/content/francesco/en/homilies/2016/documents/papa-francesco_20160904_omelia-canonizzazione-madre-teresa.html`
  Duplicate of `mother-teresa` saint_sources id 665.

### Category mismatch (source_type) — corrected (28)

- **`incorruptibility-of-bernadette-soubirous`** (miracle) — source_id 212
  `https://www.thedivinemercy.org/articles/bernadettes-body-still-rests-incorrupt`
  ~~Current: `news_article`~~ → Updated to `other`.
  thedivinemercy.org is the Marians of the Immaculate Conception's devotional site, not a Catholic press/news outlet; content matches the record but the category should be 'other', not 'news_article'.

- **`eucharistic-miracle-of-buenos-aires`** (miracle) — source_id 230
  `https://www.magiscenter.com/blog/the-eucharistic-miracle-pope-francis`
  ~~Current: `news_article`~~ → Updated to `other`.
  Magis Center is an apologetics/education nonprofit blog, not a Catholic press outlet.

- **`eucharistic-miracle-of-buenos-aires`** (miracle) — source_id 231
  `https://crisismagazine.com/opinion/exaggerations-and-eucharistic-miracles`
  ~~Current: `academic`~~ → Updated to `news_article`.
  This is an opinion column in Crisis Magazine (Catholic press) discussing academic papers, not an academic paper itself.

- **`eucharistic-miracle-of-legnica`** (miracle) — source_id 244
  `https://www.tfp.org/new-eucharistic-miracle-polish-doctors-say-host-is-human-tissue/`
  ~~Current: `news_article`~~ → Updated to `other`.
  TFP is a Catholic advocacy/apologetics nonprofit, not a standard news outlet or diocesan newsroom, so 'other' fits better than 'news_article'.

- **`healing-of-consiglia-de-martino`** (miracle) — source_id 253
  `https://www.magiscenter.com/blog/the-padre-pio-miracle-that-led-to-his-beatification`
  ~~Current: `news_article`~~ → Updated to `other`.
  Content matches (Consiglia De Martino, Salerno, 1995), but Magis Center is an apologetics/education nonprofit blog, not a news outlet.

- **`healing-of-consiglia-de-martino`** (miracle) — source_id 255
  `https://www.catholicculture.org/culture/library/view.cfm?recnum=1018`
  ~~Current: `academic`~~ → Updated to `news_article`.
  Content matches (De Martino, Salerno), but this is a reprinted Inside the Vatican magazine feature article, not a scholarly/academic publication.

- **`healing-of-matteo-pio-colella`** (miracle) — source_id 257
  `https://www.ewtn.com/catholicism/library/highlights-of-the-cause-for-padre-pio-13861`
  ~~Current: `other`~~ → Updated to `news_article`.
  Content matches (Matteo Pio Colella, San Giovanni Rotondo, Manfredonia-Vieste process), but EWTN is Catholic press and should be news_article, not other.

- **`bilocation-of-padre-pio`** (miracle) — source_id 259
  `https://www.ewtn.com/catholicism/library/padre-pios-bilocation-and-the-odor-of-sanctity-13853`
  ~~Current: `other`~~ → Updated to `news_article`.
  Content matches (Padre Pio's bilocation phenomena), but EWTN is Catholic press and should be news_article, not other.

- **`healing-of-carmen-valencia`** (miracle) — source_id 271
  `https://www.catholiccompany.com/blogs/magazine/louis-zelie-martin-canonization-miracle-5761`
  ~~Current: `news_article`~~ → Updated to `other`.
  Content matches (Carmen Perez Pons, Valencia) but this is a retailer's devotional blog post, not a news outlet, so 'other' fits better than 'news_article'.

- **`our-lady-of-the-rosary-ratisbonne`** (miracle) — source_id 286
  `https://www.newadvent.org/cathen/12659a.htm`
  ~~Current: `academic`~~ → Updated to `other`.
  New Advent's Catholic Encyclopedia entry is a general reference page, not a journal/university publication — doesn't fit 'academic'.

- **`our-lady-of-the-rosary-ratisbonne`** (miracle) — source_id 287
  `https://voiceofthefamily.com/the-miraculous-conversion-of-alphonse-ratisbonne/`
  ~~Current: `news_article`~~ → Updated to `other`.
  Voice of the Family is an advocacy/apologetics organization, not a Catholic news outlet — content matches but category fits 'other' better.

- **`miracle-of-the-sun-fatima`** (miracle) — source_id 297
  `https://en.wikipedia.org/wiki/Miracle_of_the_Sun`
  ~~Current: `academic`~~ → Updated to `other`.
  Content matches well, but Wikipedia is not an academic/journal source -- doesn't belong in the academic category.

- **`healing-of-juan-manuel-gutierrez`** (miracle) — source_id 329
  `https://www.vaticannews.va/en/pope/news/2024-11/pope-decree-saints-blesseds-frassati-trocatti-vietnam-martyr.html`
  ~~Current: `vatican_decree`~~ → Updated to `news_article`.
  This is a Vatican News press report summarizing the decree signing (domain vaticannews.va, not vatican.va/press.vatican.va, and not the primary decree text); it confirms a Frassati canonization-miracle decree but doesn't name Gutiérrez specifically, matching only by circumstance.

- **`healing-of-james-fulton-engstrom`** (miracle) — source_id 333
  `https://www.magiscenter.com/blog/fulton-sheen-beatification-miracle`
  ~~Current: `news_article`~~ → Updated to `other`.
  Magis Center is an apologetics/education nonprofit blog, not a news outlet, though the content correctly documents the Engstrom/Sheen case.

- **`our-lady-of-akita`** (miracle) — source_id 360
  `https://www.ewtn.com/catholicism/library/message-from-our-lady--akita-japan-5167`
  ~~Current: `other`~~ → Updated to `news_article`.
  Content matches (Sr. Agnes Sasagawa, Akita apparition), but ewtn.com is Catholic press and should be categorized news_article, not other.

- **`healing-of-eva-benassi-from-peritonitis`** (miracle) — source_id 387
  `https://chrc-phila.org/canonization-of-saint-john-neumann/`
  ~~Current: `academic`~~ → Updated to `other`.
  This is a diocesan archival/historical center blog post, not a peer-reviewed academic source; content does confirm the Eva Benassi case.

- **`healing-of-kent-lenahan-from-traumatic-injuries`** (miracle) — source_id 389
  `https://chrc-phila.org/canonization-of-saint-john-neumann/`
  ~~Current: `academic`~~ → Updated to `other`.
  This is a diocesan archival/historical center blog post, not a peer-reviewed academic source; content does confirm the Lenahan case.

- **`healing-of-michael-flanigan-from-bone-cancer`** (miracle) — source_id 392
  `https://chrc-phila.org/canonization-of-saint-john-neumann/`
  ~~Current: `academic`~~ → Updated to `other`.
  This is a diocesan archival/historical center blog post, not a peer-reviewed academic source; content does confirm the Michael Flanigan case.

- **`juan-diego`** (saint) — source_id 704
  `https://faith.nd.edu/saint/st-juan-diego-cuauhtlatoatzin/`
  ~~Current: `academic`~~ → Updated to `other`.
  Content matches (detailed bio of Juan Diego including his canonization miracle) but this is a Notre Dame campus-ministry devotional saint profile, not a scholarly/academic work, despite the .edu domain.

- **`maximilian-kolbe`** (saint) — source_id 707
  `https://www.piercedhearts.org/heart_church/paul_vi/oct_17_71_beat_max_kolbe.htm`
  ~~Current: `vatican_decree`~~ → Updated to `other`.
  Content is a genuine Paul VI beatification homily text but it is hosted on a third-party devotional site (piercedhearts.org), not vatican.va/press.vatican.va or an official Holy See dicastery page, and a homily is not a canonization/beatification decree.

- **`pier-giorgio-frassati`** (saint) — source_id 712
  `https://www.vaticannews.va/en/pope/news/2024-11/pope-decree-saints-blesseds-frassati-trocatti-vietnam-martyr.html`
  ~~Current: `vatican_decree`~~ → Updated to `news_article`.
  This is a Vatican News (vaticannews.va) news article reporting that the Pope signed the decree, not the primary decree document itself; content match confirmed.

- **`fulton-sheen`** (saint) — source_id 713
  `https://www.vaticannews.va/en/vatican-city/news/2026-03/fulton-sheen-to-be-beatified-in-st-louis-on-24-september.html`
  ~~Current: `vatican_decree`~~ → Updated to `news_article`.
  Vatican News article announcing the beatification date/logistics, not a primary Holy See decree text; content match confirmed.

- **`edith-stein`** (saint) — source_id 716
  `https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_19981011_edith_stein_en.html`
  ~~Current: `vatican_decree`~~ → Updated to `other`.
  This is a general Vatican-published biography page (discusses her 1987 beatification; fetched content does not mention canonization/saint) rather than an actual decree text — better categorized as other, consistent with the analogous John XXIII biography source (721) already tagged other.

- **`edith-stein`** (saint) — source_id 719
  `https://www.ewtn.com/catholicism/library/edith-stein-st-teresa-benedicta-of-the-cross-9982`
  ~~Current: `other`~~ → Updated to `news_article`.
  Hosted on ewtn.com, a Catholic press outlet covered by the news_article heuristic; currently tagged other.

- **`damien-of-molokai`** (saint) — source_id 728
  `https://www.ewtn.com/catholicism/library/beatification-of-damien-de-veuster-8696`
  ~~Current: `other`~~ → Updated to `news_article`.
  Page loads and is JPII's 1995 beatification homily for Damien, hosted on EWTN's library (Catholic press), which maps to news_article rather than other.

- **`john-henry-newman`** (saint) — source_id 738
  `https://www.vaticannews.va/en/pope/news/2019-02/pope-francis-decree-sainthood-cardinal-newman.html`
  ~~Current: `vatican_decree`~~ → Updated to `news_article`.
  This is a Vatican News staff article reporting on and interviewing about the canonization approval, not the primary Vatican decree text itself.

- **`john-neumann`** (saint) — source_id 742
  `https://www.britannica.com/biography/Saint-John-Neumann`
  ~~Current: `academic`~~ → Updated to `other`.
  Britannica is a general commercial encyclopedia, not a .edu domain or journal publisher, so 'academic' doesn't fit; content itself matches John Neumann.

- **`john-neumann`** (saint) — source_id 744
  `https://chrc-phila.org/canonization-of-saint-john-neumann/`
  ~~Current: `academic`~~ → Updated to `other`.
  This is a diocesan historical research center's archive page, not a .edu domain or journal publisher, so 'other' fits better than 'academic'; content matches Neumann's canonization.

## Fixed 2026-09-29

### Content mismatch — thematic homily recategorized, not replaced (3)

Researched each case for a vatican.va page naming the specific recipient (none exists — these beatification-stage miracles were never given an individual public page, unlike the rare exception found for Escrivá's *canonization* miracle at `vatican.va/latest/documents/escriva_miracolo-canoniz_en.html`, which already correctly cites it on `healing-of-dr-manuel-nevado-rey`). Recategorized the mismatched homily to `other` in each case rather than deleting it — it's still a legitimate Vatican document, just not proof of this specific case — and added a case-specific corroborating source where one was found.

- **`healing-of-sr-marie-simon-pierre`** (miracle) — source_id 277
  `https://www.vatican.va/content/benedict-xvi/en/homilies/2011/documents/hf_ben-xvi_hom_20110501_beatificazione-gpii.html`
  ~~Current: `vatican_decree`~~ → Updated to `other`.
  Also added source_id 394 — `https://www.ncronline.org/blogs/ncr-today/i-was-cured-during-night-between-second-and-third-june` (`news_article`), Sr. Marie Simon-Pierre's own first-person account of her cure. Fetch was blocked (403) so content wasn't directly re-confirmed on this pass — worth a manual spot-check.

- **`healing-of-monica-besra`** (miracle) — source_id 279
  `https://www.vatican.va/content/john-paul-ii/en/homilies/2003/documents/hf_jp-ii_hom_20031019_mother-theresa.html`
  ~~Current: `vatican_decree`~~ → Updated to `other`.
  Also added source_id 395 — `https://www.washingtonpost.com/world/asia_pacific/the-vatican-believes-mother-teresa-cured-this-woman-but-was-it-a-miracle/2016/09/01/83664464-6e12-11e6-993f-73c693a89820_story.html` (`news_article`), confirmed by search snippet to name Besra specifically.

- **`healing-of-sr-concepcion-boullon-rubio`** (miracle) — source_id 373
  `https://www.vatican.va/content/john-paul-ii/it/homilies/1992/documents/hf_jp-ii_hom_19920517_beatifications.html`
  ~~Current: `vatican_decree`~~ → Updated to `other`.
  No new source added — the existing source_id 374 (`opusdei.org`, already `other`) was independently re-confirmed to name Sister Concepción Boullón Rubio specifically. Also found the actual CCS decree text naming her mirrored at `opusdei.org/de/article/dekret-uber-die-anerkennung-eines-josemaria-escriva-zugeschriebenen-wunders-6-juli-1991/` — genuine decree content, but per the hosting rule it would be `other` (not vatican.va-hosted), so not added as a duplicate of source 374's coverage.

All 3 lose their only Tier 1 (`vatican_decree`) source as a result — tracked as new entries in `source-coverage-gaps.md`'s Tier 1 gap list, not a regression, since they were never actually satisfying Tier 1 in substance.
