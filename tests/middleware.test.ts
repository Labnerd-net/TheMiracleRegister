import { describe, expect, it, vi } from "vitest";

vi.mock("astro:middleware", () => ({ defineMiddleware: (fn: unknown) => fn }));

import { onRequest } from "../src/middleware";

type Handler = (ctx: { url: URL }, next: () => Promise<Response>) => Promise<Response>;
const run = (url: string, res: Response = new Response("ok")) =>
  (onRequest as unknown as Handler)({ url: new URL(url) }, async () => res);

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
