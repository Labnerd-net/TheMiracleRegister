// Imports saint and miracle content files into the database in DATABASE_URL.
// Run: npm run import:content                 (dry run: prints a diff, writes nothing)
//      npm run import:content -- --apply      (writes in one transaction, asks first)
// Flags: --content-dir <path>  --apply  --update-published  --allow-dirty  --yes
// Never sets published to true and never deletes a saint or miracle.
import "dotenv/config";
import { parseArgs } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { confirm } from "./confirm";
import { ContentDirError, contentGit, loadContent, resolveContentDir } from "./content-load";
import { connect } from "./db-pool";
import { describeTarget } from "./db-target";
import { formatReport, runImport } from "./import-content-core";

const { values } = parseArgs({
  options: {
    "content-dir": { type: "string" },
    apply: { type: "boolean", default: false },
    "update-published": { type: "boolean", default: false },
    "allow-dirty": { type: "boolean", default: false },
    yes: { type: "boolean", default: false },
  },
});

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolveContentDir({ flag: values["content-dir"], env: process.env.CONTENT_DIR, repoRoot });

// Everything up to here reads files only; the database is not touched until content is valid.
let content;
try {
  content = loadContent(dir);
} catch (e) {
  if (e instanceof ContentDirError) {
    console.error(e.message);
    process.exit(2);
  }
  throw e;
}

const git = contentGit(dir);
console.log(`Content directory: ${dir.path} (from ${dir.source})`);
console.log(`Content repo commit: ${git ? `${git.head}${git.dirty ? " (uncommitted changes)" : ""}` : "not a git work tree"}`);
console.log(`Files: ${content.saints.length} saints, ${content.miracles.length} miracles`);

if (content.errors.length) {
  console.error(`\nERRORS (${content.errors.length}):\n  ${content.errors.join("\n  ")}`);
  process.exit(1);
}

if (values.apply && !values["allow-dirty"]) {
  const problems: string[] = [];
  if (!git) problems.push("the content directory is not in a git work tree");
  else {
    if (git.dirty) problems.push("the content directory has uncommitted changes");
    if (!git.onOriginMain) problems.push(`HEAD ${git.head} is not contained in origin/main${git.fetchFailed ? " (git fetch failed, origin/main may be stale)" : ""}`);
  }
  if (problems.length) {
    console.error(`\nRefusing to --apply: ${problems.join("; ")}. Commit and merge the content, or pass --allow-dirty.`);
    process.exit(2);
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}
console.log(`Target database: ${describeTarget(url)}\n`);

if (values.apply && !values.yes) {
  if (!process.stdin.isTTY) {
    console.error("Not an interactive terminal; pass --yes to confirm.");
    process.exit(2);
  }
  if (!(await confirm("Apply this import to this database?"))) {
    console.log("Aborted.");
    process.exit(1);
  }
}

const { db, close } = connect(url);
try {
  const report = await runImport(db, content, { apply: values.apply, updatePublished: values["update-published"] });
  console.log(formatReport(report, values.apply));
  process.exitCode = report.errors.length ? 1 : 0;
} finally {
  await close();
}
