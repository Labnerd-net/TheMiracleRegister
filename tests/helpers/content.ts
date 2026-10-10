import { crossFileErrors } from "../../scripts/content-load";
import type { LoadedContent } from "../../scripts/content-load";
import { miracleFileSchema, saintFileSchema } from "../../scripts/content-schema";

export const minimalSaint = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  name: `Name of ${slug}`,
  canonization_stage: "saint",
  ...extra,
});

export const minimalMiracle = (slug: string, extra: Record<string, unknown> = {}) => ({
  slug,
  title: `Title of ${slug}`,
  miracle_category: "intercessory",
  type: "healing",
  date_precision: "year",
  timing_relative_to_saint_death: "posthumous",
  recipient_privacy: "public",
  cure_characteristics: "instant_complete",
  was_medically_verified: true,
  intercessory_medium: "prayer_only",
  used_for_beatification: false,
  used_for_canonization: false,
  ...extra,
});

// Builds already-validated content the way loadContent would, without touching disk.
export function content(saints: unknown[], miracles: unknown[] = []): LoadedContent {
  const s = saints.map((x) => saintFileSchema.parse(x));
  const m = miracles.map((x) => miracleFileSchema.parse(x));
  return { dir: { path: "memory", source: "default" }, saints: s, miracles: m, errors: crossFileErrors(s, m) };
}
