import { marked } from "marked";

marked.setOptions({ breaks: false });

export function renderMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  return marked.parse(text) as string;
}
