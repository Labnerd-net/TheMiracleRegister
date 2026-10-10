// Client-side filtering shared by /saints and /miracles: fetches the API on filter or page
// change, renders through the same functions the server uses, and keeps the URL in sync.
import { paginationHtml } from "../lib/cards";
import type { Meta } from "../api/schemas";

interface BrowseOptions<T> {
  /** Form field name -> API param name (when they differ). */
  fields: { form: string; api?: string }[];
  apiPath: string;
  pagePath: string;
  pageSize: number;
  noun: { singular: string; plural: string; suffix: string };
  emptyHtml: string;
  renderItems: (items: T[]) => string;
  /** Numeric inputs are debounced instead of firing on every change. */
  debounceNumbers?: boolean;
}

export function initBrowse<T>(opts: BrowseOptions<T>) {
  const form = document.getElementById("filter-form") as HTMLFormElement | null;
  const listEl = document.querySelector<HTMLElement>("[data-browse-results]");
  const paginationEl = document.querySelector<HTMLElement>("[data-browse-pagination]");
  const countEl = document.querySelector<HTMLElement>("[data-browse-count]");
  const statusEl = document.querySelector<HTMLElement>("[data-browse-status]");
  const titleEl = document.getElementById("page-title");
  if (!form || !listEl || !paginationEl || !countEl || !statusEl) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let debounceTimer = 0;

  function buildParams(fd: FormData, mode: "api" | "page"): URLSearchParams {
    const p = new URLSearchParams();
    for (const f of opts.fields) {
      const value = fd.get(f.form) as string;
      if (!value) continue;
      p.set(mode === "api" ? (f.api ?? f.form) : f.form, value);
    }
    return p;
  }

  function buildPageUrl(fd: FormData, page: number): string {
    const p = buildParams(fd, "page");
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return qs ? `${opts.pagePath}?${qs}` : opts.pagePath;
  }

  async function applyFilters(page = 1) {
    const fd = new FormData(form!);
    listEl!.classList.add("is-loading");
    listEl!.setAttribute("aria-busy", "true");
    try {
      const api = buildParams(fd, "api");
      api.set("page", String(page));
      api.set("limit", String(opts.pageSize));
      const res = await fetch(`${opts.apiPath}?${api.toString()}`);
      if (!res.ok) throw new Error(String(res.status));
      const { data, meta } = (await res.json()) as { data: T[]; meta: Meta };

      const countText = `${meta.total} ${meta.total !== 1 ? opts.noun.plural : opts.noun.singular} ${opts.noun.suffix}`;
      countEl!.textContent = countText;
      const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
      statusEl!.textContent = pages > 1 ? `${countText}. Page ${meta.page} of ${pages}.` : `${countText}.`;

      listEl!.innerHTML = data.length === 0 ? opts.emptyHtml : opts.renderItems(data);

      const html = paginationHtml(meta.page, pages, (p) => buildPageUrl(fd, p), true);
      paginationEl!.innerHTML = html;
      paginationEl!.hidden = !html;

      history.pushState(null, "", buildPageUrl(fd, page));
    } catch {
      statusEl!.textContent = "Could not update results. Showing the previous results.";
    } finally {
      listEl!.classList.remove("is-loading");
      listEl!.setAttribute("aria-busy", "false");
    }
  }

  form.addEventListener("change", (e) => {
    if (opts.debounceNumbers && (e.target as HTMLInputElement).type === "number") return;
    applyFilters();
  });

  if (opts.debounceNumbers) {
    form.addEventListener("input", (e) => {
      if ((e.target as HTMLInputElement).type !== "number") return;
      clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => applyFilters(), 400);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    applyFilters();
  });

  paginationEl.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest(".js-page") as HTMLAnchorElement | null;
    if (!target) return;
    e.preventDefault();
    applyFilters(parseInt(target.dataset.page ?? "1")).then(() => titleEl?.focus({ preventScroll: true }));
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
}
