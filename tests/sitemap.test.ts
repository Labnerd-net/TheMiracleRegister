import { describe, expect, it, vi } from "vitest";
import { setupDb } from "./helpers/testDb";

vi.mock("cloudflare:workers", () => ({ env: { DATABASE_URL: "unused" } }));

import { GET } from "../src/pages/sitemap.xml";

setupDb();

const locs = async () => {
  const res = await (GET as unknown as () => Promise<Response>)();
  expect(res.headers.get("Content-Type")).toContain("application/xml");
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("https://themiracleregister.org", ""));
};

describe("sitemap.xml", () => {
  it("lists published saints and miracles", async () => {
    const urls = await locs();
    expect(urls).toContain("/saints/saint-alpha");
    expect(urls).toContain("/saints/saint-beta");
    expect(urls).toContain("/miracles/m-healing-ann");
  });

  it("excludes unpublished saints and miracles", async () => {
    const urls = await locs();
    expect(urls).not.toContain("/saints/saint-gamma");
    expect(urls).not.toContain("/miracles/m-unpublished");
  });

  it("includes the static pages", async () => {
    const urls = await locs();
    for (const p of ["/", "/saints", "/miracles", "/map", "/calendar", "/topics", "/themes", "/patronage"]) {
      expect(urls).toContain(p);
    }
  });

  it("omits topic and theme pages below the indexing threshold", async () => {
    const urls = await locs();
    // fixtures have at most 2 records per topic/theme, below MIN_BROWSE_RECORDS
    expect(urls.filter((u) => u.startsWith("/topics/") || u.startsWith("/themes/"))).toEqual([]);
  });
});
