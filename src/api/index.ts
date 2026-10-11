import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import miracles from "./routes/miracles";
import metadata from "./routes/metadata";
import saints from "./routes/saints";
import search from "./routes/search";
import types from "./routes/types";
import { isRateLimited } from "../lib/rateLimit";
import { validationHook } from "./errors";
import type { ApiEnv } from "./env";
import { CACHE_CONTENT, CACHE_REFERENCE } from "../lib/cache";

const app = new OpenAPIHono<ApiEnv>({ defaultHook: validationHook }).basePath("/api/v1");

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error("API error", err);
  c.header("Cache-Control", "no-store");
  return c.json({ data: null, meta: null, error: "Internal server error" }, 500);
});

// Public read-only API — open CORS is intentional. Admin endpoints must never be added under /api/v1/.
app.use("*", cors({ origin: "*" }));

app.use("*", async (c: Context<ApiEnv>, next: () => Promise<void>) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
  if (await isRateLimited(c.env.API_RATE_LIMITER, ip)) {
    return c.json({ data: null, meta: null, error: "Too many requests" }, 429);
  }
  await next();
});

const cache = (value: string) => async (c: Context<ApiEnv>, next: () => Promise<void>) => {
  await next();
  // Only successes get the shared-cache policy; a cached 404 would outlive publishing the record.
  c.header("Cache-Control", c.res.status === 200 ? value : "no-store");
};

app.use("/saints/*", cache(CACHE_CONTENT));
app.use("/miracles/*", cache(CACHE_CONTENT));
app.use("/types/*", cache(CACHE_REFERENCE));
app.use("/metadata/*", cache(CACHE_REFERENCE));
app.use("/search/*", async (c: Context<ApiEnv>, next: () => Promise<void>) => {
  await next();
  c.header("Cache-Control", "no-store");
});

app.route("/saints", saints);
app.route("/miracles", miracles);
app.route("/types", types);
app.route("/metadata", metadata);
app.route("/search", search);

app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "The Miracle Register API", version: "1.0.0" },
});

export default app;
