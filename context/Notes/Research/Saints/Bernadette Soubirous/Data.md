=======================================================================
SAINT (saints table)
=======================================================================
Slug:                bernadette-soubirous
Name:                Bernadette Soubirous
Birth Name:          Marie-Bernarde Soubirous
Birth Date:          January 7, 1844
Death Date:          April 16, 1879
Nationality:         French
Ministry Country:    France
Religious Order:     Sisters of Notre Dame of Nevers
Gender:              female
Saint Name:          Saint Bernadette of Lourdes
Beatification Miracle Dispensed: false
Canonization Miracle Dispensed: false
Dispensation Reason: null
Lay Person:          false
Feast Day:           April 16
Beatification Date:  June 14, 1925
Beatified By:        Pope Pius XI
Canonization Date:   December 8, 1933
Canonized By:        Pope Pius XI
Canonization Type:   virgin
Canonization Stage:  saint
Patronage:           Lourdes, sick people, poverty, people ridiculed for their piety, shepherds
Themes:              marian, perseverance, saints-of-everyday-life
Biography Short:     See Biography.md
Image URL:           https://upload.wikimedia.org/wikipedia/commons/f/f8/Bernadette_soubirous_1_publicdomain.jpg
Wikipedia URL:       https://en.wikipedia.org/wiki/Bernadette_Soubirous

NOTE: Bernadette is the visionary of the Lourdes apparitions (slug: our-lady-of-lourdes). After seeding,
add her saint_id to miracle_saints for that record (same pattern as Juan Diego for Guadalupe).

=======================================================================

SAINT SOURCES (saint_sources table)
=======================================================================

1. URL: https://en.wikipedia.org/wiki/Bernadette_Soubirous | Title: Bernadette Soubirous — Wikipedia | Type: other
2. URL: https://www.ewtn.com/catholicism/saints/bernadette-soubirous-494 | Title: St. Bernadette Soubirous | Type: news_article
3. URL: https://www.britannica.com/biography/Saint-Bernadette-of-Lourdes | Title: Saint Bernadette of Lourdes — Britannica | Type: other

=======================================================================
RELATIONS (saint_relations table)
=======================================================================

None (no saint_relations needed — she is the Lourdes visionary, linked via miracle_saints, not a saint_relation)

=======================================================================
SAINT LOCATIONS (saint_locations table)
=======================================================================

1. Location: Lourdes, France | Lat: 43.0951 | Lng: -0.0463 | Type: birthplace
2. Location: Grotto of Massabielle, Lourdes | Lat: 43.0934 | Lng: -0.0467 | Type: shrine
3. Location: Convent of Saint-Gildard, Nevers, France | Lat: 46.9897 | Lng: 3.1572 | Type: tomb

--- Miracle 4: Second Beatification Miracle ---
Title:               Healing of Henri Boisselet
Slug:                healing-of-henri-boisselet
Miracle Category:    intercessory
Type:                healing
Date of Event:       December 8, 1913
Date Precision:      exact_day
Timing:              posthumous
Location Name:       null (not in public record; France assumed)
Country:             null
Recipient Name:      Henri Boisselet
Recipient Privacy:   public
Recipient Gender:    male
Medical Diagnosis:   Tubercular peritonitis
Cure Details:        Instantaneous cure at the close of a novena to Bernadette on the Feast of the Immaculate Conception, December 8, 1913. Had received Last Sacraments.
Cure Characteristics: instant_complete
Medically Verified:  true
Intercessory Medium: prayer_only
Approval Authority:  vatican_dicastery
Used for Beatification: true
Used for Canonization: false
Content Tier:        core
Synopsis:            See Miracle 4 - Second Beatification Miracle.md

--- Miracle 5: Second Canonization Miracle ---
Title:               Healing of Archbishop Lemaître of Carthage
Slug:                healing-of-archbishop-lemaitre
Miracle Category:    intercessory
Type:                healing
Date of Event:       null (between 1925–1928)
Date Precision:      unknown
Timing:              posthumous
Location Name:       null
Country:             null
Recipient Name:      Archbishop Lemaître of Carthage
Recipient Privacy:   public
Recipient Gender:    male
Medical Diagnosis:   Chronic amoebic infection (amoebiasis)
Cure Details:        Complete recovery. Specific date and location not in the public record. Full documentation in the Vatican's internal Positio.
Cure Characteristics: instant_complete
Medically Verified:  true
Intercessory Medium: prayer_only
Approval Authority:  vatican_dicastery
Used for Beatification: false
Used for Canonization: true
Content Tier:        catalog
Synopsis:            See Miracle 5 - Second Canonization Miracle.md

=======================================================================
POST-SEED STEPS
=======================================================================

All steps complete:
- Saint seeded (id=313) ✓
- Miracles seeded (id=695–699) ✓
- miracle_saints links: 695, 696, 697, 698, 699 → saint 313 ✓
- miracle_saints link: our-lady-of-lourdes (687) → saint 313 ✓
- saint_sources (3) ✓
- miracle_sources (6 total) ✓
- saint_locations (3) ✓
- Publish saint + all miracles when ready for review

=======================================================================
