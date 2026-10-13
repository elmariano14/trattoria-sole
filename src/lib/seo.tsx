import { dayOrder, restaurant, type DayKey } from "@data/restaurant";
import { menu } from "./menu";
import { schemaPrice } from "./money";
import { siteUrl } from "./site";

const schemaDay: Record<DayKey, string> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
};

export function restaurantJsonLd() {
  const url = siteUrl();
  // Dni o tych samych godzinach łączymy w jeden wpis.
  const groups = new Map<string, DayKey[]>();
  for (const d of dayOrder) {
    const h = restaurant.hours[d];
    if (!h) continue;
    const key = `${h.open}-${h.close}`;
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}/#restauracja`,
    name: restaurant.name,
    description: restaurant.description,
    url,
    image: [`${url}/og.jpg`, `${url}/images/gallery/sala.webp`],
    telephone: restaurant.phone.replace(/\s/g, ""),
    email: restaurant.email,
    priceRange: restaurant.priceRange,
    servesCuisine: restaurant.servesCuisine,
    acceptsReservations: true,
    hasMenu: `${url}/menu`,
    paymentAccepted: "Gotówka, karta płatnicza",
    currenciesAccepted: "PLN",
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address.street,
      postalCode: restaurant.address.postalCode,
      addressLocality: restaurant.address.city,
      addressCountry: restaurant.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: restaurant.geo.lat, longitude: restaurant.geo.lng },
    openingHoursSpecification: [...groups.entries()].map(([key, days]) => {
      const [opens, closes] = key.split("-");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: days.map((d) => schemaDay[d]), opens, closes };
    }),
    potentialAction: {
      "@type": "OrderAction",
      target: { "@type": "EntryPoint", urlTemplate: `${url}/zamowienie`, inLanguage: "pl" },
      deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModePickUp",
    },
  };
}

export function menuJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${url}/menu#menu`,
    name: `Menu ${restaurant.name}`,
    url: `${url}/menu`,
    inLanguage: "pl",
    hasMenuSection: menu.categories.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      description: c.description,
      hasMenuItem: menu.dishes
        .filter((d) => d.category === c.id)
        .map((d) => ({
          "@type": "MenuItem",
          name: d.name,
          description: d.description,
          image: `${url}${d.image}`,
          offers: { "@type": "Offer", price: schemaPrice(d.price), priceCurrency: "PLN" },
          suitableForDiet: [
            d.vegan && "https://schema.org/VeganDiet",
            d.vegetarian && "https://schema.org/VegetarianDiet",
            d.glutenFree && "https://schema.org/GlutenFreeDiet",
          ].filter(Boolean),
        })),
    })),
  };
}

/** Bezpieczne osadzenie JSON-LD (bez możliwości zamknięcia tagu <script>). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}
