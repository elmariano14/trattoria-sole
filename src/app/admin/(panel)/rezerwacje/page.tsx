import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { restaurant } from "@data/restaurant";
import { setReservationStatus } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AutoRefresh } from "@/components/auto-refresh";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { reservationStatusLabel, type ReservationStatus } from "@/lib/status";
import { addDays, formatDayLong, zonedDate, zonedTime, zonedToUtc } from "@/lib/time";

export const metadata: Metadata = { title: "Rezerwacje" };

const RANGES = { dzis: "Dziś", jutro: "Jutro", "14-dni": "Najbliższe 14 dni" } as const;
type Range = keyof typeof RANGES;

export default function ReservationsPage({ searchParams }: PageProps<"/admin/rezerwacje">) {
  return (
    <Suspense fallback={<p className="text-muted">Wczytywanie rezerwacji…</p>}>
      <Reservations searchParams={searchParams} />
    </Suspense>
  );
}

async function Reservations({ searchParams }: Pick<PageProps<"/admin/rezerwacje">, "searchParams">) {
  await requireAdmin();
  await connection();
  const sp = await searchParams;
  const range: Range = typeof sp.zakres === "string" && sp.zakres in RANGES ? (sp.zakres as Range) : "14-dni";

  const today = zonedDate(new Date());
  const from = range === "jutro" ? addDays(today, 1) : today;
  const to = range === "dzis" ? addDays(today, 1) : range === "jutro" ? addDays(today, 2) : addDays(today, 14);

  const reservations = await db.reservation.findMany({
    where: { startsAt: { gte: zonedToUtc(from, "00:00"), lt: zonedToUtc(to, "00:00") } },
    orderBy: { startsAt: "asc" },
  });

  const byDay = new Map<string, typeof reservations>();
  for (const r of reservations) {
    const d = zonedDate(r.startsAt);
    byDay.set(d, [...(byDay.get(d) ?? []), r]);
  }
  const pending = reservations.filter((r) => r.status === "NEW").length;

  return (
    <>
      <AutoRefresh seconds={30} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Rezerwacje</h1>
          <p className="mt-1 text-muted">
            {pending > 0 ? `Do potwierdzenia: ${pending}.` : "Wszystkie rezerwacje są potwierdzone."} Limit:{" "}
            {restaurant.reservations.maxGuestsPerSlot} osób na pół godziny.
          </p>
        </div>
        <nav aria-label="Zakres dat" className="no-scrollbar flex gap-1 overflow-x-auto">
          {(Object.keys(RANGES) as Range[]).map((k) => (
            <Link
              key={k}
              href={`/admin/rezerwacje?zakres=${k}`}
              aria-current={k === range ? "page" : undefined}
              className="min-h-10 shrink-0 rounded-full border border-pane-line px-4 py-2 text-sm font-medium whitespace-nowrap aria-[current=page]:border-castagna aria-[current=page]:bg-castagna aria-[current=page]:text-pane"
            >
              {RANGES[k]}
            </Link>
          ))}
        </nav>
      </div>

      {reservations.length === 0 && (
        <p className="mt-10 rounded-3xl border border-dashed border-pane-line px-6 py-12 text-center text-muted">
          Brak rezerwacji w wybranym okresie.
        </p>
      )}

      {[...byDay.entries()].map(([date, list]) => {
        const guests = list.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + r.guests, 0);
        return (
          <section key={date} aria-labelledby={`d-${date}`} className="mt-10">
            <h2 id={`d-${date}`} className="flex flex-wrap items-baseline gap-x-3 text-2xl first-letter:uppercase">
              {formatDayLong(date)}
              <span className="font-sans text-sm font-medium text-muted">
                {list.length} rez., {guests} os.
              </span>
            </h2>
            <ul className="mt-3 divide-y divide-pane-line overflow-hidden rounded-2xl border border-pane-line bg-[#fffaf1]">
              {list.map((r) => {
                const status = r.status as ReservationStatus;
                return (
                  <li key={r.id} className={`grid gap-3 p-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center ${status === "CANCELLED" ? "opacity-55" : ""}`}>
                    <p className="font-display text-3xl tabular-nums">{zonedTime(r.startsAt)}</p>
                    <div>
                      <p className="font-semibold">
                        {r.name}, {r.guests} {r.guests === 1 ? "osoba" : r.guests < 5 ? "osoby" : "osób"}
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            { NEW: "bg-zafferano text-castagna", CONFIRMED: "bg-oliva text-pane", CANCELLED: "bg-pomodoro/15 text-pomodoro-dark" }[status]
                          }`}
                        >
                          {reservationStatusLabel[status]}
                        </span>
                      </p>
                      <p className="text-sm text-muted">
                        <a href={`tel:${r.phone.replace(/\s/g, "")}`} className="underline underline-offset-2">
                          {r.phone}
                        </a>
                        {r.email && <>, {r.email}</>}
                      </p>
                      {r.notes && <p className="mt-1 text-sm">Uwagi: {r.notes}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {status === "NEW" && <ActionButton action={setReservationStatus.bind(null, r.id, "CONFIRMED")}>Potwierdź</ActionButton>}
                      {status !== "CANCELLED" ? (
                        <ActionButton variant="danger" action={setReservationStatus.bind(null, r.id, "CANCELLED")}>
                          Anuluj
                        </ActionButton>
                      ) : (
                        <ActionButton variant="ghost" action={setReservationStatus.bind(null, r.id, "NEW")}>
                          Przywróć
                        </ActionButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
