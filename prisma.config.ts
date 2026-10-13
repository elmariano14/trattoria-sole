import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Domyślnie plik lokalny – dzięki temu `npm install` (prisma generate) działa przed utworzeniem .env.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
