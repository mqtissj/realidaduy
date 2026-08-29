import { departments, getDepartmentBySlug, municipalitiesOf } from "@/data/territories";
import { getLatest } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { renderOgImage } from "@/lib/og";

// Ver la nota en /og/indicador/[archivo]/route.tsx: ruta propia para que la
// página pueda declarar la imagen en su metadata, en el orden correcto.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return departments.map((d) => ({ archivo: `${d.slug}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;
  const dept = getDepartmentBySlug(archivo.replace(/\.png$/, ""));
  if (!dept) return new Response("No encontrado", { status: 404 });

  const pop = getLatest("poblacion", dept.id);
  const munis = municipalitiesOf(dept.id).length;

  return renderOgImage({
    eyebrow: "Departamento",
    title: dept.name,
    value: pop && pop.obs.value !== null ? formatNumber(pop.obs.value) : undefined,
    valueLabel: pop && pop.obs.value !== null ? `habitantes · ${pop.obs.periodLabel}` : undefined,
    meta: [
      dept.capital ? `Capital: ${dept.capital}` : null,
      munis > 0 ? `${munis} municipio${munis === 1 ? "" : "s"}` : null,
      "Indicadores y elecciones con fuente",
    ]
      .filter(Boolean)
      .join(" · "),
  });
}
