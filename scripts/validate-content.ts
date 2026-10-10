// Validates the content files without a database: schema, file names, slug history, mirrored
// relations, and that every referenced saint has a file. Used by catholic-research CI.
// Run: npm run validate:content -- [--content-dir <path>]
// Exit 0 if valid, 1 if any file is invalid, 2 if the content directory is unusable.
import { parseArgs } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ContentDirError, fileOnlyReferenceErrors, loadContent, resolveContentDir } from "./content-load";

const { values } = parseArgs({ options: { "content-dir": { type: "string" } } });

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dir = resolveContentDir({ flag: values["content-dir"], env: process.env.CONTENT_DIR, repoRoot });
try {
  const content = loadContent(dir);
  const errors = [...content.errors, ...fileOnlyReferenceErrors(content.saints, content.miracles)];
  console.log(`Content directory: ${dir.path} (from ${dir.source})`);
  console.log(`Files: ${content.saints.length} saints, ${content.miracles.length} miracles`);
  if (errors.length) {
    console.error(`\nINVALID (${errors.length})\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  console.log("OK");
} catch (e) {
  if (e instanceof ContentDirError) {
    console.error(e.message);
    process.exit(2);
  }
  throw e;
}
