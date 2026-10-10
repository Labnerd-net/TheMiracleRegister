import { describe, expect, it } from "vitest";
import { esc, miracleCardHtml, paginationHtml, saintCardHtml } from "../src/lib/cards";

const saint = {
  slug: "padre-pio",
  name: 'Padre "Pio" <b>',
  image_url: null,
  canonization_stage: "saint",
  nationality: "Italy",
  feast_day: "September 23",
};

const miracle = {
  slug: "healing-of-x",
  title: "Healing <script>alert(1)</script>",
  type: "miraculous_image",
  topics: ["children", "mothers", "veterans", "elderly", "youth", "marriage"],
  country: "Italy",
  date_of_event: "1999-01-01",
  cure_details: "x".repeat(200),
  approval_authority: "vatican_dicastery",
  used_for_beatification: true,
  used_for_canonization: false,
};

describe("esc", () => {
  it("escapes HTML metacharacters and tolerates null", () => {
    expect(esc(`<a href="x">&</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
    expect(esc(null)).toBe("");
  });
});

describe("saintCardHtml", () => {
  it("escapes the name and links to the saint", () => {
    const html = saintCardHtml(saint);
    expect(html).toContain('href="/saints/padre-pio"');
    expect(html).toContain("Padre &quot;Pio&quot; &lt;b&gt;");
    expect(html).not.toContain("<b>");
  });

  it("uses an initial placeholder when there is no image, and lazy/eager loading", () => {
    expect(saintCardHtml(saint)).toContain('saint-placeholder w-full h-full">P<');
    const withImage = { ...saint, image_url: "https://example.org/a.jpg" };
    expect(saintCardHtml(withImage)).toContain('loading="lazy"');
    expect(saintCardHtml(withImage, { eager: true })).toContain('loading="eager"');
  });

  it("omits feast day and nationality when absent", () => {
    const html = saintCardHtml({ ...saint, feast_day: null, nationality: null });
    expect(html).not.toContain('class="block"');
  });
});

describe("miracleCardHtml", () => {
  it("escapes title and humanizes the type", () => {
    const html = miracleCardHtml(miracle, ["Saint A", "Saint <B>"]);
    expect(html).not.toContain("<script>");
    expect(html).toContain("Healing &lt;script&gt;");
    expect(html).toContain("Miraculous Image");
    expect(html).toContain("Saint A, Saint &lt;B&gt;");
  });

  it("truncates the excerpt, caps topics at five and shows the badges", () => {
    const html = miracleCardHtml(miracle, []);
    expect(html).toContain("x".repeat(140) + "…");
    expect(html).not.toContain("x".repeat(141));
    expect(html).toContain("+1</span>");
    expect(html).toContain("Vatican Approved");
    expect(html).toContain("Beatification");
    expect(html).not.toContain("Canonization");
  });

  it("renders without badges, topics or excerpt", () => {
    const html = miracleCardHtml(
      { ...miracle, topics: null, cure_details: null, approval_authority: null, used_for_beatification: false },
      [],
    );
    expect(html).not.toContain("approval-badge");
    expect(html).not.toContain("tag--link");
    expect(html).not.toContain("<p ");
  });
});

describe("paginationHtml", () => {
  const url = (p: number) => `/saints?page=${p}`;

  it("is empty for a single page", () => {
    expect(paginationHtml(1, 1, url)).toBe("");
  });

  it("disables previous on the first page and next on the last", () => {
    const first = paginationHtml(1, 3, url);
    expect(first).toContain('aria-disabled="true">← Previous');
    expect(first).toContain('href="/saints?page=2"');
    const last = paginationHtml(3, 3, url);
    expect(last).toContain('aria-disabled="true">Next →');
    expect(last).toContain('href="/saints?page=2"');
    expect(last).toContain("Page 3 of 3");
  });

  it("adds client hooks only in ajax mode and escapes the URL", () => {
    expect(paginationHtml(2, 3, url)).not.toContain("js-page");
    const ajax = paginationHtml(2, 3, (p) => `/x?a=1&b=${p}`, true);
    expect(ajax).toContain('class="pagination-btn js-page" data-page="1"');
    expect(ajax).toContain("/x?a=1&amp;b=3");
  });
});
