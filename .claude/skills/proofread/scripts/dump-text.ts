import "dotenv/config";
import { createDb } from "../../../../src/db/index";
import { miracles } from "../../../../src/db/schema/miracles";
import { saints } from "../../../../src/db/schema/saints";
import { miracleSaints } from "../../../../src/db/schema/miracle-saints";
import { eq, inArray } from "drizzle-orm";

// Dumps the free-text narrative columns the proofread skill checks:
//   - miracles.synopsis, miracles.cure_details, miracles.medical_diagnosis
//   - saints.biography_short
// plus identity fields (recipient_name, location_name, saint name variants,
// and each miracle's linked saints via miracle_saints) needed for the
// cross-record spelling-consistency check - a miracle's synopsis is checked
// against the name fields of the saint(s) it's actually linked to, not just
// any saint in the dump.
//
// Deliberately excludes miracles.vatican_medical_board_verdict - that field
// paraphrases a sealed Vatican document, not site-authored prose, so it's
// out of scope for a writing-quality pass (see SKILL.md).
//
// Read-only (SELECT only, no writes). Only published records are included
// by default, same convention as verify-sources' dump-sources.ts.

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

  let miracleRows = await db
    .select({
      id: miracles.id,
      slug: miracles.slug,
      title: miracles.title,
      content_tier: miracles.content_tier,
      recipient_name: miracles.recipient_name,
      location_name: miracles.location_name,
      synopsis: miracles.synopsis,
      cure_details: miracles.cure_details,
      medical_diagnosis: miracles.medical_diagnosis,
      published: miracles.published,
    })
    .from(miracles)
    .where(onlyPublished ? eq(miracles.published, true) : undefined);

  if (miracleSlugFilter) {
    miracleRows = miracleRows.filter((m) => m.slug === miracleSlugFilter);
  }
  if (limit) {
    miracleRows = miracleRows.slice(0, limit);
  }

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
  const linkedSaintRows = linkedSaintIds.length
    ? await db
        .select({
          id: saints.id,
          slug: saints.slug,
          name: saints.name,
          saint_name: saints.saint_name,
          birth_name: saints.birth_name,
        })
        .from(saints)
        .where(inArray(saints.id, linkedSaintIds))
    : [];
  const linkedSaintById = new Map(linkedSaintRows.map((s) => [s.id, s]));

  const linkedSaintsByMiracle = new Map<number, (typeof linkedSaintRows)[number][]>();
  for (const link of links) {
    const s = linkedSaintById.get(link.saint_id);
    if (!s) continue;
    const list = linkedSaintsByMiracle.get(link.miracle_id) ?? [];
    list.push(s);
    linkedSaintsByMiracle.set(link.miracle_id, list);
  }

  let miracleOut = miracleRows.map((m) => ({
    ...m,
    saints: linkedSaintsByMiracle.get(m.id) ?? [],
  }));

  let saintRows = await db
    .select({
      id: saints.id,
      slug: saints.slug,
      name: saints.name,
      saint_name: saints.saint_name,
      birth_name: saints.birth_name,
      biography_short: saints.biography_short,
      published: saints.published,
    })
    .from(saints)
    .where(onlyPublished ? eq(saints.published, true) : undefined);

  if (saintSlugFilter) {
    saintRows = saintRows.filter((s) => s.slug === saintSlugFilter);
  }
  if (limit) {
    saintRows = saintRows.slice(0, limit);
  }

  // Each flag narrows to just the record(s) it names - the other side is
  // zeroed out rather than left as a full unfiltered dump (a miracle's
  // linked-saint name fields travel inline via `saints` above, so a
  // `--miracle` run keeps the spelling cross-check without needing the
  // full saints list).
  if (miracleSlugFilter && !saintSlugFilter) {
    saintRows = [];
  }
  if (saintSlugFilter && !miracleSlugFilter) {
    miracleOut = [];
  }

  console.log(JSON.stringify({ miracles: miracleOut, saints: saintRows }, null, 2));
}

main();
