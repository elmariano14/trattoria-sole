"use client";

import { useCart } from "@/components/cart/cart-provider";
import { MinusIcon, PlusIcon } from "@/components/icons";
import type { Dish } from "@/lib/menu";

type Props = {
  dish: Pick<Dish, "id" | "name" | "dineInOnly">;
  unavailable?: boolean;
  tone?: "light" | "dark";
};

/** „Dodaj” → po dodaniu zamienia się w licznik ilości. */
export function AddToCart({ dish, unavailable, tone = "light" }: Props) {
  const { quantityOf, add, setQuantity, ready } = useCart();
  const qty = ready ? quantityOf(dish.id) : 0;

  if (dish.dineInOnly) {
    return <span className="text-sm text-muted">Tylko na sali</span>;
  }
  if (unavailable) {
    return (
      <span className="rounded-full bg-pane-deep px-3 py-1.5 text-sm font-medium text-muted">Chwilowo niedostępne</span>
    );
  }

  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(dish.id)}
        className={`btn min-h-10 px-4 py-1.5 text-sm ${tone === "dark" ? "bg-pane text-castagna hover:bg-white" : "btn-primary"}`}
        aria-label={`Dodaj do zamówienia: ${dish.name}`}
      >
        <PlusIcon size={16} />
        Dodaj
      </button>
    );
  }

  const stepper =
    tone === "dark"
      ? "border-pane/40 text-pane [&_button:hover]:bg-pane/10"
      : "border-castagna/25 text-castagna [&_button:hover]:bg-pane-deep";
  return (
    <div className={`inline-flex items-center rounded-full border-[1.5px] ${stepper}`} role="group" aria-label={`Ilość: ${dish.name}`}>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full"
        onClick={() => setQuantity(dish.id, qty - 1)}
        aria-label={qty === 1 ? `Usuń z zamówienia: ${dish.name}` : `Zmniejsz ilość: ${dish.name}`}
      >
        <MinusIcon size={16} />
      </button>
      <span className="min-w-6 text-center font-semibold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full"
        onClick={() => add(dish.id)}
        aria-label={`Zwiększ ilość: ${dish.name}`}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
