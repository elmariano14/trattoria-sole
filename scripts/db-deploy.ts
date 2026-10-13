/**
 * Stosuje migracje z prisma/migrations do bazy wskazanej w DATABASE_URL.
 * Działa zarówno z lokalnym plikiem SQLite, jak i z Turso (libsql://),
 * do którego `prisma migrate deploy` nie potrafi się połączyć bezpośrednio.
 *
 *   DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npm run db:deploy
 */
import "dotenv/config";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL;
if (!url || url.includes("WKLEJ")) {
  console.error("Brak DATABASE_URL – uzupełnij adres bazy (np. w .env.vercel).");
  process.exit(1);
}

const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
const dir = join(process.cwd(), "prisma", "migrations");

async function main() {
  // Ta sama tabela, której używa Prisma – dzięki temu `prisma migrate dev`
  // lokalnie i ten skrypt nie wchodzą sobie w drogę.
  await db.execute(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
  )`);

  const applied = new Set(
    (await db.execute(`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`)).rows.map(
      (r) => String(r.migration_name),
    ),
  );

  const migrations = readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, "migration.sql")))
    .map((d) => d.name)
    .sort();

  let count = 0;
  for (const name of migrations) {
    if (applied.has(name)) continue;
    const sql = readFileSync(join(dir, name, "migration.sql"), "utf8");
    console.log(`→ ${name}`);
    await db.executeMultiple(sql);
    await db.execute({
      sql: `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
            VALUES (?, ?, current_timestamp, ?, 1)`,
      args: [crypto.randomUUID(), "applied-by-db-deploy", name],
    });
    count++;
  }
  console.log(count ? `Zastosowano migracji: ${count}.` : "Baza jest aktualna.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.close());
