"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart-provider";
import { formatPrice } from "@/lib/money";
import { getDish } from "@/lib/menu";

/** Pływający pasek koszyka na dole ekranu – główna droga do zamówienia na telefonie. */
export function CartBar() {
  const { count, total, ready, lastAdded } = useCart();
  const pathname = usePathname();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    // Krótki komunikat po dodaniu dania, ogłaszany też czytnikom ekranu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToast(`Dodano: ${getDish(lastAdded.dishId)?.name ?? "danie"}`);
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [lastAdded]);

  if (!ready || count === 0 || pathname.startsWith("/zamowienie")) return null;

  const items = count === 1 ? "1 pozycja" : count < 5 ? `${count} pozycje` : `${count} pozycji`;

  return (
    <aside aria-label="Twoje zamówienie" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <p role="status" aria-live="polite" className="sr-only">
        {toast}
      </p>
      <Link
        href="/zamowienie"
        className="pointer-events-auto mx-auto flex max-w-md items-center gap-3 rounded-full bg-castagna py-2 pr-2 pl-5 text-pane shadow-[0_10px_30px_-10px_rgba(36,21,15,0.7)]"
      >
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm text-pane/75">{toast ?? `Twoje zamówienie: ${items}`}</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </span>
        <span className="btn btn-primary ml-auto shrink-0">Przejdź do zamówienia</span>
      </Link>
    </aside>
  );
}
