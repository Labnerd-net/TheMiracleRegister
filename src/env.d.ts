/// <reference types="astro/client" />

// Cloudflare Workers environment bindings
interface CloudflareEnv {
  DATABASE_URL: string;
  PREVIEW_TOKEN: string;
  API_RATE_LIMITER: RateLimit;
  SEARCH_RATE_LIMITER: RateLimit;
}
