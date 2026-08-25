import type { DataStatus } from "@/lib/types";

export function DemoBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-demo-bg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-demo-ink"
      title="Valor tomado de investigación verificada, pendiente de validación final contra el boletín oficial."
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path d="M12 2 1 21h22L12 2Zm1 14h-2v2h2v-2Zm0-7h-2v5h2V9Z" />
      </svg>
      Pendiente de validación
    </span>
  );
}

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
