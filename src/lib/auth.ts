const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_COOKIE = "tmr_session";

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(message: string, hexSig: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = new Uint8Array(hexSig.match(/.{2}/g)?.map(h => parseInt(h, 16)) ?? []);
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(message));
}

export async function verifyPassword(
  password: string,
  expectedPassword: string,
  secret: string
): Promise<boolean> {
  const expectedSig = await hmac(expectedPassword, secret);
  return hmacVerify(password, expectedSig, secret);
}

export async function createSessionToken(sessionSecret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const sig = await hmac(`${expiresAt}`, sessionSecret);
  return `${expiresAt}.${sig}`;
}

export async function validateSessionToken(
  token: string,
  sessionSecret: string
): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const expiresAt = parseInt(token.slice(0, dot), 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
  const sig = token.slice(dot + 1);
  return hmacVerify(`${expiresAt}`, sig, sessionSecret);
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_MS / 1000}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
