/**
 * Pobiera zdjęcia z listy data/image-credits.json (Unsplash, licencja Unsplash),
 * kadruje je i zapisuje jako WebP w public/images/. Generuje też obraz OG.
 * Gdy zdjęcia nie da się pobrać, w jego miejsce trafia placeholder w kolorach marki.
 *
 *   npm run images            # pobiera brakujące
 *   npm run images -- --force # pobiera wszystko od nowa
 *
 * Własne zdjęcia: podmień pliki w public/images/ (te same nazwy) i usuń wpisy z credits.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

type Credit = {
  file: string;
  shape: "square" | "wide" | "original";
  download: string;
  author: string;
};

const root = process.cwd();
const credits: Credit[] = JSON.parse(readFileSync(join(root, "data", "image-credits.json"), "utf8"));
const force = process.argv.includes("--force");

const SIZES = {
  square: { width: 900, height: 900 },
  wide: { width: 2000, height: 1200 },
  original: { width: 1400, height: undefined },
} as const;

async function placeholder(out: string, w: number, h: number, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="#24150F"/>
    <circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) * 0.32}" fill="#E8A13A"/>
    <text x="50%" y="${h - 40}" text-anchor="middle" font-family="Georgia, serif" font-size="32" fill="#F5E9D4">${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(out);
}

async function main() {
  let ok = 0;
  let failed = 0;
  for (const c of credits) {
    const out = join(root, "public", c.file);
    if (existsSync(out) && !force) continue;
    mkdirSync(dirname(out), { recursive: true });
    const size = SIZES[c.shape];
    try {
      const res = await fetch(`${c.download}?w=2400&q=85&fm=jpg`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const input = Buffer.from(await res.arrayBuffer());
      await sharp(input)
        .resize(size.width, size.height, { fit: "cover", position: sharp.strategy.attention, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(out);
      ok++;
      console.log(`✓ ${c.file}  (fot. ${c.author})`);
    } catch (err) {
      failed++;
      const { width, height = 900 } = size;
      await placeholder(out, width, height, c.file.split("/").pop()!.replace(".webp", ""));
      console.warn(`✗ ${c.file}: ${(err as Error).message} – zapisano placeholder`);
    }
  }

  // Obraz Open Graph 1200×630 z przyciemnionego zdjęcia stołu i nazwy restauracji.
  const og = join(root, "public", "og.jpg");
  if (!existsSync(og) || force) {
    const base = join(root, "public", "images", "hero", "stol-noc.webp");
    const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="#24150F" fill-opacity="0.62"/>
      <circle cx="1010" cy="600" r="250" fill="#E8A13A" fill-opacity="0.9"/>
      <text x="80" y="300" font-family="Georgia, serif" font-size="96" fill="#F5E9D4">Trattoria Sole</text>
      <text x="84" y="370" font-family="Arial, sans-serif" font-size="34" fill="#F5E9D4">Kuchnia włoska · Kraków · Zamów na odbiór</text>
    </svg>`);
    await sharp(base).resize(1200, 630, { fit: "cover" }).composite([{ input: overlay }]).jpeg({ quality: 82 }).toFile(og);
    console.log("✓ /og.jpg");
  }

  console.log(`\nGotowe: pobrano ${ok}, placeholderów ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
