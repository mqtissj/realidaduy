import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EmbedFrame from "@/components/embed/EmbedFrame";
import EmbedMap, { type EmbedLegend } from "@/components/embed/EmbedMap";
import type { MapEntry } from "@/components/map/ChoroplethMap";
import { departmentSummaries, type MetricSummary } from "@/lib/data/summaries";
import { quantileScale } from "@/lib/scale";

const GOBIERNO = "gobierno";

/** Indicadores con dato departamental, más el mapa de partido de gobierno. */
function embeddableSlugs(): string[] {
  const territories = departmentSummaries();
  const slugs = new Set<string>();
  for (const t of territories) for (const m of t.metrics) slugs.add(m.slug);
  return [GOBIERNO, ...slugs];
}

export function generateStaticParams() {
  return embeddableSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Mapa para insertar — ${slug}` };
}

export default async function EmbedMapaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const territories = departmentSummaries();

  if (slug === GOBIERNO) {
    const entries: Record<string, MapEntry> = {};
    const parties = new Map<string, { color: string; label: string }>();
    for (const t of territories) {
      entries[t.id] = {
        fill: t.gov?.color ?? "var(--color-line)",
        label: t.name,
        sublabel: t.gov
          ? `${t.gov.partyName}${t.gov.electedName ? ` · ${t.gov.electedName}` : ""}`
          : "Sin datos",
      };
      if (t.gov && !parties.has(t.gov.partyId)) {
        parties.set(t.gov.partyId, { color: t.gov.color, label: t.gov.partyName });
      }
    }
    const legend: EmbedLegend = {
      kind: "categorical",
      items: [...parties.values()],
      title: "Partido de gobierno",
    };
    return (
      <EmbedFrame
        title="Partido de gobierno departamental"
        subtitle="Intendencias electas en 2025 (período 2025–2030)"
        sourceLine="Fuente: Corte Electoral · Elecciones departamentales 2025"
        href="/elecciones"
      >
        <EmbedMap
          entries={entries}
          legend={legend}
          geoUrl="/geo/departamentos.json"
          mapTitle="Partido de gobierno de los 19 departamentos de Uruguay"
        />
      </EmbedFrame>
    );
  }

  // Indicador: se toma la primera aparición para nombre, unidad y período.
  let metric: MetricSummary | undefined;
  const values: number[] = [];
  for (const t of territories) {
    const m = t.metrics.find((x) => x.slug === slug);
    if (!m) continue;
    metric ??= m;
    values.push(m.value);
  }
  if (!metric || values.length < 2) notFound();

  const scale = quantileScale(values);
  const entries: Record<string, MapEntry> = {};
  for (const t of territories) {
    const m = t.metrics.find((x) => x.slug === slug);
    entries[t.id] = {
      fill: m ? scale.fillFor(m.value) : "var(--color-line)",
      label: t.name,
      sublabel: m ? `${m.display} (${m.periodLabel})` : "Sin datos",
    };
  }

  return (
    <EmbedFrame
      title={metric.name}
      subtitle={`Por departamento · ${metric.periodLabel}`}
      sourceLine={`Fuente: ${metric.sourceShort} · ${metric.periodLabel}`}
      href={`/indicadores/${slug}`}
    >
      <EmbedMap
        entries={entries}
        legend={{
          kind: "sequential",
          breaks: scale.breaks,
          unit: metric.unit,
          decimals: metric.decimals,
          title: `${metric.name} · ${metric.periodLabel}`,
        }}
        geoUrl="/geo/departamentos.json"
        mapTitle={`${metric.name} por departamento`}
      />
    </EmbedFrame>
  );
}
