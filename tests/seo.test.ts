import { describe, expect, it } from "vitest";
import { DEFAULT_DESCRIPTION, PAGE_DESCRIPTIONS } from "../src/lib/seo";

describe("meta descriptions", () => {
  const all = { default: DEFAULT_DESCRIPTION, ...PAGE_DESCRIPTIONS };

  it.each(Object.entries(all))("%s is about 150 characters and at most 160", (_name, text) => {
    expect(text.length).toBeGreaterThanOrEqual(100);
    expect(text.length).toBeLessThanOrEqual(160);
  });

  it("are all different, so index pages do not share one snippet", () => {
    expect(new Set(Object.values(all)).size).toBe(Object.keys(all).length);
  });

  it("contain no characters that need escaping in an attribute", () => {
    for (const text of Object.values(all)) expect(text).not.toMatch(/["<>&]/);
  });
});
