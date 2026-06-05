export function parseEnum<T extends string>(
  val: string,
  allowed: readonly T[],
  fallback: T | null = null
): T | null {
  return (allowed as readonly string[]).includes(val) ? (val as T) : fallback;
}
