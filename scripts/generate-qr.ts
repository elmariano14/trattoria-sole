/**
 * Generuje pliki do druku:
 *  - public/qr/menu-qr.png      – sam kod QR (1200×1200 px)
 *  - public/qr/karta-stolik.png – karta na stolik A6 (105×148 mm, 300 dpi)
 *
 *   NEXT_PUBLIC_SITE_URL=https://twoja-domena.pl npm run qr
 */
import "dotenv/config";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { menuQrPng, menuQrTarget } from "../src/lib/qr";
import { siteUrl } from "../src/lib/site";

const out = join(process.cwd(), "public", "qr");
mkdirSync(out, { recursive: true });

const W = 1240; // 105 mm @ 300 dpi
const H = 1748; // 148 mm @ 300 dpi
const QR = 760;

async function main() {
  const base = siteUrl();
  if (base.includes("WKLEJ")) {
    console.error("Uzupełnij NEXT_PUBLIC_SITE_URL (adres strony z Vercel).");
    process.exit(1);
  }
  if (base.includes("localhost")) {
    console.warn("⚠ NEXT_PUBLIC_SITE_URL wskazuje na localhost – ustaw docelową domenę przed drukiem.");
  }

  const qr = await menuQrPng(1200, base);
  await sharp(qr).toFile(join(out, "menu-qr.png"));

  const card = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="100%" height="100%" fill="#F5E9D4"/>
    <rect x="0" y="0" width="${W}" height="520" fill="#24150F"/>
    <circle cx="${W / 2}" cy="520" r="140" fill="#E8A13A"/>
    <rect x="0" y="520" width="${W}" height="8" fill="#24150F"/>
    <text x="${W / 2}" y="230" text-anchor="middle" font-family="Didot, 'Bodoni 72', Georgia, serif" font-size="128" fill="#F5E9D4">Trattoria Sole</text>
    <text x="${W / 2}" y="320" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" fill="#F5E9D4" fill-opacity="0.75">kuchnia włoska, Kraków</text>
    <rect x="${(W - QR) / 2 - 30}" y="740" width="${QR + 60}" height="${QR + 60}" rx="48" fill="#FFFFFF"/>
    <text x="${W / 2}" y="1640" text-anchor="middle" font-family="Didot, 'Bodoni 72', Georgia, serif" font-size="72" fill="#24150F">Zeskanuj i zobacz menu</text>
    <text x="${W / 2}" y="1700" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#6E5546">ceny, alergeny i zamówienia na odbiór</text>
  </svg>`);

  await sharp(card)
    .composite([{ input: await sharp(qr).resize(QR, QR).toBuffer(), left: (W - QR) / 2, top: 770 }])
    .withMetadata({ density: 300 })
    .png()
    .toFile(join(out, "karta-stolik.png"));

  console.log(`✓ public/qr/menu-qr.png\n✓ public/qr/karta-stolik.png\n  → ${menuQrTarget(base)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
