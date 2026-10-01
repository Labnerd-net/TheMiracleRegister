import app from "../../src/api/index";

// Loose shape for asserting on JSON responses
export type Body = Record<string, any>;
export const json = async (res: Response) => (await res.json()) as Body;

// In-memory stand-in for the API_RATE_LIMITER binding (60 calls per key, like wrangler.jsonc).
function fakeLimiter(max = 60) {
  const counts = new Map<string, number>();
  return {
    limit: async ({ key }: { key: string }) => {
      const n = (counts.get(key) ?? 0) + 1;
      counts.set(key, n);
      return { success: n <= max };
    },
  } as unknown as RateLimit;
}

// Each request gets a unique client IP unless one is given, so the rate limiter
// never leaks between tests. Only the rate-limit test passes a fixed IP.
export function createRequester() {
  const env = { DATABASE_URL: process.env.DATABASE_URL!, API_RATE_LIMITER: fakeLimiter() };
  let n = 0;
  return (path: string, opts: { ip?: string } = {}) =>
    app.request(path, { headers: { "CF-Connecting-IP": opts.ip ?? `10.0.0.${++n}` } }, env);
}
