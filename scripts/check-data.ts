// Read-only data integrity check against the database in DATABASE_URL.
// Run: npm run check:data   (exit code 1 if any error; warnings do not fail)
// The rules live in check-data-core.ts.
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { runChecks, type Sql } from "./check-data-core";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}

const { errors, warnings, saintCount, miracleCount } = await runChecks(neon(url) as unknown as Sql);

const report = (label: string, list: string[]) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length})`);
  for (const l of list) console.log(`  ${l}`);
};
console.log(`Checked ${saintCount} saints, ${miracleCount} miracles.`);
report("ERRORS", errors);
report("WARNINGS", warnings);
if (!errors.length) console.log(warnings.length ? "\nOK (with warnings)" : "\nOK");
process.exit(errors.length ? 1 : 0);
