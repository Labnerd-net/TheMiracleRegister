// Single render path for the saint and miracle browse cards and their pagination.
// The server (via set:html in the card components) and the client-side filter scripts
// both call these, so a filtered result looks the same as a first page load.
import { thumbUrl } from "./image";
import { approvalBadge, humanizeSnakeCase } from "./format";

export function esc(str: string | null | undefined): string {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export interface SaintCardData {
  slug: string;
  name: string;
  image_url: string | null;
  canonization_stage: string;
  nationality: string | null;
  feast_day?: string | null;
}

export function saintCardHtml(s: SaintCardData, opts: { eager?: boolean } = {}): string {
  const img = s.image_url
    ? `<img src="${esc(thumbUrl(s.image_url, 500))}" alt="${esc(s.name)}" loading="${opts.eager ? "eager" : "lazy"}" decoding="async" width="300" height="400" class="w-full h-full object-cover object-top saint-img" />`
    : `<div class="saint-placeholder w-full h-full">${esc(s.name.charAt(0))}</div>`;
  return `<a href="/saints/${esc(s.slug)}" class="saint-card-link group no-underline">
  <div class="aspect-[3/4] overflow-hidden mb-4" style="background:var(--bg-elevated)">${img}</div>
  <div>
    <h2 style="font-family:var(--font-display);font-size:1.2rem;font-weight:400;color:var(--text-1);line-height:1.25;margin-bottom:0.35rem;transition:color 0.2s" class="group-hover:text-[--color-accent]">${esc(s.name)}</h2>
    <div class="flex items-center gap-2 flex-wrap mb-1.5"><span class="stage-badge ${esc(s.canonization_stage)}">${esc(s.canonization_stage)}</span></div>
    <div style="font-family:var(--font-sans);font-size:0.7rem;color:var(--text-4);line-height:1.6">${s.feast_day ? `<span class="block">${esc(s.feast_day)}</span>` : ""}${s.nationality ? `<span class="block">${esc(s.nationality)}</span>` : ""}</div>
  </div>
</a>`;
}

export interface MiracleCardData {
  slug: string;
  title: string;
  type: string;
  topics: string[] | null;
  country: string | null;
  date_of_event: string | null;
  cure_details: string | null;
  approval_authority: string | null;
  used_for_beatification: boolean;
  used_for_canonization: boolean;
}

const META = "font-family:var(--font-sans);font-size:0.68rem;color:var(--text-4)";
const SEP = `<span style="color:var(--rule-mid)">·</span>`;

export function miracleCardHtml(m: MiracleCardData, saintNames: string[]): string {
  const names = saintNames.map(esc).join(", ");
  const meta = [
    names ? `<span style="font-family:var(--font-sans);font-size:0.68rem;font-weight:600;color:var(--color-accent)">${names}</span>` : "",
    `${SEP}<span style="${META}">${esc(humanizeSnakeCase(m.type))}</span>`,
    m.date_of_event ? `${SEP}<span style="${META}">${esc(m.date_of_event)}</span>` : "",
    m.country ? `${SEP}<span style="${META}">${esc(m.country)}</span>` : "",
  ].join("");

  const excerpt = m.cure_details
    ? `<p style="font-family:var(--font-sans);font-size:0.78rem;color:var(--text-3);line-height:1.65;margin-bottom:0.5rem">${esc(m.cure_details.length > 140 ? m.cure_details.slice(0, 140) + "…" : m.cure_details)}</p>`
    : "";

  const topics = m.topics ?? [];
  const topicHtml = topics.length > 0
    ? `<div class="flex flex-wrap gap-1">${topics.slice(0, 5).map((t) => `<a href="/topics/${encodeURIComponent(t)}" class="tag tag--link">${esc(t)}</a>`).join("")}${topics.length > 5 ? `<span class="tag">+${topics.length - 5}</span>` : ""}</div>`
    : "";

  const approval = approvalBadge(m.approval_authority);
  const badges = [
    approval ? `<span class="approval-badge ${approval.cls}">${approval.label}</span>` : "",
    m.used_for_beatification ? `<span class="used-badge">Beatification</span>` : "",
    m.used_for_canonization ? `<span class="used-badge">Canonization</span>` : "",
  ].join("");

  return `<div class="block group relative">
  <div class="card px-6 py-5">
    <div class="flex items-start justify-between gap-6">
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">${meta}</div>
        <h2 style="font-family:var(--font-display);font-size:1.25rem;font-weight:400;color:var(--text-1);line-height:1.3;margin-bottom:0.5rem;transition:color 0.2s" class="group-hover:text-[--color-accent]"><a href="/miracles/${esc(m.slug)}" class="card-link">${esc(m.title)}</a></h2>
        ${excerpt}${topicHtml}
      </div>
      ${badges ? `<div class="shrink-0 flex flex-col gap-1 items-end">${badges}</div>` : ""}
    </div>
  </div>
</div>`;
}

/** Inner HTML of the pagination <nav>. `ajax` adds the hooks the client script intercepts. */
export function paginationHtml(
  page: number,
  totalPages: number,
  urlFor: (p: number) => string,
  ajax = false,
): string {
  if (totalPages <= 1) return "";
  const link = (p: number, label: string) =>
    `<a href="${esc(urlFor(p))}" class="pagination-btn${ajax ? " js-page" : ""}"${ajax ? ` data-page="${p}"` : ""}>${label}</a>`;
  const off = (label: string) => `<span class="pagination-btn disabled" aria-disabled="true">${label}</span>`;
  return `${page > 1 ? link(page - 1, "← Previous") : off("← Previous")}
<span class="pagination-info" aria-current="page">Page ${page} of ${totalPages}</span>
${page < totalPages ? link(page + 1, "Next →") : off("Next →")}`;
}
