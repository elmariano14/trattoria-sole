"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_QUANTITY, type CartLine } from "@/lib/cart";
import { getDish } from "@/lib/menu";

const STORAGE_KEY = "sole-cart-v1";

type CartContextValue = {
  lines: CartLine[];
  /** false do czasu odczytu localStorage – unikamy mignięcia pustego koszyka. */
  ready: boolean;
  count: number;
  /** Suma do wyświetlenia; ostateczną cenę liczy serwer. */
  total: number;
  quantityOf: (dishId: string) => number;
  add: (dishId: string) => void;
  setQuantity: (dishId: string, quantity: number) => void;
  remove: (dishId: string) => void;
  clear: () => void;
  lastAdded: { dishId: string; at: number } | null;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    // Pomijamy dania, których nie ma już w menu albo nie można ich zamówić.
    return parsed.filter(
      (l): l is CartLine =>
        typeof l?.dishId === "string" &&
        Number.isInteger(l?.quantity) &&
        l.quantity > 0 &&
        !!getDish(l.dishId) &&
        !getDish(l.dishId)!.dineInOnly,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartContextValue["lastAdded"]>(null);

  useEffect(() => {
    // Odczyt localStorage możliwy dopiero w przeglądarce, po hydracji.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLines(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setLines(readStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Tryb prywatny / pełna pamięć – koszyk działa dalej w pamięci.
    }
  }, [lines, ready]);

  const setQuantity = useCallback((dishId: string, quantity: number) => {
    setLines((prev) => {
      const q = Math.max(0, Math.min(MAX_QUANTITY, quantity));
      if (q === 0) return prev.filter((l) => l.dishId !== dishId);
      return prev.some((l) => l.dishId === dishId)
        ? prev.map((l) => (l.dishId === dishId ? { ...l, quantity: q } : l))
        : [...prev, { dishId, quantity: q }];
    });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const quantityOf = (dishId: string) => lines.find((l) => l.dishId === dishId)?.quantity ?? 0;
    return {
      lines,
      ready,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      total: lines.reduce((s, l) => s + (getDish(l.dishId)?.price ?? 0) * l.quantity, 0),
      quantityOf,
      add: (dishId) => {
        setQuantity(dishId, quantityOf(dishId) + 1);
        setLastAdded({ dishId, at: Date.now() });
      },
      setQuantity,
      remove: (dishId) => setQuantity(dishId, 0),
      clear: () => setLines([]),
      lastAdded,
    };
  }, [lines, ready, lastAdded, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart musi być użyty wewnątrz <CartProvider>");
  return ctx;
}
