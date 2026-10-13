import type { Metadata } from "next";
import { Suspense } from "react";
import { SunMark } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Logowanie" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-castagna px-4 text-pane">
      <div className="w-full max-w-sm">
        <p className="flex items-center gap-2 font-display text-2xl">
          <SunMark size={30} /> Trattoria Sole
        </p>
        <h1 className="mt-8 text-4xl">Panel obsługi</h1>
        <p className="mt-2 text-pane/70">Zamówienia, rezerwacje i dostępność dań.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-sm text-pane/50">Wersja demo: hasło ustawiasz w zmiennej ADMIN_PASSWORD.</p>
      </div>
    </div>
  );
}
