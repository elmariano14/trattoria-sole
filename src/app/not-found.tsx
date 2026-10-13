import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/not-found-content";
import { SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = { title: "Nie znaleziono strony" };

/** Nieznany adres – ta sama rama co reszta strony (nagłówek, stopka, koszyk). */
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
