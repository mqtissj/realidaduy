import { departments, getDepartmentBySlug, municipalitiesOf } from "@/data/territories";
import { getLatest } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export function generateStaticParams() {
  return departments.map((d) => ({ slug: d.slug }));
}

export const alt = "Perfil territorial de un departamento de Uruguay en realidad.uy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dept = getDepartmentBySlug(slug);
  if (!dept) return renderOgImage({ title: "Departamento" });

  const pop = getLatest("poblacion", dept.id);
  const munis = municipalitiesOf(dept.id).length;

  return renderOgImage({
    eyebrow: "Departamento",
    title: dept.name,
    value: pop && pop.obs.value !== null ? formatNumber(pop.obs.value) : undefined,
    valueLabel:
      pop && pop.obs.value !== null ? `habitantes · ${pop.obs.periodLabel}` : undefined,
    meta: [
      dept.capital ? `Capital: ${dept.capital}` : null,
      munis > 0 ? `${munis} municipio${munis === 1 ? "" : "s"}` : null,
      "Indicadores y elecciones con fuente",
    ]
      .filter(Boolean)
      .join(" · "),
  });
}
