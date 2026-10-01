/** Constant-time check of a `?preview=` value against PREVIEW_TOKEN. An empty or unset token never matches. */
export function isValidPreviewToken(provided: string | null, token: string | undefined): boolean {
  if (!provided || !token) return false;
  const enc = new TextEncoder();
  const a = enc.encode(provided);
  const b = enc.encode(token);
  // Compare over the longer length so a length mismatch doesn't short-circuit.
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}
