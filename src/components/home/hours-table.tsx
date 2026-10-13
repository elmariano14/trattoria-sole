"use client";

import { useEffect, useState } from "react";
import { dayNames, dayOrder, restaurant, type DayKey } from "@data/restaurant";
import { dayKeyOf, zonedDate } from "@/lib/time";

/** Tabela godzin z wyróżnionym dzisiejszym dniem (liczonym w strefie restauracji). */
export function HoursTable() {
  const [today, setToday] = useState<DayKey | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(dayKeyOf(zonedDate(new Date())));
  }, []);

  return (
    <table className="mt-8 w-full max-w-sm text-left">
      <caption className="sr-only">Godziny otwarcia</caption>
      <tbody>
        {dayOrder.map((d) => {
          const h = restaurant.hours[d];
          const isToday = d === today;
          return (
            <tr key={d} className={`border-b border-pane-line ${isToday ? "font-semibold" : ""}`}>
              <th scope="row" className="py-2.5 font-normal">
                <span className={isToday ? "font-semibold" : ""}>{dayNames[d]}</span>
                {isToday && <span className="ml-2 rounded-full bg-zafferano px-2 py-0.5 text-xs text-castagna">dziś</span>}
              </th>
              <td className={`py-2.5 text-right tabular-nums ${h ? "" : "text-muted"}`}>
                {h ? `${h.open}–${h.close}` : "nieczynne"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
