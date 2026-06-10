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
