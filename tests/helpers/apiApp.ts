import app from "../../src/api/index";

// Loose shape for asserting on JSON responses
export type Body = Record<string, any>;
export const json = async (res: Response) => (await res.json()) as Body;

// In-memory stand-in for the RATE_LIMIT KV namespace.
function fakeKv() {
  const store = new Map<string, string>();
  return {
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value);
    },
  } as unknown as KVNamespace;
}

// Each request gets a unique client IP unless one is given, so the rate limiter
// never leaks between tests. Only the rate-limit test passes a fixed IP.
export function createRequester() {
  const env = { DATABASE_URL: process.env.DATABASE_URL!, RATE_LIMIT: fakeKv() };
  let n = 0;
  return (path: string, opts: { ip?: string } = {}) =>
    app.request(path, { headers: { "CF-Connecting-IP": opts.ip ?? `10.0.0.${++n}` } }, env);
}
