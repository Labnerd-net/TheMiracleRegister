export type Locale = "en" | "es";

/** URL prefix for a locale; "" for the default (English) so untranslated paths are unchanged. */
export function localePrefix(locale: Locale): string {
  return locale === "es" ? "/es" : "";
}

/** Prefixes an app-relative path (starting with "/") with the locale segment. */
export function localePath(locale: Locale, path: string): string {
  return `${localePrefix(locale)}${path}`;
}
