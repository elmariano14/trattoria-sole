import type { NextConfig } from "next";
import menu from "./data/menu.json";
import { assertValidMenu } from "./src/lib/menu-schema";

// Błąd w data/menu.json zatrzymuje dev/build, zanim trafi na produkcję.
assertValidMenu(menu);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Natywne bindingi klienta libSQL nie powinny trafiać do bundla.
  serverExternalPackages: ["@libsql/client", "libsql"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
