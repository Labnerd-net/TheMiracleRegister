# Plan: UI/UX Design — Academic/Editorial

## Design System

### Typography
- **Body**: EB Garamond (Google Fonts) — scholarly serif, excellent for long-form content
- **UI**: Inter (Google Fonts) — clean sans-serif for nav, labels, tags, metadata
- Base size: 18px body, generous line-height (1.7)

### Color Palette
- Background: `stone-50` (#fafaf9) — warm white
- Surface: `white` — cards, raised elements
- Text primary: `stone-900` (#1c1917)
- Text secondary: `stone-500` (#78716c)
- Border: `stone-200` (#e7e5e4)
- **Accent**: deep burgundy `#8B2635` — Catholic scholarly feel
- Tag background: `stone-100`

### Layout
- Max width: 1024px, centered
- Sidebar layout on saint/miracle detail pages (metadata left, content right on desktop)
- Full-width tables on list pages

### Component Patterns
- **Tags/topics**: small pill, stone-100 bg, stone-600 text, Inter xs
- **Badges** (saint/blessed): accent-tinted pill
- **Section divider**: thin stone-200 border
- **Meta row**: two-column dl with Inter label + Garamond value

---

## Files Changed
- `src/styles/global.css` — Tailwind base + font imports + custom utilities
- `src/layouts/Base.astro` — new nav, font links, overall structure
- `src/pages/index.astro` — homepage redesign
- `src/pages/saints/index.astro` — saint cards/list
- `src/pages/saints/[slug].astro` — saint detail with sidebar layout
- `src/pages/miracles/index.astro` — miracle list
- `src/pages/miracles/[slug].astro` — miracle detail with sidebar

Admin panel keeps its own CSS (system-ui, functional) — no Tailwind on admin.
