# Spec for Miracle Location Map

Title: Miracle Location Map
Branch: claude/feature/miracle-location-map
Spec file: context/specs/miracle-location-map.md

## Summary

Add an interactive map to the miracle detail page (`/miracles/[slug]`) showing a single marker at the miracle's geographic location. The map only renders when both `location_lat` and `location_lng` are populated on the miracle record. Leaflet is used as the mapping library with OpenStreetMap tiles — no API key required.

## Functional Requirements

- Display a fixed-height map section below the synopsis on the miracle detail page
- Only render the map when both `location_lat` and `location_lng` are non-null
- Place a single marker at the miracle's coordinates
- Show a popup on the marker with `location_name` and `country` (display whichever fields are present)
- Use Leaflet loaded via CDN (not npm) to avoid SSR issues on Cloudflare Workers
- Use OpenStreetMap tile layer (free, no API key)
- Map section should have an eyebrow label ("Location") consistent with the page's design language
- Map initialisation must happen client-side only (inside a plain `<script>` tag, not frontmatter)

## Possible Edge Cases

- Miracle has `location_lat`/`location_lng` but no `location_name` or `country` — popup should still render gracefully with whatever is available, or omit the popup if nothing to show
- Miracle has `location_name` and `country` but no coordinates — map section must not render at all
- Multiple miracle detail pages open at once — each should initialise its own Leaflet instance independently
- Leaflet CSS must be loaded alongside the JS to avoid unstyled tiles

## Acceptance Criteria

- Map renders on a miracle detail page that has lat/lng coordinates
- Map does not render on a miracle detail page that has no coordinates
- Marker popup shows location name and/or country when available
- Map fits within the page's content column (not full-width)
- Map is visually consistent with the site's minimal design (no gaudy default Leaflet styling beyond what's necessary)
- Page build passes with no errors
- No console errors on pages without coordinates

## Open Questions

- Should the map be full-width or constrained to the main content column? (Assumption: constrained to content column, same as other sections)
- Should the map appear before or after sources? (Assumption: between synopsis and sources, since location is contextual to the narrative)

## Testing Guidelines

- No unit tests needed for a pure client-side map render
- Manual browser test: verify map appears on a miracle with coordinates, absent on one without

## Personal Opinion

Good addition. The data model already has `location_lat` and `location_lng` on every miracle record — this makes that data visible rather than invisible. Leaflet + OSM is the right stack: free, no keys, well-supported, and the implementation is small. The risk is low since it's purely additive and guarded by a null check. No concerns.
