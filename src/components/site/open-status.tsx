"use client";

import { useEffect, useState } from "react";
import { openStatus } from "@/lib/slots";
import { addDays, formatDayLong, zonedDate } from "@/lib/time";

/**
 * „Otwarte do 22:00” / „Zamknięte, otwieramy jutro o 12:00”.
 * Liczone w przeglądarce, żeby statyczna strona zawsze pokazywała aktualny stan.
 */
export function OpenStatus({ className = "" }: { className?: string }) {
  const [text, setText] = useState<{ open: boolean; label: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const s = openStatus(now);
      if (s.open) return setText({ open: true, label: `Teraz otwarte, do ${s.until}` });
      if (!("nextDate" in s) || !s.nextDate) return setText({ open: false, label: "Teraz zamknięte" });
      const today = zonedDate(now);
      const day =
        s.nextDate === today ? "dziś" : s.nextDate === addDays(today, 1) ? "jutro" : formatDayLong(s.nextDate).split(",")[0];
      setText({ open: false, label: `Teraz zamknięte, otwieramy ${day} o ${s.nextOpen}` });
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={`flex min-h-6 items-center gap-2 text-sm ${className}`} aria-live="polite">
      {text && (
        <>
          <span
            className={`size-2.5 rounded-full ${text.open ? "bg-[#7fb069] shadow-[0_0_0_4px_rgba(127,176,105,0.22)]" : "bg-current opacity-50"}`}
            aria-hidden
          />
          {text.label}
        </>
      )}
    </p>
  );
}
