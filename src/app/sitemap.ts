import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/menu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/zamowienie`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/rezerwacja`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
