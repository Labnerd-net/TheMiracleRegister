import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { asc, eq, sql, and, inArray, ilike } from "drizzle-orm";
import { createDb } from "../../db";
import { miracleSaints, miracles, saintRelations, saints } from "../../db/schema";
import { canonizationStage } from "../../db/schema/enums";
import { SAINT_THEMES } from "../../db/topics";
import {
  MiracleListItemSchema,
  RelatedSaintSchema,
  SaintDetailSchema,
  SaintListItemSchema,
  envelopeSchema,
} from "../schemas";
import type { ApiEnv } from "../env";
import { notFound } from "../errors";

const SaintsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  canonization_stage: z.enum(canonizationStage.enumValues).optional(),
  theme: z.enum(SAINT_THEMES).optional(),
  religious_order: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
});

const saintsRoute = new OpenAPIHono<ApiEnv>();

saintsRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    request: { query: SaintsQuerySchema },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(z.array(SaintListItemSchema)) } },
        description: "List of saints",
      },
    },
  }),
  async (c) => {
    const { page, limit, canonization_stage, theme, religious_order, nationality } = c.req.valid("query");
    const offset = (page - 1) * limit;
    const db = createDb(c.env.DATABASE_URL);

    const conditions = [eq(saints.published, true)];
    if (canonization_stage) conditions.push(eq(saints.canonization_stage, canonization_stage));
    if (theme) conditions.push(sql`${saints.themes} @> ARRAY[${theme}]::text[]`);
    if (religious_order) conditions.push(ilike(saints.religious_order, `%${religious_order}%`));
    if (nationality) conditions.push(eq(saints.nationality, nationality));
    const where = and(...conditions);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: saints.id,
          slug: saints.slug,
          name: saints.name,
          saint_name: saints.saint_name,
          canonization_stage: saints.canonization_stage,
          feast_day: saints.feast_day,
          nationality: saints.nationality,
          image_url: saints.image_url,
        })
        .from(saints)
        .where(where)
        .orderBy(asc(saints.name))
        .offset(offset)
        .limit(limit),
      db.select({ total: sql<number>`count(*)::int` }).from(saints).where(where),
    ]);

    return c.json({ data: rows, meta: { page, limit, total }, error: null }, 200);
  }
);

saintsRoute.openapi(
  createRoute({
    method: "get",
    path: "/{slug}",
    request: { params: z.object({ slug: z.string() }) },
    responses: {
      200: {
        content: { "application/json": { schema: envelopeSchema(SaintDetailSchema) } },
        description: "Saint detail",
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

    const [saint] = await db.select({
      id: saints.id,
      slug: saints.slug,
      name: saints.name,
      saint_name: saints.saint_name,
      birth_name: saints.birth_name,
      birth_date: saints.birth_date,
      death_date: saints.death_date,
      feast_day: saints.feast_day,
      religious_order: saints.religious_order,
      nationality: saints.nationality,
      beatification_date: saints.beatification_date,
      beatified_by: saints.beatified_by,
      canonization_date: saints.canonization_date,
      canonized_by: saints.canonized_by,
      canonization_type: saints.canonization_type,
      canonization_stage: saints.canonization_stage,
      patronage: saints.patronage,
      themes: saints.themes,
      biography_short: saints.biography_short,
      gender: saints.gender,
      lay_person: saints.lay_person,
      image_url: saints.image_url,
      wikipedia_url: saints.wikipedia_url,
    }).from(saints).where(and(eq(saints.slug, slug), eq(saints.published, true)));
    if (!saint) return notFound(c);

    const [saintMiracles, relatedRows] = await Promise.all([
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
          was_medically_verified: miracles.was_medically_verified,
          approval_authority: miracles.approval_authority,
        })
        .from(miracles)
        .innerJoin(miracleSaints, eq(miracles.id, miracleSaints.miracle_id))
        .where(and(eq(miracleSaints.saint_id, saint.id), eq(miracles.published, true))),
      db
        .select({
          id: saints.id,
          slug: saints.slug,
          name: saints.name,
          relation_type: saintRelations.relation_type,
        })
        .from(saintRelations)
        .innerJoin(saints, eq(saintRelations.related_saint_id, saints.id))
        .where(and(eq(saintRelations.saint_id, saint.id), eq(saints.published, true))),
    ]);

    // Fetch all linked saints for these miracles (needed for MiracleListItemSchema.saints)
    const miracleIds = saintMiracles.map((m) => m.id);
    const saintLinks =
      miracleIds.length > 0
        ? await db
            .select({
              miracle_id: miracleSaints.miracle_id,
              id: saints.id,
              slug: saints.slug,
              name: saints.name,
            })
            .from(miracleSaints)
            .innerJoin(saints, eq(miracleSaints.saint_id, saints.id))
            .where(inArray(miracleSaints.miracle_id, miracleIds))
        : [];

    const saintsByMiracleId = new Map<number, { id: number; slug: string; name: string }[]>();
    for (const link of saintLinks) {
      if (!saintsByMiracleId.has(link.miracle_id)) saintsByMiracleId.set(link.miracle_id, []);
      saintsByMiracleId.get(link.miracle_id)!.push({ id: link.id, slug: link.slug, name: link.name });
    }

    const data = {
      ...saint,
      related_saints: relatedRows,
      miracles: saintMiracles.map((m) => ({ ...m, saints: saintsByMiracleId.get(m.id) ?? [] })),
    };

    // cast needed: Hono can't reconcile 200/404 response union types at compile time
    return c.json({ data: data as z.infer<typeof SaintDetailSchema>, meta: null, error: null }, 200);
  }
);

export default saintsRoute;
