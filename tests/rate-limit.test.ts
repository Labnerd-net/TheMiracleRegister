import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, isRateLimited } from "../src/lib/rateLimit";

const limiterReturning = (success: boolean) =>
  ({ limit: vi.fn(async () => ({ success })) }) as unknown as RateLimit & { limit: ReturnType<typeof vi.fn> };

afterEach(() => vi.restoreAllMocks());

describe("isRateLimited", () => {
  it("is false when the limiter allows the key", async () => {
    expect(await isRateLimited(limiterReturning(true), "ip")).toBe(false);
  });
  it("is true when the limiter rejects the key", async () => {
    expect(await isRateLimited(limiterReturning(false), "ip")).toBe(true);
  });
  it("passes the key through to the binding", async () => {
    const limiter = limiterReturning(true);
    await isRateLimited(limiter, "203.0.113.7");
    expect(limiter.limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
  });
  it("skips the limiter entirely when there is no key", async () => {
    const limiter = limiterReturning(false);
    expect(await isRateLimited(limiter, null)).toBe(false);
    expect(limiter.limit).not.toHaveBeenCalled();
  });
  it("fails open and logs when the limiter throws", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const limiter = { limit: vi.fn(async () => { throw new Error("limiter down"); }) } as unknown as RateLimit;
    expect(await isRateLimited(limiter, "ip")).toBe(false);
    expect(error).toHaveBeenCalledOnce();
  });
});

describe("clientIp", () => {
  const req = (headers: Record<string, string> = {}) => new Request("https://example.test/", { headers });
  it("reads CF-Connecting-IP", () => {
    expect(clientIp(req({ "CF-Connecting-IP": " 203.0.113.7 " }))).toBe("203.0.113.7");
  });
  it("is null when the header is missing or blank", () => {
    expect(clientIp(req())).toBeNull();
    expect(clientIp(req({ "CF-Connecting-IP": "  " }))).toBeNull();
  });
  it("ignores X-Forwarded-For, which a client can set", () => {
    expect(clientIp(req({ "X-Forwarded-For": "1.2.3.4" }))).toBeNull();
  });
});
