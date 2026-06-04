export const MIRACLE_TOPICS = [
  // Life stages and roles
  "children",
  "mothers",
  "fathers",
  "pregnancy-and-childbirth",
  "marriage",
  "youth",
  "elderly",
  // Life circumstances
  "addiction",
  "prisoners",
  "loss-grief",
  "financial-hardship",
  "workplace",
  "native-and-indigenous",
  "pro-life",
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
