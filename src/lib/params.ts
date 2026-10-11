// Bounds for numeric query params, shared by the API schemas and the browse pages.
// Without them an oversized value overflows the Postgres int column and surfaces as a 500.
export const MAX_PAGE = 10000;
export const MAX_ID = 2147483647; // int4 max
export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;

// Parses a decimal integer within [min, max]; undefined when absent, malformed or out of range.
export function parseBoundedInt(raw: string | null | undefined, min: number, max: number): number | undefined {
  if (!raw || !/^-?\d+$/.test(raw)) return undefined;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= min && n <= max ? n : undefined;
}
