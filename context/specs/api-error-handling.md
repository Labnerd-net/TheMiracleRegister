# API Error Handling (backlog #6, #8, #9, #10)

Branch: `claude/fix/api-error-handling`

## Problem
- #6: the `/saints/*` and `/miracles/*` cache middleware sets `CACHE_CONTENT` on every status, so 404s, 400s and 500s are edge-cached. A just-published record can keep returning a cached 404.
- #8: numeric params have no upper bounds (`saint_id=99999999999`, `year_from=1e12`, `page=1e19`); Postgres overflows and the API returns a 500. `/miracles` and `/saints` pages parse with `parseInt` and have the same flaw.
- #9: no `app.onError`; DB errors return Hono's plain-text 500, and zod validation failures return Hono's default `{success:false,error}` body, neither in the `{data, meta, error}` envelope.
- #10: `/search` with neither `q` nor `topic` returns 200 with `error: "Provide q or topic"`.

## Scope
- `src/api/errors.ts`: `badRequest(c, message)` helper plus a shared zod `defaultHook` returning the envelope with 400.
- All `OpenAPIHono` routers get the hook; `app.onError` logs and returns the envelope with 500 and `no-store`.
- Cache middleware sets the policy only when the response is 200; `no-store` otherwise.
- `src/lib/params.ts`: shared bounds (`MAX_PAGE`, `MAX_ID`, `MIN_YEAR`, `MAX_YEAR`) and `parseBoundedInt`. Used in `schemas.ts` (`page`, `saint_id`, `year_from`, `year_to`) and in the `/miracles` and `/saints` pages.
- `/miracles` API returns 400 when `year_from > year_to`.
- `/search` returns 400 for missing `q` and `topic`.

## Not in scope
- Other items from #11-#13 (flag parsing, filter semantics, search pagination).
- Page-level (Astro) error pages.

## Verification
Tests for each: non-200 responses carry `no-store`, 200 keeps the policy, out-of-range params give 400, `year_from > year_to` gives 400, a DB failure gives a JSON envelope 500, validation errors use the envelope. Lint, typecheck, tests, build.
