import Link from "next/link";
import { dayNames, dayOrder, restaurant } from "@data/restaurant";
import { SunMark } from "@/components/icons";
import { author } from "@/lib/site";

export function Footer() {
  const { address } = restaurant;
  return (
    <footer className="bg-castagna pb-28 text-pane md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-2xl">
            <SunMark size={30} /> Trattoria Sole
          </p>
          <p className="mt-3 max-w-xs text-pane/70">{restaurant.tagline}.</p>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-zafferano">Kontakt</h2>
          <address className="mt-3 space-y-1 not-italic text-pane/85">
            <p>{address.street}</p>
            <p>
              {address.postalCode} {address.city}
            </p>
            <p className="pt-2">
              <a href={restaurant.phoneHref} className="hover:text-zafferano">
                {restaurant.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${restaurant.email}`} className="hover:text-zafferano">
                {restaurant.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="font-sans text-sm font-semibold text-zafferano">Godziny otwarcia</h2>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-pane/85">
            {dayOrder.map((d) => {
              const h = restaurant.hours[d];
              return (
                <div key={d} className="contents">
                  <dt>{dayNames[d]}</dt>
                  <dd className="tabular-nums">{h ? `${h.open}–${h.close}` : "nieczynne"}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-3 border-t border-castagna-line px-4 pt-6 text-sm text-pane/60 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>
          Projekt demonstracyjny: Trattoria Sole jest restauracją fikcyjną, a dane kontaktowe są przykładowe.
          {author.url && (
            <>
              {" "}
              Realizacja:{" "}
              <a href={author.url} className="text-pane underline underline-offset-4 hover:text-zafferano">
                {author.name || author.url}
              </a>
              .
            </>
          )}
        </p>
        <p className="flex gap-4">
          <Link href="/zdjecia" className="hover:text-pane">
            Zdjęcia: Unsplash
          </Link>
          <Link href="/admin" className="hover:text-pane" prefetch={false}>
            Panel obsługi
          </Link>
        </p>
      </div>
    </footer>
  );
}
