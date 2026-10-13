"use client";

import Link from "next/link";
import { useActionState, useEffect, useId, useState } from "react";
import { restaurant } from "@data/restaurant";
import { createReservation, type ReservationState } from "@/app/actions/reservation";
import { CheckIcon } from "@/components/icons";
import { reservationDateRange, reservationTimes } from "@/lib/slots";
import { formatDayLong } from "@/lib/time";

const initial: ReservationState = { status: "idle" };

export function ReservationForm() {
  const [state, action, pending] = useActionState(createReservation, initial);
  const id = useId();
  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  // Zakres dat i godziny zależą od „teraz” – liczymy je w przeglądarce.
  const [range, setRange] = useState<{ min: string; max: string } | null>(null);
  const [date, setDate] = useState(values?.date ?? "");
  const [times, setTimes] = useState<string[]>([]);
  const [time, setTime] = useState(values?.time ?? "");

  useEffect(() => {
    const r = reservationDateRange(new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRange(r);
    setDate((d) => d || r.min);
  }, []);

  useEffect(() => {
    if (!date) return;
    const t = reservationTimes(date, new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimes(t);
    setTime((cur) => (t.includes(cur) ? cur : (t.find((x) => x >= "18:00") ?? t[0] ?? "")));
  }, [date]);

  if (state.status === "success") {
    return (
      <div className="rounded-[2rem] bg-castagna p-6 text-pane sm:p-8" role="status">
        <p className="flex items-center gap-2 text-zafferano">
          <CheckIcon /> Rezerwacja wysłana
        </p>
        <h2 className="mt-3 text-4xl first-letter:uppercase">{state.summary}</h2>
        <p className="mt-4 max-w-md text-pane/80">
          Potwierdzimy rezerwację telefonicznie lub SMS-em w ciągu godziny (w godzinach otwarcia). Do zobaczenia!
        </p>
        <Link href="/menu" className="btn btn-ghost-dark mt-8">
          Zajrzyj do menu
        </Link>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="field-error">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined });

  return (
    <form action={action} noValidate className="grid gap-5">
      {state.status === "error" && (
        <p role="alert" className="rounded-2xl border border-pomodoro/30 bg-pomodoro/8 px-4 py-3 text-pomodoro-dark">
          {state.message}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <label htmlFor={`${id}-date`} className="field-label">
            Data
          </label>
          <input
            id={`${id}-date`}
            name="date"
            type="date"
            required
            className="field"
            min={range?.min}
            max={range?.max}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            {...a11y("date")}
          />
          {date && <p className="mt-1.5 text-sm text-muted first-letter:uppercase">{formatDayLong(date)}</p>}
          {err("date")}
        </div>
        <div>
          <label htmlFor={`${id}-time`} className="field-label">
            Godzina
          </label>
          <select id={`${id}-time`} name="time" required className="field" value={time} onChange={(e) => setTime(e.target.value)} disabled={times.length === 0} {...a11y("time")}>
            {times.length === 0 ? <option value="">Nieczynne</option> : times.map((t) => <option key={t}>{t}</option>)}
          </select>
          {err("time")}
        </div>
        <div>
          <label htmlFor={`${id}-guests`} className="field-label">
            Liczba osób
          </label>
          <select id={`${id}-guests`} name="guests" className="field" defaultValue={values?.guests ?? "2"} {...a11y("guests")}>
            {Array.from({ length: restaurant.reservations.maxGuestsOnline }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {err("guests")}
        </div>
      </div>
      {date && times.length === 0 && (
        <p className="text-sm text-muted">W ten dzień nie przyjmujemy już rezerwacji (w poniedziałki restauracja jest nieczynna). Wybierz inną datę.</p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="field-label">
            Imię i nazwisko
          </label>
          <input id={`${id}-name`} name="name" className="field" autoComplete="name" required defaultValue={values?.name} placeholder="Jan Kowalski" {...a11y("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="field-label">
            Telefon
          </label>
          <input id={`${id}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" required defaultValue={values?.phone} placeholder="000 000 000" {...a11y("phone")} />
          {err("phone")}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-email`} className="field-label">
          E-mail (opcjonalnie)
        </label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" className="field" defaultValue={values?.email} placeholder="jan.kowalski@example.com" {...a11y("email")} />
        {err("email")}
      </div>
      <div>
        <label htmlFor={`${id}-notes`} className="field-label">
          Uwagi (opcjonalnie)
        </label>
        <textarea id={`${id}-notes`} name="notes" maxLength={300} className="field min-h-24" defaultValue={values?.notes} placeholder="Np. krzesełko dla dziecka, stolik przy oknie, urodziny" />
      </div>
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor={`${id}-website`}>Strona www</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <button className="btn btn-primary px-8" disabled={pending || times.length === 0}>
          {pending ? "Wysyłamy…" : "Zarezerwuj stolik"}
        </button>
        <p className="text-sm text-muted">
          Więcej niż {restaurant.reservations.maxGuestsOnline} osób? Zadzwoń:{" "}
          <a href={restaurant.phoneHref} className="font-semibold text-castagna underline underline-offset-4">
            {restaurant.phone}
          </a>
        </p>
      </div>
    </form>
  );
}
