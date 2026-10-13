"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChiliIcon, LeafIcon, WheatOffIcon } from "@/components/icons";
import { menu, type Dish } from "@/lib/menu";
import { formatPrice } from "@/lib/money";
import { AddToCart } from "./add-to-cart";
import { Allergens, DietBadges } from "./dish-badges";

type Filter = "wege" | "bez-glutenu" | "ostre";

const FILTERS: { id: Filter; label: string; icon: React.ReactNode; test: (d: Dish) => boolean }[] = [
  { id: "wege", label: "Wegetariańskie", icon: <LeafIcon size={16} />, test: (d) => d.vegetarian },
  { id: "bez-glutenu", label: "Bez glutenu", icon: <WheatOffIcon size={16} />, test: (d) => d.glutenFree },
  { id: "ostre", label: "Ostre", icon: <ChiliIcon size={16} />, test: (d) => d.spicy > 0 },
];

function readFiltersFromUrl(): Filter[] {
  const raw = new URLSearchParams(window.location.search).get("filtr") ?? "";
  return raw.split(",").filter((f): f is Filter => FILTERS.some((x) => x.id === f));
}

export function MenuBrowser({ unavailable }: { unavailable: string[] }) {
  const unavailableSet = useMemo(() => new Set(unavailable), [unavailable]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [active, setActive] = useState(menu.categories[0].id);
  const navRef = useRef<HTMLDivElement>(null);

  // Filtry w adresie URL – link „menu bez glutenu” można komuś wysłać.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(readFiltersFromUrl());
  }, []);

  const toggle = (f: Filter) => {
    const next = filters.includes(f) ? filters.filter((x) => x !== f) : [...filters, f];
    setFilters(next);
    const url = new URL(window.location.href);
    if (next.length) url.searchParams.set("filtr", next.join(","));
    else url.searchParams.delete("filtr");
    window.history.replaceState(null, "", url);
  };

  const sections = useMemo(() => {
    const tests = FILTERS.filter((f) => filters.includes(f.id)).map((f) => f.test);
    return menu.categories
      .map((c) => ({ ...c, dishes: menu.dishes.filter((d) => d.category === c.id && tests.every((t) => t(d))) }))
      .filter((c) => c.dishes.length > 0);
  }, [filters]);
  const shown = sections.reduce((s, c) => s + c.dishes.length, 0);

  // Podświetlenie kategorii, którą właśnie widać na ekranie.
  // Aktywna jest ostatnia sekcja, której początek minął dolną krawędź paska.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = (navRef.current?.parentElement?.parentElement?.offsetHeight ?? 100) + 24;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = s.id;
      }
      if (current) setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  // Aktywna zakładka zawsze widoczna w poziomo przewijanym pasku.
  useEffect(() => {
    const nav = navRef.current;
    const pill = nav?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (nav && pill) nav.scrollTo({ left: pill.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-pane-line bg-pane/95 backdrop-blur supports-[backdrop-filter]:bg-pane/85">
        <nav aria-label="Kategorie menu" className="mx-auto max-w-6xl">
          <div ref={navRef} className="no-scrollbar flex gap-1 overflow-x-auto px-4 pt-2 sm:px-6">
            {sections.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                data-cat={c.id}
                aria-current={active === c.id ? "true" : undefined}
                className="relative shrink-0 px-3 py-2.5 font-display text-lg whitespace-nowrap text-castagna/65 transition-colors hover:text-castagna aria-[current=true]:text-castagna"
              >
                {c.name}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 -bottom-px h-[3px] rounded-full bg-pomodoro transition-opacity ${active === c.id ? "opacity-100" : "opacity-0"}`}
                />
              </a>
            ))}
          </div>
        </nav>
        <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar sm:px-6" role="group" aria-label="Filtry">
          {FILTERS.map((f) => {
            const on = filters.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(f.id)}
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3 text-sm font-medium transition-colors ${
                  on ? "border-castagna bg-castagna text-pane" : "border-pane-line bg-[#fffaf1] text-castagna hover:border-castagna/50"
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            );
          })}
          {filters.length > 0 && (
            <button type="button" onClick={() => setFiltersAndUrl([], setFilters)} className="ml-1 shrink-0 px-2 text-sm text-muted underline underline-offset-4">
              Wyczyść
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <p className="sr-only" aria-live="polite">
          {filters.length > 0 ? `Pokazujemy ${shown} z ${menu.dishes.length} dań.` : ""}
        </p>

        {sections.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-2xl">Żadne danie nie spełnia wszystkich filtrów naraz.</p>
            <button type="button" className="btn btn-ghost mt-6" onClick={() => setFiltersAndUrl([], setFilters)}>
              Pokaż całe menu
            </button>
          </div>
        )}

        {sections.map((c) => (
          <section key={c.id} id={c.id} aria-labelledby={`${c.id}-h`} className="scroll-mt-32 pt-12">
            <div className="max-w-2xl">
              <h2 id={`${c.id}-h`} className="text-4xl sm:text-5xl">
                {c.name}
              </h2>
              <p className="mt-2 text-muted">{c.description}</p>
            </div>
            <ul className="mt-4 grid gap-x-14 md:grid-cols-2">
              {c.dishes.map((d) => (
                <DishRow key={d.id} dish={d} unavailable={unavailableSet.has(d.id)} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

function setFiltersAndUrl(next: Filter[], set: (f: Filter[]) => void) {
  set(next);
  const url = new URL(window.location.href);
  url.searchParams.delete("filtr");
  window.history.replaceState(null, "", url);
}

function DishRow({ dish, unavailable }: { dish: Dish; unavailable: boolean }) {
  return (
    <li className="flex gap-4 border-b border-pane-line py-6 sm:gap-5">
      <div className={`relative size-20 shrink-0 overflow-hidden rounded-full ring-1 ring-castagna/10 sm:size-28 ${unavailable ? "grayscale opacity-60" : ""}`}>
        <Image src={dish.image} alt="" fill sizes="(min-width: 640px) 112px, 80px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className={`font-display text-[1.35rem] leading-tight ${unavailable ? "text-castagna/60" : ""}`}>{dish.name}</h3>
          <span className="menu-leader" aria-hidden />
          <span className="font-display text-xl whitespace-nowrap tabular-nums">{formatPrice(dish.price)}</span>
        </div>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-castagna/80">{dish.description}</p>
        <div className="mt-2 space-y-1.5">
          <DietBadges dish={dish} />
          <Allergens dish={dish} />
        </div>
        <div className="mt-3">
          <AddToCart dish={dish} unavailable={unavailable} />
        </div>
      </div>
    </li>
  );
}
