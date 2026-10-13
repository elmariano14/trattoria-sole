import Image from "next/image";
import Link from "next/link";
import { restaurant, reviews } from "@data/restaurant";
import { AddToCart } from "@/components/menu/add-to-cart";
import { DietBadges } from "@/components/menu/dish-badges";
import { PhoneIcon, PinIcon, StarIcon } from "@/components/icons";
import { featuredDishes } from "@/lib/menu";
import { formatPrice } from "@/lib/money";
import { HoursTable } from "./hours-table";
import { MapEmbed } from "./map-embed";
import oven from "../../../public/images/about/piec.webp";
import table from "../../../public/images/hero/stol-noc.webp";

export function About() {
  return (
    <section aria-labelledby="o-nas-h" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:gap-16 md:py-28">
      {/* kadr w kształcie łuku pieca */}
      <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-full">
        <Image src={oven} alt="Ogień w łukowym piecu opalanym drewnem" fill placeholder="blur" sizes="(min-width: 768px) 450px, 92vw" className="object-cover" />
      </div>
      <div>
        <h2 id="o-nas-h" className="text-4xl leading-tight sm:text-5xl">
          Przepisy z Neapolu, piec z Krakowa
        </h2>
        <div className="mt-6 max-w-prose space-y-4 text-[1.05rem] leading-relaxed text-castagna/85">
          <p>
            Giulia przywiozła z Neapolu zeszyt z przepisami babci Giuseppiny. Marek zbudował dla niej piec, cegła po
            cegle, w dawnej piekarni na rogu Oliwkowej. Tak w 2014 roku powstała Trattoria Sole.
          </p>
          <p>
            Gotujemy krótko i sezonowo: kilka antipasti, makarony robione codziennie rano, pizza na cieście, które
            dojrzewa dwie doby. Resztę menu podpowiada targ.
          </p>
        </div>
        <dl className="mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-pane-line pt-6">
          <dt className="font-display text-xl">Ciasto</dt>
          <dd className="self-center text-castagna/80">dojrzewa 48 godzin</dd>
          <dt className="font-display text-xl">Makaron</dt>
          <dd className="self-center text-castagna/80">wałkowany codziennie od 7 rano</dd>
          <dt className="font-display text-xl">Piec</dt>
          <dd className="self-center text-castagna/80">opalany bukiem, 450°C</dd>
        </dl>
      </div>
    </section>
  );
}

export function Featured() {
  return (
    <section aria-labelledby="polecane-h" className="border-y border-pane-line bg-pane-deep/45 py-20">
      <div className="mx-auto flex max-w-6xl items-end justify-between gap-6 px-4 sm:px-6">
        <div>
          <h2 id="polecane-h" className="text-4xl sm:text-5xl">
            Dania, po które się wraca
          </h2>
          <p className="mt-3 max-w-md text-muted">Pięć pozycji, które goście zamawiają najczęściej.</p>
        </div>
        <Link href="/menu" className="hidden shrink-0 font-semibold text-pomodoro underline-offset-4 hover:underline sm:block">
          Całe menu
        </Link>
      </div>

      <ul className="no-scrollbar mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-5 lg:overflow-visible">
        {featuredDishes.map((d) => (
          <li key={d.id} className="flex w-[68vw] max-w-64 shrink-0 snap-start flex-col lg:w-auto">
            <div className="relative aspect-square overflow-hidden rounded-full shadow-[0_24px_40px_-24px_rgba(36,21,15,0.6)]">
              <Image src={d.image} alt={d.name} fill sizes="(min-width: 1024px) 200px, 68vw" className="object-cover" />
            </div>
            <h3 className="mt-5 text-2xl leading-tight">{d.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-castagna/75">{d.description}</p>
            <div className="mt-2">
              <DietBadges dish={d} />
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <span className="font-display text-xl tabular-nums">{formatPrice(d.price)}</span>
              <AddToCart dish={d} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 px-4 sm:hidden">
        <Link href="/menu" className="btn btn-ghost w-full">
          Zobacz całe menu
        </Link>
      </p>
    </section>
  );
}

export function PickupHowTo() {
  const steps = [
    { title: "Wybierz dania", text: "Dodaj je do zamówienia prosto z menu. Ceny i alergeny widzisz od razu." },
    { title: "Wybierz godzinę odbioru", text: "Odbiory co 15 minut. Pokazujemy tylko terminy, na które kuchnia zdąży." },
    { title: "Odbierz i zapłać na miejscu", text: "Gotówką lub kartą. Zamówienie czeka na Ciebie gorące, bez stania w kolejce." },
  ];
  return (
    <section aria-labelledby="odbior-h" className="relative isolate overflow-hidden bg-castagna text-pane">
      <Image src={table} alt="" fill placeholder="blur" sizes="100vw" className="-z-10 object-cover opacity-35" />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <h2 id="odbior-h" className="max-w-xl text-4xl leading-tight sm:text-5xl">
          Zamów na odbiór, bez dzwonienia w godzinach szczytu
        </h2>
        <p className="mt-5 max-w-xl text-pane/80">
          Na każdy kwadrans przyjmujemy ograniczoną liczbę zamówień. Kuchnia nie dostaje dwudziestu pizz naraz, a Ty
          odbierasz o umówionej godzinie.
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-zafferano font-display text-xl text-castagna">
                {i + 1}
              </span>
              <div>
                <h3 className="text-2xl">{s.title}</h3>
                <p className="mt-1.5 text-pane/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/menu" className="btn btn-primary mt-12 px-6">
          Wybierz dania
        </Link>
      </div>
    </section>
  );
}

export function HoursAndMap() {
  return (
    <section aria-labelledby="godziny-h" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.3fr] md:py-28">
      <div>
        <h2 id="godziny-h" className="text-4xl sm:text-5xl">
          Godziny i dojazd
        </h2>
        <HoursTable />
        <address className="mt-8 space-y-3 not-italic">
          <p className="flex items-start gap-3">
            <PinIcon className="mt-0.5 shrink-0 text-pomodoro" />
            <span>
              {restaurant.address.street}, {restaurant.address.postalCode} {restaurant.address.city}
              <span className="block text-sm text-muted">Pięć minut spacerem od Rynku Głównego.</span>
            </span>
          </p>
          <p className="flex items-center gap-3">
            <PhoneIcon className="shrink-0 text-pomodoro" />
            <a href={restaurant.phoneHref} className="underline-offset-4 hover:underline">
              {restaurant.phone}
            </a>
          </p>
        </address>
      </div>
      <MapEmbed />
    </section>
  );
}

export function Reviews() {
  return (
    <section aria-labelledby="opinie-h" className="border-t border-pane-line py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="opinie-h" className="text-4xl sm:text-5xl">
          Co mówią goście
        </h2>
      </div>
      <ul tabIndex={0} aria-label="Opinie gości (przewiń w bok)" className="no-scrollbar mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {reviews.map((r) => (
          <li key={r.author} className="w-[82vw] max-w-sm shrink-0 snap-start lg:w-auto lg:max-w-none">
            <figure className="flex h-full flex-col rounded-3xl bg-[#fffaf1] p-6 ring-1 ring-pane-line">
              <div className="flex text-zafferano" role="img" aria-label={`Ocena: ${r.rating} na 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon key={i} size={18} filled={i < r.rating} />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-[1.3rem] leading-snug">„{r.text}”</blockquote>
              <figcaption className="mt-auto pt-5 text-sm font-semibold text-muted">{r.author}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ReservationCta() {
  return (
    <section aria-labelledby="rezerwacja-h" className="relative overflow-hidden bg-castagna-soft text-pane">
      <div aria-hidden className="absolute -right-32 -bottom-60 size-80 rounded-full bg-zafferano md:-right-24 md:-bottom-56 md:size-[34rem]" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <h2 id="rezerwacja-h" className="max-w-lg text-4xl leading-tight sm:text-5xl">
          Stolik na wieczór?
        </h2>
        <p className="mt-4 max-w-md text-pane/80">
          Rezerwacje online przyjmujemy do {restaurant.reservations.maxGuestsOnline} osób. Większą grupę i kolację
          firmową ustalimy przez telefon.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/rezerwacja" className="btn btn-primary px-6">
            Zarezerwuj stolik
          </Link>
          <a href={restaurant.phoneHref} className="btn btn-ghost-dark px-6">
            Zadzwoń: {restaurant.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
