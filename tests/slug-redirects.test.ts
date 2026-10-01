import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { setupDb } from "./helpers/testDb";
import { saints, miracles, slugRedirects } from "../src/db/schema";
import { findSlugRedirect } from "../src/lib/slugRedirect";

const ctx = setupDb();
const lookup = (type: "saint" | "miracle", slug: string) => findSlugRedirect(ctx.db as never, type, slug);
const rows = () => ctx.db.select().from(slugRedirects);
const clear = () => ctx.db.delete(slugRedirects);
const renameSaint = (from: string, to: string) =>
  ctx.db.update(saints).set({ slug: to }).where(eq(saints.slug, from));

async function saintSlug() {
  const [s] = await ctx.db.select({ slug: saints.slug }).from(saints).where(eq(saints.id, ctx.ids.saints.alpha));
  return s.slug;
}

describe("slug redirect triggers", () => {
  it("records a redirect when a saint slug changes", async () => {
    await clear();
    const original = await saintSlug();
    await renameSaint(original, "renamed-one");
    expect(await lookup("saint", original)).toBe("renamed-one");
    expect(await lookup("miracle", original)).toBeNull();
    await renameSaint("renamed-one", original);
  });

  it("records a redirect when a miracle slug changes", async () => {
    await clear();
    const [m] = await ctx.db.select({ slug: miracles.slug }).from(miracles).where(eq(miracles.id, ctx.ids.miracles.healingAnn));
    await ctx.db.update(miracles).set({ slug: "renamed-miracle" }).where(eq(miracles.slug, m.slug));
    expect(await lookup("miracle", m.slug)).toBe("renamed-miracle");
    await ctx.db.update(miracles).set({ slug: m.slug }).where(eq(miracles.slug, "renamed-miracle"));
  });

  it("does nothing when the slug is unchanged", async () => {
    await clear();
    await ctx.db.update(saints).set({ name: "Unchanged Slug" }).where(eq(saints.id, ctx.ids.saints.alpha));
    expect(await rows()).toHaveLength(0);
  });

  it("keeps chains to one hop", async () => {
    await clear();
    const original = await saintSlug();
    await renameSaint(original, "hop-b");
    await renameSaint("hop-b", "hop-c");
    expect(await lookup("saint", original)).toBe("hop-c");
    expect(await lookup("saint", "hop-b")).toBe("hop-c");
    await renameSaint("hop-c", original);
  });

  it("drops the redirect when a slug is renamed back, so there is no loop", async () => {
    await clear();
    const original = await saintSlug();
    await renameSaint(original, "temp-name");
    await renameSaint("temp-name", original);
    expect(await lookup("saint", original)).toBeNull();
    expect(await lookup("saint", "temp-name")).toBe(original);
    for (const r of await rows()) expect(r.old_slug).not.toBe(r.new_slug);
  });

  it("enforces one redirect per (entity, old slug)", async () => {
    await clear();
    await ctx.db.insert(slugRedirects).values({ entity_type: "saint", old_slug: "dup", new_slug: "a" });
    await expect(
      ctx.db.insert(slugRedirects).values({ entity_type: "saint", old_slug: "dup", new_slug: "b" })
    ).rejects.toThrow();
    await ctx.db.insert(slugRedirects).values({ entity_type: "miracle", old_slug: "dup", new_slug: "c" });
  });
});
