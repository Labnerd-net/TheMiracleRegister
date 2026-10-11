import { describe, expect, it } from "vitest";
import { citations } from "../src/lib/cite";

const text = (c: ReturnType<typeof citations>[number], date?: string) =>
  c.before + (date ? c.dateTemplate.replace("{date}", date) : "") + c.after;

describe("citations", () => {
  const [apa, chicago] = citations("Healing of Ann", "/miracles/healing-of-ann");

  it("gives APA and Chicago in order", () => {
    expect([apa.format, chicago.format]).toEqual(["APA", "Chicago"]);
  });
  it("uses the pinned canonical URL for the path", () => {
    expect(text(apa)).toContain("https://themiracleregister.org/miracles/healing-of-ann");
    expect(text(chicago)).toContain("https://themiracleregister.org/miracles/healing-of-ann");
  });
  it("reads correctly without a date", () => {
    expect(text(apa)).toBe(
      "The Miracle Register. (n.d.). Healing of Ann. Retrieved from https://themiracleregister.org/miracles/healing-of-ann"
    );
    expect(text(chicago)).toBe(
      '"Healing of Ann." The Miracle Register. https://themiracleregister.org/miracles/healing-of-ann.'
    );
  });
  it("inserts the access date into the placeholder", () => {
    expect(text(apa, "October 10, 2026")).toContain("Retrieved October 10, 2026, from https://");
    expect(text(chicago, "October 10, 2026")).toContain("Accessed October 10, 2026. https://");
  });
});
