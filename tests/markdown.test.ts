import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/lib/markdown";

describe("renderMarkdown — XSS sanitization", () => {
  it("strips <script> tags and their content", () => {
    const out = renderMarkdown('<script>alert(1)</script>');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert(1)");
  });

  it("strips <iframe> tags", () => {
    const out = renderMarkdown('<iframe src="https://evil.com"></iframe>');
    expect(out).not.toContain("<iframe");
  });

  it("strips inline event attributes", () => {
    const out = renderMarkdown('<p onclick="evil()">text</p>');
    expect(out).not.toContain("onclick");
    expect(out).toContain("text");
  });

  it("strips javascript: href", () => {
    const out = renderMarkdown('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain("javascript:");
  });

  it("strips <style> tags", () => {
    const out = renderMarkdown('<style>body{display:none}</style>');
    expect(out).not.toContain("<style");
  });
});

describe("renderMarkdown — valid markdown passthrough", () => {
  it("renders bold and italic", () => {
    const out = renderMarkdown("**bold** and _italic_");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
  });

  it("renders links with href", () => {
    const out = renderMarkdown("[example](https://example.com)");
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain("example");
  });

  it("renders unordered lists", () => {
    const out = renderMarkdown("- one\n- two");
    expect(out).toContain("<ul>");
    expect(out).toContain("<li>");
  });

  it("returns empty string for null/undefined input", () => {
    expect(renderMarkdown(null)).toBe("");
    expect(renderMarkdown(undefined)).toBe("");
    expect(renderMarkdown("")).toBe("");
  });
});
