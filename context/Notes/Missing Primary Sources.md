# Missing Primary Sources — Beatification/Canonization Miracles

Standard: every `core`-tier canonization/beatification miracle (`used_for_beatification` or `used_for_canonization` = true, `approval_authority: vatican_dicastery`) should have a `source_type: vatican_decree` row in `miracle_sources` — the Vatican's own record that the case was used. Identified 2026-09-28 by querying for core-tier miracles with `used_for_beatification`/`used_for_canonization` = true and no `vatican_decree` row on file. Most already have secondary sourcing (news/academic/other) — the decree itself is what's missing, and for a canonization case the decree should be findable at vatican.va. Delete a row once a `vatican_decree` source is added in the admin panel.

Not included here: 20 other core-tier miracles (apparitions, Eucharistic miracles, incorruptibles, stigmata — Fatima, Akita, Lourdes, the Tilma of Guadalupe, Lanciano, Padre Pio's stigmata, etc.) that also lack a `vatican_decree` row. Those are typically approved by a local bishop or nihil obstat rather than a dicastery decree, so "primary source" likely means something else for that group — open question, not yet defined.

---

## Zero sources on file (investigate from scratch)

These two have no `miracle_sources` rows at all — not just missing a decree, but missing everything. Research from the ground up before circling back to the table below.

| Saint | Miracle | Slug | Tier | Notes |
|---|---|---|---|---|
| Kateri Tekakwitha | Healing of an Unnamed Native American Boy | `healing-of-native-american-boy` | core | Used for beatification (1980) |
| Catherine Labouré | Canonization Miracle of Catherine Labouré | `canonization-miracle-of-catherine-laboure` | catalog | Not part of the core standard above (catalog-tier), but flagged since it has zero sourcing of any kind |

---

## Missing `vatican_decree` source (33 miracles)

| Found | Saint | Miracle | Slug | Used For | Existing Sources |
|---|---|---|---|---|---|
| No | Bernadette Soubirous | Healing of Sister Marie-Mélanie Meyer | `healing-of-sister-marie-melanie-meyer` | beatification | academic(1) |
| No | Bernadette Soubirous | Healing of Sister Marie de Saint-Fidèle | `healing-of-sister-marie-de-saint-fidele` | canonization | academic(1) |
| No | Bernadette Soubirous | Healing of Henri Boisselet | `healing-of-henri-boisselet` | beatification | academic(1) |
| No | Carlo Acutis | Healing of Matheus (Pancreatic Disease) | `healing-of-matheus` | beatification | news_article(1) |
| No | Carlo Acutis | Healing of Valeria Valverde | `healing-of-valeria-valverde` | canonization | news_article(1) |
| No | Edith Stein | Healing of Benedicta McCarthy from Acetaminophen Poisoning | `healing-of-benedicta-mccarthy-from-acetaminophen-poisoning` | canonization | news_article(2), other(1) |
| No | Elizabeth Ann Seton | Healing of Sister Gertrude Korzendorfer | `healing-of-sr-gertrude-korzendorfer` | beatification | news_article(1) |
| No | Elizabeth Ann Seton | Healing of Anne Theresa O'Neill from Acute Leukemia | `healing-of-anne-theresa-oneill` | beatification | academic(1), other(2), news_article(2) |
| No | Elizabeth Ann Seton | Healing of Carl Kalin from Primary Encephalitis | `healing-of-carl-kalin` | canonization | news_article(2) |
| No | Father Damien | Healing of Sister Simplicia Hue | `healing-of-sr-simplicia-hue` | beatification | news_article(1) |
| No | Father Damien | Healing of Audrey Toguchi from Metastatic Liposarcoma | `healing-of-audrey-toguchi` | canonization | news_article(3) |
| No | Faustina Kowalska | Healing of Maureen Digan | `healing-of-maureen-digan` | beatification | news_article(1) |
| No | Faustina Kowalska | Healing of Fr. Ronald Pytel | `healing-of-fr-ronald-pytel` | canonization | other(3), news_article(1) |
| No | Francisco & Jacinta Marto | Healing of Maria Emilia Santos | `healing-of-maria-emilia-santos` | beatification | other(1) |
| No | Francisco & Jacinta Marto | Healing of Lucas Maeda de Oliveira | `healing-of-lucas-maeda-de-oliveira` | canonization | news_article(4), other(2) |
| No | Fulton Sheen | Healing of James Fulton Engstrom | `healing-of-james-fulton-engstrom` | beatification | news_article(4) |
| No | John Henry Newman | Healing of Deacon Jack Sullivan | `healing-of-deacon-jack-sullivan` | beatification | news_article(2), other(2) |
| No | John Henry Newman | Healing of Melissa Villalobos | `healing-of-melissa-villalobos` | canonization | news_article(4), other(1) |
| No | John Neumann | Healing of Eva Benassi from Peritonitis | `healing-of-eva-benassi-from-peritonitis` | beatification | academic(1), other(1) |
| No | John Neumann | Healing of J. Kent Lenahan from Traumatic Injuries | `healing-of-kent-lenahan-from-traumatic-injuries` | beatification | other(1), academic(2) |
| No | John Neumann | Healing of Michael Flanigan from Bone Cancer | `healing-of-michael-flanigan-from-bone-cancer` | canonization | other(2), academic(1) |
| No | Kateri Tekakwitha | Healing of Jake Finkbonner | `healing-of-jake-finkbonner` | canonization | news_article(4) |
| No | Louis & Zélie Martin | Healing of Pietro Schiliro | `healing-of-pietro-schiliro` | beatification | news_article(1), other(1) |
| No | Louis & Zélie Martin | Healing of Carmen Perez Pons | `healing-of-carmen-valencia` | canonization | other(1), news_article(2) |
| No | Maximilian Kolbe | Healing of Angela Testoni | `healing-of-angela-testoni` | beatification | other(1) |
| No | Maximilian Kolbe | Healing of Francis Ranier | `healing-of-francis-ranier` | beatification | other(1) |
| No | Padre Pio | Healing of Consiglia De Martino | `healing-of-consiglia-de-martino` | beatification | academic(1), other(1), news_article(1) |
| No | Padre Pio | Healing of Matteo Pio Colella | `healing-of-matteo-pio-colella` | canonization | other(2), news_article(1) |
| No | Pier Giorgio Frassati | Healing of Domenico Sellan | `healing-of-domenico-sellan` | beatification | other(1), news_article(1) |
| No | Pope John Paul II | Healing of Floribeth Mora Diaz | `healing-of-floribeth-mora-diaz` | canonization | news_article(1) |
| No | Thérèse of Lisieux | Healing of Charles Anne | `healing-of-charles-anne` | beatification | other(1), news_article(1) |
| No | Thérèse of Lisieux | Healing of Sister Louise of Saint-Germain | `healing-of-sister-louise-of-saint-germain` | beatification | other(1), news_article(1) |

Note: Francisco/Jacinta Marto share the same two miracle records (jointly attributed); same for Louis/Zélie Martin — listed once per saint pairing above, not duplicated per individual saint.
