/**
 * True when `key` has exceeded the limit configured on the Workers Rate Limiting binding.
 * Fails open: if the limiter throws, log and allow, so a limiter outage never becomes a public 500.
 */
export async function isRateLimited(limiter: RateLimit, key: string): Promise<boolean> {
  try {
    const { success } = await limiter.limit({ key });
    return !success;
  } catch (e) {
    console.error("rate limiter failed, allowing request", e);
    return false;
  }
}
