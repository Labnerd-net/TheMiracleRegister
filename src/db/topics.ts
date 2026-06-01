export const MIRACLE_TOPICS = [
  // Medical conditions
  "cancer",
  "neurological",
  "gastrointestinal",
  "cardiovascular",
  "infectious",
  "respiratory",
  "orthopedic",
  "obstetric",
  "dermatological",
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
  // Spiritual and devotional
  "technology",
  "pro-life",
  "conversion",
  "hope",
  "perseverance",
  "eucharistic",
  "marian",
  "martyrs",
  "missionaries",
  "saints-of-everyday-life",
  "spiritual-direction",
  // Saint-specific phenomena
  "stigmata",
  "bilocation",
  "incorruptibility",
  "miraculous-images",
  "saints-bodies",
] as const;

export type MiracleTopic = (typeof MIRACLE_TOPICS)[number];
