import { z } from "zod";
import { restaurant } from "@data/restaurant";
import { MAX_QUANTITY } from "./cart";

/** Akceptuje 9 cyfr z opcjonalnym +48 i separatorami; zwraca "+48 000 000 000". */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-()]/g, ""))
  .refine((v) => /^(\+48|0048)?\d{9}$/.test(v), "Podaj numer telefonu: 9 cyfr.")
  .transform((v) => {
    const d = v.slice(-9);
    return `+48 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  });

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.email("Sprawdź adres e-mail.").optional());

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków.`)
    .transform((v) => (v === "" ? undefined : v));

const name = z.string().trim().min(2, "Podaj imię (min. 2 znaki).").max(60, "Maksymalnie 60 znaków.");

export const orderInputSchema = z.object({
  items: z
    .array(z.object({ dishId: z.string().max(80), quantity: z.number().int().min(1).max(MAX_QUANTITY) }))
    .min(1, "Koszyk jest pusty.")
    .max(40),
  pickupAt: z.iso.datetime({ message: "Wybierz godzinę odbioru." }),
  name,
  phone: phoneSchema,
  email: optionalEmail,
  notes: optionalText(300),
  /** Pole-pułapka na boty: ludzie go nie widzą. */
  website: z.string().max(0).optional(),
});

export type OrderInput = z.input<typeof orderInputSchema>;

export const reservationInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Wybierz datę."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Wybierz godzinę."),
  guests: z.coerce
    .number({ message: "Podaj liczbę osób." })
    .int()
    .min(1, "Minimum 1 osoba.")
    .max(restaurant.reservations.maxGuestsOnline, `Online rezerwujemy do ${restaurant.reservations.maxGuestsOnline} osób. Przy większej grupie zadzwoń.`),
  name,
  phone: phoneSchema,
  email: optionalEmail,
  notes: optionalText(300),
  website: z.string().max(0).optional(),
});

/** Błędy pól z zod w kształcie { pole: "komunikat" }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
