import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { restaurant } from "@data/restaurant";
import { setOrderStatus } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AutoRefresh } from "@/components/auto-refresh";
import { requireAdmin } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { nextOrderActionLabel, nextOrderStatus, orderStatusLabel, type OrderStatus } from "@/lib/status";
import { addDays, formatDayLong, zonedDate, zonedTime, zonedToUtc } from "@/lib/time";

export const metadata: Metadata = { title: "Zamówienia" };

const VIEWS = {
  aktywne: { label: "Do realizacji", statuses: ["NEW", "PREPARING", "READY"] },
  odebrane: { label: "Odebrane", statuses: ["PICKED_UP"] },
  anulowane: { label: "Anulowane", statuses: ["CANCELLED"] },
} as const satisfies Record<string, { label: string; statuses: OrderStatus[] }>;
type View = keyof typeof VIEWS;

const DAYS = { dzis: "Dziś", jutro: "Jutro", "7-dni": "Najbliższe 7 dni" } as const;
type Day = keyof typeof DAYS;

export default function OrdersPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="text-muted">Wczytywanie zamówień…</p>}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();
  await connection();
  const sp = await searchParams;
  const view: View = typeof sp.widok === "string" && sp.widok in VIEWS ? (sp.widok as View) : "aktywne";
  const day: Day = typeof sp.dzien === "string" && sp.dzien in DAYS ? (sp.dzien as Day) : "dzis";

  const today = zonedDate(new Date());
  const from = day === "jutro" ? addDays(today, 1) : today;
  const to = day === "dzis" ? addDays(today, 1) : day === "jutro" ? addDays(today, 2) : addDays(today, 7);
  const range = { gte: zonedToUtc(from, "00:00"), lt: zonedToUtc(to, "00:00") };

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: { pickupAt: range, status: { in: [...VIEWS[view].statuses] } },
      include: { items: true },
      orderBy: [{ pickupAt: "asc" }, { createdAt: "asc" }],
    }),
    db.order.groupBy({ by: ["status"], where: { pickupAt: range }, _count: { _all: true } }),
  ]);
  const countFor = (v: View) =>
    counts.filter((c) => (VIEWS[v].statuses as readonly string[]).includes(c.status)).reduce((s, c) => s + c._count._all, 0);

  const href = (p: { widok?: View; dzien?: Day }) => {
    const q = new URLSearchParams({ widok: p.widok ?? view, dzien: p.dzien ?? day });
    return `/admin?${q}`;
  };

  return (
    <>
      <AutoRefresh seconds={20} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Zamówienia na odbiór</h1>
          <p className="mt-1 text-muted first-letter:uppercase">
            {day === "7-dni" ? `od ${formatDayLong(from)}` : formatDayLong(from)}. Lista odświeża się co 20 sekund.
          </p>
        </div>
        <Tabs items={Object.entries(DAYS).map(([k, label]) => ({ href: href({ dzien: k as Day }), label, active: k === day }))} />
      </div>

      <div className="mt-6">
        <Tabs
          items={(Object.keys(VIEWS) as View[]).map((k) => ({
            href: href({ widok: k }),
            label: `${VIEWS[k].label} (${countFor(k)})`,
            active: k === view,
          }))}
        />
      </div>

      {view === "aktywne" && day === "dzis" && <SlotLoad orders={orders} />}

      {orders.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-pane-line px-6 py-12 text-center text-muted">
          Brak zamówień w tym widoku. Nowe zamówienia pojawią się tu automatycznie.
        </p>
      ) : view === "aktywne" ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-5">
          {(["NEW", "PREPARING", "READY"] as const).map((s) => {
            const list = orders.filter((o) => o.status === s);
            return (
              <section key={s} aria-labelledby={`col-${s}`} className="lg:rounded-3xl lg:bg-pane-deep/40 lg:p-3">
                <h2 id={`col-${s}`} className="mb-3 flex items-center gap-2 px-1 font-sans text-base font-semibold">
                  {orderStatusLabel[s]}
                  <span className="rounded-full bg-castagna px-2 text-sm text-pane">{list.length}</span>
                </h2>
                <ul className="grid gap-3">
                  {list.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </>
  );
}

function Tabs({ items }: { items: { href: string; label: string; active: boolean }[] }) {
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.active ? "page" : undefined}
          className="min-h-10 shrink-0 rounded-full border border-pane-line px-4 py-2 text-sm font-medium whitespace-nowrap hover:border-castagna/50 aria-[current=page]:border-castagna aria-[current=page]:bg-castagna aria-[current=page]:text-pane"
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

type OrderWithItems = Prisma.OrderGetPayload<{ include: { items: true } }>;

/** Obłożenie kuchni w najbliższych slotach – widać, kiedy zbliża się szczyt. */
function SlotLoad({ orders }: { orders: OrderWithItems[] }) {
  const bySlot = new Map<string, number>();
  for (const o of orders) bySlot.set(zonedTime(o.pickupAt), (bySlot.get(zonedTime(o.pickupAt)) ?? 0) + 1);
  if (bySlot.size === 0) return null;
  const max = restaurant.pickup.maxOrdersPerSlot;
  return (
    <section aria-labelledby="load-h" className="mt-6 rounded-3xl border border-pane-line bg-[#fffaf1] p-4">
      <h2 id="load-h" className="font-sans text-sm font-semibold">
        Obłożenie kuchni (limit {max} zamówienia na 15 minut)
      </h2>
      <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
        {[...bySlot.entries()].map(([time, n]) => (
          <li
            key={time}
            className={`shrink-0 rounded-xl px-3 py-1.5 text-sm tabular-nums ${n >= max ? "bg-pomodoro text-white" : "bg-pane-deep"}`}
          >
            <span className="font-semibold">{time}</span> {n}/{max}
            {n >= max && <span className="sr-only"> (pełny)</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function OrderCard({ order }: { order: OrderWithItems }) {
  const status = order.status as OrderStatus;
  const next = nextOrderStatus[status];
  const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <li className="rounded-2xl border border-pane-line bg-[#fffaf1] p-4 shadow-[0_1px_0_rgba(36,21,15,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl leading-none tabular-nums">{zonedTime(order.pickupAt)}</p>
          <p className="mt-1 text-sm text-muted">
            {order.number}, {itemsCount} szt.
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            {
              NEW: "bg-zafferano text-castagna",
              PREPARING: "bg-castagna text-pane",
              READY: "bg-oliva text-pane",
              PICKED_UP: "bg-pane-deep text-muted",
              CANCELLED: "bg-pomodoro/15 text-pomodoro-dark",
            }[status]
          }`}
        >
          {orderStatusLabel[status]}
        </span>
      </div>
      <ul className="mt-3 space-y-0.5 border-t border-pane-line pt-3 text-[0.95rem]">
        {order.items.map((i) => (
          <li key={i.id}>
            <span className="font-semibold tabular-nums">{i.quantity}×</span> {i.name}
          </li>
        ))}
      </ul>
      {order.notes && <p className="mt-2 rounded-xl bg-zafferano/20 px-3 py-2 text-sm">Uwagi: {order.notes}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-pane-line pt-3 text-sm">
        <span>
          {order.customerName},{" "}
          <a href={`tel:${order.phone.replace(/\s/g, "")}`} className="underline underline-offset-2">
            {order.phone}
          </a>
        </span>
        <span className="font-semibold tabular-nums">{formatPrice(order.totalGrosze)}</span>
      </div>
      {status !== "PICKED_UP" && status !== "CANCELLED" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {next && <ActionButton action={setOrderStatus.bind(null, order.id, next)}>{nextOrderActionLabel[status]}</ActionButton>}
          <ActionButton variant="danger" action={setOrderStatus.bind(null, order.id, "CANCELLED")}>
            Anuluj
          </ActionButton>
        </div>
      )}
      {(status === "PICKED_UP" || status === "CANCELLED") && (
        <div className="mt-3">
          <ActionButton variant="ghost" action={setOrderStatus.bind(null, order.id, "NEW")}>
            Przywróć jako nowe
          </ActionButton>
        </div>
      )}
    </li>
  );
}
