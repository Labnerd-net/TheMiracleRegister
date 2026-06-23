Miracles Project - Existing Websites Landscape

RESEARCH CONDUCTED: May 29, 2026

1. Carlo Acutis - Eucharistic Miracles Exhibition
   URL: www.miracolieucaristici.org
   Status: ACTIVE - still maintained by Associazione Amici di Carlo Acutis
   Focus: Eucharistic miracles only (host, blood, wine to blood transformations)
   Format: Organized by country, with individual pages per miracle
   Data: Location, year, description, photographic panels
   Limitations: No medical documentation, no saint intercession miracles, primarily an exhibition poster catalog rather than a searchable database
   Notes: This was Carlo Acutis' original project - he created it as a teenager. The site is still well-maintained with 15+ languages. Our project would NOT duplicate this (different focus entirely).

2. The Miracle Hunter
   URL: www.miraclehunter.com
   Status: ACTIVE - seems maintained through at least 2015
   Focus: Apparitions (especially Marian), Eucharistic miracles, miraculous images, stigmata, incorruptibles
   Format: Topical directories with descriptive pages
   Limitations: No structured database, no canonization miracle focus, no saint-specific intercession miracles section. Site design is very dated (tables-based layout)
   Notes: Good reference but not a structured data project

3. Vatican News / Liturgy - Saints Canonizations
   URL: www.vatican.va/news_services/liturgy/saints/index_saints_en.html
   Status: ACTIVE - official Vatican source
   Focus: Canonization calendars with biographies
   Format: Chronological listing with basic bio info per saint
   Limitations: Not a database, no miracle details, Italian-heavy documentation. Biographies only - miracles not separately cataloged
   Notes: Valuable as a source for canonization dates and official biography links

4. Catholic Online - Saints & Angels
   URL: www.catholic.org/saints/
   Status: ACTIVE
   Focus: Saint biographies with prayer requests
   Format: Saint directory, saint of the day, patron saint index
   Limitations: Miracle section URL (saints/miracles.php) returns 404. Miracles mentioned within saint bios but not structured. No searchable miracle database
   Notes: Good saint reference but no useful miracle-level data structure

5. Wikipedia (Saint miracle pages)
   URL: en.wikipedia.org (various saint pages)
   Status: ACTIVE
   Focus: Individual saint biographies
   Format: Wiki articles with citations
   Limitations: Decentralized, inconsistent coverage, not a database. Good starting point for research but unusable as a structured source
   Notes: Useful for initial research, verify against Vatican sources

6. EWTN / National Catholic Register / Catholic News Agency
   URL: Various (ncregister.com, catholicnewsagency.com, ewtn.com)
   Status: ACTIVE
   Focus: News articles about miracles
   Format: Journalistic articles
   Limitations: News reporting, not structured data. Good for verification and narrative context
   Notes: Useful for synopsis writing - they cover miracle stories in depth

7. Hagiography Circle
   URL: www.hagiographycircle.com
   Status: DOMAIN PARKED / NOT ACTIVE
   Notes: Formerly tracked causes for canonization; now a parked domain

GAP ANALYSIS:
There is NO existing website that:
- Provides a searchable, structured database of saint intercession miracles
- Includes both Vatican documentation AND narrative synopses
- Categorizes miracles by saint, type, date, location, and medical details
- Links miracles to their specific use in beatification/canonization processes
- Presents the data in a modern, responsive, data-driven format
- Allows filtering by saint, miracle type, century, medical condition, etc.

This is a genuine gap in Catholic online resources. Carlo's Eucharistic miracle site is excellent but covers different ground. The Miracle Hunter covers types of miracles but not saint-specific intercession. No one has built the equivalent of Carlo's work for saint canonization miracles.

CONCLUSION: The project would fill a real niche with minimal duplication of existing work.

8. catholic-miracles.com
   URL: https://catholic-miracles.com/
   Status: ACTIVE - last updated June 2026
   Focus: Catholic miracles broadly — Marian apparitions, Eucharistic miracles, and saint/healing miracles
   Format: Data-driven, modern responsive site with REST API (https://catholic-miracles.com/api/miracles)
   Contact Email: catholicmiraclesdev@gmail.com (for potential collaboration)
   Data Export: Full JSON dump at /api/data?scope=full (public, no auth required)
   Total entries: 126 miracles (7 Eucharistic, 12 Marian, 107 saint/healings)

   WHAT IT COVERS (saints from our list):
     John Paul II (2), Mother Teresa (2), Gianna Beretta Molla (1), Kateri Tekakwitha (1), Carlo Acutis (1), Pier Giorgio Frassati (1), Juan Diego (2 including Guadalupe)
   NOT COVERED from our 11:
     Padre Pio, Faustina Kowalska, Andre Bessette, Maximilian Kolbe, Louis & Zelie Martin

   DATA STRUCTURE PER MIRACLE:
     - slug, title, type (saints/marian/eucharistic), location, country, year, century
     - description (short), fullNarrative, whatHappened, whySignificant, whyBelieve
     - approvalStatus (diocese/investigation/local/vatican) — single string, not split by beatification vs canonization
     - tags (99 unique), sources (array of strings), url
   NOT IN THEIR DATA MODEL:
     - No structured medical data (no diagnosis field, cure characteristics, recipient age/gender)
     - No geolocation (lat/lng for maps)
     - No relational data model (flat JSON, not normalized DB with foreign keys)
     - No two-tier miracle model (intercessory vs associated)
     - No separation of beatification vs canonization designation
     - No filtering by medical condition, cure type, or recipient details

   COMPARISON WITH OUR PROJECT:
     catholic-miracles.com is complementary, not a direct competitor. Their angle is a broad miracle catalog with narrative articles. Our angle is a structured, medically-detailed database of saint canonization miracles. Their 107 saint entries are largely Lourdes healings (90+) rather than canonization-specific miracles. The structured medical schema in our Drizzle model is the moat that sets us apart — no existing site has diagnosis-level filtering, cure characteristics, or the beatification/canonization split.

   WHAT TO LEARN FROM THEM:
     - Clean UX for browsing miracle types
     - "Surprise Me" random miracle button
     - Skeptic-facing content (separate "For Skeptics" page with scientific evidence, secular testimony, and common objections)
     - AI chatbot about Catholicism
     - Open API from day one (they made their full JSON public)
     - Tags covering medical conditions, evidence types, and saint categories

   GAP REINFORCED:
     Despite adding this site to the landscape, our gap analysis holds. No existing site provides structured, filterable saint canonization miracle data with medical documentation depth.

9. Glenn Dallaire's Site Network (Miracles of the Church / Miracles of the Saints)
   URL: https://www.miraclesofthechurch.com/ / https://www.miraclesofthesaints.com/
   Status: ACTIVE but static — last substantive content circa 2010
   Author: Glenn Dallaire, help desk analyst from Bristol, Connecticut
   Format: Old-school Blogger platform, single-person devotional blog
   Focus: Broad Catholic miracle hagiography — stigmata, bilocation, incorrupt bodies, miraculous cures, prophecy, levitation, voices from heaven, etc.

   WHAT IT COVERS:
     - 15+ categories of miracles organized by type (stigmata, bilocation, etc.)
     - Each category is a blog post with extensive quoted narrative from saint biographies
     - Covers lifetime miracles performed BY saints (healing during their ministry, bilocation, etc.)
     - Some incorrupt body coverage
     - Devotional/edification purpose, not research

   WHAT IT DOES NOT DO (relevant to our project):
     - No posthumous intercessory miracles (healings after a saint's death used for canonization)
     - No Vatican documentation, medical board verdicts, or canonization process references
     - No structured data, no database, no API, no search/filter
     - No geolocation, no source trails, no cross-referencing
     - No medical details (diagnosis, cure characteristics, recipient info)
     - Not organized by saint — organized by miracle TYPE
     - Content is curated by one person from pre-existing hagiographic sources, not Vatican primary sources

   COMPARISON WITH OUR PROJECT:
     This is the least relevant of the three sites. It covers a completely different thing — extraordinary spiritual phenomena in the lives of saints (stigmata, bilocation, levitation, etc.) — not the Vatican-confirmed intercessory healings used for canonization. Its "miraculous cures" section covers lifetime healings performed BY saints, not posthumous healings attributed TO saints. The audience, purpose, and data model have essentially no overlap with TheMiraclesRegister.

   GAP ANALYSIS REINFORCED:
     Adding these two sites to the landscape confirms the gap even more strongly:
     - catholic-miracles.com: Broad narrative catalog of miracles, no structured medical data
     - miraclesofthechurch/saints.com: Devotional hagiography blog, not organized by saint or canonization
     - TheMiraclesRegister.org: Structured, searchable database of Vatican-confirmed canonization miracles with medical documentation depth

UPDATED CONCLUSION (after evaluating 9 sites):
No existing website provides a structured, searchable, medically-detailed database of saint canonization miracles that:
- Links miracles to their specific use in beatification/canonization processes
- Categorizes by saint, type, date, location, AND medical details
- Includes structured medical data (diagnosis, cure type, recipient info)
- Provides geolocation for map-based discovery
- Presents data via both a modern web UI and a REST API
- Sources from Vatican primary documentation (Consulta Medica, Dicastery decrees)

The gap is genuine. The closest is catholic-miracles.com, but it's a narrative catalog (not a structured database) and its 107 saint entries are mostly Lourdes healings (90+) rather than canonization-specific miracles.

