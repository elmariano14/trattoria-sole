import { ChiliIcon, LeafIcon, WheatOffIcon } from "@/components/icons";
import { allergenNo, menu, type Dish } from "@/lib/menu";

const spicyLabel = ["", "lekko ostre", "ostre", "bardzo ostre"];

export function DietBadges({ dish }: { dish: Dish }) {
  const items: { key: string; label: string; icon: React.ReactNode; className: string }[] = [];
  if (dish.vegan) items.push({ key: "vegan", label: "Wegańskie", icon: <LeafIcon size={14} />, className: "text-oliva" });
  else if (dish.vegetarian)
    items.push({ key: "veg", label: "Wegetariańskie", icon: <LeafIcon size={14} />, className: "text-oliva" });
  if (dish.glutenFree)
    items.push({ key: "gf", label: "Bez glutenu", icon: <WheatOffIcon size={14} />, className: "text-muted" });
  if (dish.spicy > 0)
    items.push({
      key: "spicy",
      label: spicyLabel[dish.spicy],
      icon: (
        <span className="flex" aria-hidden>
          {Array.from({ length: dish.spicy }, (_, i) => (
            <ChiliIcon key={i} size={14} className={i > 0 ? "-ml-1" : ""} />
          ))}
        </span>
      ),
      className: "text-pomodoro",
    });
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[0.8rem] font-medium">
      {items.map((b) => (
        <li key={b.key} className={`inline-flex items-center gap-1 ${b.className}`}>
          {b.icon}
          {b.label}
        </li>
      ))}
    </ul>
  );
}

/** Numery alergenów (lista 14 alergenów UE) z pełną nazwą w podpowiedzi i dla czytników ekranu. */
export function Allergens({ dish }: { dish: Dish }) {
  if (dish.allergens.length === 0) return <p className="text-[0.8rem] text-muted">Bez alergenów z listy UE</p>;
  const names = dish.allergens.map((a) => menu.allergens[a].name.toLowerCase()).join(", ");
  return (
    <p className="flex flex-wrap items-center gap-1 text-[0.8rem] text-muted">
      <span className="sr-only">Alergeny: {names}</span>
      <span aria-hidden className="mr-0.5">
        Alergeny:
      </span>
      {dish.allergens
        .slice()
        .sort((a, b) => allergenNo(a) - allergenNo(b))
        .map((a) => (
          <abbr
            key={a}
            title={menu.allergens[a].name}
            aria-hidden
            className="grid size-5 place-items-center rounded-full border border-pane-line text-[0.7rem] font-semibold tabular-nums no-underline"
          >
            {allergenNo(a)}
          </abbr>
        ))}
    </p>
  );
}
