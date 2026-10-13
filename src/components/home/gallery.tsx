"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gallery } from "@data/restaurant";
import { ChevronLeftIcon, CloseIcon } from "@/components/icons";

// Układ mozaiki: niektóre kadry zajmują dwa wiersze lub dwie kolumny.
const spans = ["row-span-2", "", "md:row-span-2", "col-span-2 md:col-span-1", "", "md:col-span-2"];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = (delta: number) => setOpen((i) => (i === null ? i : (i + delta + gallery.length) % gallery.length));

  return (
    <section aria-labelledby="galeria-h" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
      <h2 id="galeria-h" className="text-4xl sm:text-5xl">
        Zajrzyj do środka
      </h2>
      <ul className="mt-10 grid auto-rows-[9.5rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] md:grid-cols-3 md:gap-4">
        {gallery.map((g, i) => (
          <li key={g.src} className={spans[i]}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group relative block size-full overflow-hidden rounded-2xl"
              aria-label={`Powiększ zdjęcie: ${g.alt}`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(min-width: 768px) 380px, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-castagna/90"
        aria-label="Galeria zdjęć"
      >
        {open !== null && (
          <figure className="relative flex h-[100dvh] w-screen flex-col items-center justify-center p-4">
            <div className="relative h-[75dvh] w-full max-w-5xl">
              <Image src={gallery[open].src} alt={gallery[open].alt} fill sizes="100vw" className="object-contain" />
            </div>
            <figcaption className="mt-4 text-center text-pane">
              {gallery[open].alt}
              <span className="ml-2 text-pane/60 tabular-nums">
                {open + 1}/{gallery.length}
              </span>
            </figcaption>
            <button type="button" onClick={() => setOpen(null)} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-pane text-castagna" aria-label="Zamknij galerię">
              <CloseIcon />
            </button>
            <button type="button" onClick={() => step(-1)} className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-pane/90 text-castagna" aria-label="Poprzednie zdjęcie">
              <ChevronLeftIcon />
            </button>
            <button type="button" onClick={() => step(1)} className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-pane/90 text-castagna" aria-label="Następne zdjęcie">
              <ChevronLeftIcon className="rotate-180" />
            </button>
          </figure>
        )}
      </dialog>
    </section>
  );
}
