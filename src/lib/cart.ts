/**
 * Wycena koszyka. Używana po stronie serwera – ceny zawsze bierzemy z menu,
 * nigdy z tego, co przysłała przeglądarka.
 */
import { getDish } from "./menu";

export type CartLine = { dishId: string; quantity: number };

export type PricedLine = { dishId: string; name: string; unitPrice: number; quantity: number; lineTotal: number };

export type PriceResult =
  | { ok: true; lines: PricedLine[]; total: number }
  | { ok: false; error: string };

export const MAX_QUANTITY = 20;

export function priceCart(lines: CartLine[], unavailable: ReadonlySet<string> = new Set()): PriceResult {
  if (lines.length === 0) return { ok: false, error: "Koszyk jest pusty." };
  const merged = new Map<string, number>();
  for (const l of lines) merged.set(l.dishId, (merged.get(l.dishId) ?? 0) + l.quantity);

  const priced: PricedLine[] = [];
  for (const [dishId, quantity] of merged) {
    const dish = getDish(dishId);
    if (!dish) return { ok: false, error: "Jedno z dań nie jest już w menu. Odśwież stronę." };
    if (dish.dineInOnly) return { ok: false, error: `${dish.name} serwujemy tylko na sali.` };
    if (unavailable.has(dishId)) return { ok: false, error: `${dish.name} jest chwilowo niedostępne. Usuń je z koszyka.` };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY)
      return { ok: false, error: `Nieprawidłowa ilość: ${dish.name}.` };
    priced.push({ dishId, name: dish.name, unitPrice: dish.price, quantity, lineTotal: dish.price * quantity });
  }
  return { ok: true, lines: priced, total: priced.reduce((s, l) => s + l.lineTotal, 0) };
}
