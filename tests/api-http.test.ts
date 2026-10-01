import { describe, expect, it } from "vitest";
import app from "../src/api/index";
import { createRequester, json } from "./helpers/apiApp";
import { setupDb } from "./helpers/testDb";

setupDb();
const req = createRequester();

describe("Cache-Control headers", () => {
  it.each([
    ["/api/v1/saints", "public, max-age=3600, stale-while-revalidate=60"],
    ["/api/v1/saints/saint-alpha", "public, max-age=3600, stale-while-revalidate=60"],
    ["/api/v1/miracles", "public, max-age=1800, stale-while-revalidate=60"],
    ["/api/v1/miracles/m-healing-ann", "public, max-age=1800, stale-while-revalidate=60"],
    ["/api/v1/types", "public, max-age=86400, stale-while-revalidate=60"],
    ["/api/v1/metadata", "public, max-age=86400, stale-while-revalidate=60"],
    ["/api/v1/search?q=alpha", "no-store"],
  ])("%s", async (path, expected) => {
    expect((await req(path)).headers.get("Cache-Control")).toBe(expected);
  });
});

describe("CORS", () => {
  it("allows any origin on the public API", async () => {
    expect((await req("/api/v1/types")).headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});

describe("rate limiting", () => {
  it("returns 429 with the error envelope after 60 requests from one IP", async () => {
    for (let i = 0; i < 60; i++) {
      expect((await req("/api/v1/types", { ip: "203.0.113.7" })).status).toBe(200);
    }
    const limited = await req("/api/v1/types", { ip: "203.0.113.7" });
    expect(limited.status).toBe(429);
    expect(await json(limited)).toEqual({ data: null, meta: null, error: "Too many requests" });
  });

  it("does not affect a different IP", async () => {
    for (let i = 0; i < 61; i++) await req("/api/v1/types", { ip: "203.0.113.8" });
    expect((await req("/api/v1/types", { ip: "203.0.113.9" })).status).toBe(200);
  });
});

describe("GET /api/v1/types", () => {
  it("returns the miracle types", async () => {
    const { data, error } = await json(await req("/api/v1/types"));
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty("type");
    expect(data[0]).toHaveProperty("label");
  });
});

describe("GET /api/v1/metadata", () => {
  it("returns the canonical filter options", async () => {
    const { data } = await json(await req("/api/v1/metadata"));
    expect(Object.keys(data).sort()).toEqual([
      "approval_authorities",
      "miracle_categories",
      "miracle_topics",
      "miracle_types",
      "saint_themes",
    ]);
  });
});

describe("GET /api/v1/doc", () => {
  it("returns the OpenAPI document", async () => {
    const body = await json(await req("/api/v1/doc"));
    expect(body.openapi).toBe("3.0.0");
    expect(body.paths).toBeDefined();
  });

  it("includes the MiracleImage schema", async () => {
    const body = await json(await req("/api/v1/doc"));
    expect(body.components?.schemas?.MiracleImage).toBeDefined();
  });

  it("MiracleDetail schema includes the images array", async () => {
    const body = await json(await req("/api/v1/doc"));
    expect(body.components?.schemas?.MiracleDetail?.properties?.images).toBeDefined();
  });
});

describe("test harness", () => {
  it("imports the real app", () => {
    expect(app).toBeDefined();
  });
});
