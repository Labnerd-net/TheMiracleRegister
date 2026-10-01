import { vi } from "vitest";

// Applies to every test file. API routes call createDb(...) to get a database; during
// tests that returns whatever database the current file registered via setupDb().
vi.mock("../src/db", async () => {
  const { dbHolder } = await import("./helpers/dbHolder");
  return {
    createDb: () => {
      if (!dbHolder.db) throw new Error("No test database: call setupDb() in this test file");
      return dbHolder.db;
    },
  };
});
