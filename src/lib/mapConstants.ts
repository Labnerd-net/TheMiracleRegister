export const LOCATION_TYPE_COLORS: Record<string, string> = {
  tomb: "#c9a84c",
  birthplace: "#4a90d9",
  death_place: "#888888",
  shrine: "#7c5cbf",
  relic: "#c0392b",
  major_devotional_center: "#27ae60",
  other: "#5ba8a0",
};

// When two location rows land on the exact same point (e.g. a death_place and a tomb
// that are genuinely the same building), the marker takes the color of whichever type
// ranks highest here - most pilgrimage-relevant/specific first.
export const LOCATION_TYPE_PRIORITY = [
  "tomb",
  "shrine",
  "relic",
  "major_devotional_center",
  "death_place",
  "birthplace",
  "other",
];

export function pickPrimaryLocationType(types: string[]): string {
  for (const t of LOCATION_TYPE_PRIORITY) {
    if (types.includes(t)) return t;
  }
  return types[0] ?? "other";
}

interface GroupableLocation {
  lat: string | number | null;
  lng: string | number | null;
  location_type: string;
}

export interface LocationGroup<T extends GroupableLocation> {
  lat: number;
  lng: number;
  primaryType: string;
  items: T[];
}

// Groups rows sharing the same coordinate (optionally scoped by a key, e.g. saint slug,
// so two different saints who happen to share a pilgrimage site don't get merged) into one
// marker's worth of data. The marker gets pickPrimaryLocationType's color; the popup lists
// every item in the group individually. Keys on the numeric value, not the raw string, so
// "41.902200" and "41.9022" land in the same group.
export function groupLocationsByCoordinate<T extends GroupableLocation>(
  rows: T[],
  scopeKey?: (row: T) => string
): LocationGroup<T>[] {
  const groups = new Map<string, LocationGroup<T>>();
  for (const row of rows) {
    const lat = Number(row.lat ?? NaN);
    const lng = Number(row.lng ?? NaN);
    const key = `${scopeKey ? scopeKey(row) + ":" : ""}${lat},${lng}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(row);
    } else {
      groups.set(key, { lat, lng, primaryType: row.location_type, items: [row] });
    }
  }
  for (const g of groups.values()) {
    g.primaryType = pickPrimaryLocationType(g.items.map((i) => i.location_type));
  }
  return [...groups.values()];
}
