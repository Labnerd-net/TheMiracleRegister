import "dotenv/config";
import { createDb } from "../../../../src/db/index";
import { miracleSources } from "../../../../src/db/schema/miracle-sources";
import { saintSources } from "../../../../src/db/schema/saint-sources";
import { miracles } from "../../../../src/db/schema/miracles";
import { saints } from "../../../../src/db/schema/saints";
import { miracleSaints } from "../../../../src/db/schema/miracle-saints";
import { eq, inArray } from "drizzle-orm";

// Dumps every source row attached to a *published* miracle or saint, with
// enough context (title, recipient, saint names) for a fetched page to be
// checked against. Only published records are included because unpublished
// drafts aren't live and aren't in scope for this audit.

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

  const miracleById = new Map(miracleRows.map((m) => [m.id, m]));

  const rawMiracleSources = miracleIds.length
    ? await db
        .select()
        .from(miracleSources)
        .where(inArray(miracleSources.miracle_id, miracleIds))
    : [];

  const miracleSourceRows = rawMiracleSources.map((row) => {
    const m = miracleById.get(row.miracle_id)!;
    return {
      kind: "miracle" as const,
      source_id: row.id,
      url: row.url,
      title: row.title,
      source_type: row.source_type,
      accessed_date: row.accessed_date,
      record: {
        id: m.id,
        slug: m.slug,
        title: m.title,
        recipient_name: m.recipient_name,
        location_name: m.location_name,
        country: m.country,
        date_of_event: m.date_of_event,
        saints: (saintsByMiracle.get(m.id) ?? []).map((s) => ({
          name: s.name,
          saint_name: s.saint_name,
          birth_name: s.birth_name,
        })),
      },
    };
  });

  const saintIds = saintRows.map((s) => s.id);
  const rawSaintSources = saintIds.length
    ? await db
        .select()
        .from(saintSources)
        .where(inArray(saintSources.saint_id, saintIds))
    : [];

  const saintSourceRows = rawSaintSources.map((row) => {
    const s = saintById.get(row.saint_id)!;
    return {
      kind: "saint" as const,
      source_id: row.id,
      url: row.url,
      title: row.title,
      source_type: row.source_type,
      accessed_date: row.accessed_date,
      record: {
        id: s.id,
        slug: s.slug,
        name: s.name,
        saint_name: s.saint_name,
        birth_name: s.birth_name,
        wikipedia_url: s.wikipedia_url,
      },
    };
  });

  let filteredMiracleSources = miracleSourceRows;
  let filteredSaintSources = saintSourceRows;

  if (miracleSlugFilter) {
    filteredMiracleSources = filteredMiracleSources.filter(
      (r) => r.record.slug === miracleSlugFilter
    );
    filteredSaintSources = [];
  }

  if (saintSlugFilter) {
    filteredMiracleSources = filteredMiracleSources.filter((r) =>
      (saintsByMiracle.get(r.record.id) ?? []).some((s) => s.slug === saintSlugFilter)
    );
    filteredSaintSources = filteredSaintSources.filter(
      (r) => r.record.slug === saintSlugFilter
    );
  }

  if (limit) {
    filteredMiracleSources = filteredMiracleSources.slice(0, limit);
    filteredSaintSources = filteredSaintSources.slice(
      0,
      Math.max(0, limit - filteredMiracleSources.length)
    );
  }

  process.stdout.write(
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        only_published: onlyPublished,
        miracle_sources: filteredMiracleSources,
        saint_sources: filteredSaintSources,
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
