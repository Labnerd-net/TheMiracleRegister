// Read-only listing of saints/miracles in the database in DATABASE_URL.
// Run: npm run list:content            (published + unpublished)
//      npm run list:content -- --unpublished   (unpublished only)
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}
const sql = neon(url);

const unpublishedOnly = process.argv.includes("--unpublished");

type Rec = Record<string, any>;
const saints = (await sql`select slug, name, published from saints order by name`) as Rec[];
const miracles = (await sql`select slug, title, published from miracles order by title`) as Rec[];

const rows = unpublishedOnly ? saints.filter((s) => !s.published) : saints;
console.log(`\nSaints (${rows.length}${unpublishedOnly ? " unpublished" : ""}):`);
for (const s of rows) console.log(`  [${s.published ? "x" : " "}] ${s.slug} — ${s.name}`);

const mRows = unpublishedOnly ? miracles.filter((m) => !m.published) : miracles;
console.log(`\nMiracles (${mRows.length}${unpublishedOnly ? " unpublished" : ""}):`);
for (const m of mRows) console.log(`  [${m.published ? "x" : " "}] ${m.slug} — ${m.title}`);
