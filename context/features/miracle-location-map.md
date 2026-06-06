# Plan: Miracle Location Map

## Context

The miracles table has `location_lat`, `location_lng`, `location_name`, and `country` columns. These coordinates exist in the DB but are invisible on the public site. Adding a Leaflet map to the miracle detail page makes location data useful without any backend changes.

## Key Findings

- `miracles/[slug].astro` uses `db.select()` (wildcard) — all four location fields are already in the `miracle` object, no query change needed.
- `Base.astro` has no `<head>` slot. A named slot must be added to support per-page CSS injection (Leaflet CSS must load in `<head>` to avoid unstyled tiles).
- The page has no existing `<script>` tags — this will be the first client-side JS on the miracle detail page.
- The pattern for inline scripts in this project: plain `<script>` tags with TypeScript (see `src/pages/index.astro`). For Leaflet (a CDN global), we use `<script is:inline define:vars={...}>` to safely pass SSR data to client-side code without TypeScript complications.

## Implementation Steps

### 1. Add `<slot name="head" />` to `src/layouts/Base.astro`

Inside the `<head>` block, after the existing `<script is:inline>` theme block:

```html
<slot name="head" />
```

This is the Astro-idiomatic way to allow per-page head injection. No other changes to Base.astro.

### 2. Update `src/pages/miracles/[slug].astro`

**a. Inject Leaflet CSS into `<head>` via named slot** — conditionally, only when coordinates exist:

```astro
{miracle.location_lat && miracle.location_lng && (
  <link slot="head" rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
)}
```

**b. Add map section between synopsis and sources** — guarded by null check on both lat and lng:

```astro
{miracle.location_lat && miracle.location_lng && (
  <section class="mb-9 pb-9 section-rule">
    <p class="eyebrow mb-4">Location</p>
    <div id="miracle-map" style="height:320px;width:100%;background:var(--bg-elevated)"></div>
  </section>
)}
```

**c. Load Leaflet JS and initialise the map at the bottom of the file** — after `</Base>`, using `is:inline` + `define:vars` to pass SSR values to client JS:

```astro
{miracle.location_lat && miracle.location_lng && (
  <>
    <script is:inline src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script is:inline define:vars={{
      lat: miracle.location_lat,
      lng: miracle.location_lng,
      locationName: miracle.location_name,
      country: miracle.country,
    }}>
      const map = L.map('miracle-map').setView([lat, lng], 7);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      const label = [locationName, country].filter(Boolean).join(', ');
      const marker = L.marker([lat, lng]).addTo(map);
      if (label) marker.bindPopup(label).openPopup();
    </script>
  </>
)}
```

Note: `location_lat` and `location_lng` are `numeric` in Postgres — Drizzle returns them as strings. Cast to `Number()` in the script: `L.map(...).setView([Number(lat), Number(lng)], 7)`.

## Files Changed

- `src/layouts/Base.astro` — one line added: `<slot name="head" />`
- `src/pages/miracles/[slug].astro` — head slot, map section, two script tags (all conditional on lat/lng)

## Verification

1. Run `npm run build` — should pass with no errors
2. Check a miracle detail page that has coordinates — map should render with a marker and popup
3. Check a miracle detail page without coordinates — no map section, no Leaflet JS loaded, no console errors
