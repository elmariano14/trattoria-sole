"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { restaurant } from "@data/restaurant";
import { useCart } from "@/components/cart/cart-provider";
import { BagIcon, PhoneIcon, SunMark } from "@/components/icons";

const links = [
  { href: "/menu", label: "Menu", short: "Menu" },
  { href: "/zamowienie", label: "Zamów na odbiór", short: null },
  { href: "/rezerwacja", label: "Rezerwacja", short: "Rezerwuj" },
] as const;

export function Header() {
  const { count, ready } = useCart();

  return (
    <header className="relative z-30 bg-castagna text-pane">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-pane" aria-label={`${restaurant.name}, strona główna`}>
          <SunMark size={28} />
          <span className="font-display text-[1.3rem] leading-none tracking-tight whitespace-nowrap sm:text-[1.375rem]">
            Trattoria Sole
          </span>
        </Link>

        <nav aria-label="Główna" className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Ścieżka jest znana dopiero w czasie żądania – bez niej linki renderują się bez podświetlenia. */}
          <Suspense fallback={<NavLinks pathname={null} />}>
            <NavLinksWithPath />
          </Suspense>
          <a
            href={restaurant.phoneHref}
            className="hidden min-h-11 items-center gap-2 px-3 text-[0.95rem] text-pane/80 hover:text-pane lg:inline-flex"
          >
            <PhoneIcon size={16} />
            {restaurant.phone}
          </a>
          <Link
            href="/zamowienie"
            className="relative ml-1 hidden size-11 items-center justify-center rounded-full bg-castagna-soft hover:bg-castagna-line md:inline-flex"
            aria-label={ready && count > 0 ? `Koszyk: ${count} szt.` : "Koszyk"}
          >
            <BagIcon size={20} />
            {ready && count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-zafferano px-1 text-xs font-bold text-castagna">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function NavLinksWithPath() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return links.map((l) => {
    const active = !!pathname && (pathname === l.href || pathname.startsWith(`${l.href}/`));
    return (
      <Link
        key={l.href}
        href={l.href}
        aria-current={active ? "page" : undefined}
        className={`${l.short ? "" : "hidden md:inline-flex"} inline-flex min-h-11 items-center rounded-full px-3 text-[0.95rem] font-medium transition-colors hover:text-zafferano aria-[current=page]:text-zafferano`}
      >
        <span className="md:hidden">{l.short}</span>
        <span className="hidden md:inline">{l.label}</span>
      </Link>
    );
  });
}
