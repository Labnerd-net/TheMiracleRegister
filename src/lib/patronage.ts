import { asc, eq } from "drizzle-orm";
import type { createDb } from "../db";
import { saints } from "../db/schema";
import { PATRONAGE_GROUPS } from "../db/topics";

/** A patronage term gets its own page at this many published saints; below it the index links straight to the saint. Related saints (pairs) count. */
export const MIN_PATRONAGE_SAINTS = 2;

type Db = ReturnType<typeof createDb>;

export type PatronageSaint = { id: number; slug: string; name: string };
export type PatronageTerm = { slug: string; label: string; saints: PatronageSaint[] };

/** Case and whitespace-insensitive match key for a raw `saints.patronage` string. */
export function patronageKey(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function patronageSlug(raw: string): string {
  return patronageKey(raw)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GROUP_BY_ALIAS = new Map<string, (typeof PATRONAGE_GROUPS)[number]>(
  PATRONAGE_GROUPS.flatMap((g) => g.aliases.map((a) => [patronageKey(a), g] as const)),
);

/** Resolves a raw patronage string to its group, or to its own term when no group lists it. */
export function resolvePatronage(raw: string): { slug: string; label: string } {
  const group = GROUP_BY_ALIAS.get(patronageKey(raw));
  if (group) return { slug: group.slug, label: group.label };
  return { slug: patronageSlug(raw), label: raw.trim() };
}

type SaintRow = PatronageSaint & { patronage: string[] | null };

/** Groups saints by resolved patronage term. A saint is counted once per term even if several aliases match. */
export function buildPatronageTerms(rows: SaintRow[]): PatronageTerm[] {
  const terms = new Map<string, PatronageTerm>();
  for (const row of rows) {
    for (const raw of row.patronage ?? []) {
      const { slug, label } = resolvePatronage(raw);
      if (!slug) continue;
      const term = terms.get(slug) ?? { slug, label, saints: [] };
      if (!term.saints.some((s) => s.id === row.id)) term.saints.push({ id: row.id, slug: row.slug, name: row.name });
      terms.set(slug, term);
    }
  }
  return [...terms.values()].sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
}

export function hasPatronagePage(term: PatronageTerm): boolean {
  return term.saints.length >= MIN_PATRONAGE_SAINTS;
}

/** All patronage terms across published saints, alphabetical. */
export async function getPatronageTerms(db: Db): Promise<PatronageTerm[]> {
  const rows = await db
    .select({ id: saints.id, slug: saints.slug, name: saints.name, patronage: saints.patronage })
    .from(saints)
    .where(eq(saints.published, true))
    .orderBy(asc(saints.name));
  return buildPatronageTerms(rows);
}
