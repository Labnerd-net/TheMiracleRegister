import { describe, expect, it } from "vitest";
import {
  miracleSources,
  miracles,
  saintRelations,
  saints,
} from "../src/db/schema";

describe("schema exports", () => {
  it("exports saints table", () => {
    expect(saints).toBeDefined();
  });

  it("exports saintRelations table", () => {
    expect(saintRelations).toBeDefined();
  });

  it("exports miracles table", () => {
    expect(miracles).toBeDefined();
  });

  it("exports miracleSources table", () => {
    expect(miracleSources).toBeDefined();
  });
});
