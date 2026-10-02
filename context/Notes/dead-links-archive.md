# Dead Links Archive

Ongoing tracker for `miracle_sources` / `saint_sources` rows whose URL was unreachable at time of check. As of 2026-09-29, entries below have been **deleted from the DB** (they were broken on the live site) — this file is now the only record of them. If a URL comes back, re-add it as a new source row directly in the database and move the entry to Resolved.

**When re-checking** (see the `verify-sources` skill's recheck mode): fetch the URL again. If it resolves and still documents the record, move the entry to **Resolved** with today's date and a one-line note on what confirmed it — since the DB row was deleted, re-add it as a new source directly in the database rather than expecting the old `source_id` to still exist. If still dead, leave it under **Active** and bump `Last checked` to today.

## Active (still dead)

- **`eucharistic-miracle-of-buenos-aires`** (miracle) — source_id 232 (deleted from DB 2026-09-29)
  `https://parroquiasantamariacaballito.com.ar/`
  Category: `other`
  First flagged: 2026-09-28 — HTTP 500 Internal Server Error.
  Last checked: 2026-09-29 — still HTTP 500. Same site also blocked adding a replacement official source during the 2026-09-29 coverage pass on this record (see `source-coverage-gaps.md`'s `## Open`) — no AICA/archdiocesan substitute found either.

- **`healing-of-domenico-sellan`** (miracle) — source_id 324 (deleted from DB 2026-09-29)
  `https://frassatiusa.org/first-miracle`
  Category: `other`
  First flagged: 2026-09-28 — HTTP 403 Forbidden on two separate fetch attempts.
  Last checked: 2026-09-29 — still HTTP 403.

- **`eucharistic-miracle-of-tixtla`** (miracle) — source_id 336 (deleted from DB 2026-09-29)
  `http://archive.therealpresence.org/eucharst/mir/english_pdf/Tixtla1.pdf`
  Category: `other`
  First flagged: 2026-09-28 — expired SSL certificate, archive.therealpresence.org host unreachable.
  Last checked: 2026-09-29 — certificate still expired.

- **`elizabeth-ann-seton`** (saint) — source_id 733 (deleted from DB 2026-09-29)
  `https://catholicsaints.day/elizabeth-ann-seton/`
  Category: `other`
  First flagged: 2026-09-28 — DNS resolution fails (domain does not resolve).
  Last checked: 2026-09-29 — still fails to resolve. Note: Seton's saint record has since gained two other sources during 2026-09-29 coverage work (`setonshrine.org`, the vatican.va canonization homily), so this one dying permanently is no longer a coverage risk for her record.

## Resolved

- **`padre-pio`** (saint) — old source_id 668 (deleted 2026-09-29), replacement added as source_id 756 on 2026-09-29
  Old dead URL: `https://www.santuariopadrepio.it/` (TLS certificate mismatch — cert is issued for `162.logovia.it`, not this hostname)
  New URL: `https://www.conventosantuariopadrepio.it/`
  This was the redirect target already flagged as reachable back on 2026-09-28; added it today as the official San Giovanni Rotondo shrine source on Padre Pio's saint record (`source_type: other`) — also closes the separate "Padre Pio has zero independent biography source" gap tracked in `source-coverage-gaps.md`, since previously his only source was the vatican.va canonization homily.

- **`josemaria-escriva`** (saint) — old source_id 735 (deleted 2026-09-29), re-added as source_id 745 on 2026-09-29
  Old dead URL: `https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20021006_canonization-escriva.html` (HTTP 404, first flagged 2026-09-28)
  New URL: `https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20021006_escriva.html`
  vatican.va restructured the path, dropping `_canonization-` from the filename (`_canonization-escriva.html` → `_escriva.html`). Fetched and confirmed it's still JPII's 6 October 2002 canonization homily naming Escrivá. Re-added as `vatican_decree` on the saint record.
