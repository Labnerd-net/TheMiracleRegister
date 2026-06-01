# Plan: Static Pages Rendering from DB

## Context

Data is seeded. This step wires up Astro SSR pages to query Neon via Drizzle and render real content. Pages query the DB directly (not via the API) — simpler, one less hop, and correct for SSR. API endpoints remain stubbed for now.

Four pages + a shared layout:

```
src/
  layouts/
    Base.astro          ← HTML shell, head, minimal nav
  pages/
    index.astro         ← Homepage (saint count, miracle count, brief intro)
    saints/
      index.astro       ← List all saints
      [slug].astro      ← Saint detail with their miracles
    miracles/
      index.astro       ← List all miracles (filterable by saint)
      [slug].astro      ← Miracle detail
```

No CSS framework — bare semantic HTML for now. Focus is on data rendering, not design.

---

## DB Query Approach

Astro SSR with `nodejs_compat` flag: `process.env.DATABASE_URL` is available, so `src/db/index.ts` works as-is. For local dev, `.env` provides it. For production, set `DATABASE_URL` as a Cloudflare Worker secret.

Each page imports `db` and runs Drizzle queries in the frontmatter `---` block (server-side only, never shipped to client).

---

## Pages

### `index.astro`
- Query: count of saints, count of miracles
- Show: project intro, counts, links to /saints and /miracles

### `saints/index.astro`
- Query: all saints ordered by name, with `id, slug, name, feast_day, nationality, canonization_stage, image_url, total_attributed_miracles`
- Show: table or card list, each linking to `/saints/[slug]`

### `saints/[slug].astro`
- Query: saint by slug + their miracles + related saints
- Show: all saint fields, miracle list (title, type, topics, date, recipient), related saints links
- 404 if slug not found

### `miracles/index.astro`
- Query: all miracles with saint name joined, ordered by date
- Show: list with title, saint name, type, topics, country, date
- Each links to `/miracles/[slug]`

### `miracles/[slug].astro`
- Query: miracle by slug + saint + sources
- Show: all miracle fields, saint link, source list
- 404 if slug not found

---

## Implementation Steps

1. Create `src/layouts/Base.astro`
2. Update `src/pages/index.astro`
3. Create `src/pages/saints/index.astro`
4. Create `src/pages/saints/[slug].astro`
5. Create `src/pages/miracles/index.astro`
6. Create `src/pages/miracles/[slug].astro`
7. `npm run build` — fix any errors
8. Start dev server and verify pages render with real data

---

## Verification

1. `npm run build` exits 0
2. `npm run dev` — visit all 5+ pages in browser
3. Saints list shows all 12 saints
4. Saint detail shows miracles for that saint
5. Miracle detail shows full data and links back to saint
6. 404 on unknown slugs
