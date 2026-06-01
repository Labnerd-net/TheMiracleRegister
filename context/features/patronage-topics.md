# Plan: Patronage, Noted For, and Miracle Topics

## Context

Two additions to enable topic-based searching. Someone facing a situation (cancer, addiction, grief) can search and find both relevant saints (patron OR noted_for that situation) and relevant miracles (tagged with that topic).

Key changes:
- Add `noted_for text[]` to saints — informal/biographical connections where no formal patronage exists
- Remove `subtype` (medical-only enum, too narrow) from miracles — add `topics text[]` as a single unified tag field covering medical conditions, life situations, spiritual themes, and saint-specific phenomena
- Add GIN indexes on array columns for performant `= ANY()` queries
- Add a canonical `MIRACLE_TOPICS` const array in TypeScript for app-layer type safety (replaces DB enum enforcement)

No data has been entered yet so dropping `subtype` is zero-risk.

---

## File Changes

```
src/
  db/
    schema/
      saints.ts         ← add noted_for text[]
      miracles.ts       ← remove subtype, add topics text[]
      enums.ts          ← delete miracleSubtype pgEnum
    topics.ts           ← new: MIRACLE_TOPICS const array + MiracleTopic type
  api/
    schemas.ts          ← remove subtype refs, add topics/noted_for
    routes/
      search.ts         ← add topic param, implement topic search query
drizzle/
  0001_*.sql            ← generated migration
CLAUDE.md               ← update data model section
```

---

## Implementation Steps

### 1. Add `src/db/topics.ts` — canonical topic list

```ts
export const MIRACLE_TOPICS = [
  "cancer", "neurological", "gastrointestinal", "cardiovascular",
  "infectious", "respiratory", "orthopedic", "obstetric", "dermatological",
  "children", "mothers", "fathers", "pregnancy-and-childbirth", "marriage",
  "addiction", "prisoners", "loss-grief", "financial-hardship", "workplace",
  "technology", "youth", "pro-life", "native-and-indigenous", "conversion",
  "hope", "perseverance", "stigmata", "bilocation", "incorruptibility",
  "eucharistic", "marian", "martyrs", "missionaries", "saints-of-everyday-life",
  "elderly", "miraculous-images", "saints-bodies", "spiritual-direction",
] as const;

export type MiracleTopic = typeof MIRACLE_TOPICS[number];
```

### 2. Update `src/db/schema/enums.ts`

Remove the `miracleSubtype` pgEnum export entirely.

### 3. Update `src/db/schema/saints.ts`

Add `noted_for: text("noted_for").array()` column.
Add GIN index on `patronage` and `noted_for`.

### 4. Update `src/db/schema/miracles.ts`

Remove `subtype` column and its import.
Add `topics: text("topics").array()` column.
Add GIN index on `topics`.

### 5. Update `src/api/schemas.ts`

- Remove `subtype` from `MiracleListItemSchema` and `MiracleDetailSchema`
- Add `topics: z.array(z.string()).nullable()` to both
- Add `noted_for: z.array(z.string()).nullable()` to `SaintDetailSchema`
- Add `topic` optional param to `SearchQuerySchema`

### 6. Implement topic search in `src/api/routes/search.ts`

Query logic:
- Saints: `WHERE :topic = ANY(patronage) OR :topic = ANY(noted_for)`
- Miracles: `WHERE :topic = ANY(topics)`
- Return unified results array with `type: 'saint' | 'miracle'`

### 7. Generate and apply migration

```
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 8. `npm run build` — fix any errors

---

## GIN Index Rationale

`WHERE 'cancer' = ANY(topics)` is a sequential scan without a GIN index. Drizzle supports `index().using('gin')` — add one to each text[] column at schema definition time so it's included in the migration from day one.

## Topic Enforcement Strategy

`MIRACLE_TOPICS` is a TypeScript `as const` array. The Hono route handler for `POST`/`PATCH` (admin) validates that all submitted topics are members of this array via Zod's `z.enum(MIRACLE_TOPICS)`. The DB column stays `text[]` (not an enum) so the list can grow without a schema migration — just update the const and redeploy.

---

## Verification

1. `npm run build` exits 0
2. `npm test` passes
3. `GET /api/v1/search?topic=cancer` returns correct shape (stubbed data OK at this stage)
4. Drizzle migration file exists at `drizzle/0001_*.sql` with correct DDL
