/** Client IP set by Cloudflare's edge, or null when absent (local dev, non-edge path). */
export function clientIp(request: Request): string | null {
  return request.headers.get("CF-Connecting-IP")?.trim() || null;
}

/**
 * True when `key` has exceeded the limit configured on the Workers Rate Limiting binding.
 * Fails open: if the limiter throws, log and allow, so a limiter outage never becomes a public 500.
 */
export async function isRateLimited(limiter: RateLimit, key: string | null): Promise<boolean> {
  // No identifiable client: skip rather than pool every such request into one shared bucket.
  if (key === null) return false;
  try {
    const { success } = await limiter.limit({ key });
    return !success;
  } catch (e) {
    console.error("rate limiter failed, allowing request", e);
    return false;
  }
}
