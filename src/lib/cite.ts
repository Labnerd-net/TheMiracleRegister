import { SITE_NAME, SITE_URL } from "./jsonld";

export interface Citation {
  format: string;
  before: string;
  // Access-date text with a {date} placeholder. The page fills it in the browser, because
  // cached HTML would otherwise carry the date of the render, not of the visit. Without
  // JavaScript the date is omitted and the citation still reads correctly.
  dateTemplate: string;
  after: string;
}

// `path` is a site path such as /miracles/<slug>. Pages have no author or publication date.
export function citations(title: string, path: string): Citation[] {
  const url = `${SITE_URL}${path}`;
  return [
    {
      format: "APA",
      before: `${SITE_NAME}. (n.d.). ${title}. Retrieved `,
      dateTemplate: "{date}, ",
      after: `from ${url}`,
    },
    {
      format: "Chicago",
      before: `"${title}." ${SITE_NAME}. `,
      dateTemplate: "Accessed {date}. ",
      after: `${url}.`,
    },
  ];
}
