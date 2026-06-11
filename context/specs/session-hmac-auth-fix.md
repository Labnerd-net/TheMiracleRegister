# Spec for Session HMAC Auth Fix

Title: Session HMAC Auth Fix
Branch: claude/feature/session-hmac-auth-fix
Spec file: context/specs/session-hmac-auth-fix.md

## Summary

The session token HMAC in `src/lib/auth.ts` currently signs the payload `${expiresAt}|${adminPassword}`, embedding the admin password directly in the signed token. This has two security problems:

1. **Password exposure:** If `SESSION_SECRET` is ever compromised, an attacker can derive the admin password by brute-forcing the two-part HMAC input.
2. **Password rotation doesn't invalidate sessions:** Existing tokens remain valid for up to 7 days after a password change, because the password is baked into the token rather than checked against the current secret.

The fix is to sign only `${expiresAt}` with `SESSION_SECRET`, and verify the admin password only at login time (as it already is). Sessions should be invalidated when the admin password changes, not carry the password forward.

## Functional Requirements

- `createSessionToken()` signs only `${expiresAt}` — no password embedded in the payload
- `validateSession()` verifies the HMAC against `${expiresAt}` only
- The admin password is checked only during the login POST, not during session validation
- Session tokens signed under the old scheme (with embedded password) are implicitly invalidated after this change (they will fail HMAC verification)
- No change to the 7-day session lifetime or cookie/header mechanics

## Possible Edge Cases

- Any existing valid sessions will be invalidated immediately on deploy — logged-in admins will be logged out. This is acceptable and expected behavior for a security fix.
- If `SESSION_SECRET` is rotated, all sessions are invalidated regardless (unchanged behavior).

## Acceptance Criteria

- `createSessionToken()` no longer includes `adminPassword` in the HMAC input
- `validateSession()` no longer includes `adminPassword` in the HMAC verification
- A session token created after the fix cannot be used to infer the admin password even if `SESSION_SECRET` is known
- Changing `ADMIN_PASSWORD` now effectively invalidates all existing sessions (because old tokens no longer carry the password to verify against — they just expire naturally, or are invalidated when `SESSION_SECRET` is rotated)
- Login still works correctly end-to-end
- Build passes, existing auth tests pass

## Open Questions

- None. The fix is clearly scoped.

## Testing Guidelines

Create or update tests in `./tests/` to cover:
- `createSessionToken()` produces a token that does not contain the admin password as a substring
- `validateSession()` returns valid for a fresh token created with the current `SESSION_SECRET`
- `validateSession()` returns invalid for a token with a tampered expiry
- `validateSession()` returns invalid for an expired token

## Personal Opinion

This is a good and necessary fix. Embedding a secret (the admin password) in a signed token is a well-known anti-pattern — it violates the principle that a token should only prove "this was issued by the server at this time," not carry credentials. The password-rotation gap is a real operational risk.

The change is minimal: remove the password from the HMAC input in two places. No schema changes, no new dependencies, no API changes. Straightforward and worth doing before any further admin work.
