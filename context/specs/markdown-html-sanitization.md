# Spec for Markdown HTML Sanitization

Title: Markdown HTML Sanitization
Branch: claude/feature/markdown-html-sanitization
Spec file: context/specs/markdown-html-sanitization.md

## Summary

`src/lib/markdown.ts` passes `marked.parse()` output directly into `set:html={}` on public pages. `marked` does not sanitize HTML by default — it passes through raw HTML tags in the source text. Admin-entered fields (`cure_details`, `synopsis`, `biography_short`) rendered this way could contain `<script>`, `<iframe>`, or event-attribute XSS payloads. Because these pages are cached by Cloudflare, a single compromised admin session could inject malicious content served to all visitors until the cache is purged.

The fix is to sanitize the HTML output of `marked.parse()` before it reaches the template, stripping dangerous tags and attributes. The sanitizer should run inside the existing `renderMarkdown()` helper in `src/lib/markdown.ts` so all callers are covered automatically.

## Functional Requirements

- `renderMarkdown()` in `src/lib/markdown.ts` sanitizes the HTML returned by `marked.parse()` before returning it
- Sanitization strips: `<script>`, `<iframe>`, `<style>`, `<object>`, `<embed>`, `<form>`, and any inline event attributes (`on*`)
- Safe markdown output (paragraphs, bold, italic, links, lists, headings) passes through unchanged
- No changes required to any page templates — all callers of `renderMarkdown()` benefit automatically
- A sanitizer library is used rather than a hand-rolled regex approach (regex is not reliable for HTML sanitization)

## Possible Edge Cases

- Links with `javascript:` href should be stripped
- Data URIs in `src` or `href` attributes should be stripped
- Nested or malformed HTML tags should not bypass the sanitizer
- The sanitizer must work in the Cloudflare Workers runtime (no Node.js built-ins; must be pure JS/WASM compatible)

## Acceptance Criteria

- `renderMarkdown('<script>alert(1)</script>')` returns a string with no `<script>` tag
- `renderMarkdown('<iframe src="evil.com"></iframe>')` returns a string with no `<iframe>` tag
- `renderMarkdown('<p onclick="evil()">text</p>')` returns `<p>text</p>` with the event attribute removed
- `renderMarkdown('**bold** and [link](https://example.com)')` still returns correct HTML
- Build passes, existing tests pass

## Open Questions

- **Which sanitizer library?** `dompurify` requires a DOM environment and won't run in Workers. `sanitize-html` uses Node.js internals. The best Workers-compatible option is likely `isomorphic-dompurify` (bundles a JSDOM shim) or a purpose-built edge-compatible library. This needs a quick check before implementation.

## Testing Guidelines

Add tests in `./tests/` covering:
- Script tag in markdown input is stripped from output
- Iframe tag is stripped
- Event attribute (`onclick`, `onerror`) is stripped from an otherwise valid tag
- `javascript:` href is stripped
- Normal markdown (bold, italic, links, lists) renders correctly through sanitization

## Personal Opinion

This is a good and necessary fix. The risk is real: Cloudflare cache amplifies any XSS injected through the admin panel. `marked` is intentionally not a sanitizer — it's documented behavior, not a bug. The right fix is to add a sanitizer at the output layer rather than restrict what admins can enter.

The main complexity is the Workers runtime constraint: most sanitizer libraries assume a browser DOM or Node.js environment. Picking the right library is the key decision; the actual code change in `markdown.ts` is a one-liner wrapper once the library is chosen.
