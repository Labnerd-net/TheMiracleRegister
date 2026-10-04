Research Resources - TheMiraclesRegister.org

=======================================================================
PRIMARY RESEARCH SOURCES - Vatican Documentation
=======================================================================

1. Vatican News / Vatican.va
   URL: https://www.vatican.va
   Content: Papal decrees of canonization (Apostolic Letters), official Positio documents
   Use: Primary source for canonization miracles, Vatican medical board verdicts
   Language: Latin (official), Italian, English translations available
   IMPORTANT: This is the only domain that counts as `vatican_decree` /
     Tier 1 sourcing (hostname `vatican.va` or ending `.vatican.va`).
     `vaticannews.va` (entry 2 below) is a *different domain* — press
     coverage of a decree, not the decree itself. See
     `.claude/skills/verify-sources/SKILL.md` for the full standard.

2. Vatican News (Vatican News website)
   URL: https://www.vaticannews.va
   Content: News coverage of canonizations, beatifications, miracle recognitions
   Use: Current events, recent miracle confirmations
   Note: Despite the name, this is `news_article` tier, not `vatican_decree`
     — it's a distinct domain from vatican.va. Don't cite it as the decree.

3. Dicastery for the Causes of Saints
   URL: https://www.vatican.va/roman_curia/congregations/csaints/
   Content: Official congregation overseeing canonization process
   Use: Understanding canonization procedures, miracle requirements

4. Vatican Basilica / Vatican Media (photo archive)
   URL: https://www.vatican.va/news_services/liturgy/photogallery/
   Content: Official Vatican photographs of canonization ceremonies
   Use: Canonization photos, papal ceremony images

5. Consulta Medica (Vatican medical board)
   URL: No public standalone site — verdicts are referenced within the
     dicastery's Positio documents and canonization decrees on vatican.va
   Content: The Vatican's own medical board, which reviews healing
     miracles for scientific inexplicability as part of the adjudication
     chain: diocesan tribunal -> Consulta Medica -> dicastery decree
   Use: Their verdicts are primary sources for the medical-verification
     side of a canonization miracle; look for them cited within the
     vatican.va decree/Positio rather than as a separate URL
   Note: For non-dicastery healings, the equivalent body is the Lourdes
     Bureau des Constatations Medicales / CMIL (see entry 20 below) —
     not Consulta Medica, which is specific to the canonization process.

=======================================================================
SECONDARY RESEARCH SOURCES - Catholic News
=======================================================================

5. Catholic News Agency (CNA)
   URL: https://www.catholicnewsagency.com
   Content: News coverage of saint causes, miracle investigations
   Use: Current reporting on ongoing causes, miracle details

6. EWTN / National Catholic Register
   URL: https://www.ewtn.com / https://www.ncregister.com
   Content: In-depth articles on saints, canonization processes
   Use: Background research, saint biographies

7. Aleteia
   URL: https://aleteia.org
   Content: Popular saint articles, miracle stories, fact-checking articles
   Use: Readable summaries, debunking (e.g. Carlo's incorrupt body article)

=======================================================================
REFERENCE WEBSITES
=======================================================================

8. Miracle Hunter (miraclehunter.com)
   URL: https://www.miraclehunter.com
   Content: Catalog of Vatican-confirmed miracles
   Use: General reference, cross-referencing (dated but useful)
   Note: Verify all information against Vatican primary sources

9. Wikipedia (individual saint articles)
   URL: https://en.wikipedia.org
   Saints in this project:
   - https://en.wikipedia.org/wiki/Pope_John_Paul_II
   - https://en.wikipedia.org/wiki/Mother_Teresa
   - https://en.wikipedia.org/wiki/Padre_Pio
   - https://en.wikipedia.org/wiki/Faustina_Kowalska
   - https://en.wikipedia.org/wiki/Gianna_Beretta_Molla
   - https://en.wikipedia.org/wiki/Kateri_Tekakwitha
   - https://en.wikipedia.org/wiki/Andre_Bessette
   - https://en.wikipedia.org/wiki/Maximilian_Kolbe
   - https://en.wikipedia.org/wiki/Louis_and_Zelie_Martin
   - https://en.wikipedia.org/wiki/Carlo_Acutis
   - https://en.wikipedia.org/wiki/Juan_Diego
   Use: Initial overview, date verification, biographical outline
   Note: Always verify against Vatican sources for official details
   IMPORTANT: Wikipedia is background research only — never add it as a
     `saint_sources` or `miracle_sources` DB row. The saint's own
     `wikipedia_url` field already surfaces it on the page; a duplicate
     source row renders twice. It also doesn't count toward either leg
     (status or biography) of the saint sourcing standard.

10. Official shrine / diocesan / custodial-organization sites
    URL: Varies by case (e.g. lourdes-france.org, setonshrine.org,
      virgendeguadalupe.mx)
    Content: The shrine, diocese, religious order, or custodial
      organization's own account of a saint or miracle
    Use: For miracles with no dicastery decree (most apparitions,
      stigmata, incorruptibles), this is Tier 1 evidence under the
      bundle rule: an official shrine/diocesan account plus at least
      one independent Tier 2 source (Catholic press, book, academic).
      Also satisfies the biography leg on a saint record when no
      scholarly biography is readily available. Before falling back to
      the bundle, check whether the local ordinary issued an actual
      declaration on the case (e.g. Bishop Ito's 1988 declaration on
      Akita) — that's stronger evidence than the bundle when it exists.
      See `Source Requirements Standard.md` and
      `.claude/skills/verify-sources/SKILL.md` for the full rule.

11. Wikipedia — List of patron saints by occupation and activity
    URL: https://en.wikipedia.org/wiki/List_of_patron_saints_by_occupation_and_activity
    Content: The most structured/exhaustive patronage list — organized by
      occupation, illness, place, and cause, each entry individually sourced
    Use: Primary reference when deciding what to put in a saint's
      `patronage` field (CLAUDE.md's `saints` table)

12. Catholic.com Encyclopedia — Patron Saints
    URL: https://www.catholic.com/encyclopedia/patron-saints
    Content: Secondary cross-check list of patronages by category
    Use: Verify a patronage found on Wikipedia against a second source

13. EWTN — Roman Catholic Patron Saints
    URL: https://www.ewtn.com/catholicism/library/roman-catholic-patron-saints-5730
    Content: Another quick-lookup patronage list
    Use: Tertiary cross-check / alternate phrasing for a patronage
    Note: There is no single official Vatican-sanctioned master list of
      patronages — they accumulate through tradition and popular devotion
      rather than formal decree, so these compiled lists are the best
      available reference, not a canonical source. `patronage` is modeled
      as free text (not an enum); keep new entries in sentence case and
      check `PATRONAGE_GROUPS` in `src/db/topics.ts` for an existing
      equivalent string before adding a new one.

=======================================================================
IMAGE SOURCES
=======================================================================

Wikimedia Commons is the primary source for saint images used on this site.
All images below are from Wikimedia Commons and carry the noted license.

== Saints with Public Domain Images ==

Padre Pio
  File: Padre_Pio_portrait.jpg
  URL: https://commons.wikimedia.org/wiki/File:Padre_Pio_portrait.jpg
  License: Public domain
  Notes: Older portrait, suitable for general use

Faustina Kowalska
  File: Saint_Faustyna_Kowalska_portrait_(1931).jpg
  URL: https://commons.wikimedia.org/wiki/File:Saint_Faustyna_Kowalska_portrait_(1931).jpg
  License: Public domain
  Notes: Portrait from 1931, unknown author

Gianna Beretta Molla
  File: GiannaBerettaMolla.jpg
  URL: https://commons.wikimedia.org/wiki/File:GiannaBerettaMolla.jpg
  License: Public domain
  Notes: Photo from 1957, unknown author

Kateri Tekakwitha
  File: Kateri_Tekakwitha_1690.jpg
  URL: https://commons.wikimedia.org/wiki/File:Kateri_Tekakwitha_1690.jpg
  License: Public domain (painting from 1690, author died 1709)
  Notes: Oil painting by Claude Chauchetiere S.J. (1690)

Andre Bessette (Brother Andre)
  File: Frere_Andre_1920.jpg
  URL: https://commons.wikimedia.org/wiki/File:Frere_Andre_1920.jpg
  License: Public domain (Canadian, photo pre-1949)
  Notes: Circa 1920, by Frere Denis c.s.c.

Maximilian Kolbe
  File: Fr.Maximilian_Kolbe_1939.jpg
  URL: https://commons.wikimedia.org/wiki/File:Fr.Maximilian_Kolbe_1939.jpg
  License: Public domain
  Notes: 1939/1940, unknown author

Louis Martin (for Louis and Zelie Martin)
  File: Louis_Martin_1.jpg
  URL: https://commons.wikimedia.org/wiki/File:Louis_Martin_1.jpg
  License: Public domain (photo ca. 1875)
  Notes: Unidentified photographer, very old photo
  Note: Need a separate Zelie Martin photo on Commons

Juan Diego
  File: Juan-Diego.jpg
  URL: https://commons.wikimedia.org/wiki/File:Juan-Diego.jpg
  License: Public domain (18th century painting by Miguel Cabrera, 1695-1768)
  Notes: Painting, not a photograph

== Saints with Creative Commons Licensed Images ==

John Paul II
  File: JPII_29_09_2004_2.JPG
  URL: https://commons.wikimedia.org/wiki/File:JPII_29_09_2004_2.JPG
  License: CC BY-SA 3.0
  Attribution: Radomil Binek
  Requirements: Must credit the author, share-alike

Mother Teresa
  File: MotherTeresa_090.jpg
  URL: https://commons.wikimedia.org/wiki/File:MotherTeresa_090.jpg
  License: CC BY-SA 2.0 de
  Attribution: Turelio
  Requirements: Must credit the author, share-alike
  Alt: White House photo (Reagans and Mother Teresa) - Public domain
  URL: https://commons.wikimedia.org/wiki/File:Reagans_and_Mother_Teresa_C29916-8a.jpg

== Saints Without Free-License Portrait on Commons ==

Carlo Acutis
  Status: RESOLVED (2026-10-03) - no free-license portrait exists on Wikimedia Commons or
    elsewhere (Wikipedia's own infobox photo is a non-free fair-use file sourced from Crux,
    author unknown, restricted to Wikipedia-only use - not reusable). Associazione Amici di
    Carlo Acutis never replied to a direct permission request.
  Decision: Used a photo from the Associazione's own public "download" gallery
    (carloacutis.com/en/association/download), which hosts personal/family photos of Carlo
    for public use. image_url set to a specific file from that gallery
    (public/img/materiale/foto/prev/foto_017.jpg); saints.carlo-acutis also has a
    saint_sources row (source_type: other) crediting the Associazione and linking to the
    gallery page, so provenance is documented if a takedown is ever requested.
  Note: this is an exception to the usual Commons-only convention for saint image_url -
    acceptable here because the image is hosted directly by the rights-holding Associazione
    on their own public gallery, not a third party.

=======================================================================
PUBLIC DOMAIN ART MUSEUM COLLECTIONS
=======================================================================

These museums offer large collections of religious art that are public domain
(CC0) or openly licensed. For pre-1920s paintings, nearly all qualify as
public domain. These are excellent for miracle scene illustrations,
decorative elements, and saint depictions beyond simple portraits.

1. Metropolitan Museum of Art (The Met) - Open Access
   URL: https://www.metmuseum.org/art/collection
   License: CC0 (public domain) for qualifying works - 400,000+ images
   Strengths: Medieval altarpieces, Renaissance religious works, Byzantine icons,
     stained glass, illuminated manuscript leaves
   Best for: Older saints, biblical parallel imagery, decorative details
   Search tips: Use filters -> Open Access + Public Domain
     Search miracle or saint name

2. Art Institute of Chicago
   URL: https://www.artic.edu/collection
   License: CC0 for public domain works
   Strengths: Large religious art collection, strong on medieval manuscript
     illuminations, Renaissance panels. Good tagging and search.
   Best for: Medieval and Renaissance religious scenes

3. Rijksmuseum (Amsterdam)
   URL: https://www.rijksmuseum.nl/en/rijksstudio
   License: Public domain for qualifying works - high-res downloads
   Strengths: Northern Renaissance religious art (van Eyck, Memling, Bosch,
     van der Weyden). Incredible detail in high-res scans.
   Best for: Northern European saints, intricate religious scenes

4. National Gallery of Art (Washington DC)
   URL: https://www.nga.gov/collection.html
   License: Public domain for qualifying works - 50,000+ images
   Strengths: Italian Renaissance (Fra Angelico, Botticelli, Raphael),
     Spanish religious art (El Greco, Zurbaran, Murillo)
   Best for: Italian and Spanish saints, miracle scenes

5. National Gallery (London)
   URL: https://www.nationalgallery.org.uk/paintings
   License: Most pre-1900 works are public domain, downloadable
   Strengths: World-class collection of religious paintings.
     Strong on Raphael, Caravaggio, Duccio, Giotto
   Best for: Major miracle scene paintings, artist attribution pages

6. Los Angeles County Museum of Art (LACMA)
   URL: https://collections.lacma.org
   License: Public domain for qualifying works - 20,000+ images
   Strengths: Spanish colonial religious art (useful for Juan Diego and Guadalupe)

7. Cleveland Museum of Art
   URL: https://www.clevelandart.org/art/collection
   License: CC0 for public domain works
   Strengths: Medieval art, religious iconography, Byzantine and Coptic art

8. J. Paul Getty Museum (Open Content)
   URL: https://www.getty.edu/art/collection/
   License: Digital images of public domain works are CC0
   Strengths: Illuminated manuscripts, medieval religious art, European paintings

9. Morgan Library and Museum
   URL: https://www.themorgan.org/collection
   License: Public domain for qualifying works
   Strengths: Medieval and Renaissance illuminated manuscripts. Books of Hours
     with saint depictions and religious scenes.

10. British Library Digitised Manuscripts
    URL: https://www.bl.uk/manuscripts/
    License: Public domain for pre-1900 manuscripts
    Strengths: Thousands of illuminated manuscripts fully digitized. Saint
      cycles, miracle scenes, decorative initials, borders.
    Best for: Medieval manuscript art, historiated initials, decorative elements

11. Gallica (Bibliotheque nationale de France)
    URL: https://gallica.bnf.fr
    License: Public domain for qualifying works
    Strengths: Massive collection of French illuminated manuscripts. Books of
      Hours, Golden Legend manuscripts with saint miracle cycles.
    Search: Use saint name in French search
    Best for: High medieval French manuscript art

12. Vatican Apostolic Library (DigiVatLib)
    URL: https://digi.vatlib.it
    License: Public domain for most pre-1920s manuscripts
    Strengths: The Vatican's own library digitization project. Manuscripts
      including hagiographic cycles, biblical scenes.
    Best for: Authoritative religious manuscript art from the Vatican

13. Yale University Art Gallery
    URL: https://artgallery.yale.edu/collection
    License: CC0 for public domain works
    Strengths: European paintings, religious art collection

14. Wellcome Collection (London)
    URL: https://wellcomecollection.org/works
    License: CC0 for most works
    Strengths: Medical and healing imagery. Art depicting healings, medical
      history. Unique resource for miracle healing visual context.

15. The Public Domain Review
    URL: https://publicdomainreview.org/collections/
    License: Curated public domain works from multiple sources
    Strengths: Themed collections, high-quality curation
    Best for: Discovering unexpectedly relevant religious imagery

=======================================================================
WELL-KNOWN MIRACLE ART CYCLES (All Public Domain)
=======================================================================

Specific artworks and cycles that depict miracle scenes directly. These are
excellent for hero images on saint and miracle detail pages.

1. Giotto di Bondone (1267-1337) - Scrovegni Chapel, Padua
   Life of Christ miracles: Raising of Lazarus, Wedding at Cana, Healing of
     the Paralytic, Raising of Jairus Daughter
   Also: Scrovegni has key saint scenes including St. Joachim and St. Anne
   Location: Wikimedia Commons - full cycle available at high res
   License: Public domain (painted 1303-1305)

2. Duccio di Buoninsegna (1255-1319) - Maesta Altarpiece
   Miracle scenes: Many Christ miracles from the predella panels (Wedding at
     Cana, Raising of Lazarus, Healing of the Blind Man, Transfiguration)
   Location: Museo dell Opera del Duomo, Siena and other museums
   License: Public domain

3. Fra Angelico (1395-1455) - San Marco Friary, Florence
   Paintings of saints in contemplative moments
   Key works: Annunciation, Transfiguration, various saint frescoes
   Location: Convent of San Marco, Florence (now a museum)
   License: Public domain

4. Raphael (1483-1520) - Vatican Stanze
   Miracles from the lives of Saints Peter and Paul
   Key works: Healing of the Lame Man, Liberation of St. Peter,
     St. Paul Preaching in Athens
   License: Public domain

5. Caravaggio (1571-1610)
   The Calling of St Matthew (San Luigi dei Francesi, Rome)
   The Conversion of St Paul (Santa Maria del Popolo, Rome)
   The Crucifixion of St Peter (Santa Maria del Popolo, Rome)
   License: Public domain (all painted pre-1610)

6. El Greco (1541-1614)
   St Peter in Penitence, St Francis and Brother Leo Meditating
   Various saint portraits with intense spiritual presence
   License: Public domain

7. Francisco de Zurbaran (1598-1664)
   Extraordinary series of individual contemplative saints
   Key works: St. Francis in Meditation, St. Serapion, St. Bonaventure,
     St. Thomas Aquinas, St. Anthony Abbot
   Also: Immaculate Conception, Crucifixion
   Best for: Full-body saint portraits with intense spiritual presence
   License: Public domain

8. Bartolome Esteban Murillo (1617-1682)
   St Elizabeth of Hungary Tending the Sick
   Immaculate Conception (several versions)
   Various Spanish saint depictions
   License: Public domain

9. Gustave Dore (1832-1883) - Bible Illustrations
   230 wood-engraved illustrations for the Bible (1866)
   Many miracle scenes from both Old and New Testaments
   Location: Wikimedia Commons has the full set
   License: Public domain (Dore died 1883)
   Best for: Dramatic black-and-white illustrations

10. Albrecht Durer (1471-1528)
    Various saint woodcuts and engravings
    Best for: Print-quality black-and-white saint illustrations
    License: Public domain

=======================================================================
ILLUMINATED MANUSCRIPT RESOURCES
=======================================================================

Medieval illuminated manuscripts are an incredible source of saint art.
Books of Hours, Psalters, and Golden Legend manuscripts contain dozens of
saint miniatures, historiated initials, and decorative borders.

How to find saint-specific manuscript art:
  - Search Gallica (gallica.bnf.fr) for Heures plus saint name
  - Search British Library Digitised Manuscripts for saint plus Book of Hours
  - Search Golden Legend (Legenda Aurea) digitized manuscripts

Key manuscript collections for saint art:
  - Tres Riches Heures du Duc de Berry (Chantilly / BnF)
  - Hours of Jeanne d Evreux (Met Cloisters)
  - Farnese Hours (Morgan Library and Museum)
  - Bedford Hours (British Library)
  - Grimani Breviary (Venice)

License: All pre-1500 manuscripts are public domain

=======================================================================
PRACTICAL USAGE GUIDE
=======================================================================

When selecting images for the website:

1. Attribution Requirements
   - Public Domain (PD): No attribution required, but Courtesy of [Museum] is nice
   - CC0: No attribution required
   - CC BY-SA: Must credit author plus share-alike on your site
   - PD-Art (photo of public domain 2D artwork): No additional copyright

2. Image Formats for Web
   - Hero/large images: JPG or WebP, 1200-1920px wide
   - Saint thumbnails/cards: Square crops, 200-400px
   - Icons/initials: PNG with transparency
   - Convert high-res museum images to WebP for faster loading

3. Where to Use What
   - Saint detail pages: Portrait photo plus a miracle scene painting
   - Hero banners: Giotto/Duccio miracle scenes (full width, cropped)
   - Saint cards/thumbnails: Byzantine icon style or Zurbaran portrait
   - Decorative elements: Illuminated initials for saint names
   - Background patterns: Subtle manuscript border details or Dore engravings

4. Fallback for Saints Without Free Portraits
   - Carlo Acutis: No free-license photo available
     Options:
     (1) Commission or create a digital icon in iconographic style
     (2) Use AI-generated portrait (US public domain per 2025 Copyright Office ruling)
     (3) Use a silhouette or symbolic representation (Eucharist for Carlo)
     (4) Contact the Carlo Acutis Association directly

=======================================================================
AI-GENERATED ART OPTION
=======================================================================

For saints lacking public domain images (especially modern ones like Carlo
Acutis), AI-generated art in a reverent style is a valid option.

Current copyright status (as of 2026):
  - Works created entirely by AI (no human creative input) are US public domain
  - Can be used freely on any website
  - Style suggestion: Byzantine icon style for saint profile images
  - Style suggestion: Illuminated-manuscript-inspired miniature style

This approach is useful for:
  - Carlo Acutis (no PD photo exists)
  - Custom decorative elements matching the sites visual theme
  - Miracle illustrations where no period artwork exists

=======================================================================
ADDITIONAL IMAGE RESOURCES
=======================================================================

16. New York Public Library Digital Collections
    URL: https://digitalcollections.nypl.org
    License: Many public domain works
    Strengths: Religious prints, early modern saint depictions

17. Smithsonian Open Access
    URL: https://www.si.edu/openaccess
    License: CC0 for most collections
    Strengths: Religious art, folk art with religious themes

18. WikiArt Visual Art Encyclopedia
    URL: https://www.wikiart.org
    License: Most pre-1920s works listed as public domain
    Strengths: Curated by artist, themed collections, searchable by saint name

19. Old Book Illustrations
    URL: https://www.oldbookillustrations.com
    License: Public domain (pre-1920s illustrations)
    Strengths: High-quality scans of 19th century wood engravings.
      Searchable by theme (saint, angel, miracle, etc.)

20. NGA Images (National Gallery of Art, Washington)
    URL: https://images.nga.gov
    License: CC0
    Strengths: Dedicated image download site with high-res TIFF/JPG

=======================================================================
NOTE-TAKING / RESEARCH WORKFLOW
=======================================================================

For each saint, the research folder contains:
  - Data: Schema-structured fields matching the database model
  - Biography: Long-form biographical sketch (~300 words, to be written)
  - Miracle 1, 2, 3, ...: Individual miracle synopses (~500-1000 words, to be written)

When adding new research:
  1. Update the saint's Data note with any new factual findings
  2. Write biography and synopsis content in their respective notes
  3. Add image_url and wikipedia_url to Data note
  4. Update Sources section with new source URLs

=======================================================================
KEY FACTS VERIFIED
=======================================================================

- Carlo Acutis canonized: September 7, 2025 by Pope Leo XIV
- Carlo Acutis canonized alongside: Pier Giorgio Frassati
- Carlo's body: NOT incorrupt (wax-encased display, normal decay confirmed by Archbishop Sorrentino)
- Carlo's second miracle: Valeria Valverde, brain haemorrhage from bicycle fall in Florence, 2022
- Juan Diego beatification: equipollent (dispensed from miracle requirement)
- Maximilian Kolbe: martyr (only 1 miracle required, but 2 confirmed)

=======================================================================
EXPANDED MIRACLE CATEGORIES — RESEARCH SOURCES
=======================================================================

These are the primary research sources for the Tier 2 (catalog) miracle
categories — see the `content_tier` field (CLAUDE.md's `miracles` table)
for the `core` / `catalog` / `stub` distinction these categories map to.

-----------------------------------------------------------------------
Marian Apparitions
-----------------------------------------------------------------------

1. Miracle Hunter — Apparitions
   URL: https://www.miraclehunter.com/marian_apparitions/
   Content: Comprehensive catalog organized by approval level and century
   Use: Primary reference for the apparition overview note
   Categories: Vatican-Approved (15), Bishop-Approved (10),
     Traditionally Approved (19), Approved for Faith Expression (13),
     Coptic Approved (7)
   Note: Dated design but thorough. Cross-reference with Vatican.

2. Vatican — Norms for Apparition Discernment
   URL: https://www.vatican.va/roman_curia/congregations/cfaith/documents/
   Content: Official norms for judging apparition claims
   Use: Understanding the formal approval process

3. EWTN — Marian Apparitions Library
   URL: https://www.ewtn.com/catholicism/library/marian-apparitions-11792
   Content: Articles and resources on major apparitions
   Use: Narrative context and verification

-----------------------------------------------------------------------
Eucharistic Miracles
-----------------------------------------------------------------------

4. Carlo Acutis — Eucharistic Miracles Exhibition (DEFINITIVE)
   URL: https://www.miracolieucaristici.org/en/Liste/list.html
   Content: 153 Church-approved Eucharistic miracles, photographic panels
   Use: Primary reference for all Eucharistic miracle data
   Note: This is the gold standard. Do NOT duplicate data — link to it.
     The exhibition has been displayed in 10,000+ parishes worldwide.
   Maintained by: Associazione Amici di Carlo Acutis
     (info@carloacutis.com)

5. Miracle Hunter — Eucharistic Miracles
   URL: https://www.miraclehunter.com/eucharistic_miracles/
   Content: Additional Eucharistic miracle listings
   Use: Cross-reference with Carlo's site

-----------------------------------------------------------------------
Incorruptibles
-----------------------------------------------------------------------

6. The Incorruptibles (book) — Joan Carroll Cruz
   URL: TAN Books / Amazon
   Content: The definitive reference — over 100 documented cases
   Use: Names, locations, dates, preservation details
   ISBN: 978-0895553968 (TAN Books, 1977/1991)

7. Miracle Hunter — Incorruptibles
   URL: https://www.miraclehunter.com/incorruptibles/
   Content: ~90 saints organized by century (177 AD - 1999)
   Use: Quick reference, century-by-century breakdown

8. Wikipedia — Category:Incorrupt saints
   URL: https://en.wikipedia.org/wiki/Category:Incorrupt_saints
   Content: ~98 saints in a searchable list
   Use: Quick lookup, initial verification

9. Catholic Encyclopedia — Incorruptibility
   URL: https://www.newadvent.org/cathen/07710a.htm
   Content: Theological background on incorruptibility
   Use: Understanding the phenomenon

-----------------------------------------------------------------------
Stigmata
-----------------------------------------------------------------------

10. Miracle Hunter — Stigmata
    URL: https://www.miraclehunter.com/stigmata/
    Content: ~38+ entries organized by century (1200-1999),
      ~320 stigmatics total in history
    Use: Primary reference for stigmata overview

11. Catholic Encyclopedia — Mystical Stigmata
    URL: https://www.newadvent.org/cathen/14294b.htm
    Content: Dr. Imbert's statistical analysis (321 cases, 41 men,
      62 saints/blessed)
    Use: Authoritative statistics and theological analysis

12. Wikipedia — Stigmata
    URL: https://en.wikipedia.org/wiki/Stigmata
    Content: Overview with references, list of notable cases
    Use: Initial research, cross-referencing

-----------------------------------------------------------------------
Miraculous Images
-----------------------------------------------------------------------

13. Miraculous Images of Our Lady (book) — Joan Carroll Cruz
    URL: TAN Books / Amazon
    Content: 126 cataloged images by century (40 AD - 1899)
    Use: Names, types (statue/painting/icon/tilma), locations, phenomena
    ISBN: 978-0895554842 (TAN Books)

14. Miracle Hunter — Miraculous Images
    URL: https://www.miraclehunter.com/miraculous_images/
    Content: Century-organized catalog (126 entries)
    Use: Quick reference for image type, location, date

15. Our Lady of Guadalupe — Official Site
    URL: https://www.virgendeguadalupe.mx
    Content: The definitive site for the Tilma of Guadalupe
    Use: Primary reference for the most famous miraculous image
    Note: Scientific studies of the tilma (no paint source, eye reflections)

-----------------------------------------------------------------------
Miracles of Nature
-----------------------------------------------------------------------

16. Miracle of the Sun — Wikipedia
    URL: https://en.wikipedia.org/wiki/Miracle_of_the_Sun
    Content: Comprehensive coverage of the Fatima solar phenomenon
    Use: Primary reference for the most documented nature miracle

17. Vatican — Fatima Documents
    URL: https://www.vatican.va/roman_curia/congregations/cfaith/documents/
    Content: Official Church documents on the Fatima apparitions
    Use: Canonical investigation records, Bishop da Silva's 1930 declaration

18. Catholic Encyclopedia — Miracles (nature classification)
    URL: https://www.newadvent.org/cathen/10338a.htm
    Content: Theological classification of nature miracles
    Use: Understanding the category

-----------------------------------------------------------------------
Lourdes Healings (Verified Non-Canonization)
-----------------------------------------------------------------------

19. Sanctuary of Lourdes — Medical Bureau
    URL: https://www.lourdes-france.org/en/the-miracles-of-lourdes/
    Content: 70 officially recognized healings, medical documentation
    Use: Primary reference for all Lourdes miracle data
    Note: 7,000+ reported healings, 70 declared miraculous.
      80% women, most by contact with Lourdes water.
      Includes list of recognized cases with medical details.

20. International Medical Committee of Lourdes (CMIL)
    URL: Via Sanctuary of Lourdes website
    Content: Medical verification documentation
    Use: Understanding the 7-criteria verification process

21. Lourdes Healings — Wikipedia
    URL: https://en.wikipedia.org/wiki/Lourdes_healings
    Content: Overview of notable cases and process
    Use: Quick reference for key cases (Catherine Latapie, Pierre de Rudder,
      Gabriel Gargam, Vittorio Micheli, etc.)

-----------------------------------------------------------------------
Miraculous & Saintly Phenomena
-----------------------------------------------------------------------

22. Miracle Hunter — Apparitions to Saints
    URL: https://www.miraclehunter.com/marian_apparitions/saints/
    Content: Apparitions of Christ and Mary to saints
    Use: Reference for visions and private revelations

23. Catholic Encyclopedia — Mystical Phenomena
    URL: https://www.newadvent.org/cathen/ (search for bilocation,
      levitation, inedia, ecstasy)
    Content: Authoritative articles on each phenomenon
    Use: Understanding the phenomena, Church's position

24. The Physical Phenomena of Mysticism (book) — Herbert Thurston, S.J.
    URL: Amazon / used bookstores
    Content: Classic (1952) analysis of stigmata, levitation, bilocation,
      luminosity, inedia, ecstasy
    Use: Critical but fair analysis from a Jesuit scholar

-----------------------------------------------------------------------
GENERAL / CROSS-CATEGORY
-----------------------------------------------------------------------

25. Catholic Answers — Miracle Types
    URL: https://www.catholic.com
    Content: Apologetics articles on miracle categories
    Use: Understanding Church teaching on different miracle types

26. New Advent Catholic Encyclopedia
    URL: https://www.newadvent.org/cathen/
    Content: Comprehensive pre-Vatican II Catholic encyclopedia
    Use: Authoritative articles on all miracle-related topics.
      Search for specific miracle, phenomenon, or saint.

27. Vatican — Dicastery for the Causes of Saints
    URL: https://www.vatican.va/roman_curia/congregations/csaints/
    Content: Official procedures for canonization miracle verification
    Use: Understanding the formal miracle approval process

-----------------------------------------------------------------------
IMAGE SOURCES — Miracle Categories
-----------------------------------------------------------------------

For Marian apparition images:
  - Official shrine websites (lourdes-france.org, fatima.pt, etc.)
  - Wikimedia Commons — search by apparition name (e.g. Our Lady of Guadalupe)

For Eucharistic miracle images:
  - Carlo Acutis exhibition panels (miracolieucaristici.org — photographic)
  - Wikimedia Commons — search by miracle location (e.g. Lanciano, Bolsena)

For incorruptible saint images:
  - Wikimedia Commons — search by saint name + body/tomb/reliquary
  - Shrine websites often have photos of the incorrupt body on display

For stigmata images:
  - Wikimedia Commons — St. Francis of Assisi receiving stigmata (Giotto),
    St. Padre Pio photographs, St. Catherine of Siena
  - Note: Many stigmata images are artistic depictions, not photographs

For miraculous image photos:
  - Wikimedia Commons — search by title (e.g. Our Lady of Czestochowa,
    Our Lady of Guadalupe, Montserrat)
  - Vatican Museums — Byzantine icons collection
  - Official shrine websites

