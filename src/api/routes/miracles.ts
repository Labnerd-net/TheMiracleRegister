import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, asc, eq, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { miracleImages, miracleSources, miracles } from "../../db/schema";
import {
  MiracleDetailSchema,
  MiracleListItemSchema,
  MiraclesQuerySchema,
  envelopeSchema,
} from "../schemas";
import type { ApiEnv } from "../env";
import { notFound } from "../errors";
import { fetchSaintsByMiracle, miracleFilterConditions } from "../../lib/queries/miracles";
import { redactRecipient } from "../../lib/privacy";

const miraclesRoute = new OpenAPIHono<ApiEnv>();

miraclesRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: MiraclesQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(z.array(MiracleListItemSchema)) } },
        description: "List of miracles",
      },
    },
  }),
  async (c) => {
    const { saint_id, type, topic, category, country, year_from, year_to, used_for_beatification, used_for_canonization, approval_authority, page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    const db = createDb(c.env.DATABASE_URL);

    const conditions = miracleFilterConditions(db, {
      saint_id, type, topic, category, country, year_from, year_to,
      used_for_beatification: used_for_beatification === "1",
      used_for_canonization: used_for_canonization === "1",
      approval_authority,
    });

    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: miracles.id,
          slug: miracles.slug,
          title: miracles.title,
          type: miracles.type,
          topics: miracles.topics,
          country: miracles.country,
          date_of_event: miracles.date_of_event,
          date_precision: miracles.date_precision,
          recipient_name: miracles.recipient_name,
          recipient_privacy: miracles.recipient_privacy,
          was_medically_verified: miracles.was_medically_verified,
          approval_authority: miracles.approval_authority,
          cure_details: miracles.cure_details,
          used_for_beatification: miracles.used_for_beatification,
          used_for_canonization: miracles.used_for_canonization,
        })
        .from(miracles)
        .where(where)
        .orderBy(asc(miracles.date_of_event))
        .offset(offset)
        .limit(limit),
      db.select({ total: sql<number>`count(*)::int` }).from(miracles).where(where),
    ]);

    const saintsByMiracleId = await fetchSaintsByMiracle(db, rows.map((r) => r.id));
    const data = rows.map(({ recipient_privacy, ...r }) => ({
      ...r,
      recipient_name: redactRecipient(r.recipient_name, recipient_privacy),
      saints: saintsByMiracleId.get(r.id) ?? [],
    }));

    return c.json({ data, meta: { page, limit, total }, error: null }, 200);
  }
);

miraclesRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    request: { params: z.object({ slug: z.string() }) },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(MiracleDetailSchema) } },
        description: "Miracle detail",
      },
      404: {
        content: { "application/json": { schema: envelopeSchema(z.null()) } },
        description: "Not found",
      },
    },
  }),
  async (c) => {
    const { slug } = c.req.valid("param");
    const db = createDb(c.env.DATABASE_URL);

    const [miracle] = await db.select({
      id: miracles.id,
      slug: miracles.slug,
      title: miracles.title,
      miracle_category: miracles.miracle_category,
      type: miracles.type,
      topics: miracles.topics,
      date_of_event: miracles.date_of_event,
      date_precision: miracles.date_precision,
      timing_relative_to_saint_death: miracles.timing_relative_to_saint_death,
      location_name: miracles.location_name,
      location_lat: miracles.location_lat,
      location_lng: miracles.location_lng,
      country: miracles.country,
      region: miracles.region,
      recipient_name: miracles.recipient_name,
      recipient_privacy: miracles.recipient_privacy,
      recipient_age_at_event: miracles.recipient_age_at_event,
      medical_diagnosis: miracles.medical_diagnosis,
      cure_details: miracles.cure_details,
      cure_characteristics: miracles.cure_characteristics,
      was_medically_verified: miracles.was_medically_verified,
      medical_verification_date: miracles.medical_verification_date,
      intercessory_medium: miracles.intercessory_medium,
      approval_authority: miracles.approval_authority,
      vatican_decree_date: miracles.vatican_decree_date,
      vatican_medical_board_verdict: miracles.vatican_medical_board_verdict,
      used_for_beatification: miracles.used_for_beatification,
      used_for_canonization: miracles.used_for_canonization,
      witness_count: miracles.witness_count,
      synopsis: miracles.synopsis,
      recipient_gender: miracles.recipient_gender,
      recipient_country: miracles.recipient_country,
    }).from(miracles).where(and(eq(miracles.slug, slug), eq(miracles.published, true)));
    if (!miracle) return notFound(c);

    const [sources, saintsByMiracleId, images] = await Promise.all([
      db
        .select({
          id: miracleSources.id,
          url: miracleSources.url,
          title: miracleSources.title,
          source_type: miracleSources.source_type,
          accessed_date: miracleSources.accessed_date,
        })
        .from(miracleSources)
        .where(eq(miracleSources.miracle_id, miracle.id)),
      fetchSaintsByMiracle(db, [miracle.id]),
      db
        .select({
          id: miracleImages.id,
          url: miracleImages.url,
          caption: miracleImages.caption,
          display_order: miracleImages.display_order,
          source_attribution: miracleImages.source_attribution,
        })
        .from(miracleImages)
        .where(eq(miracleImages.miracle_id, miracle.id))
        .orderBy(asc(miracleImages.display_order)),
    ]);

    const data = { ...miracle, recipient_name: redactRecipient(miracle.recipient_name, miracle.recipient_privacy), saints: saintsByMiracleId.get(miracle.id) ?? [], sources, images };

    // cast needed: Hono can't reconcile 200/404 response union types at compile time
    return c.json({ data: data as z.infer<typeof MiracleDetailSchema>, meta: null, error: null }, 200);
  }
);

export default miraclesRoute;
