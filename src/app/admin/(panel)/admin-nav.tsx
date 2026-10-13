"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Zamówienia" },
  { href: "/admin/rezerwacje", label: "Rezerwacje" },
  { href: "/admin/menu", label: "Dostępność dań" },
  { href: "/admin/qr", label: "Kod QR" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] overflow-x-auto px-2 md:mx-0 md:w-auto md:px-0">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className="relative shrink-0 px-3 py-4 text-sm font-medium whitespace-nowrap text-pane/70 hover:text-pane aria-[current=page]:text-pane"
          >
            {l.label}
            {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-zafferano" />}
          </Link>
        );
      })}
    </nav>
  );
}
