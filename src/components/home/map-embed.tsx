"use client";

import { useState } from "react";
import { restaurant } from "@data/restaurant";
import { PinIcon } from "@/components/icons";

/**
 * Mapa ładowana dopiero po kliknięciu („fasada”).
 * Osadzona mapa OpenStreetMap to ~300 KB skryptów z zewnętrznej domeny –
 * nie spowalnia więc strony i nie wysyła nic do OSM bez działania gościa.
 */
export function MapEmbed() {
  const [show, setShow] = useState(false);
  const { lat, lng } = restaurant.geo;
  const bbox = [lng - 0.012, lat - 0.0055, lng + 0.012, lat + 0.0055].join(",");
  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="relative min-h-80 overflow-hidden rounded-[2rem] border border-pane-line bg-pane-deep">
      {show ? (
        <iframe
          title="Mapa okolicy restauracji (OpenStreetMap)"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
          className="absolute inset-0 size-full grayscale-[35%] sepia-[25%]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          {/* Umowny „plan miasta” z CSS – zero dodatkowych bajtów. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(28deg,transparent_0_46px,var(--color-pane-line)_46px_49px),repeating-linear-gradient(-62deg,transparent_0_70px,var(--color-pane-line)_70px_72px)]"
          />
          <span aria-hidden className="relative grid size-14 place-items-center rounded-full bg-pomodoro text-white shadow-lg">
            <PinIcon size={26} />
          </span>
          <p className="relative font-semibold">
            {restaurant.address.street}, {restaurant.address.city}
          </p>
          <div className="relative flex flex-wrap justify-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
              Pokaż mapę
            </button>
            <a href={osmLink} target="_blank" rel="noopener noreferrer" className="btn btn-ghost bg-pane/70">
              Otwórz w OpenStreetMap
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </a>
          </div>
          <p className="relative max-w-xs text-xs text-muted">Mapa ładuje się z OpenStreetMap dopiero po kliknięciu.</p>
        </div>
      )}
      <p className="pointer-events-none absolute top-3 left-3 rounded-full bg-pane/90 px-3 py-1 text-xs text-muted">
        Lokalizacja przybliżona, adres fikcyjny
      </p>
    </div>
  );
}
