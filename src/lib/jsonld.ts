import { safeHttpUrl } from "./url";

export const SITE_URL = "https://themiracleregister.org";
export const SITE_NAME = "The Miracle Register";

type JsonLd = Record<string, unknown>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isoDate(value: string | null | undefined): string | undefined {
  return value && ISO_DATE.test(value) ? value : undefined;
}

/** Drops undefined/null/empty-array values so the output stays minimal. */
function compact(obj: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v != null && !(Array.isArray(v) && v.length === 0)),
  );
}

/** Serializes for embedding in a <script> tag; `<` is escaped so content cannot close the tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function saintJsonLd(saint: {
  slug: string;
  name: string;
  saint_name: string | null;
  birth_date: string | null;
  birth_date_precision: string;
  death_date: string | null;
  death_date_precision: string;
  nationality: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  description?: string;
}): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/saints/${saint.slug}#saint`,
    url: `${SITE_URL}/saints/${saint.slug}`,
    name: saint.name,
    alternateName: saint.saint_name && saint.saint_name !== saint.name ? saint.saint_name : undefined,
    // Only assert a date to search engines when it's actually known to the day —
    // an approximate year/century shouldn't be published as a precise birthDate/deathDate.
    birthDate: saint.birth_date_precision === "exact_day" ? isoDate(saint.birth_date) : undefined,
    deathDate: saint.death_date_precision === "exact_day" ? isoDate(saint.death_date) : undefined,
    nationality: saint.nationality,
    image: saint.image_url,
    description: saint.description,
    sameAs: safeHttpUrl(saint.wikipedia_url) ? [saint.wikipedia_url!] : undefined,
  });
}

/** Deliberately takes no recipient fields: recipient names may be restricted. */
export function miracleJsonLd(miracle: {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  saints: { slug: string; name: string }[];
}): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "Article",
    url: `${SITE_URL}/miracles/${miracle.slug}`,
    mainEntityOfPage: `${SITE_URL}/miracles/${miracle.slug}`,
    headline: miracle.title,
    description: miracle.description,
    image: miracle.image,
    about: miracle.saints.map((s) => ({
      "@type": "Person",
      "@id": `${SITE_URL}/saints/${s.slug}#saint`,
      name: s.name,
      url: `${SITE_URL}/saints/${s.slug}`,
    })),
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  });
}

export function siteJsonLd(): JsonLd[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "The Miracle Register",
      description:
        "A structured database of miracles attributed to Catholic saints, with medical documentation, narrative synopses and source trails.",
      url: SITE_URL,
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${SITE_URL}/api/v1/miracles`,
        },
      ],
    },
  ];
}

export function collectionJsonLd(page: { name: string; description: string; path: string }): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.name,
    description: page.description,
    url: `${SITE_URL}${page.path}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}
