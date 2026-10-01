import { describe, expect, it } from "vitest";
import { createRequester, json } from "./helpers/apiApp";
import { setupDb } from "./helpers/testDb";

setupDb();
const req = createRequester();

type R = { type: string; slug: string; title: string; excerpt: string | null };
const search = async (qs: string) => json(await req(`/api/v1/search?${qs}`));
const keys = (data: R[]) => data.map((r) => `${r.type}:${r.slug}`);

describe("GET /api/v1/search", () => {
  describe("q", () => {
    it("matches saint name case-insensitively, plus miracles that mention it", async () => {
      const { data } = await search("q=ALPHA");
      expect(keys(data)).toEqual(["saint:saint-alpha", "miracle:m-healing-ann"]);
    });
    it("matches saint biography", async () => {
      expect(keys((await search("q=orphans")).data)).toEqual(["saint:saint-beta"]);
    });
    it("matches miracle title, synopsis, diagnosis and cure details", async () => {
      expect(keys((await search("q=shrine")).data)).toEqual(["miracle:m-healing-ann"]);
      expect(keys((await search("q=lanterns")).data)).toEqual(["miracle:m-first-name"]);
      expect(keys((await search("q=quartz")).data)).toEqual(["miracle:m-confidential"]);
      expect(keys((await search("q=harmonic")).data)).toEqual(["miracle:m-apparition"]);
    });
    it("excludes unpublished saints and miracles", async () => {
      // "devoted" is in the published and the unpublished saint's biography; "lanterns"
      // is in the published and the unpublished miracle's synopsis.
      expect(keys((await search("q=devoted")).data)).toEqual(["saint:saint-alpha"]);
      expect(keys((await search("q=unpublished")).data)).toEqual([]);
    });
    it("truncates excerpts to 200 characters", async () => {
      const { data } = await search("q=lanterns");
      expect(data[0].excerpt).toHaveLength(200);
    });
    it("treats % and _ literally", async () => {
      expect((await search("q=%25%25")).data).toEqual([]);
      expect((await search("q=al_ha")).data).toEqual([]);
    });
    it("rejects q longer than 100 characters", async () => {
      const res = await req(`/api/v1/search?q=${"a".repeat(101)}`);
      expect(res.status).toBe(400);
    });
    it("returns an empty result for no matches", async () => {
      const body = await search("q=zzzzqq");
      expect(body.data).toEqual([]);
      expect(body.meta.total).toBe(0);
      expect(body.error).toBeNull();
    });
  });

  describe("topic", () => {
    it("matches saint themes, excluding unpublished saints", async () => {
      expect(keys((await search("topic=hope")).data)).toEqual(["saint:saint-alpha"]);
    });
    it("matches miracle topics, excluding unpublished miracles", async () => {
      expect(keys((await search("topic=children")).data).sort()).toEqual(["miracle:m-confidential", "miracle:m-healing-ann"]);
    });
  });

  it("returns a helpful envelope when neither q nor topic is given", async () => {
    const res = await req("/api/v1/search");
    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ data: [], error: "Provide q or topic" });
  });

  it.each(["q=a", "topic=bogus", "limit=101"])("rejects %s with 400", async (qs) => {
    expect((await req(`/api/v1/search?${qs}`)).status).toBe(400);
  });

  it("paginates results", async () => {
    const body = await search("q=alpha&limit=1&page=2");
    expect(body.meta).toMatchObject({ page: 2, limit: 1, total: 2 });
    expect(keys(body.data)).toEqual(["miracle:m-healing-ann"]);
  });
});
