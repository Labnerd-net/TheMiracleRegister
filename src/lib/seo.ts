// Static on purpose: counts in a description go stale in cached search snippets.
// Keep each to about 150 characters (hard ceiling 160) so results do not truncate it.
export const DEFAULT_DESCRIPTION =
  "A structured database of Catholic miracles and the saints they are attributed to, drawn from Vatican decrees, medical verdicts and primary sources.";

export const PAGE_DESCRIPTIONS = {
  saints:
    "Browse saints of the Catholic Church with documented miracles, filterable by canonization stage, religious order, nationality and theme.",
  miracles:
    "Browse documented Catholic miracles, healings and apparitions linked to the saints, with medical verification, approval status and sources.",
  map: "An interactive world map of miracle locations and places tied to the saints, including tombs, shrines, birthplaces and apparition sites.",
  timeline:
    "A chronological timeline of Catholic miracles and apparitions across the centuries, grouped by decade, with links to each documented case.",
  search:
    "Search the Miracle Register for saints and miracles by name, place, medical condition or keyword across biographies, synopses and cure details.",
} as const;
