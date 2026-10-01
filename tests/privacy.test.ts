import { describe, expect, it } from "vitest";
import { redactRecipient } from "../src/lib/privacy";

describe("redactRecipient", () => {
  it("returns null for confidential", () => expect(redactRecipient("Jane Doe", "confidential")).toBeNull());
  it("keeps only the first token for first_name_only", () => {
    expect(redactRecipient("Jane Marie Doe", "first_name_only")).toBe("Jane");
    expect(redactRecipient("  Jane   Doe ", "first_name_only")).toBe("Jane");
  });
  it("returns the full name for public and not_applicable", () => {
    expect(redactRecipient("Jane Doe", "public")).toBe("Jane Doe");
    expect(redactRecipient("Jane Doe", "not_applicable")).toBe("Jane Doe");
  });
  it("returns the name unchanged when privacy is missing", () => {
    expect(redactRecipient("Jane Doe", null)).toBe("Jane Doe");
    expect(redactRecipient("Jane Doe", undefined)).toBe("Jane Doe");
  });
  it("returns null for null or empty names", () => {
    expect(redactRecipient(null, "public")).toBeNull();
    expect(redactRecipient("", "public")).toBeNull();
  });
  it("returns null for a whitespace-only name under first_name_only", () => {
    expect(redactRecipient("   ", "first_name_only")).toBeNull();
  });
});
