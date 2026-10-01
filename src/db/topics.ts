export const MIRACLE_TOPICS = [
  // Life stages and roles
  "children",
  "mothers",
  "pregnancy-and-childbirth",
  "marriage",
  "youth",
  "elderly",
  // Life circumstances and vocation
  "addiction",
  "prisoners",
  "loss-grief",
  "native-and-indigenous",
  "veterans",
  "religious-life",
  "conversion",
] as const;

export type MiracleTopic = (typeof MIRACLE_TOPICS)[number];

export const SAINT_THEMES = [
  "hope",
  "perseverance",
  "conversion",
  "eucharistic",
  "marian",
  "martyrs",
  "missionaries",
  "saints-of-everyday-life",
  "spiritual-direction",
  "technology",
] as const;

export type SaintTheme = (typeof SAINT_THEMES)[number];

// Merges raw `saints.patronage` strings that mean the same thing. Aliases are
// matched case-insensitively, but stored patronage must be sentence case (first letter
// capitalized, then lowercase except proper nouns and acronyms); `check:data` enforces the
// first letter. A patronage string in no group is its own term.
// Places and organizations (France, Lourdes, Opus Dei, ...) are not grouped.
export const PATRONAGE_GROUPS = [
  {
    slug: "families",
    label: "Families",
    aliases: ["Families", "Catholic families", "Parents", "Married couples"],
  },
  { slug: "the-sick", label: "The sick", aliases: ["The sick"] },
  {
    slug: "youth",
    label: "Youth",
    aliases: ["Youth", "Adolescents", "Young Catholics", "University students"],
  },
  { slug: "world-youth-day", label: "World Youth Day", aliases: ["World Youth Day"] },
  { slug: "converts", label: "Converts", aliases: ["Converts"] },
  {
    slug: "education",
    label: "Education",
    aliases: ["Catholic education", "Catholic schools", "Teachers"],
  },
  {
    slug: "native-peoples",
    label: "Native peoples",
    aliases: ["Native Americans", "Indigenous peoples of the Americas"],
  },
  { slug: "missions", label: "Missions", aliases: ["Missionaries", "Missions"] },
  {
    slug: "environment",
    label: "Environment",
    aliases: ["Ecology", "Environmentalists"],
  },
  {
    slug: "pro-life",
    label: "Pro-life",
    aliases: ["Unborn children", "Pro-life movement"],
  },
] as const;

export type PatronageGroup = (typeof PATRONAGE_GROUPS)[number];
