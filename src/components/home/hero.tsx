import Image from "next/image";
import Link from "next/link";
import { restaurant } from "@data/restaurant";
import { PinIcon } from "@/components/icons";
import { OpenStatus } from "@/components/site/open-status";
import plate from "../../../public/images/hero/talerz.webp";

/**
 * Hero: talerz widziany z góry jako słońce (sole), które wschodzi nad linią stołu.
 * To jedyna animacja przy wejściu na stronę.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-castagna text-pane">
      {/* linia „horyzontu” – krawędź stołu */}
      <div aria-hidden className="absolute top-[62%] right-0 left-1/2 hidden h-px bg-castagna-line md:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-4 px-4 sm:px-6 md:min-h-[600px] md:grid-cols-2 md:gap-8 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="relative order-1 -mr-[22vw] ml-[8vw] aspect-square md:order-2 md:mr-[-22%] md:ml-0 lg:mr-[-8%]">
          <div
            aria-hidden
            className="absolute right-[2%] bottom-[2%] size-[82%] animate-sunrise rounded-full bg-zafferano"
          />
          <div className="absolute top-[4%] left-[2%] size-[84%] animate-plate overflow-hidden rounded-full shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)]">
            <Image
              src={plate}
              alt="Pizza margherita z bazylią, widziana z góry"
              fill
              priority
              placeholder="blur"
              sizes="(min-width: 1024px) 520px, (min-width: 768px) 50vw, 96vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="relative order-2 pb-14 md:order-1 md:py-24">
          <OpenStatus className="text-pane/80" />
          <h1 className="mt-4 text-[clamp(3.6rem,15vw,8.25rem)] md:text-[clamp(4.5rem,9.5vw,8.25rem)] leading-[0.88] tracking-[-0.02em]">
            Trattoria
            <br />
            Sole
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-pane/80">
            Makaron wałkujemy każdego ranka, pizzę pieczemy w piecu opalanym bukiem. Zamów na odbiór na wybraną
            godzinę albo zarezerwuj stolik na wieczór.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary px-6">
              Zamów na odbiór
            </Link>
            <Link href="/rezerwacja" className="btn btn-ghost-dark px-6">
              Zarezerwuj stolik
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-pane/65">
            <PinIcon size={16} />
            {restaurant.address.street}, {restaurant.address.city}
          </p>
        </div>
      </div>
    </section>
  );
}
