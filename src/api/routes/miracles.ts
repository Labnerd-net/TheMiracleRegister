import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { and, asc, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { createDb } from "../../db";
import { miracleSources, miracles, saints } from "../../db/schema";
import {
  MiracleDetailSchema,
  MiracleListItemSchema,
  MiraclesQuerySchema,
  envelopeSchema,
} from "../schemas";
import type { ApiEnv } from "../env";

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
    const { saint_id, type, country, year_from, year_to, page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;
    const db = createDb(c.env.DATABASE_URL);

    const conditions = [];
    if (saint_id !== undefined) conditions.push(eq(miracles.saint_id, saint_id));
    if (type !== undefined) conditions.push(eq(miracles.type, type));
    if (country !== undefined) conditions.push(ilike(miracles.country, `%${country}%`));
    if (year_from !== undefined)
      conditions.push(gte(sql`EXTRACT(YEAR FROM ${miracles.date_of_event})::int`, year_from));
    if (year_to !== undefined)
      conditions.push(lte(sql`EXTRACT(YEAR FROM ${miracles.date_of_event})::int`, year_to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

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
          was_medically_verified: miracles.was_medically_verified,
          vatican_recognized: miracles.vatican_recognized,
          saint_id: miracles.saint_id,
        })
        .from(miracles)
        .where(where)
        .orderBy(asc(miracles.date_of_event))
        .offset(offset)
        .limit(limit),
      db.select({ total: sql<number>`count(*)::int` }).from(miracles).where(where),
    ]);

    return c.json({ data: rows, meta: { page, limit, total }, error: null }, 200);
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

    const [miracle] = await db.select().from(miracles).where(eq(miracles.slug, slug));
    if (!miracle) {
      return c.json({ data: null, meta: null, error: "Not found" }, 404);
    }

    const sources = await db
      .select({
        id: miracleSources.id,
        url: miracleSources.url,
        title: miracleSources.title,
        source_type: miracleSources.source_type,
        accessed_date: miracleSources.accessed_date,
      })
      .from(miracleSources)
      .where(eq(miracleSources.miracle_id, miracle.id));

    const data = { ...miracle, sources };

    // cast needed: Hono can't reconcile 200/404 response union types at compile time
    return c.json({ data: data as z.infer<typeof MiracleDetailSchema>, meta: null, error: null }, 200);
  }
);

export default miraclesRoute;
