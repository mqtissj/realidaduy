// Formateo es-UY: coma decimal, punto de miles.

const nf = (decimals: number) =>
  new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export function formatNumber(value: number, decimals = 0): string {
  return nf(decimals).format(value);
}

export function formatValue(value: number, unit: string, decimals: number): string {
  const n = formatNumber(value, decimals);
  if (unit === "%") return `${n}%`;
  if (unit === "pesos") return `$ ${n}`;
  if (unit === "USD") return `US$ ${n}`;
  if (unit === "personas" || unit === "habitantes") return n;
  if (unit === "pp") return `${n} pp`;
  return `${n} ${unit}`;
}

/** "+0,4 pp" / "−0,4 pp" / "sin cambios" — la dirección siempre lleva signo textual. */
export function formatDelta(delta: number, unit: string, decimals = 1): string {
  if (delta === 0) return "sin cambios";
  const sign = delta > 0 ? "+" : "−";
  const n = formatNumber(Math.abs(delta), decimals);
  const suffix = unit === "%" ? " pp" : unit === "personas" ? "" : ` ${unit}`;
  return `${sign}${n}${suffix}`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("es-UY", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** "¿Cómo evolucionó el desempleo?" → "como-evoluciono-el-desempleo" */
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
