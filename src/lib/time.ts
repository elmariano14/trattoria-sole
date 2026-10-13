/**
 * Operacje na dacie i godzinie w strefie restauracji (Europe/Warsaw),
 * niezależnie od strefy serwera (Vercel działa w UTC).
 * Daty kalendarzowe trzymamy jako "YYYY-MM-DD", godziny jako "HH:mm".
 */
import type { DayKey } from "@data/restaurant";

export const TIME_ZONE = "Europe/Warsaw";

const WEEKDAYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

export function zonedParts(date: Date, timeZone = TIME_ZONE): ZonedParts {
  const out: Record<string, number> = {};
  for (const p of formatter(timeZone).formatToParts(date)) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return out as ZonedParts;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Data kalendarzowa w strefie restauracji, np. "2026-10-13". */
export function zonedDate(date: Date, timeZone = TIME_ZONE): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Godzina w strefie restauracji, np. "18:45". */
export function zonedTime(date: Date, timeZone = TIME_ZONE): string {
  const p = zonedParts(date, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

function offsetMinutes(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** Zamienia lokalną datę i godzinę restauracji na moment w czasie (UTC). */
export function zonedToUtc(date: string, time: string, timeZone = TIME_ZONE): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = offsetMinutes(new Date(guess), timeZone);
  let utc = guess - first * 60000;
  // Korekta w okolicy zmiany czasu (DST).
  const second = offsetMinutes(new Date(utc), timeZone);
  if (second !== first) utc = guess - second * 60000;
  return new Date(utc);
}

export function dayKeyOf(date: string): DayKey {
  const [y, m, d] = date.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

/** "wtorek, 13 października" */
export function formatDayLong(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

/** "13.10, 18:45" w strefie restauracji. */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
