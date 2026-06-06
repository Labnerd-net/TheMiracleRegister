import { marked } from "marked";

marked.setOptions({ breaks: false });

export function renderMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  return marked.parse(text) as string;
}

// Replaces [^N] markers with superscript citation links before markdown rendering.
// The footnote list itself is rendered by the page template using the sources array.
export function renderMarkdownWithCitations(text: string | null | undefined): string {
  if (!text) return "";
  const withCitations = text.replace(/\[\^(\d+)\]/g, (_, n) =>
    `<sup><a href="#ref-${n}" id="cite-${n}" class="citation">${n}</a></sup>`
  );
  return marked.parse(withCitations) as string;
}
