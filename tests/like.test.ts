import { describe, expect, it } from "vitest";
import { escapeLike, likeContains } from "../src/lib/like";

describe("escapeLike", () => {
  it("escapes %, _ and backslash", () => expect(escapeLike("50%_a\\b")).toBe("50\\%\\_a\\\\b"));
  it("leaves plain text alone", () => expect(escapeLike("Andre")).toBe("Andre"));
});

describe("likeContains", () => {
  it("wraps the escaped value in wildcards", () => expect(likeContains("a%")).toBe("%a\\%%"));
});
