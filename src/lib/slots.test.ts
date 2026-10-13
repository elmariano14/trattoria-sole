import { describe, expect, it } from "vitest";
import { restaurant } from "@data/restaurant";
import { addDays, dayKeyOf, zonedDate, zonedTime, zonedToUtc } from "./time";
import { buildPickupDays, isValidPickupTime, openStatus, pickupTimes, reservationTimes } from "./slots";

describe("time", () => {
  it("przelicza czas Warszawy na UTC latem i zimą", () => {
    // 13 października 2026 – czas letni (UTC+2)
    expect(zonedToUtc("2026-10-13", "18:00").toISOString()).toBe("2026-10-13T16:00:00.000Z");
    // 15 grudnia 2026 – czas zimowy (UTC+1)
    expect(zonedToUtc("2026-12-15", "18:00").toISOString()).toBe("2026-12-15T17:00:00.000Z");
  });

  it("obsługuje dzień zmiany czasu (25.10.2026)", () => {
    expect(zonedToUtc("2026-10-25", "12:00").toISOString()).toBe("2026-10-25T11:00:00.000Z");
  });

  it("zwraca datę i godzinę w strefie restauracji", () => {
    const late = new Date("2026-10-13T22:30:00Z"); // 00:30 następnego dnia w Warszawie
    expect(zonedDate(late)).toBe("2026-10-14");
    expect(zonedTime(late)).toBe("00:30");
  });

  it("dni tygodnia i dodawanie dni", () => {
    expect(dayKeyOf("2026-10-13")).toBe("tue");
    expect(dayKeyOf("2026-10-12")).toBe("mon");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("pickup slots", () => {
  it("generuje sloty co 15 min do 30 min przed zamknięciem", () => {
    const times = pickupTimes("2026-10-13"); // wtorek 12–22
    expect(times[0]).toBe("12:15");
    expect(times.at(-1)).toBe("21:30");
    expect(times).toHaveLength(38);
  });

  it("w poniedziałek (zamknięte) nie ma slotów", () => {
    expect(pickupTimes("2026-10-12")).toEqual([]);
  });

  it("pomija sloty bliżej niż 30 min i pokazuje kolejne dni otwarcia", () => {
    const now = zonedToUtc("2026-10-13", "18:05");
    const days = buildPickupDays(now, new Map());
    expect(days.map((d) => d.date)).toEqual(["2026-10-13", "2026-10-14", "2026-10-15"]);
    expect(days[0].slots[0].time).toBe("18:45");
  });

  it("niedziela wieczorem → przeskakuje zamknięty poniedziałek", () => {
    const now = zonedToUtc("2026-10-18", "20:50"); // niedziela, zamknięcie 21:00
    const days = buildPickupDays(now, new Map());
    expect(days[0].date).toBe("2026-10-20"); // wtorek
  });

  it("oznacza pełny slot jako niedostępny", () => {
    const now = zonedToUtc("2026-10-13", "12:00");
    const full = zonedToUtc("2026-10-13", "13:00").toISOString();
    const days = buildPickupDays(now, new Map([[full, restaurant.pickup.maxOrdersPerSlot]]));
    const slot = days[0].slots.find((s) => s.time === "13:00")!;
    expect(slot).toMatchObject({ available: false, left: 0 });
    expect(days[0].slots.find((s) => s.time === "13:15")!.available).toBe(true);
  });

  it("waliduje moment odbioru", () => {
    const now = zonedToUtc("2026-10-13", "12:00");
    expect(isValidPickupTime(zonedToUtc("2026-10-13", "13:00"), now)).toBe(true);
    expect(isValidPickupTime(zonedToUtc("2026-10-13", "12:20"), now)).toBe(false); // za wcześnie
    expect(isValidPickupTime(zonedToUtc("2026-10-13", "13:07"), now)).toBe(false); // poza siatką
    expect(isValidPickupTime(zonedToUtc("2026-10-13", "21:45"), now)).toBe(false); // po ostatnim slocie
  });
});

describe("reservations & open status", () => {
  it("rezerwacje co 30 min, ostatnia 90 min przed zamknięciem", () => {
    const now = zonedToUtc("2026-10-10", "10:00");
    const times = reservationTimes("2026-10-16", now); // piątek 12–23
    expect(times[0]).toBe("12:00");
    expect(times.at(-1)).toBe("21:30");
  });

  it("dziś pomija godziny bliżej niż 60 min", () => {
    const now = zonedToUtc("2026-10-13", "17:10");
    expect(reservationTimes("2026-10-13", now)[0]).toBe("18:30");
  });

  it("status otwarcia", () => {
    expect(openStatus(zonedToUtc("2026-10-13", "13:00"))).toEqual({ open: true, until: "22:00" });
    expect(openStatus(zonedToUtc("2026-10-12", "13:00"))).toEqual({
      open: false,
      nextDate: "2026-10-13",
      nextOpen: "12:00",
    });
  });
});
