import { and, eq } from "drizzle-orm";
import type { createDb } from "../db";
import { slugRedirects } from "../db/schema";

/** Short, so a later rename-back cannot leave browsers or the edge in a redirect loop. */
export const CACHE_REDIRECT = "public, max-age=60, s-maxage=60";

/** New slug for a renamed saint or miracle, or null if `slug` was never renamed. */
export async function findSlugRedirect(
  db: ReturnType<typeof createDb>,
  entityType: "saint" | "miracle",
  slug: string
): Promise<string | null> {
  const [row] = await db
    .select({ new_slug: slugRedirects.new_slug })
    .from(slugRedirects)
    .where(and(eq(slugRedirects.entity_type, entityType), eq(slugRedirects.old_slug, slug)));
  return row?.new_slug ?? null;
}
