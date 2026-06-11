import { marked } from "marked";
import { filterXSS, type IWhiteList } from "xss";

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
  return filterXSS(html, {
    whiteList: allowList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
}
