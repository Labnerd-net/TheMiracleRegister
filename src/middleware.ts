import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { clientIp, isRateLimited } from "./lib/rateLimit";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export const onRequest = defineMiddleware(async (context, next) => {
  // The API applies its own limiter; static assets never reach the Worker.
  const limited =
    !context.url.pathname.startsWith("/api/") &&
    (await isRateLimited(env.PAGE_RATE_LIMITER, clientIp(context.request)));
  const response = limited
    ? new Response("Too many requests", {
        status: 429,
        headers: { "Retry-After": "60", "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
      })
    : await next();
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(name)) response.headers.set(name, value);
  }
  // Preview responses must not leak the token via Referer or be indexed.
  if (context.url.searchParams.has("preview")) {
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
});
