import type { Metadata } from "next";
import CompareTool from "@/components/compare/CompareTool";
import { departmentSummaries, municipioSummaries } from "@/lib/data/summaries";

export const metadata: Metadata = {
  title: "Compará territorios",
  description:
    "Compará departamentos y municipios de Uruguay lado a lado, con diferencias absolutas y porcentuales y fuente a la vista.",
};

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; nivel?: string }>;
}) {
  const { a, b, nivel } = await searchParams;
  const territories = [...departmentSummaries(), ...municipioSummaries()];
  const initial: string[] = [];
  if (a) initial.push(`${a}|departamento`);
  if (b) initial.push(`${b}|departamento`);
  if (nivel === "municipio" && initial.length === 0) {
    // Sugerencia inicial al llegar desde la página de municipios.
    initial.push("ch|municipio", "f|municipio");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Compará</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Elegí dos o tres territorios y miralos lado a lado. Cada comparación muestra la
        diferencia absoluta, la porcentual y la fuente.
      </p>
      <div className="mt-6">
        <CompareTool territories={territories} initial={initial} />
      </div>
    </div>
  );
}
