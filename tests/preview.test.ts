import { describe, it, expect } from "vitest";
import { isValidPreviewToken } from "../src/lib/preview";

describe("isValidPreviewToken", () => {
  it("accepts the exact token", () => expect(isValidPreviewToken("abc", "abc")).toBe(true));
  it("rejects a wrong token", () => expect(isValidPreviewToken("abd", "abc")).toBe(false));
  it("rejects a prefix or longer value", () => {
    expect(isValidPreviewToken("ab", "abc")).toBe(false);
    expect(isValidPreviewToken("abcd", "abc")).toBe(false);
  });
  it("rejects empty and missing values", () => {
    expect(isValidPreviewToken("", "")).toBe(false);
    expect(isValidPreviewToken("", "abc")).toBe(false);
    expect(isValidPreviewToken(null, "abc")).toBe(false);
    expect(isValidPreviewToken("abc", undefined)).toBe(false);
  });
});
