/**
 * Sloty odbioru i rezerwacji. Czyste funkcje – liczby zajętości (z bazy)
 * przekazuje wywołujący, dzięki czemu logikę łatwo przetestować.
 */
import { restaurant } from "@data/restaurant";
import { addDays, dayKeyOf, formatDayLong, fromMinutes, toMinutes, zonedDate, zonedToUtc } from "./time";

type Config = typeof restaurant;

export type PickupSlot = { time: string; iso: string; left: number; available: boolean };
export type PickupDay = { date: string; label: string; slots: PickupSlot[] };

export function hoursFor(date: string, config: Config = restaurant) {
  return config.hours[dayKeyOf(date)];
}

/** Czy restauracja jest teraz otwarta (w jej strefie czasowej). */
export function openStatus(now: Date, config: Config = restaurant) {
  const today = zonedDate(now, config.timeZone);
  const hours = hoursFor(today, config);
  if (hours) {
    const open = zonedToUtc(today, hours.open, config.timeZone);
    const close = zonedToUtc(today, hours.close, config.timeZone);
    if (now >= open && now < close) return { open: true as const, until: hours.close };
  }
  // Najbliższe otwarcie w ciągu tygodnia.
  for (let i = 0; i < 8; i++) {
    const date = addDays(today, i);
    const h = hoursFor(date, config);
    if (!h) continue;
    if (zonedToUtc(date, h.open, config.timeZone) > now) return { open: false as const, nextDate: date, nextOpen: h.open };
  }
  return { open: false as const };
}

/** Godziny slotów odbioru danego dnia (bez uwzględniania „teraz”). */
export function pickupTimes(date: string, config: Config = restaurant): string[] {
  const hours = hoursFor(date, config);
  if (!hours) return [];
  const { slotMinutes, lastOrderBeforeCloseMinutes } = config.pickup;
  const first = toMinutes(hours.open) + slotMinutes;
  const last = toMinutes(hours.close) - lastOrderBeforeCloseMinutes;
  const times: string[] = [];
  for (let t = first; t <= last; t += slotMinutes) times.push(fromMinutes(t));
  return times;
}

/** Najbliższe dni otwarcia, w które można odebrać zamówienie. */
export function pickupDates(now: Date, config: Config = restaurant): string[] {
  const today = zonedDate(now, config.timeZone);
  const dates: string[] = [];
  for (let i = 0; i < 14 && dates.length < config.pickup.daysAhead; i++) {
    const date = addDays(today, i);
    if (hoursFor(date, config)) dates.push(date);
  }
  return dates;
}

/**
 * Pełna siatka slotów odbioru.
 * @param taken liczba zamówień na slot, klucz = ISO momentu odbioru
 */
export function buildPickupDays(now: Date, taken: Map<string, number>, config: Config = restaurant): PickupDay[] {
  const earliest = now.getTime() + config.pickup.leadMinutes * 60_000;
  return pickupDates(now, config)
    .map((date) => {
      const slots = pickupTimes(date, config)
        .map((time) => {
          const at = zonedToUtc(date, time, config.timeZone);
          const iso = at.toISOString();
          const left = Math.max(0, config.pickup.maxOrdersPerSlot - (taken.get(iso) ?? 0));
          return { time, iso, at, left };
        })
        .filter((s) => s.at.getTime() >= earliest)
        .map(({ time, iso, left }) => ({ time, iso, left, available: left > 0 }));
      return { date, label: formatDayLong(date), slots };
    })
    .filter((d) => d.slots.length > 0);
}

/** Czy podany moment odbioru jest poprawnym slotem (pomijając limit). */
export function isValidPickupTime(at: Date, now: Date, config: Config = restaurant): boolean {
  if (at.getTime() < now.getTime() + config.pickup.leadMinutes * 60_000) return false;
  return pickupDates(now, config).some((date) =>
    pickupTimes(date, config).some((time) => zonedToUtc(date, time, config.timeZone).getTime() === at.getTime()),
  );
}

/** Godziny rezerwacji danego dnia; dla dzisiejszej daty pomija te, które już minęły. */
export function reservationTimes(date: string, now: Date, config: Config = restaurant): string[] {
  const hours = hoursFor(date, config);
  if (!hours) return [];
  const { slotMinutes, lastBeforeCloseMinutes, leadMinutes } = config.reservations;
  const earliest = now.getTime() + leadMinutes * 60_000;
  const times: string[] = [];
  for (let t = toMinutes(hours.open); t <= toMinutes(hours.close) - lastBeforeCloseMinutes; t += slotMinutes) {
    const time = fromMinutes(t);
    if (zonedToUtc(date, time, config.timeZone).getTime() >= earliest) times.push(time);
  }
  return times;
}

export function reservationDateRange(now: Date, config: Config = restaurant) {
  const min = zonedDate(now, config.timeZone);
  return { min, max: addDays(min, config.reservations.daysAhead) };
}
