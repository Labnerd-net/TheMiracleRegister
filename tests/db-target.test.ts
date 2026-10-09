import { describe, expect, it } from "vitest";
import { describeTarget } from "../scripts/db-target";

describe("describeTarget", () => {
  it("shows host and database but never the credentials", () => {
    const out = describeTarget("postgresql://user:s3cret@ep-x.us-east-2.aws.neon.tech/neondb?sslmode=require");
    expect(out).toBe("ep-x.us-east-2.aws.neon.tech/neondb");
    expect(out).not.toContain("s3cret");
    expect(out).not.toContain("user");
  });

  it("does not echo an unparseable value", () => {
    expect(describeTarget("not a url with s3cret")).toBe("(unparseable DATABASE_URL)");
  });
});
