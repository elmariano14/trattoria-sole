/** Publiczny adres strony – SEO, sitemap, kod QR. */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const author = {
  name: process.env.NEXT_PUBLIC_AUTHOR_NAME || "",
  url: process.env.NEXT_PUBLIC_AUTHOR_URL || "",
};
