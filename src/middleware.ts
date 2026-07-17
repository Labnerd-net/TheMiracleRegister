import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { SESSION_COOKIE, validateSessionToken } from "./lib/auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  if (!pathname.startsWith("/admin")) return next();

  if (pathname === "/admin/login") {
    const response = await next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const cookie = context.cookies.get(SESSION_COOKIE);
  if (cookie) {
    const valid = await validateSessionToken(cookie.value, env.SESSION_SECRET);
    if (valid) {
      const response = await next();
      response.headers.set("Cache-Control", "no-store");
      return response;
    }
  }

  const loginUrl = new URL("/admin/login", context.request.url);
  loginUrl.searchParams.set("next", pathname);
  const response = context.redirect(loginUrl.toString());
  response.headers.set("Cache-Control", "no-store");
  return response;
});
