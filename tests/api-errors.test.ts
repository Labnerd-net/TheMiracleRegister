import { describe, expect, it, vi } from "vitest";
import { createRequester, json } from "./helpers/apiApp";
import { dbHolder } from "./helpers/dbHolder";

// No setupDb(): createDb throws, standing in for a failing database connection.
const req = createRequester();

describe("unhandled errors", () => {
  it("return the JSON envelope with 500 and are not cached", async () => {
    dbHolder.db = null;
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await req("/api/v1/miracles");
    expect(res.status).toBe(500);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await json(res)).toEqual({ data: null, meta: null, error: "Internal server error" });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
