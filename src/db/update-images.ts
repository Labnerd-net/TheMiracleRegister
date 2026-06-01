import "dotenv/config";
import { createDb } from "./index";
import { saints } from "./schema";
import { eq } from "drizzle-orm";

const db = createDb(process.env.DATABASE_URL!);

const images: Record<string, string> = {
  "john-paul-ii": "https://upload.wikimedia.org/wikipedia/commons/3/34/JPII_29_09_2004_2.JPG",
  "mother-teresa": "https://upload.wikimedia.org/wikipedia/commons/8/8e/MotherTeresa_090.jpg",
  "padre-pio": "https://upload.wikimedia.org/wikipedia/commons/5/51/Padre_Pio_portrait.jpg",
  "faustina-kowalska": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Saint_Faustyna_Kowalska_portrait_%281931%29.jpg",
  "gianna-beretta-molla": "https://upload.wikimedia.org/wikipedia/commons/8/87/GiannaBerettaMolla.jpg",
  "kateri-tekakwitha": "https://upload.wikimedia.org/wikipedia/commons/1/14/Kateri_Tekakwitha_1690.jpg",
  "andre-bessette": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Fr%C3%A8re_Andr%C3%A9_1920.jpg",
  "maximilian-kolbe": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Fr.Maximilian_Kolbe_1939.jpg",
  "louis-martin": "https://upload.wikimedia.org/wikipedia/commons/3/38/Louis_Martin_1.jpg",
  "zelie-martin": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Z%C3%A9lie_Martin_1.jpg",
  "juan-diego": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Juan-Diego.jpg",
};

async function run() {
  for (const [slug, url] of Object.entries(images)) {
    await db.update(saints).set({ image_url: url }).where(eq(saints.slug, slug));
    console.log(`Updated ${slug}`);
  }
  console.log("Done.");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
