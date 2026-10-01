// Data is edited directly in Neon with no purge hook, so keep browser caching short and let the edge
// hold content only briefly. `s-maxage` applies to shared caches, `max-age` to the browser.
export const CACHE_CONTENT = "public, max-age=60, s-maxage=900, stale-while-revalidate=3600";

// Pages that show date-dependent content (Today's Feast): no SWR, so a stale day is never served after the TTL.
export const CACHE_DAILY = "public, max-age=60, s-maxage=300";

// Lists derived from code constants (types, metadata); they only change on deploy.
export const CACHE_REFERENCE = "public, max-age=600, s-maxage=3600, stale-while-revalidate=3600";
