import { describe, expect, it } from "vitest";
import { safeHttpUrl } from "../src/lib/url";

describe("safeHttpUrl", () => {
  it("passes http and https URLs through unchanged", () => {
    expect(safeHttpUrl("https://www.vatican.va/x")).toBe("https://www.vatican.va/x");
    expect(safeHttpUrl("http://example.org/a?b=1")).toBe("http://example.org/a?b=1");
  });

  it("rejects other schemes", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("JaVaScRiPt:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>1</script>")).toBeNull();
    expect(safeHttpUrl("ftp://example.org/file")).toBeNull();
  });

  it("rejects relative, empty and null input", () => {
    expect(safeHttpUrl("/saints/x")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
  });
});
