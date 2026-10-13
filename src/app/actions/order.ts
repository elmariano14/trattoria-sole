"use server";

import { after } from "next/server";
import { restaurant } from "@data/restaurant";
import { getUnavailableDishIdsFresh } from "@/lib/availability";
import { priceCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { sendOrderEmails } from "@/lib/mailer";
import { isValidPickupTime } from "@/lib/slots";
import { fieldErrors, orderInputSchema, type OrderInput } from "@/lib/validation";

export type PlaceOrderResult =
  | { ok: true; id: string; number: string }
  | { ok: false; message: string; errors?: Record<string, string>; slotTaken?: boolean };

class SlotFullError extends Error {}

export async function placeOrder(input: OrderInput): Promise<PlaceOrderResult> {
  const parsed = orderInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Sprawdź zaznaczone pola.", errors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;
  if (data.website) return { ok: false, message: "Nie udało się złożyć zamówienia." };

  const now = new Date();
  const pickupAt = new Date(data.pickupAt);
  if (!isValidPickupTime(pickupAt, now)) {
    return { ok: false, message: "Ten termin odbioru jest już niedostępny. Wybierz inną godzinę.", slotTaken: true };
  }

  const priced = priceCart(data.items, await getUnavailableDishIdsFresh());
  if (!priced.ok) return { ok: false, message: priced.error };

  try {
    const order = await db.$transaction(async (tx) => {
      // Limit zamówień na slot – to on chroni kuchnię przed zatorem w szczycie.
      const taken = await tx.order.count({ where: { pickupAt, status: { not: "CANCELLED" } } });
      if (taken >= restaurant.pickup.maxOrdersPerSlot) throw new SlotFullError();

      const counter = await tx.counter.upsert({
        where: { name: "order" },
        create: { name: "order", value: 1 },
        update: { value: { increment: 1 } },
      });

      return tx.order.create({
        data: {
          number: `TS-${String(counter.value).padStart(4, "0")}`,
          customerName: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes,
          pickupAt,
          totalGrosze: priced.total,
          items: {
            create: priced.lines.map((l) => ({
              dishId: l.dishId,
              name: l.name,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    // Mail wysyłamy po odpowiedzi – klient nie czeka na serwer SMTP.
    after(() => sendOrderEmails(order));

    return { ok: true, id: order.id, number: order.number };
  } catch (err) {
    if (err instanceof SlotFullError) {
      return {
        ok: false,
        message: "Ktoś właśnie zajął ostatnie miejsce w tym terminie. Wybierz inną godzinę odbioru.",
        slotTaken: true,
      };
    }
    console.error("Błąd zapisu zamówienia:", err);
    return { ok: false, message: `Nie udało się zapisać zamówienia. Spróbuj ponownie lub zadzwoń: ${restaurant.phone}.` };
  }
}
