import { describe, expect, it } from "vitest";
import { saintJsonLd } from "../src/lib/jsonld";

const base = {
  slug: "example-saint",
  name: "Example Saint",
  saint_name: null,
  nationality: null,
  image_url: null,
  wikipedia_url: null,
};

describe("saintJsonLd", () => {
  it("includes birthDate/deathDate at exact_day precision", () => {
    const ld = saintJsonLd({
      ...base,
      birth_date: "1947-02-08",
      birth_date_precision: "exact_day",
      death_date: "1947-02-08",
      death_date_precision: "exact_day",
    });
    expect(ld.birthDate).toBe("1947-02-08");
    expect(ld.deathDate).toBe("1947-02-08");
  });

  it("omits birthDate/deathDate when precision is less than exact_day", () => {
    const ld = saintJsonLd({
      ...base,
      birth_date: "1869-01-01",
      birth_date_precision: "year",
      death_date: "1947-01-01",
      death_date_precision: "decade",
    });
    expect(ld.birthDate).toBeUndefined();
    expect(ld.deathDate).toBeUndefined();
  });
});
