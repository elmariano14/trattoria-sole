import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Figtree } from "next/font/google";
import { restaurant } from "@data/restaurant";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  // Bez kursywy: oszczędza dwa pliki fontu (~50 KB), a nigdzie jej nie potrzebujemy.
  style: "normal",
  axes: ["opsz"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${restaurant.name}: kuchnia włoska w Krakowie, zamówienia na odbiór`,
    template: `%s | ${restaurant.name}`,
  },
  description: restaurant.description,
  applicationName: restaurant.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: restaurant.name,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${restaurant.name}: stół zastawiony włoskimi daniami` }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#24150F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${bodoni.variable} ${figtree.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
