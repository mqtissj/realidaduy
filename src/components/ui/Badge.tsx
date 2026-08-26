import type { DataStatus } from "@/lib/types";

const STATUS_LABEL: Record<DataStatus, string> = {
  OFFICIAL: "Dato oficial",
  CALCULATED: "Calculado",
  ESTIMATED: "Estimado",
  SECONDARY: "Fuente secundaria",
  UNAVAILABLE: "Sin datos",
};

export function StatusBadge({ status }: { status: DataStatus }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PartyBadge({ color, name }: { color: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-0.5 text-sm font-semibold text-ink">
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink/20"
        style={{ background: color }}
        aria-hidden
      />
      {name}
    </span>
  );
}
