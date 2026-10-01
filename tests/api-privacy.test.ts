import { describe, expect, it } from "vitest";
import { createRequester, json } from "./helpers/apiApp";
import { setupDb } from "./helpers/testDb";

setupDb();
const req = createRequester();

// recipient_privacy -> recipient_name:
//   public          "Ann Testwell"  -> unchanged
//   first_name_only "Bea Fictiva"   -> "Bea"
//   confidential    "Carl Nobody"   -> null
// Only the recipient_name field is redacted by the API; keeping names out of free text
// is a data rule enforced by `npm run check:data`.
const expected: Record<string, string | null> = {
  "m-healing-ann": "Ann Testwell",
  "m-first-name": "Bea",
  "m-confidential": null,
};

type M = { slug: string; recipient_name: string | null };
const name = (list: M[], slug: string) => list.find((m) => m.slug === slug)?.recipient_name;

describe("recipient_name redaction", () => {
  it("applies on the miracle list", async () => {
    const { data } = await json(await req("/api/v1/miracles?limit=100"));
    for (const [slug, want] of Object.entries(expected)) expect(name(data, slug)).toBe(want);
  });

  it.each(Object.entries(expected))("applies on miracle detail for %s", async (slug, want) => {
    const { data } = await json(await req(`/api/v1/miracles/${slug}`));
    expect(data.recipient_name).toBe(want);
  });

  it("applies on miracles inside a saint detail", async () => {
    const alpha = await json(await req("/api/v1/saints/saint-alpha"));
    expect(name(alpha.data.miracles, "m-healing-ann")).toBe("Ann Testwell");
    expect(name(alpha.data.miracles, "m-first-name")).toBe("Bea");
    const beta = await json(await req("/api/v1/saints/saint-beta"));
    expect(name(beta.data.miracles, "m-confidential")).toBeNull();
  });

  it("does not expose recipient_privacy on list or saint-detail miracles", async () => {
    const list = await json(await req("/api/v1/miracles?limit=100"));
    expect(list.data[0]).not.toHaveProperty("recipient_privacy");
    const saint = await json(await req("/api/v1/saints/saint-alpha"));
    expect(saint.data.miracles[0]).not.toHaveProperty("recipient_privacy");
  });

  it("never returns the restricted full names anywhere in the list payload", async () => {
    const text = await (await req("/api/v1/miracles?limit=100")).text();
    expect(text).not.toContain("Fictiva");
    expect(text).not.toContain("Nobody");
  });
});
