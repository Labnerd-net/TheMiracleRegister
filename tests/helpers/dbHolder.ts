import type { TestDb } from "./testDb";

// Shared slot between setupDb() and the mocked createDb in tests/setup.ts.
export const dbHolder: { db: TestDb | null } = { db: null };
