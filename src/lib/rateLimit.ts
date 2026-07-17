export async function isRateLimited(
  kv: KVNamespace,
  key: string,
  { max, windowSeconds }: { max: number; windowSeconds: number }
): Promise<boolean> {
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw) : 0;
  if (count >= max) return true;
  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds });
  return false;
}
