import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeIndicators, getIndicator } from "@/data/dictionary";
import { getDepartmentRanking, getLatest, getSeries } from "@/lib/data";
import { getSource } from "@/data/sources";
import { formatNumber, formatValue } from "@/lib/format";
import { StatusBadge } from "@/components/ui/Badge";
import Delta from "@/components/charts/Delta";
import ChartCard from "@/components/charts/ChartCard";
import LineChart from "@/components/charts/LineChart";
import RankingList from "@/components/charts/RankingList";
import SourceNote from "@/components/ui/SourceNote";
import StateView from "@/components/ui/StateView";

export function generateStaticParams() {
  return activeIndicators.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const indicator = getIndicator(slug);
  if (!indicator) return {};
  return {
    title: indicator.name,
    description: `${indicator.question} ${indicator.plainDefinition}`,
  };
}

export default async function IndicadorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const indicator = getIndicator(slug);
  if (!indicator || indicator.status !== "active") notFound();

  const latest = getLatest(indicator.id, "UY");
  const source = getSource(indicator.sourceId);
  const wbSeries = getSeries(indicator.id, "UY", { status: "SECONDARY", periodLength: 4 });
  const ranking = indicator.geographicLevel.includes("departamento")
    ? getDepartmentRanking(indicator.id)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <nav aria-label="Miga de pan" className="text-sm text-ink-faint">
        <Link className="hover:text-primary" href="/indicadores">
          Indicadores
        </Link>{" "}
        / <span className="text-ink-soft">{indicator.name}</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{indicator.question}</h1>
      <p className="mt-1 text-ink-faint">{indicator.name}</p>

      {/* Último dato */}
      <section aria-labelledby="ultimo-dato" className="mt-6">
        <h2 id="ultimo-dato" className="sr-only">
          Último dato disponible
        </h2>
        {latest && latest.obs.value !== null ? (
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="tnum font-display text-5xl font-bold">
                {formatValue(latest.obs.value, indicator.unit, indicator.decimals)}
              </p>
              {latest.delta !== undefined ? (
                <Delta
                  delta={latest.delta}
                  indicator={indicator}
                  prevLabel={latest.prev?.periodLabel}
                />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-ink-soft">{indicator.unitLabel}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
              <span>
                {latest.obs.periodLabel} · {source?.shortName}
              </span>
              <StatusBadge status={latest.obs.status} />
            </div>
            {latest.obs.notes ? (
              <p className="mt-2 text-sm text-ink-soft">{latest.obs.notes}</p>
            ) : null}
          </div>
        ) : indicator.geographicLevel.includes("pais") ? (
          <StateView kind="pending" />
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-soft shadow-card">
            Este indicador se publica por departamento: el detalle está en el ranking de más
            abajo.
          </div>
        )}
      </section>

      {/* ¿Qué significa? */}
      <section aria-labelledby="que-significa" className="mt-6">
        <div className="rounded-2xl border-l-4 border-primary bg-primary-soft/60 px-4 py-3">
          <h2 id="que-significa" className="text-sm font-bold uppercase tracking-wide text-primary">
            ¿Qué significa?
          </h2>
          <p className="mt-1 text-ink">{indicator.plainDefinition}</p>
        </div>
      </section>

      {/* Evolución */}
      <section aria-labelledby="evolucion" className="mt-8">
        <h2 id="evolucion" className="sr-only">
          Evolución histórica
        </h2>
        {wbSeries.length >= 4 ? (
          <ChartCard
            question={`${indicator.question} — evolución`}
            subtitle="Serie anual comparable (fuente secundaria internacional)"
            sourceLine={`Fuente: Banco Mundial · ${wbSeries[0].period}–${wbSeries[wbSeries.length - 1].period} · Serie anual`}
            note={wbSeries[0].notes}
            table={{
              caption: `Evolución anual de ${indicator.name}`,
              head: ["Año", indicator.name],
              rows: wbSeries.map((o) => [
                o.period,
                formatValue(o.value!, indicator.unit, indicator.decimals),
              ]),
            }}
          >
            <LineChart
              data={wbSeries.map((o) => ({ x: o.period, y: o.value! }))}
              unit={indicator.unit}
              decimals={indicator.decimals}
            />
          </ChartCard>
        ) : indicator.geographicLevel.includes("pais") ? (
          <StateView
            kind="pending"
            detail={`La serie histórica oficial (${source?.shortName}) se ingerirá y validará antes de publicarse.`}
          />
        ) : (
          <p className="text-sm text-ink-faint">
            La serie histórica {indicator.availableFrom ? `(${indicator.availableFrom}–hoy) ` : ""}
            está disponible en la fuente; el gráfico de evolución se sumará en una próxima
            versión.
          </p>
        )}
      </section>

      {/* Por departamento */}
      <section aria-labelledby="por-departamento" className="mt-8">
        <h2 id="por-departamento" className="font-display text-2xl font-bold">
          Por departamento
        </h2>
        <div className="mt-4">
          {ranking.length > 0 ? (
            <ChartCard
              question={`¿Dónde ${indicator.id === "poblacion" ? "vive más gente" : "es mayor"}?`}
              subtitle={`${indicator.name} por departamento`}
              sourceLine={`Fuente: ${source?.name} · ${ranking[0].obs.periodLabel}`}
              table={{
                caption: `${indicator.name} por departamento`,
                head: ["Departamento", indicator.name],
                rows: ranking.map((r) => [
                  r.territory.name,
                  formatValue(r.obs.value!, indicator.unit, indicator.decimals),
                ]),
              }}
            >
              <RankingList
                entries={ranking.map((r) => ({
                  label: r.territory.name,
                  href: `/departamentos/${r.territory.slug}`,
                  value: r.obs.value!,
                  display: formatNumber(r.obs.value!, indicator.decimals),
                }))}
              />
            </ChartCard>
          ) : indicator.geographicLevel.includes("departamento") ? (
            <StateView kind="nodata-departamental" />
          ) : (
            <StateView
              kind="nodata"
              detail="Este indicador se publica únicamente a nivel nacional."
            />
          )}
        </div>
      </section>

      {/* Fuente */}
      <section className="mt-8">
        <SourceNote indicator={indicator} obs={latest?.obs} />
      </section>
    </div>
  );
}
