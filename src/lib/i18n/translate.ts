import type { Locale } from "./locale";

// Only `reviewed` translation rows are ever shown publicly (see TMR's publish-review gate in
// CLAUDE.md "Publishing"). An unreviewed or missing translation silently falls back to English
// rather than showing a blank field or a 404 under /es/.

export type SaintTranslationRow = {
  name: string | null;
  saint_name: string | null;
  biography_short: string | null;
  reviewed: boolean;
};

export function applySaintTranslation<
  T extends { name: string; saint_name: string | null; biography_short: string | null },
>(saint: T, translation: SaintTranslationRow | undefined, locale: Locale): T {
  if (locale !== "es" || !translation?.reviewed) return saint;
  return {
    ...saint,
    name: translation.name ?? saint.name,
    saint_name: translation.saint_name ?? saint.saint_name,
    biography_short: translation.biography_short ?? saint.biography_short,
  };
}

export type MiracleTranslationRow = {
  title: string | null;
  synopsis: string | null;
  cure_details: string | null;
  medical_diagnosis: string | null;
  vatican_medical_board_verdict: string | null;
  reviewed: boolean;
};

export function applyMiracleTranslation<
  T extends {
    title: string;
    synopsis: string | null;
    cure_details: string | null;
    medical_diagnosis: string | null;
    vatican_medical_board_verdict: string | null;
  },
>(miracle: T, translation: MiracleTranslationRow | undefined, locale: Locale): T {
  if (locale !== "es" || !translation?.reviewed) return miracle;
  return {
    ...miracle,
    title: translation.title ?? miracle.title,
    synopsis: translation.synopsis ?? miracle.synopsis,
    cure_details: translation.cure_details ?? miracle.cure_details,
    medical_diagnosis: translation.medical_diagnosis ?? miracle.medical_diagnosis,
    vatican_medical_board_verdict: translation.vatican_medical_board_verdict ?? miracle.vatican_medical_board_verdict,
  };
}
