=======================================================================
SAINT (saints table)
=======================================================================
Slug:                [kebab-case-slug]
Name:                [Common/devotional name — primary display name, e.g. "Mother Teresa", "Padre Pio"]
Saint Name:          [Formal Vatican/devotional title, e.g. "Saint Teresa of Calcutta" — nullable, omit if not applicable]
Birth Name:          [Legal birth name, if different from Name]
Birth Date:          [Month Day, Year]
Death Date:          [Month Day, Year]
Feast Day:           [Month Day — text form]
Feast Scope:         [universal | national | martyrologium | diocesan | order — check existing DB saints from the same country/order for precedent before guessing; American saints are typically 'national', not 'universal']
Religious Order:     [e.g. "Franciscan" — omit if lay person]
Nationality:         
Ministry Country:    [country where the saint primarily served, if different from nationality]
Beatification Date:  
Beatified By:        [Pope name]
Canonization Date:   [omit if not yet canonized]
Canonized By:        [Pope name]
Canonization Type:   [confessor | martyr | virgin | married_couple | other]
Canonization Stage:  [saint | blessed | venerable | servant_of_god — mutable, reflects current status]
Patronage:           [comma-separated formal patronages]
Themes:              [comma-separated — MUST be from the canonical SAINT_THEMES list in src/db/topics.ts: hope, perseverance, conversion, eucharistic, marian, martyrs, missionaries, saints-of-everyday-life, spiritual-direction, technology. Do not invent new values.]
Biography Short:     See Biography note
Gender:              [male | female | group]
Lay Person:          [true | false]
Beatification Miracle Dispensed:[true | false]
Canonization Miracle Dispensed:[true | false]
Dispensation Reason: [martyr | equipollent | papal_exception — only set if a dispensation boolean above is true]
Image URL:           [Wikimedia Commons public domain URL — prefer an unframed upper-body portrait or photo to match the style already used across the site]
Wikipedia URL:       

=======================================================================
SAINT SOURCES (saint_sources table)
=======================================================================
1. URL: | Title: | Type: [vatican_decree | news_article | book | academic | other]

=======================================================================
RELATIONS (saint_relations table)
=======================================================================
Related Saint:       [only if canonized/beatified alongside another saint, part of a family/group cause, etc. — omit section entirely if none]
Relation Type:       [canonized_together | same_order | family]

=======================================================================
SAINT LOCATIONS (saint_locations table)
=======================================================================
1. Location: [name] | Lat: | Lng: | Type: [tomb | birthplace | death_place | shrine | relic | major_devotional_center | other]

=======================================================================
