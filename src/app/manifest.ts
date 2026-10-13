import type { MetadataRoute } from "next";
import { restaurant } from "@data/restaurant";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: restaurant.name,
    short_name: "Sole",
    description: restaurant.tagline,
    lang: "pl",
    start_url: "/menu",
    display: "standalone",
    background_color: "#F5E9D4",
    theme_color: "#24150F",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
