# Rate Limiting Gaps (backlog #1, #2)

Branch: `claude/fix/rate-limiting`

## Problem
- #1: the API limiter and `/search` key on `CF-Connecting-IP ?? "unknown"` (and `Astro.clientAddress ?? "unknown"`). A request without the header lands in one shared bucket, so unidentifiable clients throttle each other.
- #2: only `/api/v1/*` and `/search` are limited. `/miracles`, `/saints/[slug]`, `/map`, `/random` and the rest query Neon on every edge-cache miss, and random query strings bypass the cache.

## Scope
- `src/lib/rateLimit.ts`: `clientIp(request)` returns the trimmed `CF-Connecting-IP` or `null`; `isRateLimited` takes `string | null` and returns false for `null` (explicit skip, documented). Cloudflare always sets the header on real traffic and a client cannot spoof it at the edge, so a missing header means local dev or a non-edge path; the limiter outage fail-open is unchanged.
- API middleware and `search.astro` use `clientIp`.
- New binding `PAGE_RATE_LIMITER` in `wrangler.jsonc` (namespace_id 16003, 120 per 60s). `src/middleware.ts` applies it to every request except `/api/` (the API has its own limiter). Static assets are served before the Worker and are not counted. A limited request gets a plain-text 429 with `Retry-After: 60` and `Cache-Control: no-store`, and still receives the security headers.

## Not in scope
- Ignoring unknown query params in cache keys, or a Cloudflare WAF rule (dashboard work; the per-IP limiter bounds cache-busting from one client).
- Different limits per route.
- Retry-After on the API 429.

## Verification
Unit tests: `clientIp`, null key skip, middleware 429 (headers, no `next()` call), `/api/` bypass, fail-open. Lint, typecheck, build, tests. Dev server: confirm 120 requests pass and the next returns 429 on a page, and that `/api/v1` still counts only against its own limiter.
