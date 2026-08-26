import { formatNumber } from "@/lib/format";

export interface PartyBarRow {
  name: string;
  color: string;
  pct: number;
  votes?: number | null;
}

/**
 * Barras horizontales de resultados electorales: color partidario como
 * codificación de categoría, siempre con etiqueta de texto y porcentaje.
 */
export default function PartyBars({
  rows,
  compact = false,
}: {
  rows: PartyBarRow[];
  compact?: boolean;
}) {
  const max = Math.max(...rows.map((r) => r.pct), 1);
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {rows.map((r) => (
        <div
          key={r.name}
          className={`grid items-center gap-2 text-sm ${
            compact
              ? "grid-cols-[8.5rem_1fr_auto]"
              : "grid-cols-[10rem_1fr_auto] sm:grid-cols-[13rem_1fr_auto]"
          }`}
        >
          <span className="truncate font-semibold">{r.name}</span>
          <span aria-hidden className="h-5 overflow-hidden rounded-r-sm bg-canvas">
            <span
              className="block h-full rounded-r-sm border-y border-r border-ink/10"
              style={{ width: `${Math.max((r.pct / max) * 100, 1.5)}%`, background: r.color }}
            />
          </span>
          <span className="tnum font-bold">{formatNumber(r.pct, 2)}%</span>
        </div>
      ))}
    </div>
  );
}
