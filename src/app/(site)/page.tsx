import { About, Featured, HoursAndMap, PickupHowTo, ReservationCta, Reviews } from "@/components/home/sections";
import { Gallery } from "@/components/home/gallery";
import { Hero } from "@/components/home/hero";
import { JsonLd, restaurantJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={restaurantJsonLd()} />
      <Hero />
      <About />
      <Featured />
      <PickupHowTo />
      <HoursAndMap />
      <Reviews />
      <Gallery />
      <ReservationCta />
    </>
  );
}
