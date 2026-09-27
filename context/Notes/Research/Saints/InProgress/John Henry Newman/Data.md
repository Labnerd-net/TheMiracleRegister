=======================================================================
SAINT (saints table)
=======================================================================
Slug:                john-henry-newman
Name:                John Henry Newman
Birth Name:          John Henry Newman
Birth Date:           February 21, 1801
Death Date:           August 11, 1890
Nationality:          English
Ministry Country:     United Kingdom
Religious Order:      Oratorian (Congregation of the Oratory of St Philip Neri) — founder of the Birmingham Oratory
Gender:               male
Saint Name:           Saint John Henry Newman
Beatification Miracle Dispensed: false
Canonization Miracle Dispensed: false
Dispensation Reason:  [null]
Lay Person:           false
Feast Day:            October 9
Beatification Date:   September 19, 2010
Beatified By:         Pope Benedict XVI
Canonization Date:    October 13, 2019
Canonized By:         Pope Francis
Canonization Type:    confessor
Canonization Stage:   saint
Patronage:            Catholic education (co-patron with St. Thomas Aquinas), converts, Newman Centers (Catholic campus ministry)
Themes:               conversion, spiritual-direction
Biography Short:      See Biography.md
Image URL:            https://upload.wikimedia.org/wikipedia/commons/2/29/John_Henry_Cardinal_Newman.jpg
Wikipedia URL:        https://en.wikipedia.org/wiki/John_Henry_Newman
Preview:              http://localhost:4321/saints/john-henry-newman?preview=YOUR_PREVIEW_TOKEN (local, token in .env) | https://themiracleregister.org/saints/john-henry-newman (live, once published:true)
Status:               Inserted in DB as saint id 325, published:false — verified rendering locally 2026-09-26

NOTE: Declared a Doctor of the Church and co-patron of the Church's educational mission (with
St. Thomas Aquinas) by Pope Leo XIV on November 1, 2025 — the first Englishman so honored since
the Venerable Bede. No dedicated schema field for Doctor of the Church status; flagged here in
case that becomes worth tracking later.

=======================================================================

SAINT SOURCES (saint_sources table)
=======================================================================

1. URL: https://www.vaticannews.va/en/pope/news/2019-02/pope-francis-decree-sainthood-cardinal-newman.html | Title: John Henry Newman: 'A Mind Alive' — Vatican News | Type: vatican_decree
2. URL: https://www.americamagazine.org/vatican-dispatch/2025/11/01/pope-leo-declares-st-john-henry-newman-a-doctor-of-the-church-and-co-patron-of-catholic-education/ | Title: Pope Leo declares St. John Henry Newman a doctor of the church and co-patron of Catholic education — America Magazine | Type: news_article
3. URL: https://birminghamoratory.org.uk/biography/ | Title: Biography — The Birmingham Oratory | Type: other

NOTE: Do not add https://en.wikipedia.org/wiki/Canonisation_of_John_Henry_Newman (or any Wikipedia
URL) as a saint_sources row — wikipedia_url above already renders as the hardcoded "Reference"
link; a Wikipedia row here duplicates it under a misleading "Official Site" label. (Caught after
initial DB entry — see git history.)

=======================================================================
RELATIONS (saint_relations table)
=======================================================================
Related Saint: [none]

=======================================================================
SAINT LOCATIONS (saint_locations table)
=======================================================================

1. Location: 80 Old Broad Street, City of London, England | Lat: 51.5155 | Lng: -0.0825 | Type: birthplace
2. Location: Birmingham Oratory, Edgbaston, Birmingham, England | Lat: 52.4611 | Lng: -1.9306 | Type: death_place
3. Location: Chapel of St Charles Borromeo, Birmingham Oratory, Edgbaston | Lat: 52.4611 | Lng: -1.9306 | Type: relic
4. Location: Oratory House cemetery, Rednal, Birmingham, England | Lat: 52.3868 | Lng: -2.0091 | Type: shrine

NOTE on relics/shrine: Newman was buried at Rednal in 1890. When his grave was opened on
October 2, 2008 during the canonization process, no bodily remains survived — the wooden
coffin had decayed in damp soil. Only coffin fittings and preserved locks of hair were
recovered; these, along with hair given to the Oratory before his death, were placed in a
casket in the Chapel of St Charles Borromeo at the Birmingham Oratory on November 2, 2008.
Rednal remains a place of pilgrimage despite the absence of remains, hence "shrine" rather
than "tomb" for that entry.

=======================================================================
