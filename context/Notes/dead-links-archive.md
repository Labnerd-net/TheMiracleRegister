# Dead Links Archive

Ongoing tracker for `miracle_sources` / `saint_sources` rows whose URL was unreachable at time of check. As of 2026-09-29, entries below have been **deleted from the DB** (they were broken on the live site) — this file is now the only record of them. If a URL comes back, re-add it as a new source row directly in the database and move the entry to Resolved.

**When re-checking** (see the `verify-sources` skill's recheck mode): fetch the URL again. If it resolves and still documents the record, move the entry to **Resolved** with today's date and a one-line note on what confirmed it — since the DB row was deleted, re-add it as a new source directly in the database rather than expecting the old `source_id` to still exist. If still dead, leave it under **Active** and bump `Last checked` to today.

## Active (still dead)

- **`eucharistic-miracle-of-buenos-aires`** (miracle) — source_id 232 (deleted from DB 2026-09-29)
  `https://parroquiasantamariacaballito.com.ar/`
  Category: `other`
  First flagged: 2026-09-28 — HTTP 500 Internal Server Error.
  Last checked: 2026-09-28

- **`healing-of-domenico-sellan`** (miracle) — source_id 324 (deleted from DB 2026-09-29)
  `https://frassatiusa.org/first-miracle`
  Category: `other`
  First flagged: 2026-09-28 — HTTP 403 Forbidden on two separate fetch attempts.
  Last checked: 2026-09-28

- **`eucharistic-miracle-of-tixtla`** (miracle) — source_id 336 (deleted from DB 2026-09-29)
  `http://archive.therealpresence.org/eucharst/mir/english_pdf/Tixtla1.pdf`
  Category: `other`
  First flagged: 2026-09-28 — expired SSL certificate, archive.therealpresence.org host unreachable.
  Last checked: 2026-09-28

- **`padre-pio`** (saint) — source_id 668 (deleted from DB 2026-09-29)
  `https://www.santuariopadrepio.it/`
  Category: `other`
  First flagged: 2026-09-28 — TLS certificate mismatch. Redirect target (conventosantuariopadrepio.it) is reachable and still documents Padre Pio — consider adding that URL instead of waiting for this one to come back.
  Last checked: 2026-09-28

- **`elizabeth-ann-seton`** (saint) — source_id 733 (deleted from DB 2026-09-29)
  `https://catholicsaints.day/elizabeth-ann-seton/`
  Category: `other`
  First flagged: 2026-09-28 — DNS resolution fails (domain does not resolve).
  Last checked: 2026-09-28

- **`josemaria-escriva`** (saint) — source_id 735 (deleted from DB 2026-09-29)
  `https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20021006_canonization-escriva.html`
  Category: `vatican_decree`
  First flagged: 2026-09-28 — HTTP 404, page no longer exists at this path.
  Last checked: 2026-09-28

## Resolved

(none yet)
