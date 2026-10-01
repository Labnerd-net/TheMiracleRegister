/// <reference types="astro/client" />

// Cloudflare Workers environment bindings
interface CloudflareEnv {
  DATABASE_URL: string;
  PREVIEW_TOKEN: string;
  RATE_LIMIT: KVNamespace;
}
