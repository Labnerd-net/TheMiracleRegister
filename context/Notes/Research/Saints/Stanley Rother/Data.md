=======================================================================
SAINT (saints table)
=======================================================================
Slug:                stanley-rother
Name:                Stanley Rother
Saint Name:          [omit — not yet canonized, no formal "Saint ___" title exists. Current formal title is "Blessed Stanley Rother."]
Birth Name:          [same as Name — no change]
Birth Date:          March 27, 1935
Death Date:          July 28, 1981
Feast Day:           July 28
Feast Scope:         diocesan — observed as an optional memorial specifically in the Archdiocese of Oklahoma City, Diocese of Tulsa, Diocese of Little Rock, and parishes of the Diocese of Sololá (Guatemala). Not a blanket US national memorial, and not universal (he is Blessed, not canonized).
Religious Order:     None — diocesan priest (Diocese of Oklahoma City and Tulsa), not a member of a religious order
Nationality:         American (United States)
Ministry Country:    Guatemala
Beatification Date: September 23, 2017
Beatified By:        Pope Francis (Mass celebrated in his name by Cardinal Angelo Amato, Prefect of the Congregation for the Causes of Saints, in Oklahoma City)
Canonization Date:  [omit — not yet canonized]
Canonized By:        [omit — not yet canonized]
Canonization Type:   martyr
Canonization Stage:  blessed
Patronage:           None formally designated. Patronage titles are typically assigned at or after canonization; no official patronage was found for Blessed Stanley Rother as of this research (October 2026). [TO BE RESEARCHED if this changes]
Themes:              martyrs, missionaries — both confirmed against the canonical SAINT_THEMES list (src/db/topics.ts). "martyrs" fits directly (recognized martyr, odium fidei). "missionaries" fits his 13 years serving as a missionary priest among the Tz'utujil in Guatemala.
Biography Short:     See Biography note
Gender:              male
Lay Person:          false
Beatification Miracle Dispensed: true — martyrs are dispensed from the usual beatification-miracle requirement once the Congregation/Dicastery for the Causes of Saints confirms death in odium fidei (confirmed for Rother December 1, 2016).
Canonization Miracle Dispensed: false — NOT dispensed. This is the key distinction for this file: the beatification miracle was waived because he is a martyr, but canonization still requires one verified miracle attributed to his intercession after beatification, and none has been publicly confirmed as of this research. See "Miracle 1 - status.md" in this folder for detail — do not create a Miracle record for Rother until/unless a specific case is publicly named.
Dispensation Reason: martyr
Image URL:           https://upload.wikimedia.org/wikipedia/commons/8/8d/Beato_Stanley_Francis_Rother.jpg — NOTE: this file is licensed CC BY-SA 3.0 (Wikimedia Commons), not public domain/CC0. It is an upper-body portrait dated March 30, 1980, uploaded to Commons June 21, 2022. Flagged as an open question below since CLAUDE.md's data model specifies "public domain" for image_url — confirm whether CC BY-SA is acceptable for this project or whether a true PD alternative needs to be found before publishing.
Wikipedia URL:       https://en.wikipedia.org/wiki/Stanley_Rother

=======================================================================
SAINT SOURCES (saint_sources table)
=======================================================================
1. URL: https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2016/12/02/0873/01936.html | Title: Promulgazione di Decreti della Congregazione delle Cause dei Santi (martyrdom decree naming "Stanley Francesco Rother," b. March 27, 1935, d. July 28, 1981, ucciso in odio alla Fede) | Type: vatican_decree
   — Hostname is press.vatican.va, a subdomain of vatican.va (distinct from vaticannews.va), so this satisfies the Tier 1 "status leg" for the beatification/martyrdom act itself.
2. URL: https://www.ncregister.com/news/vatican-recognizes-oklahoma-missionary-priest-as-martyr | Title: Vatican Recognizes Oklahoma Missionary Priest as Martyr | Type: news_article
3. URL: https://www.ewtnnews.com/world/us/faithful-martyr-and-missionary-father-stanley-rother-beatified-in-oklahoma | Title: Faithful Martyr and Missionary Father Stanley Rother Beatified in Oklahoma (EWTN/CNA) | Type: news_article
4. URL: https://www.franciscanmedia.org/st-anthony-messenger/blessed-stanley-rother-2/ | Title: Father Stanley Rother: Recognized Martyr of Oklahoma City (St. Anthony Messenger / Franciscan Media) | Type: news_article
5. URL: https://archokc.org/rothercause | Title: The Cause for Canonization of Blessed Stanley Rother (Archdiocese of Oklahoma City — official postulating diocese) | Type: other
   — FLAG: automated WebFetch returned HTTP 403 for this domain (bot-blocked); its relevance/content was inferred only from search-index snippets, not a direct fetch. A human (or a future content-match audit) should open this in a browser to confirm before treating it as fully verified.

=======================================================================
RELATIONS (saint_relations table)
=======================================================================
[omit — no joint beatification/canonization, no family or group cause]

=======================================================================
SAINT LOCATIONS (saint_locations table)
=======================================================================
1. Location: Holy Trinity Catholic Church (birthplace/home parish), Okarche, Oklahoma | Lat: 35.72500 | Lng: -97.97583 | Type: birthplace
2. Location: Parroquia Santiago Apóstol (heart relic entombed near/beneath the altar), Santiago Atitlán, Guatemala | Lat: 14.6330 | Lng: -91.2330 | Type: relic
3. Location: Blessed Stanley Rother Shrine, 700 SE 89th St, Oklahoma City, Oklahoma 73149 (final resting place of his body/remains) | Lat: [TO BE RESEARCHED — precise geocode not verified] | Lng: [TO BE RESEARCHED] | Type: tomb

=======================================================================

Open questions before this can move past stub status:
- Resolving the "Priority Additions.md" note ("not yet canonized — 1 miracle only"): confirmed this means the canonization-track miracle is still OUTSTANDING, not dispensed. Zero miracles have been used for Rother to date — the beatification miracle was waived (martyr dispensation) and the canonization miracle has not yet been found/confirmed. `canonization_miracle_dispensed` should be `false`. See "Miracle 1 - status.md" for detail.
- Image URL is CC BY-SA 3.0, not public domain — confirm whether this license is acceptable per project convention, or source a true PD alternative (e.g. a US-government or pre-1929 work, unlikely to exist for a priest who died in 1981).
- Blessed Stanley Rother Shrine's precise lat/lng not verified (address only: 700 SE 89th St, Oklahoma City, OK 73149) — geocode before using in saint_locations.
- archokc.org/rothercause could not be directly fetched (HTTP 403) — verify content manually before relying on it as a saint_sources row in the live DB.
- Patronage: none found; re-check periodically in case a devotional patronage (e.g. "patron of missionaries facing violence") becomes commonly cited.
- Feast Scope marked "diocesan" based on CNA's calendar page listing specific dioceses (Oklahoma City, Tulsa, Little Rock, Sololá) — confirm this is the full/current list before publishing, since diocesan permissions can expand over time.
