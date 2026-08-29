import { activeIndicators, getIndicator } from "@/data/dictionary";
import { getSource } from "@/data/sources";
import { getDepartmentRanking, getLatest } from "@/lib/data";
import { formatValue } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export function generateStaticParams() {
  return activeIndicators.map((i) => ({ slug: i.slug }));
}

export const alt = "Indicador de realidad.uy con su último dato, período y fuente";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const indicator = getIndicator(slug);
  if (!indicator) return renderOgImage({ title: "Indicador" });

  const source = getSource(indicator.sourceId);
  const latest = getLatest(indicator.id, "UY");

  // Sin dato país (indicadores solo departamentales): la vista previa muestra
  // el alcance territorial en vez de un número que no existe.
  const deptCount = latest ? 0 : getDepartmentRanking(indicator.id).length;

  return renderOgImage({
    eyebrow: "Indicador",
    title: indicator.question,
    value:
      latest && latest.obs.value !== null
        ? formatValue(latest.obs.value, indicator.unit, indicator.decimals)
        : undefined,
    valueLabel:
      latest && latest.obs.value !== null
        ? `${indicator.unitLabel} · ${latest.obs.periodLabel}`
        : undefined,
    meta:
      latest && latest.obs.value !== null
        ? `${indicator.name} · Fuente: ${source?.shortName ?? "oficial"}`
        : deptCount > 0
          ? `${indicator.name} · ${deptCount} departamentos · Fuente: ${source?.shortName ?? "oficial"}`
          : indicator.name,
  });
}
