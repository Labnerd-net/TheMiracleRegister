// Transaction-capable Drizzle connection for scripts. The app's neon-http driver cannot run
// transactions, so scripts that need one use the Neon WebSocket pool instead.
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../src/db/schema";
import type { Db } from "./import-content-core";

export function connect(databaseUrl: string): { db: Db; close: () => Promise<void> } {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema }) as unknown as Db;
  return { db, close: () => pool.end() };
}
