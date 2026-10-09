import { describe, expect, it } from "vitest";
import {
  approvalBadge, escHtml, formatApproxDate, formatFeastDay, humanizeSlug, humanizeSnakeCase, ogDescription, sortSources, stripMarkdown,
} from "../src/lib/format";

describe("formatApproxDate", () => {
  it("formats by precision", () => {
    expect(formatApproxDate("1950-05-01", "exact_day")).toBe("May 1, 1950");
    expect(formatApproxDate("1950-05-01", "month")).toBe("May 1950");
    expect(formatApproxDate("1950-01-01", "year")).toBe("c. 1950");
    expect(formatApproxDate("1957-01-01", "decade")).toBe("c. 1950s");
  });
  it("returns null for unknown precision or missing date", () => {
    expect(formatApproxDate("1950-01-01", "unknown")).toBeNull();
    expect(formatApproxDate(null, "exact_day")).toBeNull();
    expect(formatApproxDate("1950-01-01", "bogus")).toBeNull();
  });
  it("uses the right century ordinal suffix", () => {
    const c = (year: string) => formatApproxDate(`${year}-01-01`, "century");
    expect(c("0050")).toBe("1st century");
    expect(c("0150")).toBe("2nd century");
    expect(c("0250")).toBe("3rd century");
    expect(c("0350")).toBe("4th century");
    expect(c("1050")).toBe("11th century");
    expect(c("1150")).toBe("12th century");
    expect(c("1250")).toBe("13th century");
    expect(c("2050")).toBe("21st century");
  });
  it("treats the century boundary year as the earlier century", () => {
    expect(formatApproxDate("0100-01-01", "century")).toBe("1st century");
    expect(formatApproxDate("0101-01-01", "century")).toBe("2nd century");
  });
});

describe("formatFeastDay", () => {
  it("formats month and day", () => expect(formatFeastDay(12, 25)).toBe("December 25"));
  it("returns null when either part is missing", () => {
    expect(formatFeastDay(null, 5)).toBeNull();
    expect(formatFeastDay(5, null)).toBeNull();
  });
});

describe("string helpers", () => {
  it("humanizes snake case and slugs", () => {
    expect(humanizeSnakeCase("instant_complete")).toBe("Instant Complete");
    expect(humanizeSlug("pregnancy-and-childbirth")).toBe("Pregnancy and childbirth");
  });
  it("escapes HTML and tolerates null", () => {
    expect(escHtml(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
    expect(escHtml(null)).toBe("");
  });
  it("sorts sources by tier, stable within a type", () => {
    const out = sortSources([
      { source_type: "other", id: 1 }, { source_type: "book", id: 2 },
      { source_type: "vatican_decree", id: 3 }, { source_type: "book", id: 4 },
    ]);
    expect(out.map((s) => s.id)).toEqual([3, 2, 4, 1]);
  });
  it("maps approval authority to a badge", () => {
    expect(approvalBadge("vatican_dicastery")?.label).toBe("Vatican Approved");
    expect(approvalBadge("none")).toBeNull();
    expect(approvalBadge(null)).toBeNull();
  });
});

describe("stripMarkdown / ogDescription", () => {
  it("strips links, emphasis, headings and lists", () => {
    expect(stripMarkdown("# Title\n\nSome **bold** and [a link](http://x.test).\n- item")).toBe("Title Some bold and a link. item");
    expect(stripMarkdown(null)).toBe("");
  });
  it("leaves short text alone and truncates long text at a word boundary within 160 chars", () => {
    expect(ogDescription("short text")).toBe("short text");
    const out = ogDescription("word ".repeat(100));
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(161);
    expect(out.slice(0, -1).endsWith(" ")).toBe(false);
  });
});
