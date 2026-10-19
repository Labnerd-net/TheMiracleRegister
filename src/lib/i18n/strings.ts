import type { Locale } from "./locale";

// Chrome strings for pages with a /es/ counterpart. `es` is filled in as each page's Spanish
// pass is reviewed (see catholic-research CLAUDE.md "Publishing"); until then `t()` falls back
// to English rather than showing a blank label.
const en = {
  backToSaints: "← Saints",
  feastDay: "Feast Day",
  nationality: "Nationality",
  order: "Order",
  canonized: "Canonized",
  related: "Related",
  patronage: "Patronage",
  biography: "Biography",
  miracles: "Miracles",
  noMiracles: "No miracles recorded.",
  locations: "Locations",
  listOfLocations: "List of locations",
  sources: "Sources",
  reference: "Reference",
  wikipedia: "Wikipedia ↗",
  record: "Record",
  born: "Born",
  died: "Died",
  beatified: "Beatified",
};

type Key = keyof typeof en;

const es: Partial<Record<Key, string>> = {};

export function t(locale: Locale, key: Key): string {
  return (locale === "es" ? es[key] : undefined) ?? en[key];
}
