"use server";

import { after } from "next/server";
import { restaurant } from "@data/restaurant";
import { db } from "@/lib/db";
import { sendReservationEmails } from "@/lib/mailer";
import { reservationDateRange, reservationTimes } from "@/lib/slots";
import { formatDayLong, zonedToUtc } from "@/lib/time";
import { fieldErrors, reservationInputSchema } from "@/lib/validation";

export type ReservationState =
  | { status: "idle" }
  | { status: "error"; message: string; errors?: Record<string, string>; values?: Record<string, string> }
  | { status: "success"; summary: string };

export async function createReservation(_prev: ReservationState, formData: FormData): Promise<ReservationState> {
  const values = Object.fromEntries(
    ["date", "time", "guests", "name", "phone", "email", "notes"].map((k) => [k, String(formData.get(k) ?? "")]),
  );
  const parsed = reservationInputSchema.safeParse({ ...values, website: String(formData.get("website") ?? "") });
  if (!parsed.success) {
    return { status: "error", message: "Sprawdź zaznaczone pola.", errors: fieldErrors(parsed.error), values };
  }
  const data = parsed.data;
  if (data.website) return { status: "error", message: "Nie udało się wysłać rezerwacji.", values };

  const now = new Date();
  const range = reservationDateRange(now);
  if (data.date < range.min || data.date > range.max) {
    return { status: "error", message: "Wybierz datę z dostępnego zakresu.", errors: { date: "Data poza zakresem." }, values };
  }
  if (!reservationTimes(data.date, now).includes(data.time)) {
    return {
      status: "error",
      message: "O tej godzinie nie przyjmujemy rezerwacji. Wybierz inną.",
      errors: { time: "Niedostępna godzina." },
      values,
    };
  }

  const startsAt = zonedToUtc(data.date, data.time);
  try {
    const booked = await db.reservation.aggregate({
      where: { startsAt, status: { not: "CANCELLED" } },
      _sum: { guests: true },
    });
    const seatsLeft = restaurant.reservations.maxGuestsPerSlot - (booked._sum.guests ?? 0);
    if (data.guests > seatsLeft) {
      return {
        status: "error",
        message:
          seatsLeft > 0
            ? `O ${data.time} zostało już tylko ${seatsLeft} miejsc. Wybierz inną godzinę albo zmniejsz liczbę osób.`
            : `O ${data.time} nie mamy już wolnych stolików. Wybierz inną godzinę.`,
        errors: { time: "Brak miejsc." },
        values,
      };
    }

    const reservation = await db.reservation.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        guests: data.guests,
        startsAt,
        notes: data.notes,
      },
    });
    after(() => sendReservationEmails(reservation));

    const people = data.guests === 1 ? "1 osoba" : data.guests < 5 ? `${data.guests} osoby` : `${data.guests} osób`;
    return { status: "success", summary: `${formatDayLong(data.date)}, godz. ${data.time}, ${people}` };
  } catch (err) {
    console.error("Błąd zapisu rezerwacji:", err);
    return {
      status: "error",
      message: `Nie udało się zapisać rezerwacji. Spróbuj ponownie lub zadzwoń: ${restaurant.phone}.`,
      values,
    };
  }
}
