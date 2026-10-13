import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions/admin";
import { SunMark } from "@/components/icons";
import { AdminNav } from "./admin-nav";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-castagna text-pane">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 pt-3 sm:px-6 md:flex-nowrap md:py-0">
          <Link href="/admin" className="flex items-center gap-2 py-2 font-display text-xl">
            <SunMark size={24} /> Panel
          </Link>
          <form action={logout} className="ml-auto md:order-last">
            <button className="min-h-11 text-sm text-pane/70 hover:text-pane">Wyloguj</button>
          </form>
          <Suspense>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
