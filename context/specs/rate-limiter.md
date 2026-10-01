# Rate Limiter: Workers Rate Limiting Binding (backlog #16)

Branch: `claude/feature/rate-limiter`

## Problem
`src/lib/rateLimit.ts` does a KV read then a KV write on the same key for every API request and every search. KV allows about 1 write/s per key and bills writes, the read-then-write is not atomic, and any KV error is uncaught, so a KV hiccup becomes a public 500 on the whole API and `/search`.

## Approach
Replace KV with the Workers Rate Limiting binding (`env.X.limit({ key })`), and fail open if the limiter itself throws.

- `wrangler.jsonc`: remove the `RATE_LIMIT` KV binding; add `ratelimits` bindings (limit and period are fixed per binding, period must be 10 or 60):
  - `API_RATE_LIMITER`: 60 per 60s (current API limit)
  - `SEARCH_RATE_LIMITER`: 30 per 60s (current search limit)
- `src/lib/rateLimit.ts`: `isRateLimited(limiter, key)` returns `!success`; on any error it logs and returns false (fail open).
- Update `src/api/index.ts`, `src/api/env.ts`, `src/pages/search.astro`, `src/env.d.ts`.
- Tests: fake limiter in `tests/helpers/apiApp.ts` and `tests/rate-limit.test.ts`, including the fail-open path.

## Behaviour changes to accept
- Counters are **per Cloudflare location**, and the binding is documented as permissive and eventually consistent, not an accounting system. A client spread across locations can exceed the nominal limit. KV was also eventually consistent, so this is a loosening, not a new class of weakness.
- Limits are now fixed in `wrangler.jsonc`, not in code constants.
- A limiter outage now allows traffic instead of returning 500.

## Not in scope
- Per-route limits, WAF rate-limit rules, deleting the old KV namespace from the account (it becomes unused; remove by hand).
- `namespace_id` values must be unique per Cloudflare account; `16001`/`16002` were chosen, not checked against other Workers on the account.

## Verification
Typecheck, build, tests (429 envelope, per-IP isolation, fail-open). On the dev server: the API returns 429 after the configured count and `/search` returns 429. Not verifiable here: behaviour on the deployed edge.
