import type { BreakdownDimension, Indicator, Observation } from "@/lib/types";
import {
  DIMENSION_LABEL,
  getBreakdown,
  getDepartmentBreakdown,
  getHistorySeries,
} from "@/lib/data";
import { getObservationSource } from "@/data/sources";
import { formatDelta, formatValue } from "@/lib/format";
import ChartCard from "@/components/charts/ChartCard";
import MultiLineChart, { type LineSeries } from "@/components/charts/MultiLineChart";
import TableWrap from "@/components/ui/TableWrap";

// Colores de las aperturas: los mismos para cualquier dimensión, sin asociar
// colores a un sexo. El total va punteado para leerse sin el color.
const GROUP_COLORS = ["var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-6)", "var(--chart-5)"];

/**
 * "Por sexo" (o por edad) en la página de un indicador: la serie del país
 * abierta por grupo, o su último dato si no hay serie, y la tabla por
 * departamento. Si el indicador no tiene aperturas, no muestra nada.
 */
export default function BreakdownSection({
  indicator,
  dimension,
}: {
  indicator: Indicator;
  dimension: BreakdownDimension;
}) {
  const fmt = (v: number) => formatValue(v, indicator.unit, indicator.decimals);
  const sourceOf = (o: Observation) => getObservationSource(indicator.sourceId, o)?.shortName ?? "";
  const country = getBreakdown(indicator.id, "UY", dimension);
  const dept = getDepartmentBreakdown(indicator.id, dimension);
  if (country.length === 0 && dept.rows.length === 0) return null;
  const label = DIMENSION_LABEL[dimension];
  const id = `por-${dimension}`;

  // Serie anual del país: años que tienen todos los grupos.
  const annual = country.map((g) => ({ ...g, obs: g.obs.filter((o) => o.period.length === 4) }));
  const years = annual.length
    ? annual[0].obs.map((o) => o.period).filter((p) => annual.every((g) => g.obs.some((o) => o.period === p)))
    : [];
  const total = getHistorySeries(indicator.id, "UY").filter((o) => years.includes(o.period));
  const valueAt = (obs: Observation[], period: string) => obs.find((o) => o.period === period)?.value ?? null;
  const series: LineSeries[] = [
    ...(total.length === years.length
      ? [{ key: "total", label: "Total", color: "var(--chart-1)", dashed: true, points: total.map((o) => ({ x: o.period, y: o.value! })) }]
      : []),
    ...annual.map((g, i) => ({
      key: g.group,
      label: g.label,
      color: GROUP_COLORS[i % GROUP_COLORS.length],
      points: years.map((p) => ({ x: p, y: valueAt(g.obs, p)! })),
    })),
  ];
  const hasTotal = series[0]?.key === "total";

  // Último dato del país por grupo, cuando no alcanza para una serie.
  const latestPeriod = country.length
    ? country.map((g) => g.obs[g.obs.length - 1].period).reduce((a, p) => (p < a ? p : a))
    : undefined;
  const latest = latestPeriod
    ? country.map((g) => ({ ...g, o: g.obs.find((o) => o.period === latestPeriod) })).filter((g) => g.o)
    : [];

  const maxLatest = Math.max(...latest.map((g) => g.o!.value!), 1);
  const totalAtLatest = latestPeriod
    ? getHistorySeries(indicator.id, "UY").find((o) => o.period === latestPeriod)?.value ?? undefined
    : undefined;
  // "Margen de error al 95%: ±1,8 punto." → "±1,8": la encuesta lo publica por grupo.
  const margin = (o: Observation) => {
    const m = o.notes?.match(/Margen de error al 95%: (±[\d,]+)/)?.[1];
    return m && indicator.unit === "%" ? `${m} pp` : m;
  };

  // Con dos grupos (hombres y mujeres), la diferencia entre los dos.
  const two = dept.groups.length === 2;
  const diffHead = two ? `Diferencia (${dept.groups[1].label.toLowerCase()} − ${dept.groups[0].label.toLowerCase()})` : "";
  const diff = (values: (number | null)[]) =>
    formatDelta(values[1]! - values[0]!, indicator.unit, indicator.decimals);

  return (
    <section aria-labelledby={id} className="mt-8">
      <h2 id={id} className="font-display text-2xl font-bold">
        Por {label}
      </h2>
      <div className="mt-4 space-y-4">
        {years.length >= 4 ? (
          <ChartCard
            question={`${indicator.question} — por ${label}`}
            subtitle={`Serie anual oficial · ${years[0]}–${years[years.length - 1]}`}
            sourceLine={`Fuente: ${sourceOf(annual[0].obs[0])} · Serie anual por ${label}`}
            table={{
              caption: `${indicator.name} por ${label}, Uruguay`,
              head: ["Año", ...series.map((s) => s.label)],
              rows: years.map((p, j) => [
                p,
                ...(hasTotal ? [fmt(series[0].points[j].y)] : []),
                ...annual.map((g) => fmt(valueAt(g.obs, p)!)),
              ]),
            }}
          >
            <MultiLineChart series={series} unit={indicator.unit} decimals={indicator.decimals} />
          </ChartCard>
        ) : latest.length > 2 ? (
          <ChartCard
            question={`${indicator.question} — por ${label}`}
            subtitle={`Uruguay · ${latest[0].o!.periodLabel}${totalAtLatest ? ` · total ${fmt(totalAtLatest)}` : ""}`}
            sourceLine={`Fuente: ${sourceOf(latest[0].o!)} · ${latest[0].o!.periodLabel}`}
            note={[...new Set(latest.map((g) => g.o!.notes?.replace(/^Margen de error[^.]*\. /, "")).filter(Boolean))].join(" ")}
            table={{
              caption: `${indicator.name} por ${label}, Uruguay, ${latest[0].o!.periodLabel}`,
              head: [label.charAt(0).toUpperCase() + label.slice(1), indicator.name, "Margen de error al 95%"],
              rows: latest.map((g) => [g.label, fmt(g.o!.value!), margin(g.o!) ?? "—"]),
            }}
          >
            <ul className="space-y-1.5">
              {latest.map((g) => (
                <li
                  key={g.group}
                  className="grid grid-cols-[9rem_1fr_auto] items-center gap-2 text-sm sm:grid-cols-[12rem_1fr_auto]"
                >
                  <span className="font-semibold">{g.label}</span>
                  <span aria-hidden className="h-4 overflow-hidden rounded-r-sm bg-primary-soft">
                    <span
                      className="block h-full rounded-r-sm bg-primary"
                      style={{ width: `${Math.max((g.o!.value! / maxLatest) * 100, 1.5)}%` }}
                    />
                  </span>
                  <span className="tnum font-semibold">
                    {fmt(g.o!.value!)}
                    {margin(g.o!) ? <span className="font-normal text-ink-faint"> {margin(g.o!)}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </ChartCard>
        ) : latest.length > 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <p className="text-sm font-semibold text-ink-soft">Uruguay · {latest[0].o!.periodLabel}</p>
            <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
              {latest.map((g) => (
                <div key={g.group}>
                  <dt className="text-sm text-ink-soft">{g.label}</dt>
                  <dd className="tnum font-display text-3xl font-bold">{fmt(g.o!.value!)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-ink-faint">Fuente: {sourceOf(latest[0].o!)}</p>
          </div>
        ) : null}

        {dept.rows.length > 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
            <h3 className="font-display text-lg font-bold md:text-xl">Por {label} en cada departamento</h3>
            <p className="mt-0.5 text-sm text-ink-soft">
              {dept.rows[0].periodLabel} · Fuente: {sourceOf(dept.rows[0].obs)}
            </p>
            <TableWrap label={`${indicator.name} por ${label} y departamento`} className="mt-3">
              <table className="tabla min-w-[320px]">
                <caption className="sr-only">
                  {indicator.name} por {label} y departamento, {dept.rows[0].periodLabel}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Departamento</th>
                    {dept.groups.map((g) => (
                      <th key={g.group} scope="col" className="num">
                        {g.label}
                      </th>
                    ))}
                    {two ? (
                      <th scope="col" className="num">
                        {diffHead}
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {dept.rows.map((r) => (
                    <tr key={r.territory.id}>
                      <th scope="row">{r.territory.name}</th>
                      {r.values.map((v, j) => (
                        <td key={dept.groups[j].group} className="num">
                          {fmt(v!)}
                        </td>
                      ))}
                      {two ? <td className="num">{diff(r.values)}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </div>
        ) : null}
      </div>
    </section>
  );
}
