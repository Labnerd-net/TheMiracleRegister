import { describe, expect, it } from "vitest";
import { createRequester, json } from "./helpers/apiApp";
import { setupDb } from "./helpers/testDb";

setupDb();
const req = createRequester();

const slugs = async (path: string) => (await json(await req(path))).data.map((s: { slug: string }) => s.slug);

describe("GET /api/v1/saints", () => {
  it("returns only published saints ordered by name", async () => {
    const body = await json(await req("/api/v1/saints"));
    expect(body.error).toBeNull();
    expect(body.meta).toMatchObject({ page: 1, limit: 20, total: 2 });
    expect(body.data.map((s: { slug: string }) => s.slug)).toEqual(["saint-beta", "saint-alpha"]);
  });

  describe("filters", () => {
    it("canonization_stage", async () => {
      expect(await slugs("/api/v1/saints?canonization_stage=blessed")).toEqual(["saint-beta"]);
      expect(await slugs("/api/v1/saints?canonization_stage=venerable")).toEqual([]);
    });
    it("theme (array containment) excludes unpublished saints", async () => {
      expect(await slugs("/api/v1/saints?theme=hope")).toEqual(["saint-alpha"]);
    });
    it("religious_order is a case-insensitive partial match", async () => {
      expect(await slugs("/api/v1/saints?religious_order=fran")).toEqual(["saint-alpha"]);
    });
    it("nationality is an exact match", async () => {
      expect(await slugs("/api/v1/saints?nationality=France")).toEqual(["saint-beta"]);
    });
  });

  it("paginates", async () => {
    const body = await json(await req("/api/v1/saints?limit=1&page=2"));
    expect(body.meta).toMatchObject({ page: 2, limit: 1, total: 2 });
    expect(body.data.map((s: { slug: string }) => s.slug)).toEqual(["saint-alpha"]);
  });

  it.each(["limit=101", "theme=bogus", "canonization_stage=bogus"])("rejects %s with 400", async (qs) => {
    expect((await req(`/api/v1/saints?${qs}`)).status).toBe(400);
  });
});

describe("GET /api/v1/saints/:slug", () => {
  it("returns detail with published miracles only", async () => {
    const res = await req("/api/v1/saints/saint-alpha");
    expect(res.status).toBe(200);
    const { data, error } = await json(res);
    expect(error).toBeNull();
    expect(data).toMatchObject({ slug: "saint-alpha", name: "Saint Alpha", canonization_stage: "saint" });
    expect(data.miracles.map((m: { slug: string }) => m.slug).sort()).toEqual(["m-first-name", "m-healing-ann"]);
  });

  it("lists related saints but not unpublished ones", async () => {
    const { data } = await json(await req("/api/v1/saints/saint-alpha"));
    expect(data.related_saints).toEqual([
      expect.objectContaining({ slug: "saint-beta", relation_type: "same_order" }),
    ]);
  });

  it("returns 404 for an unpublished saint", async () => {
    const res = await req("/api/v1/saints/saint-gamma");
    expect(res.status).toBe(404);
    expect(await json(res)).toMatchObject({ data: null, error: "Not found" });
  });

  it("returns 404 for an unknown slug", async () => {
    expect((await req("/api/v1/saints/unknown-slug")).status).toBe(404);
  });

  it("does not expose unpublished co-saints on a miracle", async () => {
    const { data } = await json(await req("/api/v1/saints/saint-beta"));
    const confidential = data.miracles.find((m: { slug: string }) => m.slug === "m-confidential");
    expect(confidential.saints.map((s: { slug: string }) => s.slug)).toEqual(["saint-beta"]);
  });

  it("includes linked saints on each miracle", async () => {
    const { data } = await json(await req("/api/v1/saints/saint-beta"));
    const shared = data.miracles.find((m: { slug: string }) => m.slug === "m-first-name");
    expect(shared.saints.map((s: { slug: string }) => s.slug).sort()).toEqual(["saint-alpha", "saint-beta"]);
  });
});
