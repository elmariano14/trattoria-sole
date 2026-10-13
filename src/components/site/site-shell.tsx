import { Suspense } from "react";
import { CartBar } from "@/components/cart/cart-bar";
import { CartProvider } from "@/components/cart/cart-provider";
import { Footer } from "./footer";
import { Header } from "./header";

/** Wspólna rama strony publicznej – używana przez layout (site) i globalną stronę 404. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <a
        href="#tresc"
        className="sr-only z-50 rounded-full bg-zafferano px-4 py-2 font-semibold text-castagna focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Przejdź do treści
      </a>
      <Header />
      <main id="tresc" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      {/* CartBar czyta ścieżkę (ukrywa się na /zamowienie) – w Suspense, żeby nie blokować prerenderu. */}
      <Suspense>
        <CartBar />
      </Suspense>
    </CartProvider>
  );
}
