/// <reference types="astro/client" />

// Cloudflare Workers environment bindings
interface CloudflareEnv {
  DATABASE_URL: string;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  PREVIEW_TOKEN: string;
}
