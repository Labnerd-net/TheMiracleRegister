// Read-only data integrity check against the database in DATABASE_URL.
// Run: npm run check:data   (exit code 1 if any error; warnings do not fail)
import "dotenv/config";
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { MIRACLE_TOPICS, SAINT_THEMES, PATRONAGE_GROUPS } from "../src/db/topics";
import { patronageKey, patronageSlug } from "../src/lib/patronage";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}
const sql = neon(url);

const errors: string[] = [];
const warnings: string[] = [];
const err = (check: string, msg: string) => errors.push(`[${check}] ${msg}`);
const warn = (check: string, msg: string) => warnings.push(`[${check}] ${msg}`);

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HTTP_RE = /^https?:\/\//i;
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

type Rec = Record<string, any>;
const saints = (await sql`
  select id, slug, themes, patronage, published, image_url, wikipedia_url,
         feast_month, feast_day_of_month, feast_easter_offset
  from saints`) as Rec[];
const miracles = (await sql`
  select id, slug, title, topics, published, miracle_category, approval_authority, synopsis, cure_details,
         recipient_name, recipient_privacy,
         feast_month, feast_day_of_month, feast_easter_offset
  from miracles`) as Rec[];
const miracleSources = (await sql`select miracle_id, url from miracle_sources`) as Rec[];
const saintSources = (await sql`select saint_id, url from saint_sources`) as Rec[];
const miracleImages = (await sql`select miracle_id, url from miracle_images`) as Rec[];
const miracleSaints = (await sql`select miracle_id, saint_id from miracle_saints`) as Rec[];
const relations = (await sql`select saint_id, related_saint_id, relation_type from saint_relations`) as Rec[];

const slugRedirects = (await sql`select entity_type, old_slug, new_slug from slug_redirects`) as Rec[];

const saintById = new Map(saints.map((s) => [s.id, s]));

// 1. slug format
for (const [kind, rows] of [["saint", saints], ["miracle", miracles]] as const) {
  for (const r of rows) {
    if (!SLUG_RE.test(r.slug)) err("slug-format", `${kind} "${r.slug}" is not lowercase-hyphen slug format`);
  }
}

// 2. topics / themes against canonical lists
const topicSet = new Set<string>(MIRACLE_TOPICS);
const themeSet = new Set<string>(SAINT_THEMES);
for (const m of miracles) {
  for (const t of m.topics ?? []) if (!topicSet.has(t)) err("topics", `miracle "${m.slug}" has unknown topic "${t}"`);
}
for (const s of saints) {
  for (const t of s.themes ?? []) if (!themeSet.has(t)) err("themes", `saint "${s.slug}" has unknown theme "${t}"`);
}

// 2b. patronage strings: group aliases are matched case-insensitively, so a stray variant of
// an alias is harmless but should be normalized; two different strings must not share a slug
const groupSlugs = new Set<string>(PATRONAGE_GROUPS.map((g) => g.slug));
const aliasSpelling = new Map<string, string>(PATRONAGE_GROUPS.flatMap((g) => g.aliases.map((a) => [patronageKey(a), a] as const)));
const keyBySlug = new Map<string, string>();
for (const s of saints) {
  for (const raw of s.patronage ?? []) {
    const key = patronageKey(raw);
    const slug = patronageSlug(raw);
    if (!slug) {
      err("patronage", `saint "${s.slug}" has a blank or unsluggable patronage "${raw}"`);
      continue;
    }
    if (raw.charAt(0) !== raw.charAt(0).toUpperCase()) err("patronage", `saint "${s.slug}" patronage "${raw}" must start with a capital letter (sentence case)`);
    const canonical = aliasSpelling.get(key);
    if (canonical !== undefined) {
      if (raw !== canonical) err("patronage", `saint "${s.slug}" patronage "${raw}" should be spelled "${canonical}"`);
      continue;
    }
    if (groupSlugs.has(slug)) err("patronage", `saint "${s.slug}" patronage "${raw}" collides with group slug "${slug}"; add it to that group`);
    const other = keyBySlug.get(slug);
    if (other !== undefined && other !== key) err("patronage", `patronage "${raw}" (saint "${s.slug}") and "${other}" share slug "${slug}"`);
    keyBySlug.set(slug, key);
  }
}

// 3. published records have at least one source
const miracleSourceCount = new Map<number, number>();
for (const r of miracleSources) miracleSourceCount.set(r.miracle_id, (miracleSourceCount.get(r.miracle_id) ?? 0) + 1);
const saintSourceCount = new Map<number, number>();
for (const r of saintSources) saintSourceCount.set(r.saint_id, (saintSourceCount.get(r.saint_id) ?? 0) + 1);
for (const m of miracles) {
  if (m.published && !miracleSourceCount.get(m.id)) err("sources", `published miracle "${m.slug}" has no sources`);
}
for (const s of saints) {
  if (s.published && !saintSourceCount.get(s.id)) err("sources", `published saint "${s.slug}" has no sources`);
}

// 4. Wikipedia must not be a saint_sources row (rendered separately from wikipedia_url)
const saintSlugById = new Map(saints.map((s) => [s.id, s.slug]));
for (const r of saintSources) {
  if (/(^|\.)wikipedia\.org\//i.test(String(r.url).replace(/^https?:\/\//i, ""))) {
    err("wikipedia-source", `saint "${saintSlugById.get(r.saint_id)}" has a Wikipedia saint_sources row (use wikipedia_url)`);
  }
}

// 5. URL scheme on every stored URL
const checkUrl = (label: string, u: string | null) => {
  if (u && !HTTP_RE.test(u)) err("url-scheme", `${label}: "${u}" is not an http(s) URL`);
};
for (const s of saints) {
  checkUrl(`saint "${s.slug}" image_url`, s.image_url);
  checkUrl(`saint "${s.slug}" wikipedia_url`, s.wikipedia_url);
}
const miracleSlugById = new Map(miracles.map((m) => [m.id, m.slug]));
for (const r of miracleSources) checkUrl(`miracle "${miracleSlugById.get(r.miracle_id)}" source`, r.url);
for (const r of saintSources) checkUrl(`saint "${saintSlugById.get(r.saint_id)}" source`, r.url);
for (const r of miracleImages) checkUrl(`miracle "${miracleSlugById.get(r.miracle_id)}" image`, r.url);

// 6. published intercessory miracles link to at least one published saint
//    (apparitions, associated miracles and Lourdes Bureau healings may legitimately have none)
const publishedSaintLinks = new Map<number, number>();
for (const r of miracleSaints) {
  if (saintById.get(r.saint_id)?.published) publishedSaintLinks.set(r.miracle_id, (publishedSaintLinks.get(r.miracle_id) ?? 0) + 1);
}
for (const m of miracles) {
  if (m.published && m.miracle_category === "intercessory" && m.approval_authority !== "lourdes_bureau" && !publishedSaintLinks.get(m.id)) err("miracle-saints", `published intercessory miracle "${m.slug}" has no published saint linked`);
}

// 7. saint_relations are mirrored with the same relation_type
const relKeys = new Set(relations.map((r) => `${r.saint_id}:${r.related_saint_id}:${r.relation_type}`));
for (const r of relations) {
  if (!relKeys.has(`${r.related_saint_id}:${r.saint_id}:${r.relation_type}`)) {
    err("relations", `"${saintSlugById.get(r.saint_id)}" -> "${saintSlugById.get(r.related_saint_id)}" (${r.relation_type}) has no mirror row`);
  }
  if (r.saint_id === r.related_saint_id) err("relations", `"${saintSlugById.get(r.saint_id)}" is related to itself`);
}

// 8. feast fields are valid and consistent
const checkFeast = (label: string, r: Rec) => {
  const { feast_month: mo, feast_day_of_month: d, feast_easter_offset: off } = r;
  if ((mo == null) !== (d == null) && off == null) warn("feast", `${label}: feast_month and feast_day_of_month must be set together`);
  if (mo != null && (mo < 1 || mo > 12)) err("feast", `${label}: feast_month ${mo} out of range`);
  else if (mo != null && d != null && (d < 1 || d > DAYS_IN_MONTH[mo - 1])) err("feast", `${label}: ${mo}/${d} is not a valid date`);
  if (off != null && (mo != null || d != null)) warn("feast", `${label}: has both a fixed date and an easter offset`);
};
for (const s of saints) checkFeast(`saint "${s.slug}"`, s);
for (const m of miracles) checkFeast(`miracle "${m.slug}"`, m);

// 9. "// [in DB]" entries in feastDays.ts correspond to a saint with that feast date
const feastSrc = readFileSync(new URL("../src/data/feastDays.ts", import.meta.url), "utf8");
const inDbDates: { month: number; day: number; name: string }[] = [];
for (const line of feastSrc.split("\n")) {
  const m = line.match(/^\s*\/\/\s*\{\s*month:\s*(\d+),\s*day:\s*(\d+),\s*name:\s*'((?:[^'\\]|\\.)*)'.*\/\/\s*\[in DB\]/);
  if (m) inDbDates.push({ month: +m[1], day: +m[2], name: m[3] });
}
const saintDates = new Set(saints.filter((s) => s.published && s.feast_month != null).map((s) => `${s.feast_month}-${s.feast_day_of_month}`));
for (const e of inDbDates) {
  if (!saintDates.has(`${e.month}-${e.day}`)) {
    err("in-db-feast", `"${e.name}" is marked [in DB] on ${e.month}/${e.day} but no published saint has that feast date`);
  }
}
const inDbSet = new Set(inDbDates.map((e) => `${e.month}-${e.day}`));
for (const s of saints) {
  if (s.published && s.feast_month != null && s.feast_day_of_month != null && !inDbSet.has(`${s.feast_month}-${s.feast_day_of_month}`)) {
    warn("in-db-feast", `saint "${s.slug}" has feast ${s.feast_month}/${s.feast_day_of_month} but no [in DB] entry on that date (may show as a duplicate on /calendar if an active entry exists)`);
  }
}

// 10. restricted recipient names must not appear in free text
for (const m of miracles) {
  if (!m.recipient_name || (m.recipient_privacy !== "first_name_only" && m.recipient_privacy !== "confidential")) continue;
  const parts = String(m.recipient_name).trim().split(/\s+/);
  // first_name_only: the first name is allowed, anything after it is not; confidential: nothing is
  const forbidden = m.recipient_privacy === "first_name_only" ? parts.slice(1) : parts;
  const text = `${m.title ?? ""} ${m.synopsis ?? ""} ${m.cure_details ?? ""}`.toLowerCase();
  for (const word of forbidden) {
    if (word.length > 1 && new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
      err("privacy", `miracle "${m.slug}" (${m.recipient_privacy}) mentions "${word}" from the recipient name in title/synopsis/cure_details`);
    }
  }
}

const report = (label: string, list: string[]) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length})`);
  for (const l of list) console.log(`  ${l}`);
};
// 11. slug_redirects (written by the rename triggers): the old slug must not be live again,
//     and the new slug must resolve to a record of that type
const liveSlugs = { saint: new Set(saints.map((s) => s.slug)), miracle: new Set(miracles.map((m) => m.slug)) };
for (const r of slugRedirects) {
  const live = liveSlugs[r.entity_type as "saint" | "miracle"];
  if (live.has(r.old_slug)) err("slug-redirect", `${r.entity_type} redirect "${r.old_slug}" shadows a live record`);
  if (!live.has(r.new_slug)) err("slug-redirect", `${r.entity_type} redirect "${r.old_slug}" -> "${r.new_slug}" has no live target`);
}

console.log(`Checked ${saints.length} saints, ${miracles.length} miracles.`);
report("ERRORS", errors);
report("WARNINGS", warnings);
if (!errors.length) console.log(warnings.length ? "\nOK (with warnings)" : "\nOK");
process.exit(errors.length ? 1 : 0);
