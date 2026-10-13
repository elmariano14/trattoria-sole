/** 4400 → "44 zł", 4450 → "44,50 zł" */
export function formatPrice(grosze: number): string {
  const zl = grosze / 100;
  const text = Number.isInteger(zl)
    ? zl.toLocaleString("pl-PL")
    : zl.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${text} zł`;
}

/** Cena w formacie schema.org, np. "44.00". */
export function schemaPrice(grosze: number): string {
  return (grosze / 100).toFixed(2);
}
