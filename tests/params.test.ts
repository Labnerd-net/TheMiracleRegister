import { describe, expect, it } from "vitest";
import { MAX_ID, parseBoundedInt } from "../src/lib/params";

describe("parseBoundedInt", () => {
  it("parses in-range integers", () => {
    expect(parseBoundedInt("5", 1, 10)).toBe(5);
    expect(parseBoundedInt("10", 1, 10)).toBe(10);
  });
  it.each([null, undefined, "", "abc", "1.5", "1e3", "0", "11", "99999999999999999999", String(MAX_ID + 1)])(
    "returns undefined for %s",
    (raw) => {
      expect(parseBoundedInt(raw, 1, MAX_ID > 10 ? 10 : MAX_ID)).toBeUndefined();
    }
  );
});
