import { describe, expect, it } from "vitest";
import { isRateLimited } from "../src/lib/rateLimit";

function fakeKv() {
  const store = new Map<string, string>();
  const puts: { key: string; ttl?: number }[] = [];
  const kv = {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string, opts?: { expirationTtl?: number }) => {
      store.set(k, v);
      puts.push({ key: k, ttl: opts?.expirationTtl });
    },
  } as unknown as KVNamespace;
  return { kv, puts };
}

describe("isRateLimited", () => {
  it("allows up to max calls then blocks", async () => {
    const { kv } = fakeKv();
    const opts = { max: 3, windowSeconds: 60 };
    expect(await isRateLimited(kv, "ip", opts)).toBe(false);
    expect(await isRateLimited(kv, "ip", opts)).toBe(false);
    expect(await isRateLimited(kv, "ip", opts)).toBe(false);
    expect(await isRateLimited(kv, "ip", opts)).toBe(true);
  });
  it("tracks keys independently", async () => {
    const { kv } = fakeKv();
    const opts = { max: 1, windowSeconds: 60 };
    expect(await isRateLimited(kv, "a", opts)).toBe(false);
    expect(await isRateLimited(kv, "a", opts)).toBe(true);
    expect(await isRateLimited(kv, "b", opts)).toBe(false);
  });
  it("sets the window as the KV expiration TTL", async () => {
    const { kv, puts } = fakeKv();
    await isRateLimited(kv, "ip", { max: 5, windowSeconds: 90 });
    expect(puts[0]).toEqual({ key: "ip", ttl: 90 });
  });
  it("does not write when already limited", async () => {
    const { kv, puts } = fakeKv();
    const opts = { max: 1, windowSeconds: 60 };
    await isRateLimited(kv, "ip", opts);
    await isRateLimited(kv, "ip", opts);
    expect(puts).toHaveLength(1);
  });
});
