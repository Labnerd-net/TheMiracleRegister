# Proofreading report — 2026-10-04

## Summary

Full scan, published only: 114 records checked (86 miracles + 28 saints).
51 issues found across 42 records (72 records had nothing to flag).

By category: grammar 10, structure/repetitive-openers 9, name/spelling
consistency 11, run-on 4, punctuation 3, numeric/date style 5, spelling 3,
word-choice 1, pacing 1, meta-commentary aside 1, logic/date contradiction 1,
stray abbreviation 1 (note: a few findings below span two categories and
are listed once under the primary one, so the numbers above won't sum
exactly to 51).

**Status: 50 of 51 fixed in the DB.** All 5 of the findings that originally
needed a source check before touching have now been checked — 4 confirmed
and fixed, 1 left open because the source needed (a 1974 NYT archive piece)
is paywalled and no accessible alternative gave the missing detail. See
"Source-checked findings" at the end for what was verified and where.

## Findings by record

**our-lady-of-fatima** (miracle)
- [FIXED][grammar] "her cousins Francisco Marto was nine and Jacinta Marto was seven" — plural "cousins" paired with two singular clauses — "her cousin Francisco Marto was nine and her cousin Jacinta Marto was seven"

**our-lady-of-akita** (miracle)
- [FIXED][run-on] "bled on Fridays...1973, the day it closed and the statue's body was found covered..." — three ideas stacked in one sentence — split after "1973." then "That was the day the wound closed and the statue's body was found covered in a sweat-like moisture."

**healing-of-sr-caterina-capitani** (miracle)
- [FIXED][word-choice] "the healing was inexplicably scientific" — phrase is reversed from the standard term used elsewhere in this dataset — "the healing was scientifically inexplicable"

**healing-of-pietro-schiliro** (miracle)
- [FIXED][date/logic] "made a pilgrimage of thanksgiving to Lisieux...at the end of 2002" contradicts "by then six years old" (born May 25, 2002) — changed "2002" to "2008"

**healing-of-henri-boisselet** (miracle)
- [FIXED][grammar] cure_details: "Had received Last Sacraments before the cure." — sentence fragment missing subject — "He had received Last Sacraments before the cure."

**healing-of-floribeth-mora-diaz** (miracle)
- [FIXED][name-consistency] recipient_name "Floribeth Mora Diaz" vs. synopsis "Floribeth Mora Díaz" — accent present in prose, absent from the record's own `recipient_name`/title — added accent to `recipient_name`

**healing-of-sr-gertrude-korzendorfer** (miracle)
- [STILL OPEN][pacing] "Sister Gertrude recovered completely from the cancer." — the record's only cited source (a 1974 NYT archive piece) is paywalled and not fetchable. A web search turned up nothing beyond what's already in the record (diagnosed January 1935, died 1942) — no documented follow-up exams or precise recovery date like the Anne O'Neill case has. Left as-is rather than inventing detail; would need the NYT piece or another primary source to expand responsibly.

**healing-of-benedicta-mccarthy-from-acetaminophen-poisoning** (miracle)
- [FIXED][grammar] "prayed an urgent and sustained intercession" — non-idiomatic; you pray *for* intercession — "prayed urgently and persistently for her intercession"
- [FIXED][structure] "Her prognosis... Her liver... Her kidneys..." — three consecutive sentences open with "Her" — merged into one sentence

**our-lady-of-champion-1859** (miracle)
- [FIXED][structure] "She identified herself... She instructed Adèle... She then gave a specific mission" — three consecutive "She" openers — recast middle sentence to passive voice to break the run

**healing-of-charles-anne** (miracle)
- [FIXED][grammar] "Both physicians declared his condition beyond hope" — "both" has no clear antecedent; only one physician (Dr. Paul Loisnel) was named earlier — changed to "The physicians" rather than inventing a second physician's name
- [FIXED][grammar] cure_details: "Worn relic (sachet of Thérèse's hair) while praying novena." — breaks tense with surrounding past-tense list ("stopped," "broke," "restored") — "Wore relic..."

**healing-of-eva-benassi-from-peritonitis** (miracle)
- [FIXED][consistency] synopsis "tubercular peritonitis" vs medical_diagnosis "Tuberculous peritonitis" — same diagnosis, two adjective forms in one record — standardized on "Tubercular," matching the same term used in healing-of-henri-boisselet's medical_diagnosis elsewhere in the dataset

**healing-of-maureen-digan** (miracle)
- [FIXED][consistency] synopsis "thirty-six years" vs medical_diagnosis "(36 years" — same duration spelled out and numeral in one record — standardized on spelled-out "thirty-six years" to match the synopsis
- [FIXED][spelling] synopsis "Kraków-Łagiewniki" vs location_name/cure_details "Krakow-Lagiewniki" — diacritics dropped inconsistently for the same place within one record — standardized on the unaccented form already used in this record's own location_name/cure_details (and in faustina-kowalska's location_name elsewhere in the dataset)

**incorruptibility-of-bernadette-soubirous** / **our-lady-of-lourdes** (miracles, cross-record)
- [FIXED][spelling/style] "aged 35" (incorruptibility-of-bernadette-soubirous) vs "aged thirty-five" (our-lady-of-lourdes) — same fact, numeral in one record and spelled out in the other — standardized on spelled-out "thirty-five"

**incorruptibility-of-bernadette-soubirous** (miracle)
- [FIXED][grammar] "soft tissue possessed a soft and almost normal consistency" — redundant "soft...soft" — "possessed an almost normal consistency"

**healing-of-juan-manuel-gutierrez** (miracle)
- [FIXED][structure] "He had no brace on." ... later "He stopped wearing the brace." — directly contradictory statements about the brace within the same paragraph — checked the cited Angelus News source, which says he wore "a borrowed air cast and a makeshift brace" the whole time; removed the incorrect "He had no brace on." sentence rather than guessing

**healing-of-matteo-pio-colella** (miracle)
- [FIXED][punctuation] "opened on June 11, 2000 and concluded on October 17, 2001" — missing comma after year, inconsistent with this record's own usage elsewhere ("December 21, 1998, and") — "June 11, 2000, and concluded on October 17, 2001."

**healing-of-sr-concepcion-boullon-rubio** (miracle)
- [FIXED][run-on] "...from January to April 1982 - the strength of this apparent cure was cited when..." — checked the record's own cited Opus Dei source, which confirms the cause was formally opened February 19, 1981, a year *before* the January-April 1982 tribunal that investigated this specific miracle — so the original sentence's "cited when [cause] was introduced" framing had the causal relationship backwards, not just a punctuation problem. Split into two sentences in the correct order (cause opened 1981, then tribunal investigated the cure in 1982) rather than just fixing the dash splice.

**healing-of-giuseppe-carlo-audino** (miracle)
- [FIXED][name-consistency] synopsis "Brother André" / "André Bessette" vs this record's own embedded saints array, which stored "Andre" unaccented — fixed at the source: added the accent to the andre-bessette saint record's name/saint_name/birth_name fields (matches the site's convention for French names, e.g. Zélie, Thérèse), so this and the record below now agree with it automatically

**healing-of-child-traumatic-brain-injury** (miracle)
- [FIXED][name-consistency] same accent mismatch — resolved by the same andre-bessette saint-record fix above

**lourdes-healing-of-john-traynor** (miracle)
- [FIXED][spelling] "member of the Hospilalité of Lourdes" — misspelled; should be "Hospitalité"

**lourdes-healing-of-antonietta-raco** (miracle)
- [FIXED][grammar] "process, established since 1947, requires" — non-idiomatic — "established in 1947"

**eucharistic-miracle-of-tixtla** / **eucharistic-miracle-of-buenos-aires** (miracles, cross-record)
- [FIXED][consistency] "a Bolivian clinical neuropsychophysiologist" (tixtla) vs "a neuropsychopharmacologist" (buenos-aires) — checked both records' cited sources. Buenos Aires's own source (Aleteia) describes him as "a clinical psychologist, an expert in biochemistry and neuro-psychophysiology" — close to tixtla's existing "clinical neuropsychophysiologist," not "neuropsychopharmacologist." The other buenos-aires sources (Magiscenter, Crisis Magazine) only call him "scientist"/"Dr. Castañón" with no title, and tixtla's own sources don't give a title either, so neuropsychopharmacologist wasn't supported anywhere. Changed buenos-aires's synopsis to "a clinical neuropsychophysiologist" to match tixtla and the one source that does give a title.

**healing-of-eva-da-costa-onishi-diabetic-leg-ulcers** (miracle)
- [FIXED][consistency] "Eva da Costa herself was reported to have traveled" — drops the surname "Onishi" used in recipient_name and the record's own opening sentence — restored to "Eva da Costa Onishi"

**healing-of-kent-lenahan-from-traumatic-injuries** (miracle)
- [FIXED][structure] "That debate is worth preserving here for balance, since the surviving secondary sources raise it themselves." — authorial/meta-commentary breaks narrative voice — cut the sentence entirely

**healing-of-james-fulton-engstrom** (miracle)
- [FIXED][punctuation] "Bonnie Engstrom of Goodfield, Illinois had long had" — missing closing comma in appositive — "Goodfield, Illinois, had long had"

**healing-of-domenico-sellan** (miracle)
- [FIXED][run-on] "the diocesan canonical investigation was validated...December 21, 1989" — five independent clauses chained by semicolons — split into three sentences

**healing-of-sister-gabriella-trimusi** (miracle)
- [FIXED][structure] "She felt no pain. She rose... She removed... She cried out" — four consecutive "She" openers — combined into two sentences

**healing-of-sr-marie-simon-pierre** (miracle)
- [FIXED][consistency] cure_details: "write JPII's name" — abbreviation breaks from "John Paul II" spelled out everywhere else in this record — spelled out "John Paul II"

**healing-of-juan-jose-barragan-silva** / **healing-of-melissa-villalobos** (miracles, cross-record)
- [FIXED][spelling] "intracranial haemorrhage" (British spelling) vs "hemorrhaging" (American) used elsewhere in the same batch — standardized healing-of-juan-jose-barragan-silva's synopsis and medical_diagnosis on American "hemorrhage"

**our-lady-of-kibeho** (miracle)
- [FIXED][grammar] "independent visions confirmed by investigators as independently consistent" — redundant independent/independently — "visions investigators confirmed were mutually consistent"

**john-paul-ii** (saint)
- [FIXED][consistency] birth_name "Karol Jozef Wojtyla" vs biography_short "Karol Józef Wojtyła" — identity field lacked diacritics present in the prose — added diacritics to birth_name

**mother-teresa** (saint)
- [FIXED][consistency] birth_name "Anjeze Gonxhe Bojaxhiu" vs biography_short "Anjezë Gonxhe Bojaxhiu" — identity field lacked diacritic present in the prose — added diacritic to birth_name

**zelie-martin** (saint)
- [FIXED][naming-consistency] birth_name "Zelie Guerin Martin" vs saint_name/name "Zélie Martin" vs biography's opening "Azélie-Marie Guérin" — checked the Sanctuary of Louis and Zélie Martin's own history page, which states explicitly: "Azélie-Marie Guérin (she was never named as Zélie) was born on December 23, 1831." Confirmed the birth_name field was wrong, not just inconsistently styled — updated birth_name to "Azélie-Marie Guérin" to match her biography's opening sentence and this source.
- [FIXED][structure] "She was refused... She accepted... She taught herself... She managed orders... She was an astute businesswoman." — five consecutive "She" openers — combined into two sentences

**john-neumann** (saint)
- [FIXED][naming-consistency] birth_name "Johann Nepomuk Neumann" (German) vs bio/name/saint_name "John Nepomucene Neumann" (anglicized) — checked Wikipedia, which explicitly distinguishes the English "John Nepomucene Neumann" from the native "German: Johann Nepomuk Neumann, Czech: Jan Nepomucký Neumann." This confirmed `birth_name` ("Johann Nepomuk Neumann") was already correct — the bio's opening sentence was the one breaking convention, using the anglicized name where every comparable saint record in this dataset (john-paul-ii, oscar-romero, elizabeth-ann-seton, etc.) opens with the actual birth_name. Changed the bio's opening sentence from "John Nepomucene Neumann was born..." to "Johann Nepomuk Neumann was born..." instead of touching birth_name.
- [FIXED][style] "at age 48" — numeral breaks house pattern of spelling ages out elsewhere in this record — "at age forty-eight"

**john-henry-newman** (saint)
- [FIXED][spelling] "his cardinatial motto" — typo for "cardinalatial"

**bernadette-soubirous** (saint)
- [FIXED][punctuation] "behind the door!'." — redundant period after a closing quote already ending in "!"; also single-quote style inconsistent with double quotes used elsewhere in the batch — dropped trailing period, switched to double quotes
- [FIXED][style] "aged 35" — numeral breaks house pattern of spelling ages out elsewhere ("thirty-nine," "forty-five") — "aged thirty-five"

**oscar-romero** (saint)
- [FIXED][run-on] "...the second of eight children in a family of modest means; his father worked as a telegraph operator, and Oscar trained as a carpenter before entering the minor seminary..." — three clauses stacked — split after "modest means."
- [FIXED][structure] "He continued formation... He was ordained... He was named auxiliary bishop..." — three consecutive "He" openers — recast the third sentence

**louis-martin** (saint)
- [FIXED][structure] "He applied... He returned... He was a devoted Catholic... He loved fishing..." — four consecutive "He" openers — merged clauses, reduced to two "He" openers

**juan-diego** (saint)
- [FIXED][structure] "He was a member... He converted... He took... He was among... He was widowed..." — five consecutive "He" openers, choppy/list-like — merged clauses, reduced to two openers
- [FIXED][grammar] "whom he had been trying to reach to find a priest for, believing him near death" — tangled syntax — reordered to "whom he believed near death and had been trying to find a priest for" (did not add the "from illness" detail the reviewing agent suggested, since that wasn't in the original text and isn't worth asserting without a source check)

**kateri-tekakwitha** (saint)
- [FIXED][structure] "She attended... She cared... She was known... She died..." — four consecutive "She" openers — merged clauses, reduced to two openers before the closing "She died" sentence

**faustina-kowalska** (saint)
- [FIXED][structure] "She received the Chaplet... She was frequently ill... She died on October 5, 1938..." — three consecutive "She" openers — merged the last two

**elizabeth-ann-seton** (saint)
- [FIXED][structure] final paragraph's three sentences all open with "She" — merged the first two

**josemaria-escriva** (saint)
- [FIXED][style] "at age 73" — numeral breaks house pattern of spelling ages out elsewhere in this record — "at age seventy-three"

## Still open

1. **healing-of-sr-gertrude-korzendorfer** — pacing fix needs a real recovery-date/follow-up detail that isn't currently in the record. The record's only cited source (a 1974 NYT archive piece) is paywalled; a web search found nothing beyond what's already here. Needs that article or another primary source to expand responsibly rather than being left as a rewrite of existing text.

Everything else from this report (50 of 51 findings) is fixed in the DB and verified against `npm run check:data`.
