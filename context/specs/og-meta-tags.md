# Spec for Open Graph Meta Tags

Title: Open Graph Meta Tags
Branch: claude/feature/og-meta-tags
Spec file: context/specs/og-meta-tags.md

## Summary

Add Open Graph and Twitter Card meta tags to public pages so that shared links on social media (Twitter/X, Facebook, iMessage, Mastodon, etc.) render rich preview cards — title, description, and image — instead of bare URLs. The Base.astro layout already accepts a `description` prop; this feature extends it with `ogImage` and `ogType` props and wires them into the `<head>`. Saint and miracle detail pages pass their own image, description, and type; list and static pages fall back to sensible site-level defaults.

## Functional Requirements

- Base.astro accepts new optional props: `ogImage`, `ogType`
- Base.astro renders the following meta tags when the relevant data is present:
  - `og:title` — always rendered, using the existing `fullTitle` value
  - `og:description` — rendered when `description` is provided
  - `og:image` — rendered when `ogImage` is provided; falls back to a site default image
  - `og:type` — rendered using `ogType` when provided, defaulting to `"website"`
  - `og:url` — rendered using the canonical page URL (`Astro.url`)
  - `twitter:card` — always `"summary_large_image"`
  - `twitter:title` — same as `og:title`
  - `twitter:description` — same as `og:description`, when present
  - `twitter:image` — same as `og:image`, when present
- Saints detail page (`/saints/[slug]`) passes:
  - `description`: first ~160 chars of `biography_short`, stripped of markdown
  - `ogImage`: `saint.image_url` when available
  - `ogType`: `"profile"`
- Miracles detail page (`/miracles/[slug]`) passes:
  - `description`: first ~160 chars of `synopsis`, stripped of markdown
  - `ogImage`: `miracle.image_url` when available
  - `ogType`: `"article"`
- All other pages (saints list, miracles list, homepage, etc.) render with the site-level defaults from Base.astro — no changes needed on those pages
- A default fallback OG image (the site favicon or a simple branded placeholder) is referenced for pages without a specific image

## Possible Edge Cases

- Saints or miracles with no `image_url` should fall back to the site default image, not render a broken `og:image`
- `biography_short` or `synopsis` may be null or contain markdown syntax — strip markdown before truncating for the description
- Description truncation should not cut mid-word; truncate at a word boundary near 160 chars
- The `og:url` should be the canonical URL (no trailing query params from pagination)

## Acceptance Criteria

- Sharing a saint detail URL on social media produces a preview with the saint's name, a bio excerpt, and their portrait image
- Sharing a miracle detail URL produces a preview with the miracle title, a synopsis excerpt, and the miracle image if present
- Pages without a specific image still produce a valid `og:image` pointing to the site default
- `og:type` is `"profile"` for saint pages, `"article"` for miracle pages, `"website"` for everything else
- No regressions on existing `<title>` or `description` meta rendering

## Open Questions

- None — the site domain is confirmed as `themiracleregister.org`, so absolute URLs for `og:url` are straightforward

## Testing Guidelines

No unit tests needed — OG tags are markup, best verified visually. Manual verification:
- View source on a saint detail page and confirm all 7 OG/Twitter tags are present with correct values
- View source on a miracle detail page and confirm the same
- View source on the homepage and confirm fallback defaults render

## Personal Opinion

Straightforward and high-value. Social sharing without OG tags is a real friction point — anyone pasting a link gets nothing. The implementation is minimal (a few new props in Base.astro and two callsite updates). No concerns.
