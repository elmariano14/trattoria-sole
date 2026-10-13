import { connection } from "next/server";
import { db } from "@/lib/db";
import { buildPickupDays, pickupDates } from "@/lib/slots";
import { addDays, zonedToUtc } from "@/lib/time";

/** Wolne sloty odbioru na najbliższe dni – zawsze świeże, bez cache. */
export async function GET() {
  await connection();
  const now = new Date();
  const dates = pickupDates(now);
  if (dates.length === 0) return Response.json({ days: [] });

  const from = zonedToUtc(dates[0], "00:00");
  const to = zonedToUtc(addDays(dates.at(-1)!, 1), "00:00");
  const groups = await db.order.groupBy({
    by: ["pickupAt"],
    where: { pickupAt: { gte: from, lt: to }, status: { not: "CANCELLED" } },
    _count: { _all: true },
  });
  const taken = new Map(groups.map((g) => [g.pickupAt.toISOString(), g._count._all]));

  return Response.json(
    { days: buildPickupDays(now, taken) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
