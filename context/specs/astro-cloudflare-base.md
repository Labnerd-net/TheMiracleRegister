# Spec for Astro Cloudflare Pages Base

Title: Astro Cloudflare Pages Base
Branch: claude/feature/astro-cloudflare-base
Spec file: context/specs/astro-cloudflare-base.md

## Summary

Set up the Astro frontend project with the Cloudflare Pages adapter. This step establishes the full project scaffolding — Astro config, Cloudflare adapter wiring, Wrangler config, and a minimal working page that confirms SSR is functioning. No real page content or API routes yet — just the structural foundation that everything else builds on.

## Functional Requirements

- Initialize Astro inside the existing repo (not a new subdirectory — the project root IS the Astro project)
- Install and configure `@astrojs/cloudflare` adapter for SSR
- Configure `astro.config.mjs` with Cloudflare adapter and output: 'server'
- Add `wrangler.toml` (or `wrangler.json`) for local dev with Wrangler
- Add `npm run dev` script (Astro dev server) and `npm run build` script
- Confirm `npm run build` produces a valid Cloudflare Pages output in `dist/`
- Add a minimal index page (`src/pages/index.astro`) — placeholder content only, just enough to confirm SSR renders
- Existing `src/db/` structure must remain untouched
- `.dev.vars` should be documented in `.env.example` as the Wrangler equivalent of `.env` for local Pages Functions dev (though `dotenv` covers the Drizzle scripts fine)

## Possible Edge Cases

- Astro init may want to create its own `tsconfig.json` — must reconcile with the existing one rather than overwrite it
- Astro may add its own `package.json` scripts that conflict with the existing db scripts — merge carefully
- The `@astrojs/cloudflare` adapter requires `output: 'server'` — do not use `output: 'static'` or `output: 'hybrid'`
- Cloudflare Pages Functions and Astro SSR coexist in the same build output — the Hono API layer (next step) will mount under `functions/` or via Astro middleware, not conflicting with Astro pages
- `node_modules` and `dist/` must remain gitignored

## Acceptance Criteria

- `npm run dev` starts the Astro dev server without errors
- `npm run build` completes without errors and outputs to `dist/`
- Index page renders (confirmed via dev server or build output)
- Existing `src/db/` imports still resolve correctly after Astro is added
- `npm test` still passes

## Open Questions

- Should `wrangler.toml` include a binding placeholder for the Neon `DATABASE_URL` env var, or leave that to `.dev.vars`? (Recommend `.dev.vars` — keeps secrets out of committed config)

## Testing Guidelines

No new unit tests needed for this step — it's structural scaffolding. Acceptance is confirmed by:
- `npm run build` exit code 0
- `npm test` still passing (existing schema tests)

## Personal Opinion

Straightforward step with one real risk: Astro's init tooling tends to be opinionated about `tsconfig.json` and `package.json`. As long as we merge rather than replace those files, there's no issue. The scope is appropriately narrow — just get Astro + Cloudflare adapter building cleanly before adding any routes or data.
