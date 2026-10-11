import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:middleware", () => ({ defineMiddleware: (fn: unknown) => fn }));

const limiter = vi.hoisted(() => ({ limit: vi.fn(async (opts: { key: string }) => ({ success: Boolean(opts) })) }));
vi.mock("cloudflare:workers", () => ({ env: { PAGE_RATE_LIMITER: limiter } }));

import { onRequest } from "../src/middleware";

type Handler = (ctx: { url: URL; request: Request }, next: () => Promise<Response>) => Promise<Response>;
const run = (url: string, res: Response = new Response("ok"), headers: Record<string, string> = {}) => {
  const next = vi.fn(async () => res);
  const result = (onRequest as unknown as Handler)({ url: new URL(url), request: new Request(url, { headers }) }, next);
  return Object.assign(result, { next });
};

beforeEach(() => {
  limiter.limit.mockReset();
  limiter.limit.mockResolvedValue({ success: true });
});

describe("security headers middleware", () => {
  it("sets the baseline security headers", async () => {
    const res = await run("https://example.test/saints");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Content-Security-Policy")).toBe("frame-ancestors 'none'");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
  });

  it("does not overwrite a header the response already set", async () => {
    const res = await run("https://example.test/", new Response("ok", { headers: { "X-Frame-Options": "SAMEORIGIN" } }));
    expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });

  it("marks preview responses noindex and strips the referrer", async () => {
    const res = await run("https://example.test/saints/x?preview=tok");
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("applies preview headers even if the response set its own Referrer-Policy", async () => {
    const res = await run("https://example.test/?preview=1", new Response("ok", { headers: { "Referrer-Policy": "origin" } }));
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
  });
});

describe("page rate limiting", () => {
  const ip = { "CF-Connecting-IP": "203.0.113.7" };

  it("keys the limiter on the client IP and passes allowed requests through", async () => {
    const res = await run("https://example.test/saints", new Response("ok"), ip);
    expect(res.status).toBe(200);
    expect(limiter.limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
  });

  it("returns 429 with Retry-After and no-store, without rendering, when limited", async () => {
    limiter.limit.mockResolvedValue({ success: false });
    const pending = run("https://example.test/miracles", new Response("ok"), ip);
    const res = await pending;
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(pending.next).not.toHaveBeenCalled();
  });

  it("still adds the security headers to a 429", async () => {
    limiter.limit.mockResolvedValue({ success: false });
    const res = await run("https://example.test/map", new Response("ok"), ip);
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("does not limit /api/v1/ requests (the API has its own limiter)", async () => {
    limiter.limit.mockResolvedValue({ success: false });
    const res = await run("https://example.test/api/v1/types", new Response("ok"), ip);
    expect(res.status).toBe(200);
    expect(limiter.limit).not.toHaveBeenCalled();
  });

  it("limits other /api paths such as the docs pages", async () => {
    limiter.limit.mockResolvedValue({ success: false });
    expect((await run("https://example.test/api/reference", new Response("ok"), ip)).status).toBe(429);
  });

  it("skips limiting when there is no client IP", async () => {
    const res = await run("https://example.test/saints");
    expect(res.status).toBe(200);
    expect(limiter.limit).not.toHaveBeenCalled();
  });
});
