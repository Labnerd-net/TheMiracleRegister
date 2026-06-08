# Plan: Miracle Dispensation Fields

## Context

The saints table has no structured way to record when the normal miracle requirements for beatification or canonization were waived. Without this, a saint with zero canonization miracles is ambiguous — missing data vs. papal exception. Three new nullable fields resolve this: two booleans (one per canonization stage) and an enum capturing why the dispensation occurred.

Real cases in the starting saint set:
- **Maximilian Kolbe, Edith Stein** — martyrs, beatification miracle implicitly waived
- **Juan Diego** — equipollent canonization, entire process bypassed
- **John XXIII** — explicit papal exception waiving canonization miracle requirement

---

## Files to Modify

### `src/db/schema/enums.ts`
Add a new `pgEnum`:
```typescript
export const dispensationReason = pgEnum("dispensation_reason", [
  "martyr",
  "equipollent",
  "papal_exception",
]);
```

### `src/db/schema/saints.ts`
Add three nullable columns (no `.notNull()`), following the pattern of existing nullable columns like `gender` and `lay_person`:
```typescript
beatification_miracle_dispensed: boolean("beatification_miracle_dispensed"),
canonization_miracle_dispensed: boolean("canonization_miracle_dispensed"),
dispensation_reason: dispensationReason("dispensation_reason"),
```
Import `dispensationReason` from `./enums`.

### Drizzle Migration
Run `npx drizzle-kit generate` to produce the migration SQL. No manual edits needed — all three columns are nullable additions with no data migration required. Apply with `npx drizzle-kit migrate`.

### `src/components/SaintForm.astro`
Add a new fieldset below the existing canonization fields grouping all three dispensation fields together. Import `dispensationReason` enum at the top of the frontmatter. Pattern to follow:

- **Booleans**: hidden input + checkbox pattern (same as `lay_person`):
  ```html
  <input type="hidden" name="beatification_miracle_dispensed" value="false" />
  <input type="checkbox" name="beatification_miracle_dispensed" value="true" checked={v?.beatification_miracle_dispensed ?? false} />
  ```
- **Enum dropdown**: empty "— select —" option + `.enumValues.map()` (same as `canonization_type`):
  ```html
  <option value="">— select —</option>
  {dispensationReason.enumValues.map((r) => (
    <option value={r} selected={v?.dispensation_reason === r}>{r.replace(/_/g, " ")}</option>
  ))}
  ```

### `src/pages/admin/saints/new.astro`
Add three fields to the `db.insert(saints).values({...})` call:
```typescript
beatification_miracle_dispensed: getBool("beatification_miracle_dispensed"),
canonization_miracle_dispensed: getBool("canonization_miracle_dispensed"),
dispensation_reason: parseEnum(get("dispensation_reason"), dispensationReason.enumValues),
```
Import `dispensationReason` from the schema enums.

### `src/pages/admin/saints/[slug]/edit.astro`
Add the same three fields to the `db.update(saints).set({...})` call, following the nullable pattern (no fallback to existing value needed since null is valid):
```typescript
beatification_miracle_dispensed: getBool("beatification_miracle_dispensed"),
canonization_miracle_dispensed: getBool("canonization_miracle_dispensed"),
dispensation_reason: parseEnum(get("dispensation_reason"), dispensationReason.enumValues),
```
Import `dispensationReason` from the schema enums.

### `CLAUDE.md`
Add the three new columns to the saints table documentation under the existing column list.

---

## Verification

1. `npx drizzle-kit generate` — migration file created with three ALTER TABLE ADD COLUMN statements
2. `npx drizzle-kit migrate` — migration applies cleanly
3. `npm run build` — no TypeScript errors
4. Open admin saint edit for Maximilian Kolbe — set `beatification_miracle_dispensed = true`, `dispensation_reason = martyr`, save, reload — values persist
5. Open admin saint edit for a regular saint — all three fields null/unchecked by default
