/**
 * Dane menu z data/menu.json – lekki moduł bez zod, bezpieczny dla komponentów
 * klienckich (koszyk). Poprawność pliku sprawdza menu-schema.ts przy starcie buildu.
 */
import raw from "@data/menu.json";
import type { AllergenKey, Category, Dish, Menu } from "./menu-schema";

export type { AllergenKey, Category, Dish, Menu };

export const menu = raw as Menu;

const byId = new Map(menu.dishes.map((d) => [d.id, d]));

export function getDish(id: string): Dish | undefined {
  return byId.get(id);
}

export function dishesInCategory(categoryId: string): Dish[] {
  return menu.dishes.filter((d) => d.category === categoryId);
}

export const featuredDishes = menu.dishes.filter((d) => d.featured);

export const allergenList = (Object.entries(menu.allergens) as [AllergenKey, Menu["allergens"][AllergenKey]][])
  .map(([key, a]) => ({ key, ...a }))
  .sort((a, b) => a.no - b.no);

export const allergenNo = (key: AllergenKey) => menu.allergens[key].no;
