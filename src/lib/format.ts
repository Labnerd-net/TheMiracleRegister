export function humanizeSnakeCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export function escHtml(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function approvalBadge(authority: string | null): { cls: string; label: string } | null {
  if (authority === "vatican_dicastery") return { cls: "vatican", label: "Vatican Approved" };
  if (authority === "lourdes_bureau")    return { cls: "lourdes", label: "Lourdes Bureau" };
  if (authority === "local_bishop")      return { cls: "bishop",  label: "Bishop Approved" };
  if (authority === "nihil_obstat")      return { cls: "nihil",   label: "Nihil Obstat" };
  return null;
}

export function stripMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")  // [text](url) → text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")       // ![alt](url) → remove
    .replace(/#{1,6}\s+/g, "")                  // headings
    .replace(/\*\*(.+?)\*\*/g, "$1")            // bold **
    .replace(/__(.+?)__/g, "$1")                // bold __
    .replace(/\*(.+?)\*/g, "$1")               // italic *
    .replace(/_(.+?)_/g, "$1")                  // italic _
    .replace(/`([^`]+)`/g, "$1")               // inline code
    .replace(/^\s*[-*+]\s+/gm, "")             // unordered list markers
    .replace(/^\s*\d+\.\s+/gm, "")             // ordered list markers
    .replace(/\n+/g, " ")                       // newlines → spaces
    .replace(/\s{2,}/g, " ")                    // collapse multiple spaces
    .trim();
}

export function ogDescription(text: string | null | undefined): string {
  const stripped = stripMarkdown(text);
  if (stripped.length <= 160) return stripped;
  const cut = stripped.slice(0, 160);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "…";
}
