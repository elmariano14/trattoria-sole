import type { Metadata } from "next";
import { getUnavailableDishIds } from "@/lib/availability";
import { allergenList } from "@/lib/menu";
import { JsonLd, menuJsonLd } from "@/lib/seo";
import { MenuBrowser } from "@/components/menu/menu-browser";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Menu Trattorii Sole: antipasti, świeże makarony, pizza z pieca opalanego drewnem, secondi i desery. Ceny, alergeny, dania wegetariańskie i bez glutenu.",
  alternates: { canonical: "/menu" },
};

export default async function MenuPage() {
  const unavailable = await getUnavailableDishIds();

  return (
    <>
      <JsonLd data={menuJsonLd()} />
      <section className="bg-castagna text-pane">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
          <h1 className="text-6xl sm:text-7xl">Menu</h1>
          <p className="mt-4 max-w-xl text-pane/80">
            Każde danie możesz zamówić na odbiór. Wybierz godzinę, a my przygotujemy wszystko na czas. Przy każdej
            pozycji podajemy numery alergenów, a legenda jest na dole strony.
          </p>
        </div>
      </section>

      <MenuBrowser unavailable={unavailable} />

      <section aria-labelledby="alergeny-h" className="border-t border-pane-line bg-pane-deep/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 id="alergeny-h" className="text-3xl">
            Alergeny
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Numeracja według listy 14 alergenów z rozporządzenia UE 1169/2011. Kuchnia pracuje na wspólnych
            powierzchniach, więc nie możemy wykluczyć śladowych ilości. Przy poważnej alergii powiedz nam o niej
            przy zamówieniu.
          </p>
          <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {allergenList.map((a) => (
              <div key={a.key} className="flex gap-3">
                <dt className="grid size-7 shrink-0 place-items-center rounded-full border border-castagna/30 text-sm font-semibold tabular-nums">
                  {a.no}
                </dt>
                <dd>
                  <span className="font-semibold">{a.name}</span>
                  <span className="block text-sm text-muted">{a.description}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
