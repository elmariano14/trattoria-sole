/**
 * Dane demonstracyjne do panelu: zamówienia i rezerwacje na dziś i najbliższe dni.
 * Wszystkie osoby i numery są fikcyjne: numery +48 000 000 0xx nie istnieją
 * w polskim planie numeracji (abonenckie nie zaczynają się od 0).
 *
 *   npm run db:seed
 */
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { restaurant } from "../data/restaurant";
import { getDish } from "../src/lib/menu";
import { pickupDates, pickupTimes, reservationTimes } from "../src/lib/slots";
import { addDays, zonedDate, zonedToUtc } from "../src/lib/time";

if (process.env.DATABASE_URL?.includes("WKLEJ")) {
  console.error("Uzupełnij DATABASE_URL i DATABASE_AUTH_TOKEN w .env.vercel.");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  }),
});

const people = ["Anna", "Piotr", "Kasia", "Michał", "Ola", "Tomek", "Ewa", "Bartek", "Zosia", "Kuba", "Magda", "Adam"];
const phone = (i: number) => `+48 000 000 ${String(i).padStart(3, "0")}`;
const baskets: [string, number][][] = [
  [["pizza-margherita", 2], ["tiramisu", 2]],
  [["spaghetti-alla-carbonara", 1], ["burrata-e-pomodorini", 1]],
  [["pizza-sole", 1], ["pizza-diavola", 1], ["limonata-della-casa", 2]],
  [["tagliatelle-al-ragu", 2]],
  [["risotto-ai-funghi-porcini", 1], ["panna-cotta", 1]],
  [["pizza-ortolana", 1], ["penne-all-arrabbiata", 1]],
  [["linguine-ai-frutti-di-mare", 1], ["bruschetta-al-pomodoro", 1], ["cannoli-siciliani", 2]],
];
const notes = [null, "Bez cebuli, proszę", null, "Alergia na orzechy", null, "Proszę pokroić pizzę", null];

async function main() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.reservation.deleteMany();
  await db.counter.deleteMany();

  const now = new Date();
  const dates = pickupDates(now);
  let n = 0;

  for (const [d, date] of dates.entries()) {
    const times = pickupTimes(date);
    // Szczyt wieczorny: więcej zamówień między 18:00 a 19:30.
    const evening = times.filter((t) => t >= "18:00" && t <= "19:30");
    const picks = d === 0 ? [...times.filter((t) => t >= "13:00" && t <= "14:00"), ...evening, ...evening] : evening;
    for (const [i, time] of picks.entries()) {
      if (i % (d === 0 ? 1 : 3) !== 0) continue;
      const pickupAt = zonedToUtc(date, time);
      const taken = await db.order.count({ where: { pickupAt } });
      if (taken >= restaurant.pickup.maxOrdersPerSlot) continue;
      n++;
      const basket = baskets[n % baskets.length];
      const items = basket.map(([dishId, quantity]) => {
        const dish = getDish(dishId)!;
        return { dishId, name: dish.name, unitPrice: dish.price, quantity };
      });
      const past = pickupAt < now;
      const status = past ? (n % 6 === 0 ? "CANCELLED" : "PICKED_UP") : pickupAt.getTime() - now.getTime() < 45 * 60_000 ? "PREPARING" : "NEW";
      await db.order.create({
        data: {
          number: `TS-${String(n).padStart(4, "0")}`,
          status,
          customerName: people[n % people.length],
          phone: phone(n),
          email: n % 3 === 0 ? `${people[n % people.length].toLowerCase()}@example.com` : null,
          notes: notes[n % notes.length],
          pickupAt,
          totalGrosze: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
          items: { create: items },
        },
      });
    }
  }
  await db.counter.create({ data: { name: "order", value: n } });

  const today = zonedDate(now);
  let r = 0;
  for (let i = 0; i < 10; i++) {
    const date = addDays(today, i);
    const times = reservationTimes(date, i === 0 ? now : zonedToUtc(date, "00:00"));
    for (const time of times.filter((t) => t >= "18:00" && t <= "20:00").slice(0, i < 3 ? 4 : 2)) {
      r++;
      await db.reservation.create({
        data: {
          name: `${people[(r + 3) % people.length]} ${["K.", "W.", "N.", "M."][r % 4]}`,
          phone: phone(100 + r),
          guests: [2, 4, 2, 6, 3, 2, 8][r % 7],
          startsAt: zonedToUtc(date, time),
          status: r % 3 === 0 ? "NEW" : "CONFIRMED",
          notes: r % 5 === 0 ? "Urodziny, poprosimy o świeczkę do deseru" : r % 4 === 0 ? "Krzesełko dla dziecka" : null,
        },
      });
    }
  }

  console.log(`Seed: ${n} zamówień, ${r} rezerwacji.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
