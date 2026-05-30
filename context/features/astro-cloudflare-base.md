# Plan: Astro Cloudflare Pages Base

## Context

The database layer is complete. This step adds Astro with the Cloudflare Pages adapter to an existing TypeScript project (not a fresh scaffold). The goal is a working SSR build that coexists with the existing `src/db/` structure, with a placeholder index page confirming the setup works end-to-end.

The project already has: `package.json` (with db scripts), `tsconfig.json`, `src/db/`, `tests/`, and `drizzle.config.ts`. Nothing in those files should be replaced — only extended.

---

## Implementation Steps

### 1. Install dependencies

```
npm install astro @astrojs/cloudflare
```

No interactive wizard — manual install only to avoid overwriting existing config files.

### 2. Update `package.json` scripts

Add to the existing scripts (keep all db scripts intact):
- `"dev"` → `"astro dev"`
- `"build"` → `"astro build"`
- `"preview"` → `"astro preview"`

### 3. Create `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
});
```

### 4. Update `tsconfig.json`

Astro expects to extend its own tsconfig. Replace the existing tsconfig with one that extends `astro/tsconfigs/strict` and re-adds our project-specific includes. Astro's strict preset already covers `strict`, `target: ESNext`, `moduleResolution: bundler`, `skipLibCheck`, etc.

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src", "tests", "drizzle.config.ts"]
}
```

### 5. Create `wrangler.jsonc`

```jsonc
{
  "name": "the-miracles-register",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@astrojs/cloudflare/entrypoints/server",
  "assets": {
    "directory": "./dist"
  }
}
```

The `nodejs_compat` flag is required for Neon's serverless driver and other Node APIs at runtime.

### 6. Create `src/pages/index.astro`

Minimal placeholder — just enough to confirm SSR renders:

```astro
---
// placeholder — full page content comes in a later step
---
<html lang="en">
  <head><meta charset="utf-8" /><title>The Miracles Register</title></head>
  <body><h1>The Miracles Register</h1></body>
</html>
```

### 7. Update `.env.example`

Add a note about `.dev.vars` for Wrangler local dev:

```
# For local Wrangler dev (wrangler dev), secrets go in .dev.vars (gitignored)
# .dev.vars uses the same KEY=VALUE format as .env
```

Add `.dev.vars` to `.gitignore`.

### 8. Run build and verify

```
npm run build    # must exit 0, produce dist/
npm test         # existing schema tests must still pass
```

---

## Verification

1. `npm run build` exits 0 and produces `dist/` directory
2. `npm test` passes (4 schema tests unchanged)
3. `npm run dev` starts without errors (manual check)
4. `src/db/` imports resolve correctly — no TypeScript errors after tsconfig change
