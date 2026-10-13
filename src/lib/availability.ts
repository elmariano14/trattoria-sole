import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

export const AVAILABILITY_TAG = "availability";

/**
 * Id dań oznaczonych w panelu jako „chwilowo niedostępne”.
 * Wynik jest w cache (strona menu pozostaje statyczna), a panel unieważnia go
 * przez updateTag(AVAILABILITY_TAG) przy każdej zmianie.
 */
export async function getUnavailableDishIds(): Promise<string[]> {
  "use cache";
  cacheTag(AVAILABILITY_TAG);
  cacheLife("hours");
  try {
    const rows = await db.dishAvailability.findMany({ where: { available: false }, select: { dishId: true } });
    return rows.map((r) => r.dishId);
  } catch (err) {
    // Brak bazy nie może położyć strony menu – pokazujemy wszystko jako dostępne.
    console.error("Nie udało się pobrać dostępności dań:", err);
    return [];
  }
}

/** Wersja bez cache – do walidacji zamówienia w chwili jego składania. */
export async function getUnavailableDishIdsFresh(): Promise<Set<string>> {
  const rows = await db.dishAvailability.findMany({ where: { available: false }, select: { dishId: true } });
  return new Set(rows.map((r) => r.dishId));
}
