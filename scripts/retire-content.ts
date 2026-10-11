// Retires a published saint or miracle whose content file has already been removed.
// Run: npm run retire:content -- --kind miracle --slug some-slug
//        (dry run: prints the row, child-row counts, and warnings; writes nothing)
//      npm run retire:content -- --kind miracle --slug some-slug --apply
//        (defaults to --mode unpublish; pass --mode delete for a hard delete)
// Flags: --kind <saint|miracle>  --slug <slug>  --mode <unpublish|delete>  --apply
//        --content-dir <path>  --allow-dirty  --yes
//
// Exists because import-content.ts deliberately never deletes a row or unpublishes one - see
// its own header comment. This script is for the rarer, deliberate "take this down" case: the
// content file is gone (moved elsewhere, retracted, merged into another record) and the DB row
// needs to catch up. Refuses to run if a content file for the slug still exists, since that's
// what import:content is for.
import "dotenv/config";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { confirm } from "./confirm";
import { ContentDirError, assertContentRoot, contentGit, resolveContentDir } from "./content-load";
import { connect } from "./db-pool";
import { describeTarget } from "./db-target";
import { applyRetirement, formatPlan, planRetirement, type RetireKind, type RetireMode } from "./retire-content-core";

const { values } = parseArgs({
  options: {
    kind: { type: "string" },
    slug: { type: "string" },
    mode: { type: "string", default: "unpublish" },
    "content-dir": { type: "string" },
    apply: { type: "boolean", default: false },
    "allow-dirty": { type: "boolean", default: false },
    yes: { type: "boolean", default: false },
  },
});

if (values.kind !== "saint" && values.kind !== "miracle") {
  console.error('--kind must be "saint" or "miracle"');
  process.exit(2);
}
if (!values.slug) {
  console.error("--slug is required");
  process.exit(2);
}
if (values.mode !== "unpublish" && values.mode !== "delete") {
  console.error('--mode must be "unpublish" or "delete" (default: unpublish)');
  process.exit(2);
}
const kind: RetireKind = values.kind;
const slug = values.slug;
const mode: RetireMode = values.mode;

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

const filePath = join(dir.path, `${kind}s`, `${slug}.json`);
if (existsSync(filePath)) {
  console.error(
    `Refusing to retire: ${filePath} still exists. This script is for a row whose content file is already gone - ` +
      `remove the file (and merge that) first, or use import:content if you actually want to change its content.`
  );
  process.exit(2);
}

const git = contentGit(dir);
console.log(`Content directory: ${dir.path} (from ${dir.source})`);
console.log(`Content repo commit: ${git ? `${git.head}${git.dirty ? " (uncommitted changes)" : ""}` : "not a git work tree"}`);

if (values.apply && !values["allow-dirty"]) {
  const problems: string[] = [];
  if (!git) problems.push("the content directory is not in a git work tree");
  else {
    if (git.dirty) problems.push("the content directory has uncommitted changes");
    if (!git.onOriginMain) problems.push(`HEAD ${git.head} is not contained in origin/main${git.fetchFailed ? " (git fetch failed, origin/main may be stale)" : ""}`);
  }
  if (problems.length) {
    console.error(`\nRefusing to --apply: ${problems.join("; ")}. Commit and merge the file removal, or pass --allow-dirty.`);
    process.exit(2);
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}
console.log(`Target database: ${describeTarget(url)}\n`);

const { db, close } = connect(url);
try {
  const plan = await planRetirement(db, kind, slug);
  console.log(formatPlan(plan));

  if (!plan.found) process.exit(0);

  if (!values.apply) {
    console.log("\nDry run: nothing written. Pass --apply to act (default --mode unpublish; --mode delete to hard-delete).");
    process.exit(0);
  }

  console.log(`\nAbout to ${mode} this ${kind} (--apply, --mode ${mode}).`);
  if (!values.yes) {
    if (!process.stdin.isTTY) {
      console.error("Not an interactive terminal; pass --yes to confirm.");
      process.exit(2);
    }
    if (!(await confirm(`${mode === "delete" ? "Permanently delete" : "Unpublish"} "${slug}"?`))) {
      console.log("Aborted.");
      process.exit(1);
    }
  }

  const result = await applyRetirement(db, kind, slug, mode);
  if (!result.ok) {
    console.error(`Failed: ${result.reason}`);
    process.exit(1);
  }
  console.log(`Done (${result.mode}). Run \`npm run check:data\` to confirm nothing broke.`);
} finally {
  await close();
}
