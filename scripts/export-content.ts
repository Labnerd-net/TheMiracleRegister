// One-off backfill: writes every saint and miracle (published or not) from the database in
// DATABASE_URL into content files. Read-only on the database.
// Run: npm run export:content -- [--content-dir <path>] [--force]
// The content directory must already contain a .content-root marker file.
import "dotenv/config";
import { parseArgs } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ContentDirError, assertContentRoot, resolveContentDir } from "./content-load";
import { connect } from "./db-pool";
import { describeTarget } from "./db-target";
import { exportContent, writeExport } from "./export-content-core";

const { values } = parseArgs({
  options: { "content-dir": { type: "string" }, force: { type: "boolean", default: false } },
});

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolveContentDir({ flag: values["content-dir"], env: process.env.CONTENT_DIR, repoRoot });
try {
  assertContentRoot(dir);
} catch (e) {
  if (e instanceof ContentDirError) {
    console.error(e.message);
    process.exit(2);
  }
  throw e;
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}
console.log(`Content directory: ${dir.path} (from ${dir.source})`);
console.log(`Source database: ${describeTarget(url)}`);

const { db, close } = connect(url);
try {
  const { files, errors } = await exportContent(db);
  if (errors.length) {
    console.error(`\nThese rows do not fit the content format (nothing written):\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  const { written, skipped } = writeExport(dir.path, files, values.force);
  console.log(`Wrote ${written.length} files.`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} existing files (pass --force to overwrite): ${skipped.join(", ")}`);
  }
} finally {
  await close();
}
