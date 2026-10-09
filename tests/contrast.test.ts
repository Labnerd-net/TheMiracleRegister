import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Guards the palette in src/styles/global.css: body text tokens must keep WCAG AA (4.5:1)
// on every background token, in both themes.
const css = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");

function tokens(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]));
}

const lightBlock = css.slice(css.indexOf(":root"), css.indexOf('[data-theme="dark"]'));
const darkBlock = css.slice(css.indexOf('[data-theme="dark"]'));
const light = tokens(lightBlock);
const dark = { ...light, ...tokens(darkBlock) };

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = ["text-2", "text-3", "text-4", "text-5", "color-accent", "color-gold"];
const BACKGROUNDS = ["bg-page", "bg-surface", "bg-subtle", "bg-elevated", "color-accent-light"];

describe.each([["light", light], ["dark", dark]])("%s theme contrast", (_name, theme) => {
  it("defines every token the check relies on", () => {
    for (const t of [...TEXT, ...BACKGROUNDS, "text-1"]) expect(theme[t], t).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  for (const fg of [...TEXT, "text-1"]) {
    for (const bg of BACKGROUNDS) {
      it(`${fg} on ${bg} is at least 4.5:1`, () => {
        expect(contrast(theme[fg], theme[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

it("computes known ratios correctly", () => {
  expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 5);
  expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
});
