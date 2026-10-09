// Applies Drizzle migrations after confirming the target. The only Neon branch is
// production, so a bare `drizzle-kit migrate` writes straight to the live database.
// Run: npm run db:migrate          (asks for confirmation)
//      npm run db:migrate -- --yes (skips the prompt, e.g. for scripted use)
import "dotenv/config";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { describeTarget } from "./db-target";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}

const target = describeTarget(url);
console.log(`Target database: ${target}`);

if (!process.argv.includes("--yes")) {
  if (!process.stdin.isTTY) {
    console.error("Not an interactive terminal; pass --yes to confirm.");
    process.exit(2);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Apply pending migrations to this database? (y/N) ");
  rl.close();
  if (answer.trim().toLowerCase() !== "y") {
    console.log("Aborted.");
    process.exit(1);
  }
}

const result = spawnSync("npx", ["drizzle-kit", "migrate"], { stdio: "inherit" });
process.exit(result.status ?? 1);
