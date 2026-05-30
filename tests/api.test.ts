import { describe, expect, it } from "vitest";
import app from "../src/api/index";

describe("GET /api/v1/saints", () => {
  it("returns 200 with correct envelope shape", async () => {
    const res = await app.request("/api/v1/saints");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ data: [], meta: { page: 1, limit: 20, total: 0 }, error: null });
  });
});

describe("GET /api/v1/saints/:slug", () => {
  it("returns 404 for unknown slug", async () => {
    const res = await app.request("/api/v1/saints/unknown-slug");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });
});

describe("GET /api/v1/miracles", () => {
  it("returns 200 with pagination defaults", async () => {
    const res = await app.request("/api/v1/miracles");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta).toMatchObject({ page: 1, limit: 20, total: 0 });
  });

  it("respects page and limit query params", async () => {
    const res = await app.request("/api/v1/miracles?page=2&limit=10");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.meta).toMatchObject({ page: 2, limit: 10 });
  });
});

describe("GET /api/v1/miracles/:slug", () => {
  it("returns 404 for unknown slug", async () => {
    const res = await app.request("/api/v1/miracles/unknown-slug");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Not found");
  });
});

describe("GET /api/v1/types", () => {
  it("returns 200 with non-empty type list", async () => {
    const res = await app.request("/api/v1/types");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty("type");
    expect(body.data[0]).toHaveProperty("label");
  });
});

describe("GET /api/v1/doc", () => {
  it("returns 200 with OpenAPI JSON", async () => {
    const res = await app.request("/api/v1/doc");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.openapi).toBe("3.0.0");
    expect(body.paths).toBeDefined();
  });
});
