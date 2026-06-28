import type { APIRoute } from "astro";
import { createDb } from "../db";
import { saints, miracles } from "../db/schema";
import { eq, asc } from "drizzle-orm";
import { env } from "cloudflare:workers";

const SITE = "https://themiracleregister.org";

function url(path: string, lastmod?: string | null): string {
  const loc = `${SITE}${path}`;
  return lastmod
    ? `  <url><loc>${loc}</loc><lastmod>${lastmod.slice(0, 10)}</lastmod></url>`
    : `  <url><loc>${loc}</loc></url>`;
}

export const GET: APIRoute = async () => {
  const db = createDb(env.DATABASE_URL);

  const [saintRows, miracleRows] = await Promise.all([
    db
      .select({ slug: saints.slug, updated_at: saints.updated_at })
      .from(saints)
      .where(eq(saints.published, true))
      .orderBy(asc(saints.slug)),
    db
      .select({ slug: miracles.slug, updated_at: miracles.updated_at })
      .from(miracles)
      .where(eq(miracles.published, true))
      .orderBy(asc(miracles.slug)),
  ]);

  const entries = [
    url("/"),
    url("/saints"),
    url("/miracles"),
    url("/map"),
    url("/miracles/timeline"),
    url("/search"),
    ...saintRows.map((s) => url(`/saints/${s.slug}`, s.updated_at)),
    ...miracleRows.map((m) => url(`/miracles/${m.slug}`, m.updated_at)),
  ].join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
