import { describe, expect, it } from "vitest";
import { createRequester, json } from "./helpers/apiApp";
import { setupDb } from "./helpers/testDb";

const ctx = setupDb();
const req = createRequester();

const slugs = async (path: string) => (await json(await req(path))).data.map((m: { slug: string }) => m.slug);

describe("GET /api/v1/miracles", () => {
  it("returns only published miracles, ordered by date with nulls last", async () => {
    const body = await json(await req("/api/v1/miracles"));
    expect(body.error).toBeNull();
    expect(body.meta).toMatchObject({ page: 1, limit: 20, total: 5 });
    expect(body.data.map((m: { slug: string }) => m.slug)).toEqual([
      "m-confidential",
      "m-hidden-saint-only",
      "m-healing-ann",
      "m-first-name",
      "m-apparition",
    ]);
  });

  it("never returns unpublished miracles", async () => {
    expect(await slugs("/api/v1/miracles?limit=100")).not.toContain("m-unpublished");
  });

  describe("filters", () => {
    it("saint_id", async () => {
      expect(await slugs(`/api/v1/miracles?saint_id=${ctx.ids.saints.alpha}`)).toEqual(["m-healing-ann", "m-first-name"]);
    });
    it("type", async () => {
      expect(await slugs("/api/v1/miracles?type=nature")).toEqual(["m-confidential"]);
      expect(await slugs("/api/v1/miracles?type=apparition")).toEqual(["m-apparition"]);
    });
    it("topic (array containment)", async () => {
      expect(await slugs("/api/v1/miracles?topic=children")).toEqual(["m-confidential", "m-healing-ann"]);
    });
    it("category", async () => {
      expect(await slugs("/api/v1/miracles?category=associated")).toEqual(["m-confidential"]);
      expect(await slugs("/api/v1/miracles?category=apparition")).toEqual(["m-apparition"]);
    });
    it("country is a case-insensitive partial match", async () => {
      expect(await slugs("/api/v1/miracles?country=FRA")).toEqual(["m-confidential", "m-healing-ann"]);
    });
    it("year_from and year_to are inclusive and exclude undated miracles", async () => {
      expect(await slugs("/api/v1/miracles?year_from=1950")).toEqual(["m-healing-ann", "m-first-name"]);
      expect(await slugs("/api/v1/miracles?year_to=1950")).toEqual(["m-confidential", "m-hidden-saint-only", "m-healing-ann"]);
      expect(await slugs("/api/v1/miracles?year_from=1900&year_to=1999")).toEqual(["m-hidden-saint-only", "m-healing-ann"]);
    });
    it("used_for_canonization and used_for_beatification", async () => {
      expect(await slugs("/api/v1/miracles?used_for_canonization=1")).toEqual(["m-healing-ann"]);
      expect(await slugs("/api/v1/miracles?used_for_beatification=1")).toEqual(["m-first-name"]);
    });
    it("approval_authority", async () => {
      expect(await slugs("/api/v1/miracles?approval_authority=local_bishop")).toEqual(["m-first-name"]);
      expect(await slugs("/api/v1/miracles?approval_authority=vatican_dicastery")).toEqual(["m-healing-ann"]);
    });
    it("combined filters narrow the result", async () => {
      expect(await slugs("/api/v1/miracles?country=France&type=healing")).toEqual(["m-healing-ann"]);
      expect(await slugs("/api/v1/miracles?topic=children&category=associated")).toEqual(["m-confidential"]);
      expect(await slugs("/api/v1/miracles?country=Spain&type=nature")).toEqual([]);
    });
  });

  describe("pagination", () => {
    it("respects page and limit and reports the total", async () => {
      const body = await json(await req("/api/v1/miracles?page=2&limit=2"));
      expect(body.meta).toMatchObject({ page: 2, limit: 2, total: 5 });
      expect(body.data.map((m: { slug: string }) => m.slug)).toEqual(["m-healing-ann", "m-first-name"]);
    });
    it("returns an empty page past the end", async () => {
      const body = await json(await req("/api/v1/miracles?page=99"));
      expect(body.data).toEqual([]);
      expect(body.meta.total).toBe(5);
    });
  });

  describe("invalid parameters", () => {
    it.each(["limit=101", "limit=0", "page=0", "type=bogus", "topic=bogus", "category=bogus", "approval_authority=none"])(
      "rejects %s with 400",
      async (qs) => {
        expect((await req(`/api/v1/miracles?${qs}`)).status).toBe(400);
      }
    );
  });
});

describe("GET /api/v1/miracles/:slug", () => {
  it("returns detail with linked saints, sources and ordered images", async () => {
    const res = await req("/api/v1/miracles/m-healing-ann");
    expect(res.status).toBe(200);
    const { data, error } = await json(res);
    expect(error).toBeNull();
    expect(data).toMatchObject({ slug: "m-healing-ann", type: "healing", country: "France" });
    expect(data.saints).toEqual([{ id: ctx.ids.saints.alpha, slug: "saint-alpha", name: "Saint Alpha" }]);
    expect(data.sources).toHaveLength(1);
    expect(data.sources[0]).toMatchObject({ url: "https://example.org/source", source_type: "book" });
    expect(data.images.map((i: { url: string }) => i.url)).toEqual([
      "https://example.org/first.jpg",
      "https://example.org/second.jpg",
    ]);
  });

  it("returns 404 for an unpublished miracle", async () => {
    const res = await req("/api/v1/miracles/m-unpublished");
    expect(res.status).toBe(404);
    expect(await json(res)).toMatchObject({ data: null, error: "Not found" });
  });

  it("returns 404 for an unknown slug", async () => {
    expect((await req("/api/v1/miracles/does-not-exist")).status).toBe(404);
  });

  it("does not expose unpublished saints linked to a published miracle", async () => {
    const both = await json(await req("/api/v1/miracles/m-confidential"));
    expect(both.data.saints.map((s: { slug: string }) => s.slug)).toEqual(["saint-beta"]);
    const only = await json(await req("/api/v1/miracles/m-hidden-saint-only"));
    expect(only.data.saints).toEqual([]);
  });

  it("does not expose unpublished saints in the list either", async () => {
    const body = await json(await req("/api/v1/miracles?limit=100"));
    const all = body.data.flatMap((m: { saints: { slug: string }[] }) => m.saints.map((s) => s.slug));
    expect(all).not.toContain("saint-gamma");
  });
});
