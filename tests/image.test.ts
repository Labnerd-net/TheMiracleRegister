import { describe, expect, it } from "vitest";
import { thumbUrl } from "../src/lib/image";

const BASE = "https://upload.wikimedia.org/wikipedia/commons";
const ORIGINAL = `${BASE}/f/f8/Bernadette_soubirous_1_publicdomain.jpg`;
const thumb = (w: number) =>
  `${BASE}/thumb/f/f8/Bernadette_soubirous_1_publicdomain.jpg/${w}px-Bernadette_soubirous_1_publicdomain.jpg`;

describe("thumbUrl", () => {
  it("maps an original to each standard width", () => {
    expect(thumbUrl(ORIGINAL, 330)).toBe(thumb(330));
    expect(thumbUrl(ORIGINAL, 500)).toBe(thumb(500));
    expect(thumbUrl(ORIGINAL, 960)).toBe(thumb(960));
    expect(thumbUrl(ORIGINAL, 1280)).toBe(thumb(1280));
  });

  it("rounds a width between standard widths up and caps at 1280", () => {
    expect(thumbUrl(ORIGINAL, 100)).toBe(thumb(330));
    expect(thumbUrl(ORIGINAL, 331)).toBe(thumb(500));
    expect(thumbUrl(ORIGINAL, 640)).toBe(thumb(960));
    expect(thumbUrl(ORIGINAL, 4000)).toBe(thumb(1280));
  });

  it("keeps percent-encoded and special characters in the filename", () => {
    const file = "Fr%C3%A8re_Andr%C3%A9_%281920%29.jpg";
    expect(thumbUrl(`${BASE}/e/e6/${file}`, 500)).toBe(`${BASE}/thumb/e/e6/${file}/500px-${file}`);
  });

  it("handles jpeg, png and an uppercase extension the same way", () => {
    expect(thumbUrl(`${BASE}/a/ab/X.jpeg`, 500)).toBe(`${BASE}/thumb/a/ab/X.jpeg/500px-X.jpeg`);
    expect(thumbUrl(`${BASE}/a/ab/X.PNG`, 500)).toBe(`${BASE}/thumb/a/ab/X.PNG/500px-X.PNG`);
  });

  it("renders SVG thumbnails as PNG", () => {
    expect(thumbUrl(`${BASE}/a/ab/Logo.svg`, 500)).toBe(`${BASE}/thumb/a/ab/Logo.svg/500px-Logo.svg.png`);
  });

  it("passes through URLs it cannot or should not rewrite", () => {
    const existing = `${BASE}/thumb/f/f8/Foo.jpg/500px-Foo.jpg`;
    for (const url of [
      existing,
      "https://example.com/saint.jpg",
      `${BASE}/a/ab/Scan.tif`,
      `${BASE}/a/ab/Doc.pdf`,
      `${ORIGINAL}?download`,
      "http://upload.wikimedia.org/wikipedia/commons/f/f8/X.jpg",
      "not a url",
    ]) {
      expect(thumbUrl(url, 500)).toBe(url);
    }
  });

  it("returns null for missing input and the original for an unusable width", () => {
    expect(thumbUrl(null, 500)).toBeNull();
    expect(thumbUrl(undefined, 500)).toBeNull();
    expect(thumbUrl("", 500)).toBeNull();
    expect(thumbUrl(ORIGINAL, 0)).toBe(ORIGINAL);
    expect(thumbUrl(ORIGINAL, Number.NaN)).toBe(ORIGINAL);
  });
});
