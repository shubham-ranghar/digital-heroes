import { statSync } from "node:fs";
import sharp from "sharp";

const input = "public/Smiling Volunteers Under the Pavilion.png";
const output = "public/hero.webp";

let quality = 82;
for (let attempt = 0; attempt < 6; attempt += 1) {
  await sharp(input)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(output);

  const bytes = statSync(output).size;
  if (bytes <= 300 * 1024) {
    console.log(`Wrote ${output} (${bytes} bytes, quality ${quality})`);
    process.exit(0);
  }
  quality -= 8;
}

const bytes = statSync(output).size;
console.warn(`Wrote ${output} (${bytes} bytes) — still above 300KB`);
process.exit(bytes <= 300 * 1024 ? 0 : 1);
