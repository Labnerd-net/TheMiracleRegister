# Dead Links Archive

Ongoing tracker for `miracle_sources` / `saint_sources` rows whose URL was unreachable at time of check. These rows are still live in the DB (not removed) — this file exists so a URL can be periodically re-checked and, if it comes back, cleared here without having to re-run a full audit to rediscover it.

**When re-checking:** fetch the URL again. If it resolves and still documents the record, mark it `RESOLVED` below with the date and move it out of the active list (or delete the entry). If it's still dead, leave it and update `last_checked`.

## Active (still dead)

- **`eucharistic-miracle-of-buenos-aires`** (miracle) — source_id 232
  `https://parroquiasantamariacaballito.com.ar/`
  Category: `other`
  First flagged: 2026-09-28 — HTTP 500 Internal Server Error.
  Last checked: 2026-09-28

- **`healing-of-domenico-sellan`** (miracle) — source_id 324
  `https://frassatiusa.org/first-miracle`
  Category: `other`
  First flagged: 2026-09-28 — HTTP 403 Forbidden on two separate fetch attempts.
  Last checked: 2026-09-28

- **`eucharistic-miracle-of-tixtla`** (miracle) — source_id 336
  `http://archive.therealpresence.org/eucharst/mir/english_pdf/Tixtla1.pdf`
  Category: `other`
  First flagged: 2026-09-28 — expired SSL certificate, archive.therealpresence.org host unreachable.
  Last checked: 2026-09-28

- **`padre-pio`** (saint) — source_id 668
  `https://www.santuariopadrepio.it/`
  Category: `other`
  First flagged: 2026-09-28 — TLS certificate mismatch. Redirect target (conventosantuariopadrepio.it) is reachable and still documents Padre Pio — consider updating the URL to that instead of waiting for this one to come back.
  Last checked: 2026-09-28

- **`elizabeth-ann-seton`** (saint) — source_id 733
  `https://catholicsaints.day/elizabeth-ann-seton/`
  Category: `other`
  First flagged: 2026-09-28 — DNS resolution fails (domain does not resolve).
  Last checked: 2026-09-28

- **`josemaria-escriva`** (saint) — source_id 735
  `https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20021006_canonization-escriva.html`
  Category: `vatican_decree`
  First flagged: 2026-09-28 — HTTP 404, page no longer exists at this path.
  Last checked: 2026-09-28

## Resolved

(none yet)
