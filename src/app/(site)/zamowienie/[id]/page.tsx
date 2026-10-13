import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { restaurant } from "@data/restaurant";
import { AutoRefresh } from "@/components/auto-refresh";
import { CheckIcon, ClockIcon, PinIcon } from "@/components/icons";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { orderStatusLabel, type OrderStatus } from "@/lib/status";
import { formatDateTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Potwierdzenie zamówienia",
  robots: { index: false },
};

const FLOW: OrderStatus[] = ["NEW", "PREPARING", "READY", "PICKED_UP"];

const statusText: Record<OrderStatus, string> = {
  NEW: "Kuchnia otrzymała zamówienie i zacznie je przygotowywać tak, żeby było gotowe na czas.",
  PREPARING: "Twoje dania są właśnie przygotowywane.",
  READY: "Zamówienie czeka na Ciebie. Podaj przy ladzie numer zamówienia.",
  PICKED_UP: "Zamówienie zostało odebrane. Smacznego!",
  CANCELLED: `Zamówienie zostało anulowane. Jeśli to pomyłka, zadzwoń: ${restaurant.phone}.`,
};

export default function OrderConfirmationPage({ params }: PageProps<"/zamowienie/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-pane-deep/60" aria-label="Wczytywanie zamówienia" />}>
        <Confirmation params={params} />
      </Suspense>
    </div>
  );
}

async function Confirmation({ params }: Pick<PageProps<"/zamowienie/[id]">, "params">) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const status = order.status as OrderStatus;
  const current = FLOW.indexOf(status);
  const done = status === "PICKED_UP" || status === "CANCELLED";

  return (
    <>
      {!done && <AutoRefresh seconds={30} />}
      <div className="rounded-[2rem] bg-castagna p-6 text-pane sm:p-8">
        <p className="flex items-center gap-2 text-sm text-zafferano">
          <CheckIcon size={18} /> Zamówienie przyjęte
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Dziękujemy, {order.customerName}!</h1>
        <p className="mt-4 text-pane/80">Numer zamówienia</p>
        <p className="font-display text-6xl tracking-tight">{order.number}</p>
        <div className="mt-6 grid gap-3 border-t border-castagna-line pt-6 sm:grid-cols-2">
          <p className="flex items-start gap-2">
            <ClockIcon className="mt-0.5 shrink-0 text-zafferano" />
            <span>
              Odbiór
              <span className="block font-semibold">{formatDateTime(order.pickupAt)}</span>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <PinIcon className="mt-0.5 shrink-0 text-zafferano" />
            <span>
              {restaurant.address.street}
              <span className="block text-pane/70">{restaurant.address.city}</span>
            </span>
          </p>
        </div>
      </div>

      <section aria-labelledby="status-h" className="mt-10">
        <h2 id="status-h" className="text-3xl">
          Status: {orderStatusLabel[status].toLowerCase()}
        </h2>
        <p className="mt-2 text-castagna/80" aria-live="polite">
          {statusText[status]}
        </p>
        {status !== "CANCELLED" && (
          <ol className="mt-6 grid grid-cols-4 gap-2 text-center text-xs sm:text-sm">
            {FLOW.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-2" aria-current={i === current ? "step" : undefined}>
                <span
                  className={`grid size-9 place-items-center rounded-full border-2 font-semibold ${
                    i < current
                      ? "border-oliva bg-oliva text-pane"
                      : i === current
                        ? "border-pomodoro bg-pomodoro text-white"
                        : "border-pane-line text-muted"
                  }`}
                >
                  {i < current ? <CheckIcon size={16} /> : i + 1}
                </span>
                <span className={i === current ? "font-semibold" : "text-muted"}>{orderStatusLabel[s]}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="pozycje-h" className="mt-10">
        <h2 id="pozycje-h" className="text-3xl">
          Twoje dania
        </h2>
        <ul className="mt-4 divide-y divide-pane-line border-y border-pane-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3">
              <span>
                {i.quantity} × {i.name}
              </span>
              <span className="tabular-nums">{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-xl font-semibold">
          <span>Do zapłaty przy odbiorze</span>
          <span className="tabular-nums">{formatPrice(order.totalGrosze)}</span>
        </p>
        <p className="mt-1 text-sm text-muted">Gotówka lub karta.</p>
      </section>

      <p className="mt-10 text-castagna/80">
        Coś się zmieniło? Zadzwoń:{" "}
        <a href={restaurant.phoneHref} className="font-semibold underline underline-offset-4">
          {restaurant.phone}
        </a>
        . Strona odświeża się sama, możesz ją zostawić otwartą.
      </p>
      <Link href="/menu" className="btn btn-ghost mt-8">
        Wróć do menu
      </Link>
    </>
  );
}
