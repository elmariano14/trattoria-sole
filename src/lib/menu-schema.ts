/**
 * Schemat data/menu.json. Walidacja uruchamia się przy starcie `next dev` / `next build`
 * (next.config.ts) oraz w testach – literówka w pliku (np. nieznany alergen albo
 * kategoria) zatrzyma build z czytelnym błędem.
 */
import { z } from "zod";

export const allergenKeySchema = z.enum([
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
]);

const dishSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "id: tylko małe litery, cyfry i myślniki"),
  category: z.string(),
  name: z.string().min(1),
  description: z.string(),
  /** Cena w groszach. */
  price: z.number().int().positive(),
  image: z.string().startsWith("/"),
  vegetarian: z.boolean(),
  vegan: z.boolean(),
  glutenFree: z.boolean(),
  /** 0 = łagodne, 1–3 = poziom ostrości. */
  spicy: z.number().int().min(0).max(3),
  allergens: z.array(allergenKeySchema),
  featured: z.boolean().optional(),
  /** Tylko na sali (np. alkohol) – nie można zamówić na wynos. */
  dineInOnly: z.boolean().optional(),
});

export const menuSchema = z
  .object({
    currency: z.literal("PLN"),
    allergens: z.record(allergenKeySchema, z.object({ no: z.number(), name: z.string(), description: z.string() })),
    categories: z.array(z.object({ id: z.string(), name: z.string(), description: z.string() })),
    dishes: z.array(dishSchema),
  })
  .superRefine((menu, ctx) => {
    const categories = new Set(menu.categories.map((c) => c.id));
    const ids = new Set<string>();
    menu.dishes.forEach((d, i) => {
      if (!categories.has(d.category))
        ctx.addIssue({ code: "custom", path: ["dishes", i, "category"], message: `Nieznana kategoria "${d.category}"` });
      if (ids.has(d.id)) ctx.addIssue({ code: "custom", path: ["dishes", i, "id"], message: `Powtórzone id "${d.id}"` });
      ids.add(d.id);
      if (d.vegan && !d.vegetarian)
        ctx.addIssue({ code: "custom", path: ["dishes", i], message: "Danie wegańskie musi być też wegetariańskie" });
    });
  });

export type Menu = z.infer<typeof menuSchema>;
export type Dish = Menu["dishes"][number];
export type Category = Menu["categories"][number];
export type AllergenKey = z.infer<typeof allergenKeySchema>;

/** Rzuca czytelnym błędem, jeśli menu.json jest niepoprawne. */
export function assertValidMenu(data: unknown): void {
  const result = menuSchema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`data/menu.json zawiera błędy:\n${details}`);
  }
}
