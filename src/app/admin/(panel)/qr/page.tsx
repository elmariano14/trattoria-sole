import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { menuQrTarget } from "@/lib/qr";

export const metadata: Metadata = { title: "Kod QR do menu" };

export default function QrPage() {
  return (
    <>
      <h1 className="text-4xl">Kod QR do menu</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Wydrukuj i postaw na stolikach. Goście zeskanują kod telefonem i od razu zobaczą aktualne menu z cenami,
        alergenami i dostępnością dań.
      </p>
      <Suspense fallback={<p className="mt-8 text-muted">Wczytywanie…</p>}>
        <Qr />
      </Suspense>
    </>
  );
}

async function Qr() {
  await requireAdmin();
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr]">
      <figure className="rounded-3xl border border-pane-line bg-white p-6">
        {/* eslint-disable-next-line @next/next/no-img-element -- obraz generowany dynamicznie, tylko dla admina */}
        <img src="/admin/qr/png" alt="Kod QR prowadzący do menu restauracji" width={600} height={600} className="h-auto w-full" />
        <figcaption className="mt-3 text-center text-sm break-all text-muted">{menuQrTarget()}</figcaption>
      </figure>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl">Pliki do druku</h2>
          <ul className="mt-3 flex flex-wrap gap-3">
            <li>
              <a href="/admin/qr/png?pobierz" className="btn btn-primary">
                Pobierz kod QR (PNG, 1200 px)
              </a>
            </li>
            <li>
              <a href="/qr/karta-stolik.png" download className="btn btn-ghost">
                Pobierz kartę na stolik (A6)
              </a>
            </li>
          </ul>
        </div>
        <div className="max-w-prose text-sm text-castagna/80">
          <h2 className="font-sans text-base font-semibold text-castagna">Wskazówki</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Drukuj kod w rozmiarze co najmniej 3 × 3 cm, na matowym papierze.</li>
            <li>Kod ma wysoką korekcję błędów, więc zadziała nawet lekko zachlapany.</li>
            <li>
              Kartę na stolik generuje polecenie <code className="rounded bg-pane-deep px-1.5 py-0.5">npm run qr</code>, dla
              adresu z NEXT_PUBLIC_SITE_URL. Uruchom je ponownie po zmianie domeny.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
