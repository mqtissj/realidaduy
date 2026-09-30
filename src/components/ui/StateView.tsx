// Estados estándar. Nunca un cero ni un guion ambiguo.

const MESSAGES = {
  nodata: "No hay datos públicos disponibles para este nivel territorial.",
  "nodata-municipal":
    "Disponible a nivel departamental. No existe información municipal comparable.",
  "nodata-departamental":
    "Disponible a nivel nacional. La apertura departamental de este indicador todavía no fue ingerida.",
  pending: "Todavía no hay datos cargados para esta sección.",
  error: "No pudimos cargar esta información. Probá de nuevo en unos minutos.",
} as const;

export type StateKind = keyof typeof MESSAGES;

export default function StateView({
  kind,
  detail,
  compact = false,
}: {
  kind: StateKind;
  detail?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="status"
      className={`rounded-2xl border border-dashed border-line bg-surface text-ink-soft ${
        compact ? "px-3 py-2 text-sm" : "px-4 py-6 text-center"
      }`}
    >
      <p className={compact ? "" : "mx-auto max-w-md"}>{MESSAGES[kind]}</p>
      {detail ? <p className="mt-1 text-sm text-ink-faint">{detail}</p> : null}
    </div>
  );
}
