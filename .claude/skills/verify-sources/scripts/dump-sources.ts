import "dotenv/config";
import { createDb } from "../../../../src/db/index";
import { miracleSources } from "../../../../src/db/schema/miracle-sources";
import { saintSources } from "../../../../src/db/schema/saint-sources";
import { miracles } from "../../../../src/db/schema/miracles";
import { saints } from "../../../../src/db/schema/saints";
import { miracleSaints } from "../../../../src/db/schema/miracle-saints";
import { eq, inArray } from "drizzle-orm";

// Dumps every published miracle and saint, each with its full source list
// nested inline, plus the fields needed for both checks the verify-sources
// skill runs against this data:
//   - content/categorization check (Step 2): needs recipient/location/date/
//     saint-name context alongside each source URL
//   - coverage check (coverage mode): needs content_tier, approval_authority,
//     used_for_beatification/canonization, canonization_stage, etc. to judge
//     whether the *set* of sources on a record meets the sourcing standard
// One query shape serves both so there's a single source of truth for what
// "the current state of sourcing" looks like — flatten it however a given
// check needs at read time rather than re-querying the DB per check.
//
// Read-only (SELECT only, no writes). Only published records are included
// because unpublished drafts aren't live and aren't in scope for either audit.

function getArg(flag: string): string | undefined {
  const prefix = `${flag}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  return hit?.slice(prefix.length);
}

async function main() {
  const onlyPublished = !process.argv.includes("--include-unpublished");
  const saintSlugFilter = getArg("--saint");
  const miracleSlugFilter = getArg("--miracle");
  const limitArg = getArg("--limit");
  const limit = limitArg ? Number(limitArg) : undefined;
  const db = createDb(process.env.DATABASE_URL!);

  const miracleRows = await db
    .select({
      id: miracles.id,
      slug: miracles.slug,
      title: miracles.title,
      recipient_name: miracles.recipient_name,
      location_name: miracles.location_name,
      country: miracles.country,
      date_of_event: miracles.date_of_event,
      content_tier: miracles.content_tier,
      approval_authority: miracles.approval_authority,
      used_for_beatification: miracles.used_for_beatification,
      used_for_canonization: miracles.used_for_canonization,
      vatican_medical_board_verdict: miracles.vatican_medical_board_verdict,
      published: miracles.published,
    })
    .from(miracles)
    .where(onlyPublished ? eq(miracles.published, true) : undefined);

  const miracleIds = miracleRows.map((m) => m.id);

  const links = miracleIds.length
    ? await db
        .select({
          miracle_id: miracleSaints.miracle_id,
          saint_id: miracleSaints.saint_id,
        })
        .from(miracleSaints)
        .where(inArray(miracleSaints.miracle_id, miracleIds))
    : [];

  const linkedSaintIds = [...new Set(links.map((l) => l.saint_id))];

  const saintRows = await db
    .select({
      id: saints.id,
      slug: saints.slug,
      name: saints.name,
      saint_name: saints.saint_name,
      birth_name: saints.birth_name,
      wikipedia_url: saints.wikipedia_url,
      canonization_stage: saints.canonization_stage,
      published: saints.published,
    })
    .from(saints)
    .where(onlyPublished ? eq(saints.published, true) : undefined);

  const saintById = new Map(saintRows.map((s) => [s.id, s]));
  // Saints linked to an in-scope miracle but not themselves published
  // (shouldn't normally happen, but fetch defensively for context).
  const missingSaintIds = linkedSaintIds.filter((id) => !saintById.has(id));
  const extraSaints = missingSaintIds.length
    ? await db
        .select({
          id: saints.id,
          slug: saints.slug,
          name: saints.name,
          saint_name: saints.saint_name,
          birth_name: saints.birth_name,
          wikipedia_url: saints.wikipedia_url,
          canonization_stage: saints.canonization_stage,
          published: saints.published,
        })
        .from(saints)
        .where(inArray(saints.id, missingSaintIds))
    : [];
  for (const s of extraSaints) saintById.set(s.id, s);

  const saintsByMiracle = new Map<number, typeof saintRows>();
  for (const link of links) {
    const s = saintById.get(link.saint_id);
    if (!s) continue;
    const list = saintsByMiracle.get(link.miracle_id) ?? [];
    list.push(s);
    saintsByMiracle.set(link.miracle_id, list);
  }

  const rawMiracleSources = miracleIds.length
    ? await db
        .select()
        .from(miracleSources)
        .where(inArray(miracleSources.miracle_id, miracleIds))
    : [];
  const miracleSourcesById = new Map<number, typeof rawMiracleSources>();
  for (const row of rawMiracleSources) {
    const list = miracleSourcesById.get(row.miracle_id) ?? [];
    list.push(row);
    miracleSourcesById.set(row.miracle_id, list);
  }

  const saintIds = saintRows.map((s) => s.id);
  const rawSaintSources = saintIds.length
    ? await db
        .select()
        .from(saintSources)
        .where(inArray(saintSources.saint_id, saintIds))
    : [];
  const saintSourcesById = new Map<number, typeof rawSaintSources>();
  for (const row of rawSaintSources) {
    const list = saintSourcesById.get(row.saint_id) ?? [];
    list.push(row);
    saintSourcesById.set(row.saint_id, list);
  }

  let miracleOut = miracleRows.map((m) => ({
    kind: "miracle" as const,
    id: m.id,
    slug: m.slug,
    title: m.title,
    recipient_name: m.recipient_name,
    location_name: m.location_name,
    country: m.country,
    date_of_event: m.date_of_event,
    content_tier: m.content_tier,
    approval_authority: m.approval_authority,
    used_for_beatification: m.used_for_beatification,
    used_for_canonization: m.used_for_canonization,
    has_medical_board_verdict: !!m.vatican_medical_board_verdict,
    saints: (saintsByMiracle.get(m.id) ?? []).map((s) => ({
      slug: s.slug,
      name: s.name,
      saint_name: s.saint_name,
      birth_name: s.birth_name,
    })),
    sources: (miracleSourcesById.get(m.id) ?? []).map((row) => ({
      source_id: row.id,
      url: row.url,
      title: row.title,
      source_type: row.source_type,
      accessed_date: row.accessed_date,
    })),
  }));

  let saintOut = saintRows.map((s) => ({
    kind: "saint" as const,
    id: s.id,
    slug: s.slug,
    name: s.name,
    saint_name: s.saint_name,
    birth_name: s.birth_name,
    wikipedia_url: s.wikipedia_url,
    canonization_stage: s.canonization_stage,
    sources: (saintSourcesById.get(s.id) ?? []).map((row) => ({
      source_id: row.id,
      url: row.url,
      title: row.title,
      source_type: row.source_type,
      accessed_date: row.accessed_date,
    })),
  }));

  if (miracleSlugFilter) {
    miracleOut = miracleOut.filter((m) => m.slug === miracleSlugFilter);
    saintOut = [];
  }

  if (saintSlugFilter) {
    miracleOut = miracleOut.filter((m) =>
      m.saints.some((s) => s.slug === saintSlugFilter)
    );
    saintOut = saintOut.filter((s) => s.slug === saintSlugFilter);
  }

  if (limit) {
    miracleOut = miracleOut.slice(0, limit);
    saintOut = saintOut.slice(0, Math.max(0, limit - miracleOut.length));
  }

  process.stdout.write(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        only_published: onlyPublished,
        miracles: miracleOut,
        saints: saintOut,
      },
      null,
      2
    )
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
