import type { Metadata } from "next";
import Image from "next/image";
import { ReservationForm } from "@/components/reservation/reservation-form";
import room from "../../../../public/images/gallery/sala.webp";

export const metadata: Metadata = {
  title: "Rezerwacja stolika",
  description: "Zarezerwuj stolik w Trattorii Sole w Krakowie. Rezerwacje online do 10 osób, potwierdzenie telefoniczne.",
  alternates: { canonical: "/rezerwacja" },
};

export default function ReservationPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-10 pb-24 sm:px-6 sm:pt-14 lg:grid-cols-[1fr_24rem]">
      <div>
        <h1 className="text-5xl sm:text-6xl">Rezerwacja stolika</h1>
        <p className="mt-4 max-w-xl text-castagna/80">
          Wybierz dzień, godzinę i liczbę osób. Stolik trzymamy przez 15 minut od godziny rezerwacji.
        </p>
        <div className="mt-10">
          <ReservationForm />
        </div>
      </div>
      <div className="relative hidden aspect-[3/4] overflow-hidden rounded-t-full lg:block">
        <Image src={room} alt="Sala Trattorii Sole wieczorem" fill placeholder="blur" sizes="384px" className="object-cover" />
      </div>
    </div>
  );
}
