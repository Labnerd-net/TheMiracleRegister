import { describe, expect, it } from "vitest";
import { getTableColumns } from "drizzle-orm";
import * as schema from "../src/db/schema";
import {
  MIRACLE_NESTED_KEYS,
  SAINT_NESTED_KEYS,
  miracleFileSchema,
  saintFileSchema,
  scaledDecimal,
} from "../scripts/content-schema";

const NOT_IN_FILES = ["id", "published", "created_at", "updated_at"];

const minimalSaint = { slug: "a-saint", name: "A Saint", canonization_stage: "saint" };
const minimalMiracle = {
  slug: "a-miracle",
  title: "A Miracle",
  miracle_category: "intercessory",
  type: "healing",
  date_precision: "year",
  timing_relative_to_saint_death: "posthumous",
  recipient_privacy: "public",
  cure_characteristics: "instant_complete",
  was_medically_verified: true,
  intercessory_medium: "prayer_only",
  used_for_beatification: false,
  used_for_canonization: false,
};

describe("file schema covers every column", () => {
  it("saints", () => {
    const cols = Object.keys(getTableColumns(schema.saints)).filter((c) => !NOT_IN_FILES.includes(c));
    const keys = Object.keys(saintFileSchema.shape).filter((k) => !(SAINT_NESTED_KEYS as readonly string[]).includes(k));
    expect(keys.sort()).toEqual(cols.sort());
  });
  it("miracles", () => {
    const cols = Object.keys(getTableColumns(schema.miracles)).filter((c) => !NOT_IN_FILES.includes(c));
    const keys = Object.keys(miracleFileSchema.shape).filter((k) => !(MIRACLE_NESTED_KEYS as readonly string[]).includes(k));
    expect(keys.sort()).toEqual(cols.sort());
  });
});

describe("strictness", () => {
  it("accepts minimal files and applies defaults", () => {
    const s = saintFileSchema.parse(minimalSaint);
    expect(s.birth_date_precision).toBe("exact_day");
    expect(miracleFileSchema.parse(minimalMiracle).approval_authority).toBe("none");
  });
  it("rejects unknown keys, including published", () => {
    expect(saintFileSchema.safeParse({ ...minimalSaint, published: true }).success).toBe(false);
    expect(saintFileSchema.safeParse({ ...minimalSaint, id: 1 }).success).toBe(false);
    expect(miracleFileSchema.safeParse({ ...minimalMiracle, created_at: "x" }).success).toBe(false);
  });
  it("rejects unknown themes, topics and enum values", () => {
    expect(saintFileSchema.safeParse({ ...minimalSaint, themes: ["nope"] }).success).toBe(false);
    expect(miracleFileSchema.safeParse({ ...minimalMiracle, topics: ["nope"] }).success).toBe(false);
    expect(saintFileSchema.safeParse({ ...minimalSaint, canonization_stage: "x" }).success).toBe(false);
  });
  it("keeps [] distinct from omitted", () => {
    expect(saintFileSchema.parse({ ...minimalSaint, themes: [] }).themes).toEqual([]);
    expect(saintFileSchema.parse(minimalSaint).themes).toBeUndefined();
  });
  it("rejects invalid dates and slugs", () => {
    expect(saintFileSchema.safeParse({ ...minimalSaint, birth_date: "2020-02-30" }).success).toBe(false);
    expect(saintFileSchema.safeParse({ ...minimalSaint, birth_date: "2020-1-1" }).success).toBe(false);
    expect(saintFileSchema.safeParse({ ...minimalSaint, slug: "Bad_Slug" }).success).toBe(false);
  });
  it("rejects nested unknown keys", () => {
    expect(saintFileSchema.safeParse({ ...minimalSaint, sources: [{ url: "u", source_type: "book", extra: 1 }] }).success).toBe(false);
  });
});

describe("scaledDecimal", () => {
  const d = scaledDecimal(10, 7);
  it("pads to scale as an exact string", () => {
    expect(d.parse(45.12345)).toBe("45.1234500");
    expect(d.parse("45.1234500")).toBe("45.1234500");
    expect(d.parse("-5")).toBe("-5.0000000");
  });
  it("rejects too many digits and non-decimals", () => {
    expect(d.safeParse("1.12345678").success).toBe(false);
    expect(d.safeParse("1234.5").success).toBe(false);
    expect(d.safeParse("1e-7").success).toBe(false);
    expect(d.safeParse(1e-7).success).toBe(false);
  });
});
