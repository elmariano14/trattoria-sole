import type { Metadata } from "next";
import { Checkout } from "@/components/order/checkout";
import { getUnavailableDishIds } from "@/lib/availability";

export const metadata: Metadata = {
  title: "Zamówienie na odbiór",
  description: "Zamów dania z Trattorii Sole na odbiór osobisty o wybranej godzinie. Płatność przy odbiorze.",
  alternates: { canonical: "/zamowienie" },
};

export default async function OrderPage() {
  const unavailable = await getUnavailableDishIds();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 sm:pt-14">
      <h1 className="text-5xl sm:text-6xl">Zamówienie na odbiór</h1>
      <div className="mt-8">
        <Checkout unavailable={unavailable} />
      </div>
    </div>
  );
}
