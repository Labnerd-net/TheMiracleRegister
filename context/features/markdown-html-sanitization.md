# Plan: Markdown HTML Sanitization

## Context

`src/lib/markdown.ts` passes `marked.parse()` output directly into `set:html={}` on two public pages. `marked` does not sanitize by default — it passes raw HTML tags through unchanged. Admin-entered fields (`biography_short`, `cure_details`, `synopsis`) rendered this way could contain XSS payloads. Because these pages are cached by Cloudflare, a single compromised admin session could inject content served to all visitors.

Three callsites, all via the same helper:
- `src/pages/saints/[slug].astro:178` — `biography_short`
- `src/pages/miracles/[slug].astro:252` — `cure_details`
- `src/pages/miracles/[slug].astro:259` — `synopsis`

Fix is entirely in `src/lib/markdown.ts` — all callers are covered automatically.

## Library Choice: `xss`

`xss` (npm: `xss`, GitHub: leizongmin/js-xss) is pure JavaScript with zero native dependencies and no DOM requirement. Confirmed Workers-compatible. Uses an allowlist approach: only explicitly permitted tags and attributes pass through; everything else is stripped. The existing `sanitize-html` and `DOMPurify` don't work in Workers (Node.js internals and DOM dependency respectively).

## Implementation Steps

### 1. Install the package
```
npm install xss
```
No type package needed — `xss` ships its own TypeScript types.

### 2. Update `src/lib/markdown.ts`

Import `xss` and configure an allowlist that covers everything `marked` legitimately produces for the three fields (paragraph text, bold, italic, links, lists, blockquotes, code):

```ts
import { marked } from "marked";
import { filterXSS, IWhiteList } from "xss";

marked.setOptions({ breaks: false });

const allowList: IWhiteList = {
  p: [], strong: [], em: [], b: [], i: [],
  a: ["href", "title", "target"],
  ul: [], ol: [], li: [],
  blockquote: [], code: [], pre: [],
  br: [],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
};

export function renderMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  const html = marked.parse(text) as string;
  return filterXSS(html, { whiteList: allowList });
}
```

`filterXSS` strips all tags not in the allowlist, all attributes not listed per-tag, and `javascript:`/`data:` URI schemes on `href` by default.

### 3. Add `tests/markdown.test.ts`

Tests covering:
- `<script>` tag stripped
- `<iframe>` tag stripped
- Event attribute (`onclick`) stripped from otherwise-valid tag
- `javascript:` href stripped from `<a>`
- Normal bold, italic, link, list markdown renders correctly through sanitization

## Verification

- `npm run build` — must pass clean
- `npx vitest run tests/markdown.test.ts` — all new tests pass
- Manual spot-check: view a saint detail page and a miracle detail page; prose renders correctly
