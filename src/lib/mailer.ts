import "server-only";
import nodemailer from "nodemailer";
import { restaurant } from "@data/restaurant";
import { formatPrice } from "./money";
import { formatDateTime } from "./time";

type Mail = { to: string; subject: string; text: string };

/**
 * MAIL_MODE=console (domyślnie) – tryb demo: treść maila trafia do logów serwera.
 * MAIL_MODE=smtp – prawdziwa wysyłka przez SMTP_HOST/SMTP_USER/SMTP_PASS.
 */
async function send(mail: Mail) {
  const mode = process.env.MAIL_MODE ?? "console";
  if (mode === "smtp" && process.env.SMTP_HOST) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: process.env.MAIL_FROM ?? restaurant.email, ...mail });
    return;
  }
  const line = "─".repeat(60);
  console.log(`\n┌${line}\n│ [MAIL demo] Do: ${mail.to}\n│ Temat: ${mail.subject}\n├${line}`);
  for (const l of mail.text.split("\n")) console.log(`│ ${l}`);
  console.log(`└${line}\n`);
}

/** Błąd wysyłki nie może cofnąć przyjętego zamówienia – tylko go logujemy. */
async function sendSafely(mail: Mail) {
  try {
    await send(mail);
  } catch (err) {
    console.error("Nie udało się wysłać maila:", mail.subject, err);
  }
}

const kitchen = () => process.env.RESTAURANT_EMAIL ?? "kuchnia@trattoria-sole.example";

type OrderMail = {
  number: string;
  customerName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  pickupAt: Date;
  totalGrosze: number;
  items: { name: string; quantity: number; unitPrice: number }[];
};

export async function sendOrderEmails(order: OrderMail) {
  const lines = order.items.map((i) => `${i.quantity} × ${i.name}  ${formatPrice(i.unitPrice * i.quantity)}`).join("\n");
  const when = formatDateTime(order.pickupAt);

  await sendSafely({
    to: kitchen(),
    subject: `Nowe zamówienie ${order.number} – odbiór ${when}`,
    text: [
      `Zamówienie ${order.number}`,
      `Odbiór: ${when}`,
      "",
      lines,
      "",
      `Razem: ${formatPrice(order.totalGrosze)} (płatność przy odbiorze)`,
      "",
      `Klient: ${order.customerName}, tel. ${order.phone}${order.email ? `, ${order.email}` : ""}`,
      order.notes ? `Uwagi: ${order.notes}` : "",
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n"),
  });

  if (order.email) {
    await sendSafely({
      to: order.email,
      subject: `Trattoria Sole: przyjęliśmy zamówienie ${order.number}`,
      text: [
        `Dzień dobry ${order.customerName},`,
        "",
        `dziękujemy za zamówienie. Będzie gotowe do odbioru ${when}.`,
        `Adres: ${restaurant.address.street}, ${restaurant.address.city}.`,
        "",
        lines,
        "",
        `Do zapłaty przy odbiorze: ${formatPrice(order.totalGrosze)} (gotówka lub karta).`,
        "",
        `Zmiana planów? Zadzwoń: ${restaurant.phone}.`,
        "Trattoria Sole",
      ].join("\n"),
    });
  }
}

type ReservationMail = {
  name: string;
  phone: string;
  email?: string | null;
  guests: number;
  startsAt: Date;
  notes?: string | null;
};

export async function sendReservationEmails(r: ReservationMail) {
  const when = formatDateTime(r.startsAt);
  await sendSafely({
    to: kitchen(),
    subject: `Nowa rezerwacja: ${when}, ${r.guests} os.`,
    text: [
      `Rezerwacja na ${when}`,
      `Liczba osób: ${r.guests}`,
      `Gość: ${r.name}, tel. ${r.phone}${r.email ? `, ${r.email}` : ""}`,
      r.notes ? `Uwagi: ${r.notes}` : "",
      "",
      "Potwierdź rezerwację w panelu: /admin/rezerwacje",
    ].join("\n"),
  });
  if (r.email) {
    await sendSafely({
      to: r.email,
      subject: "Trattoria Sole: otrzymaliśmy prośbę o rezerwację",
      text: [
        `Dzień dobry ${r.name},`,
        "",
        `otrzymaliśmy rezerwację na ${when} dla ${r.guests} os.`,
        "Potwierdzimy ją telefonicznie lub SMS-em.",
        "",
        "Trattoria Sole",
      ].join("\n"),
    });
  }
}
