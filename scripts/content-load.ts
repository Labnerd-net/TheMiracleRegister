// Locates, reads and validates the content files. Opens no database connection: checks that
// need the database (does a referenced saint exist there) live in import-content-core.ts.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  miracleFileSchema,
  saintFileSchema,
  type MiracleFile,
  type SaintFile,
} from "./content-schema";

export type ContentDirSource = "--content-dir flag" | "CONTENT_DIR env var" | "default";
export type ContentDir = { path: string; source: ContentDirSource };

export const DEFAULT_CONTENT_DIR = "../catholic-research/TheMiracleRegister/Content";
export const CONTENT_REPO_URL = "https://github.com/Labnerd-net/catholic-research";
export const MARKER_FILE = ".content-root";

export class ContentDirError extends Error {}

export function resolveContentDir(opts: {
  flag?: string;
  env?: string;
  repoRoot: string;
}): ContentDir {
  if (opts.flag) return { path: resolve(opts.flag), source: "--content-dir flag" };
  if (opts.env) return { path: resolve(opts.env), source: "CONTENT_DIR env var" };
  return { path: resolve(opts.repoRoot, DEFAULT_CONTENT_DIR), source: "default" };
}

function dirError(dir: ContentDir, problem: string): ContentDirError {
  return new ContentDirError(
    [
      `Content directory ${problem}.`,
      `  Path tried: ${dir.path}`,
      `  Supplied by: ${dir.source}`,
      `  Sources are checked in this order: --content-dir flag, CONTENT_DIR env var (.env), default (${DEFAULT_CONTENT_DIR}).`,
      `  To get the content repo: git clone ${CONTENT_REPO_URL} ../catholic-research`,
    ].join("\n"),
  );
}

// Checks the directory exists and carries the marker file. Shared by the importer and exporter.
export function assertContentRoot(dir: ContentDir): void {
  if (!existsSync(dir.path) || !statSync(dir.path).isDirectory()) throw dirError(dir, "does not exist");
  if (!existsSync(join(dir.path, MARKER_FILE))) throw dirError(dir, `has no ${MARKER_FILE} marker file`);
}

export type LoadedContent = {
  dir: ContentDir;
  saints: SaintFile[];
  miracles: MiracleFile[];
  /** All validation problems found, collected before failing. */
  errors: string[];
};

function readJson(path: string): unknown {
  // Strip a BOM; JSON.parse already tolerates CRLF between tokens.
  return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""));
}

function readEntityDir<T>(
  dir: ContentDir,
  sub: "saints" | "miracles",
  parse: (raw: unknown) => { success: true; data: T & { slug: string } } | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } },
  errors: string[],
): { file: string; data: T & { slug: string } }[] {
  const base = join(dir.path, sub);
  if (!existsSync(base)) return [];
  const out: { file: string; data: T & { slug: string } }[] = [];
  for (const name of readdirSync(base).sort()) {
    if (!name.endsWith(".json")) continue;
    const rel = `${sub}/${name}`;
    let raw: unknown;
    try {
      raw = readJson(join(base, name));
    } catch (e) {
      errors.push(`${rel}: invalid JSON (${(e as Error).message})`);
      continue;
    }
    const parsed = parse(raw);
    if (!parsed.success) {
      for (const i of parsed.error.issues) errors.push(`${rel}: ${i.path.join(".") || "(root)"}: ${i.message}`);
      continue;
    }
    if (name !== `${parsed.data.slug}.json`) {
      errors.push(`${rel}: file name must equal slug "${parsed.data.slug}"`);
      continue;
    }
    out.push({ file: rel, data: parsed.data });
  }
  return out;
}

export function loadContent(dir: ContentDir): LoadedContent {
  assertContentRoot(dir);
  const errors: string[] = [];
  const saintFiles = readEntityDir<SaintFile>(dir, "saints", (r) => saintFileSchema.safeParse(r), errors);
  const miracleFiles = readEntityDir<MiracleFile>(dir, "miracles", (r) => miracleFileSchema.safeParse(r), errors);
  if (!saintFiles.length && !miracleFiles.length && !errors.length) throw dirError(dir, "contains no saint or miracle files");

  const saints = saintFiles.map((f) => f.data);
  const miracles = miracleFiles.map((f) => f.data);
  errors.push(...crossFileErrors(saints, miracles));
  return { dir, saints, miracles, errors };
}

// Checks that only need the files themselves.
export function crossFileErrors(saints: SaintFile[], miracles: MiracleFile[]): string[] {
  const errors: string[] = [];

  for (const [kind, list] of [["saint", saints], ["miracle", miracles]] as const) {
    const seen = new Set<string>();
    for (const e of list) {
      if (seen.has(e.slug)) errors.push(`${kind} "${e.slug}": duplicate slug`);
      seen.add(e.slug);
    }
    const current = new Set(list.map((e) => e.slug));
    const claimed = new Map<string, string>();
    for (const e of list) {
      for (const prev of e.previous_slugs ?? []) {
        if (prev === e.slug) errors.push(`${kind} "${e.slug}": previous_slugs contains its own slug`);
        else if (current.has(prev)) errors.push(`${kind} "${e.slug}": previous slug "${prev}" is another ${kind}'s current slug`);
        const other = claimed.get(prev);
        if (other && other !== e.slug) errors.push(`${kind} "${e.slug}": previous slug "${prev}" is also claimed by "${other}"`);
        claimed.set(prev, e.slug);
      }
      if (new Set(e.previous_slugs ?? []).size !== (e.previous_slugs ?? []).length) {
        errors.push(`${kind} "${e.slug}": previous_slugs has duplicates`);
      }
    }
  }

  // saint_relations is stored in both directions, so the files must list both.
  const bySlug = new Map(saints.map((s) => [s.slug, s]));
  for (const s of saints) {
    for (const r of s.relations ?? []) {
      if (r.saint === s.slug) errors.push(`saint "${s.slug}": relation to itself`);
      const other = bySlug.get(r.saint);
      if (other && !(other.relations ?? []).some((o) => o.saint === s.slug && o.type === r.type)) {
        errors.push(`saint "${s.slug}": ${r.type} relation to "${r.saint}" is not mirrored in "${r.saint}"`);
      }
    }
  }
  return errors;
}

// Reference checks the importer does against files plus the database; with no database, the files
// must be self-contained (they are a complete set, since the backfill export covers every row).
export function fileOnlyReferenceErrors(saints: SaintFile[], miracles: MiracleFile[]): string[] {
  const errors: string[] = [];
  const known = new Set(saints.map((s) => s.slug));
  for (const s of saints) {
    for (const r of s.relations ?? []) {
      if (!known.has(r.saint)) errors.push(`saint "${s.slug}": relation to unknown saint "${r.saint}"`);
    }
  }
  for (const m of miracles) {
    for (const slug of m.saints ?? []) {
      if (!known.has(slug)) errors.push(`miracle "${m.slug}": references unknown saint "${slug}"`);
    }
  }
  return errors;
}

export type ContentGit = {
  head: string;
  /** Uncommitted changes under the content directory (untracked files included). */
  dirty: boolean;
  /** HEAD is contained in origin/main. */
  onOriginMain: boolean;
  fetchFailed: boolean;
};

// Reports the content repo state. Returns null when the directory is not in a git work tree.
export function contentGit(dir: ContentDir): ContentGit | null {
  const git = (...args: string[]) => execFileSync("git", ["-C", dir.path, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  try {
    git("rev-parse", "--show-toplevel");
  } catch {
    return null;
  }
  let fetchFailed = false;
  try {
    git("fetch", "--quiet", "origin", "main");
  } catch {
    fetchFailed = true;
  }
  let onOriginMain: boolean;
  try {
    git("merge-base", "--is-ancestor", "HEAD", "origin/main");
    onOriginMain = true;
  } catch {
    onOriginMain = false;
  }
  return {
    head: git("rev-parse", "--short", "HEAD"),
    dirty: git("status", "--porcelain", "--", ".").length > 0,
    onOriginMain,
    fetchFailed,
  };
}
