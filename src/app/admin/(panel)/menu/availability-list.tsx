"use client";

import Image from "next/image";
import { useOptimistic, useTransition } from "react";
import { setDishAvailability } from "@/app/actions/admin";
import { menu } from "@/lib/menu";
import { formatPrice } from "@/lib/money";

export function AvailabilityList({ unavailable }: { unavailable: string[] }) {
  const [optimistic, setOptimistic] = useOptimistic(
    new Set(unavailable),
    (state: Set<string>, change: { id: string; available: boolean }) => {
      const next = new Set(state);
      if (change.available) next.delete(change.id);
      else next.add(change.id);
      return next;
    },
  );
  const [, startTransition] = useTransition();

  const toggle = (id: string, available: boolean) =>
    startTransition(async () => {
      setOptimistic({ id, available });
      await setDishAvailability(id, available);
    });

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      {menu.categories.map((c) => (
        <section key={c.id} aria-labelledby={`cat-${c.id}`}>
          <h2 id={`cat-${c.id}`} className="text-2xl">
            {c.name}
          </h2>
          <ul className="mt-3 divide-y divide-pane-line overflow-hidden rounded-2xl border border-pane-line bg-[#fffaf1]">
            {menu.dishes
              .filter((d) => d.category === c.id)
              .map((d) => {
                const available = !optimistic.has(d.id);
                return (
                  <li key={d.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`relative size-11 shrink-0 overflow-hidden rounded-full ${available ? "" : "grayscale"}`}>
                      <Image src={d.image} alt="" fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${available ? "" : "text-muted line-through"}`}>{d.name}</p>
                      <p className="text-sm text-muted tabular-nums">{formatPrice(d.price)}</p>
                    </div>
                    <label className="flex cursor-pointer items-center gap-3">
                      <span className={`hidden text-sm sm:inline ${available ? "text-oliva" : "text-pomodoro"}`}>
                        {available ? "Dostępne" : "Niedostępne"}
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        className="peer sr-only"
                        checked={available}
                        onChange={(e) => toggle(d.id, e.target.checked)}
                        aria-label={`${d.name}: ${available ? "dostępne" : "chwilowo niedostępne"}`}
                      />
                      <span
                        aria-hidden
                        className="relative h-7 w-12 rounded-full bg-pane-line transition-colors peer-checked:bg-oliva peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zafferano after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
                      />
                    </label>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
