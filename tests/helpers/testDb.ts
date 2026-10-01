import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll } from "vitest";
import * as schema from "../../src/db/schema";
import { dbHolder } from "./dbHolder";
import { seed, type SeedIds } from "./fixtures";

export type TestDb = ReturnType<typeof drizzle<typeof schema>>;

// In-process Postgres with the real migrations applied (about 2s).
export async function createTestDb() {
  const pg = new PGlite();
  const db = drizzle(pg, { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return { db, close: () => pg.close() };
}

// Registers hooks that give this test file its own freshly seeded database.
export function setupDb() {
  const ctx = {} as { db: TestDb; ids: SeedIds };
  let close: () => Promise<void>;
  beforeAll(async () => {
    const created = await createTestDb();
    close = created.close;
    ctx.db = created.db;
    ctx.ids = await seed(created.db);
    dbHolder.db = created.db;
  });
  afterAll(async () => {
    dbHolder.db = null;
    await close?.();
  });
  return ctx;
}
