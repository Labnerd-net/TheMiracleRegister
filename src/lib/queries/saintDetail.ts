import { asc, and, eq } from "drizzle-orm";
import type { createDb } from "../../db";
import { saints, miracles, miracleSaints, saintRelations, saintSources, saintLocations, saintTranslations } from "../../db/schema";
import { formatApproxDate, sortSources } from "../format";
import { findSlugRedirect } from "../slugRedirect";
import { getPatronageTerms, hasPatronagePage, resolvePatronage } from "../patronage";
import { safeHttpUrl } from "../url";
import { applySaintTranslation } from "../i18n/translate";
import type { Locale } from "../i18n/locale";

type Db = ReturnType<typeof createDb>;

/**
 * Fetches and computes everything a saint detail page needs, merging in the `es` translation
 * (when reviewed) for the requested locale. Shared by /saints/[slug] and /es/saints/[slug] so the
 * two routes can't drift apart on query logic - only the markup and chrome strings differ.
 */
export async function loadSaintDetail(
  db: Db,
  slug: string,
  opts: { locale: Locale; isPreview: boolean },
) {
  const [saintRow] = await db.select().from(saints).where(
    opts.isPreview ? eq(saints.slug, slug) : and(eq(saints.slug, slug), eq(saints.published, true)),
  );
  if (!saintRow) {
    const renamedTo = opts.isPreview ? null : await findSlugRedirect(db, "saint", slug);
    if (!renamedTo) return { status: "not_found" as const };
    return { status: "redirect" as const, to: renamedTo };
  }

  const [translationRow] = opts.locale === "es"
    ? await db.select().from(saintTranslations).where(and(eq(saintTranslations.saint_id, saintRow.id), eq(saintTranslations.locale, "es")))
    : [undefined];
  const saint = applySaintTranslation(saintRow, translationRow, opts.locale);

  const [saintMiracles, relatedRows, rawSources, locations, patronageTerms] = await Promise.all([
    db.select({
      slug: miracles.slug,
      title: miracles.title,
      type: miracles.type,
      miracle_category: miracles.miracle_category,
      topics: miracles.topics,
      date_of_event: miracles.date_of_event,
      date_precision: miracles.date_precision,
      country: miracles.country,
      recipient_name: miracles.recipient_name,
      recipient_privacy: miracles.recipient_privacy,
      medical_diagnosis: miracles.medical_diagnosis,
      was_medically_verified: miracles.was_medically_verified,
      approval_authority: miracles.approval_authority,
      used_for_beatification: miracles.used_for_beatification,
      used_for_canonization: miracles.used_for_canonization,
      cure_details: miracles.cure_details,
    }).from(miracles)
      .innerJoin(miracleSaints, eq(miracles.id, miracleSaints.miracle_id))
      .where(opts.isPreview
        ? eq(miracleSaints.saint_id, saintRow.id)
        : and(eq(miracleSaints.saint_id, saintRow.id), eq(miracles.published, true)))
      .orderBy(asc(miracles.date_of_event)),
    db.select({
      id: saints.id, slug: saints.slug, name: saints.name,
      relation_type: saintRelations.relation_type,
    })
      .from(saintRelations)
      .innerJoin(saints, eq(saintRelations.related_saint_id, saints.id))
      .where(opts.isPreview
        ? eq(saintRelations.saint_id, saintRow.id)
        : and(eq(saintRelations.saint_id, saintRow.id), eq(saints.published, true))),
    db.select({
      url: saintSources.url,
      title: saintSources.title,
      source_type: saintSources.source_type,
      accessed_date: saintSources.accessed_date,
    }).from(saintSources).where(eq(saintSources.saint_id, saintRow.id)).orderBy(asc(saintSources.id)),
    db.select({
      id: saintLocations.id,
      location_name: saintLocations.location_name,
      lat: saintLocations.lat,
      lng: saintLocations.lng,
      location_type: saintLocations.location_type,
    }).from(saintLocations).where(eq(saintLocations.saint_id, saintRow.id)),
    saintRow.patronage?.length ? getPatronageTerms(db) : Promise.resolve([]),
  ]);

  const sources = sortSources(rawSources);
  const linkedPatronage = new Set(patronageTerms.filter(hasPatronagePage).map((t) => t.slug));
  const patronageLinks = (saintRow.patronage ?? []).map((raw) => {
    const { slug: pSlug } = resolvePatronage(raw);
    return { label: raw, href: linkedPatronage.has(pSlug) ? `/patronage/${pSlug}` : null };
  });

  const mappableLocations = locations.filter((l) => l.lat && l.lng);
  const birthLocation = locations.find((l) => l.location_type === "birthplace");
  const deathLocation = locations.find((l) => l.location_type === "death_place");

  return {
    status: "ok" as const,
    saint,
    saintMiracles,
    relatedRows,
    sources,
    locations,
    mappableLocations,
    birthLocation,
    deathLocation,
    bornDisplay: formatApproxDate(saintRow.birth_date, saintRow.birth_date_precision),
    diedDisplay: formatApproxDate(saintRow.death_date, saintRow.death_date_precision),
    wikipediaUrl: safeHttpUrl(saintRow.wikipedia_url),
    patronageLinks,
  };
}

export type SaintDetailResult = Awaited<ReturnType<typeof loadSaintDetail>>;
export type SaintDetailOk = SaintDetailResult & { status: "ok" };
