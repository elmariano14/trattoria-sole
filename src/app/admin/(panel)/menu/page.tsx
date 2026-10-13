import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getUnavailableDishIdsFresh } from "@/lib/availability";
import { AvailabilityList } from "./availability-list";

export const metadata: Metadata = { title: "Dostępność dań" };

export default function AvailabilityPage() {
  return (
    <>
      <h1 className="text-4xl">Dostępność dań</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Skończył się składnik? Wyłącz danie, a w menu od razu pojawi się „chwilowo niedostępne” i nie da się go zamówić.
        Ceny i opisy edytujesz w pliku <code className="rounded bg-pane-deep px-1.5 py-0.5 text-sm">data/menu.json</code>.
      </p>
      <Suspense fallback={<p className="mt-8 text-muted">Wczytywanie…</p>}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  await requireAdmin();
  const unavailable = await getUnavailableDishIdsFresh();
  return <AvailabilityList unavailable={[...unavailable]} />;
}
