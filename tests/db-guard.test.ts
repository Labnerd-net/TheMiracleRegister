import { describe, expect, it } from "vitest";
import { createTestDb } from "./helpers/testDb";

describe("test database isolation", () => {
  it("uses an unreachable DATABASE_URL so production can never be hit", () => {
    expect(process.env.DATABASE_URL).toBe("postgresql://test:test@invalid.invalid/test");
  });

  it("creates an in-process database with the real migrations applied", async () => {
    const { db, close } = await createTestDb();
    const rows = await db.execute("select count(*)::int as n from drizzle.__drizzle_migrations");
    expect(rows.rows[0]).toMatchObject({ n: expect.any(Number) });
    expect((rows.rows[0] as { n: number }).n).toBeGreaterThan(0);
    await close();
  }, 30_000);
});
