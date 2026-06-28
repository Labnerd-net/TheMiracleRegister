# Plan: Saints List Filter UI (#25)

## Context

The saints list page (`/saints`) has pagination but no filters — only the global search box. The miracles list has a full filter bar (saint, type, country, year, approval) with SSR + JS in-place swap. This feature brings the same pattern to saints: three filters (canonization stage, theme, religious order) that work server-side without JS and swap the card grid in-place with JS enabled.

## Files to Change

- `src/api/routes/saints.ts` — add optional filter query params to the list endpoint
- `src/pages/saints/index.astro` — add filter bar, SSR filter logic, JS swap script

No schema migrations, no new files.

## Implementation

### 1. API route — `src/api/routes/saints.ts`

Replace `PaginationQuerySchema` with an inline schema that adds three optional filters:

```ts
const SaintsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  canonization_stage: z.enum(canonizationStage.enumValues).optional(),
  theme: z.enum(SAINT_THEMES).optional(),
  religious_order: z.string().max(100).optional(),
});
```

Import `canonizationStage` from `../../db/schema/enums`, `SAINT_THEMES` from `../../db/topics`, `ilike` and `sql` from drizzle-orm.

Build a `conditions` array (same pattern as `src/api/routes/miracles.ts`):
```ts
const conditions = [eq(saints.published, true)];
if (canonization_stage) conditions.push(eq(saints.canonization_stage, canonization_stage));
if (theme) conditions.push(sql`${saints.themes} @> ARRAY[${theme}]::text[]`);
if (religious_order) conditions.push(ilike(saints.religious_order, `%${religious_order}%`));
const where = and(...conditions);
```

Apply `where` to both the data query and the count query.

### 2. Astro page — `src/pages/saints/index.astro`

**SSR filter params** (frontmatter):
```ts
const filterStage = (canonizationStage.enumValues as string[]).includes(sp.get("canonization_stage") ?? "")
  ? sp.get("canonization_stage") as typeof canonizationStage.enumValues[number]
  : undefined;
const filterTheme = (SAINT_THEMES as readonly string[]).includes(sp.get("theme") ?? "")
  ? sp.get("theme") as string
  : undefined;
const filterOrder = sp.get("religious_order") || undefined;
const hasActiveFilters = !!(filterStage || filterTheme || filterOrder);
```

Import `canonizationStage` from schema enums, `SAINT_THEMES` from topics, `ilike` and `sql` from drizzle-orm, `humanizeSnakeCase` from format.

Build `conditions` array → apply to both count and data queries. Add a `buildUrl(page)` helper for SSR pagination links (same pattern as miracles).

**Filter bar HTML** — add above the card grid, same markup/CSS class names as miracles list. Three controls:
- Stage: `<select name="canonization_stage">` with the 4 enum values
- Theme: `<select name="theme">` populated from `SAINT_THEMES` via `humanizeSnakeCase`
- Religious Order: `<input type="text" name="religious_order">` with placeholder

Add `id="saints-count"` to the count paragraph, `id="saints-grid"` to the card grid `<div>`, `id="saints-pagination"` to the `<nav>` pagination element.

**JS swap script** — follows the exact same IIFE pattern as the miracles list:
- `buildApiUrl(fd, page)` → `/api/v1/saints?canonization_stage=...&theme=...&religious_order=...&page=N&limit=20`
- `buildPageUrl(fd, page)` → `/saints?...` for `history.pushState`
- `renderCard(s)` → saint photo card HTML string (portrait image or placeholder initial, name, stage badge, feast day, nationality) matching the Astro template
- `renderPagination(meta, fd)` → same helper as miracles
- `applyFilters(page)` → fetch API, swap grid + pagination innerHTML, pushState
- Debounce 400ms on text input, immediate on select `change`

**CSS:** Copy the filter bar CSS block from miracles list (`.filter-bar`, `.filter-controls`, `.filter-group`, `.filter-label`, `.filter-select`, `.filter-input`, `.filter-actions`, `.filter-apply`, `.filter-clear`, `.empty-state`). The `.pagination` styles are already present in the saints list.

## Verification

1. `npm run build` — must pass
2. Open `/saints` — filter bar visible, no filters active, full list shows
3. Select "Blessed" from Stage → list updates to show only blesseds, URL reflects filter
4. Select a Theme (e.g. "marian") → list filters further
5. Type "Franciscan" in Religious Order → list filters (test partial: "Franc")
6. All three filters active simultaneously → combined results
7. Click "Clear filters" → full list restored, URL cleaned
8. Filtered result set > 20 → pagination works with filters preserved
9. Disable JS → form submit reloads page with SSR-filtered results
10. Filter with zero results → "No saints match the selected filters." empty state
