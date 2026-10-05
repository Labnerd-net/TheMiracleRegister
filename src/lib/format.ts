export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatFeastDay(month: number | null, day: number | null): string | null {
  if (!month || !day) return null;
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

export function humanizeSnakeCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const SOURCE_TYPE_ORDER = ["vatican_decree", "news_article", "book", "academic", "other"];

/** Sorts sources by tier: Vatican decree, then news, then book/academic, then other. Stable within each type. */
export function sortSources<T extends { source_type: string }>(sources: T[]): T[] {
  return [...sources].sort((a, b) =>
    SOURCE_TYPE_ORDER.indexOf(a.source_type) - SOURCE_TYPE_ORDER.indexOf(b.source_type)
  );
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

/** "pregnancy-and-childbirth" -> "Pregnancy and childbirth" */
export function humanizeSlug(s: string): string {
  const spaced = s.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Formats a date against its precision for display, e.g. for saints or miracles
 * whose exact date isn't known (ancient martyrs, Bakhita's birth, etc.).
 * `date` is expected to use the project's placeholder convention (YYYY-01-01
 * when only the year is known) — only the parts implied by `precision` are read.
 */
export function formatApproxDate(date: string | null, precision: string): string | null {
  if (precision === "unknown" || !date) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (precision === "exact_day") {
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    });
  }
  if (precision === "month") {
    return `${MONTH_NAMES[month - 1]} ${year}`;
  }
  if (precision === "year") {
    return `c. ${year}`;
  }
  if (precision === "decade") {
    return `c. ${Math.floor(year / 10) * 10}s`;
  }
  if (precision === "century") {
    const century = Math.floor((year - 1) / 100) + 1;
    const suffix = century % 10 === 1 && century % 100 !== 11 ? "st"
      : century % 10 === 2 && century % 100 !== 12 ? "nd"
      : century % 10 === 3 && century % 100 !== 13 ? "rd"
      : "th";
    return `${century}${suffix} century`;
  }
  return null;
}
