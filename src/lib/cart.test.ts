import { describe, expect, it } from "vitest";
import { priceCart } from "./cart";
import { menu } from "./menu";
import { menuSchema } from "./menu-schema";
import { formatPrice } from "./money";
import { orderInputSchema, phoneSchema } from "./validation";
import raw from "@data/menu.json";

describe("menu.json", () => {
  it("przechodzi walidację i ma ok. 25 pozycji w 6 kategoriach", () => {
    expect(menuSchema.safeParse(raw).success).toBe(true);
    expect(menu.categories).toHaveLength(6);
    expect(menu.dishes.length).toBeGreaterThanOrEqual(24);
    for (const c of menu.categories) expect(menu.dishes.some((d) => d.category === c.id)).toBe(true);
  });

  it("wyłapuje nieznaną kategorię", () => {
    const broken = structuredClone(raw);
    broken.dishes[0].category = "zupy";
    expect(menuSchema.safeParse(broken).success).toBe(false);
  });
});

describe("priceCart", () => {
  it("liczy sumę z cen z menu i scala powtórzone pozycje", () => {
    const r = priceCart([
      { dishId: "pizza-margherita", quantity: 2 },
      { dishId: "tiramisu", quantity: 1 },
      { dishId: "pizza-margherita", quantity: 1 },
    ]);
    expect(r.ok && r.total).toBe(3 * 3400 + 2600);
    expect(r.ok && r.lines).toHaveLength(2);
  });

  it("odrzuca dania niedostępne, tylko na sali i nieznane", () => {
    expect(priceCart([{ dishId: "tiramisu", quantity: 1 }], new Set(["tiramisu"])).ok).toBe(false);
    expect(priceCart([{ dishId: "aperol-spritz", quantity: 1 }]).ok).toBe(false);
    expect(priceCart([{ dishId: "kebab", quantity: 1 }]).ok).toBe(false);
    expect(priceCart([]).ok).toBe(false);
  });
});

describe("walidacja", () => {
  it("normalizuje numer telefonu", () => {
    expect(phoneSchema.parse("000-000-001")).toBe("+48 000 000 001");
    expect(phoneSchema.parse("+48 000 000 001")).toBe("+48 000 000 001");
    expect(phoneSchema.safeParse("12345").success).toBe(false);
  });

  it("puste pola opcjonalne stają się undefined", () => {
    const r = orderInputSchema.parse({
      items: [{ dishId: "tiramisu", quantity: 1 }],
      pickupAt: "2026-10-13T16:00:00.000Z",
      name: "Jan",
      phone: "000000001",
      email: "",
      notes: "  ",
    });
    expect(r.email).toBeUndefined();
    expect(r.notes).toBeUndefined();
  });

  it("formatuje ceny po polsku", () => {
    expect(formatPrice(4400)).toBe("44 zł");
    expect(formatPrice(4450)).toBe("44,50 zł");
  });
});
