# Plan: Admin Panel

## Context

Password-protected admin panel for data entry. Single admin password stored as a Cloudflare secret (`ADMIN_PASSWORD`). Sessions signed with `SESSION_SECRET` using HMAC-SHA256 via Web Crypto API — no external auth libraries.

---

## File Structure

```
src/
  middleware.ts              ← Auth guard for /admin/* routes
  lib/
    auth.ts                  ← Session token generation and validation
    slugify.ts               ← Auto-generate slugs from names
  layouts/
    AdminBase.astro          ← Admin shell with nav and logout
  pages/
    admin/
      index.astro            ← Dashboard (counts, recent)
      login.astro            ← Login form (GET + POST)
      logout.astro           ← POST handler, clears cookie
      saints/
        index.astro          ← Saints list with edit links
        new.astro            ← Create saint (GET + POST)
        [slug]/
          edit.astro         ← Edit saint (GET + POST)
      miracles/
        index.astro          ← Miracles list with edit links
        new.astro            ← Create miracle (GET + POST)
        [slug]/
          edit.astro         ← Edit miracle (GET + POST)
```

No delete in v1 — too risky without a confirmation UI. Use Drizzle Studio for deletions.

---

## Auth Design

### Secrets (Cloudflare)
- `ADMIN_PASSWORD` — the admin password
- `SESSION_SECRET` — random 32+ char string for HMAC signing

### Session Token Format
`{expiresAt}.{hmac}` where:
- `expiresAt` = Unix timestamp (ms), 7 days from login
- `hmac` = `HMAC-SHA256(expiresAt + "|" + ADMIN_PASSWORD, SESSION_SECRET)`

### Middleware (`src/middleware.ts`)
- Intercepts all `/admin/*` requests except `/admin/login`
- Reads `session` cookie
- Validates HMAC and expiry
- Redirects to `/admin/login?next={url}` on failure

### Login Flow
1. GET `/admin/login` → show form
2. POST `/admin/login` → compare password (timing-safe), generate token, set HttpOnly Secure cookie, redirect to `/admin` (or `next` param)
3. POST `/admin/logout` → clear cookie, redirect to `/admin/login`

---

## Admin Pages

### Dashboard (`/admin`)
- Saints count, miracles count
- Quick links to create new saint / miracle

### Saints List (`/admin/saints`)
- Table: name, stage, feast day, miracle count
- Each row has Edit link

### Saint Form (`/admin/saints/new` and `/admin/saints/[slug]/edit`)
Fields grouped:
1. **Identity**: name, birth_name, slug (auto-generated, editable)
2. **Life**: birth_date, birth_place, death_date, death_place, nationality, religious_order, feast_day
3. **Canonization**: beatification_date, beatified_by, canonization_date, canonized_by, canonization_type (select), canonization_stage (select)
4. **Taxonomy**: patronage (comma-separated), noted_for (comma-separated)
5. **Content**: biography_short (textarea), total_attributed_miracles, image_url, wikipedia_url

POST handler: validate → insert/update → redirect to `/admin/saints`

### Miracles List (`/admin/miracles`)
- Table: title, saint, type, date, beatification/canonization badge
- Each row has Edit link

### Miracle Form (`/admin/miracles/new` and `/admin/miracles/[slug]/edit`)
Fields grouped:
1. **Identity**: title, slug (auto-generated), saint (select), miracle_category, type
2. **Topics**: checkboxes from MIRACLE_TOPICS
3. **Date/Location**: date_of_event, date_precision, timing_relative_to_saint_death, location_name, country, region
4. **Recipient**: recipient_name, recipient_privacy, recipient_age_at_event, recipient_gender
5. **Medical**: medical_diagnosis, cure_details (textarea), cure_characteristics, was_medically_verified, medical_verification_date, intercessory_medium
6. **Vatican**: vatican_recognized, vatican_decree_date, vatican_medical_board_verdict, used_for_beatification, used_for_canonization
7. **Content**: synopsis (textarea), has_primary_sources

---

## Implementation Steps

1. `src/lib/auth.ts` — session token helpers
2. `src/lib/slugify.ts` — slug generation
3. `src/middleware.ts` — auth guard
4. `src/layouts/AdminBase.astro` — admin layout
5. `src/pages/admin/login.astro` — login form
6. `src/pages/admin/logout.astro` — logout handler
7. `src/pages/admin/index.astro` — dashboard
8. `src/pages/admin/saints/index.astro` — saints list
9. `src/pages/admin/saints/new.astro` — create saint
10. `src/pages/admin/saints/[slug]/edit.astro` — edit saint
11. `src/pages/admin/miracles/index.astro` — miracles list
12. `src/pages/admin/miracles/new.astro` — create miracle
13. `src/pages/admin/miracles/[slug]/edit.astro` — edit miracle
14. Update `src/env.d.ts` — add ADMIN_PASSWORD, SESSION_SECRET
15. `npm run build` — fix errors
16. Set secrets: `wrangler secret put ADMIN_PASSWORD` and `wrangler secret put SESSION_SECRET`
17. Add to `.dev.vars` for local dev

---

## Verification

1. `npm run build` exits 0
2. `/admin/login` accessible without auth
3. `/admin` redirects to login when not authenticated
4. After login, dashboard shows real counts
5. Can create a new saint and see it in the public list
6. Can edit an existing miracle
