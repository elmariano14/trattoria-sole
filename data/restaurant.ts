/**
 * Dane restauracji. UWAGA: Trattoria Sole jest fikcyjna – adres, telefon
 * i e-maile celowo nie należą do nikogo:
 *  - numer zaczyna się od 0 po kierunkowym, czego nie ma w polskim planie numeracji,
 *  - domena .example jest zastrzeżona (RFC 2606) i nigdy nie będzie realna.
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** Godziny otwarcia w czasie lokalnym (Europe/Warsaw). null = zamknięte. */
export type OpeningHours = Record<DayKey, { open: string; close: string } | null>;

export const restaurant = {
  name: "Trattoria Sole",
  tagline: "Kuchnia włoska z pieca opalanego drewnem",
  description:
    "Rodzinna trattoria w Krakowie: świeży makaron robiony każdego ranka, pizza z pieca opalanego bukiem i desery według przepisów nonny. Zamów na odbiór albo zarezerwuj stolik.",
  timeZone: "Europe/Warsaw",
  address: {
    street: "ul. Oliwkowa 7",
    postalCode: "30-000",
    city: "Kraków",
    country: "PL",
  },
  /** Ogólne współrzędne okolic Starego Miasta – bez wskazywania realnego budynku. */
  geo: { lat: 50.0614, lng: 19.9366 },
  phone: "+48 12 000 00 00",
  phoneHref: "tel:+48120000000",
  email: "kontakt@trattoria-sole.example",
  priceRange: "$$",
  servesCuisine: ["Włoska", "Pizza", "Makarony"],
  hours: {
    mon: null,
    tue: { open: "12:00", close: "22:00" },
    wed: { open: "12:00", close: "22:00" },
    thu: { open: "12:00", close: "22:00" },
    fri: { open: "12:00", close: "23:00" },
    sat: { open: "12:00", close: "23:00" },
    sun: { open: "12:00", close: "21:00" },
  } satisfies OpeningHours,

  /** Zasady zamówień na odbiór – to one rozładowują godziny szczytu. */
  pickup: {
    slotMinutes: 15,
    /** Najwcześniejszy odbiór: tyle minut od złożenia zamówienia. */
    leadMinutes: 30,
    /** Kuchnia przyjmuje zamówienia na odbiór do tylu minut przed zamknięciem. */
    lastOrderBeforeCloseMinutes: 30,
    /** Maks. liczba zamówień na jeden slot – kuchnia nie dostaje 20 pizz naraz. */
    maxOrdersPerSlot: 4,
    /** Ile kolejnych dni otwarcia można wybrać. */
    daysAhead: 3,
  },

  reservations: {
    slotMinutes: 30,
    /** Rezerwację na dziś można złożyć najpóźniej tyle minut wcześniej. */
    leadMinutes: 60,
    /** Ostatnia rezerwacja na tyle minut przed zamknięciem. */
    lastBeforeCloseMinutes: 90,
    /** Ile miejsc na sali może zostać zarezerwowanych w jednym slocie. */
    maxGuestsPerSlot: 36,
    maxGuestsOnline: 10,
    daysAhead: 60,
  },
} as const;

export const dayNames: Record<DayKey, string> = {
  mon: "Poniedziałek",
  tue: "Wtorek",
  wed: "Środa",
  thu: "Czwartek",
  fri: "Piątek",
  sat: "Sobota",
  sun: "Niedziela",
};

export const dayOrder: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Opinie gości – fikcyjne, podpisane tylko imieniem i inicjałem. */
export const reviews = [
  {
    author: "Marta K.",
    rating: 5,
    text: "Carbonara jak w Rzymie, bez grama śmietany. Zamówiłam na odbiór przez stronę, czekała gotowa co do minuty.",
  },
  {
    author: "Paweł W.",
    rating: 5,
    text: "Pizza Sole to obowiązkowy punkt. Ostra 'nduja i miód brzmią dziwnie, a smakują genialnie.",
  },
  {
    author: "Agnieszka i Tomek",
    rating: 5,
    text: "Świętowaliśmy tu rocznicę. Obsługa zapamiętała, że Tomek nie je glutenu, zanim zdążyliśmy o tym wspomnieć.",
  },
  {
    author: "Krzysztof M.",
    rating: 4,
    text: "W piątek wieczorem tłoczno, ale rezerwacja online zadziałała bez problemu. Tiramisù najlepsze w mieście.",
  },
  {
    author: "Ola S.",
    rating: 5,
    text: "Wreszcie mogę zobaczyć alergeny przy każdym daniu, zanim przyjdę. Dla alergika to zmienia wszystko.",
  },
];

export const gallery = [
  { src: "/images/gallery/sala.webp", alt: "Sala restauracji wieczorem, stoliki przy świecach" },
  { src: "/images/gallery/piec.webp", alt: "Pizza wyjmowana z pieca opalanego drewnem" },
  { src: "/images/gallery/makaron.webp", alt: "Ręczne wałkowanie świeżego makaronu" },
  { src: "/images/gallery/wino.webp", alt: "Kieliszki czerwonego wina na stole" },
  { src: "/images/gallery/stol.webp", alt: "Stół zastawiony włoskimi daniami do dzielenia się" },
  { src: "/images/gallery/kuchnia.webp", alt: "Kucharz przygotowujący danie w otwartej kuchni" },
];
