import type { Metadata } from "next";
import Link from "next/link";
import MetricCard from "@/components/charts/MetricCard";
import { activeIndicators, plannedIndicators } from "@/data/dictionary";
import type { Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Indicadores",
  description:
    "Todos los indicadores de Uruguay Data por categoría: trabajo, economía, sociedad y población, con fuente y metodología.",
};

const CATEGORY_LABEL: Partial<Record<Category, string>> = {
  trabajo: "Trabajo",
  economia: "Economía",
  sociedad: "Sociedad",
  poblacion: "Población",
};

const ORDER: Category[] = ["trabajo", "economia", "sociedad", "poblacion"];

export default function IndicadoresPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Indicadores</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Cada indicador muestra su último valor, su evolución y de dónde sale el dato.
      </p>

      {ORDER.map((cat) => {
        const indicators = activeIndicators.filter((i) => i.category === cat);
        if (indicators.length === 0) return null;
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`} className="mt-8">
            <h2 id={`cat-${cat}`} className="font-display text-2xl font-bold">
              {CATEGORY_LABEL[cat]}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {indicators.map((i) =>
                i.geographicLevel.includes("pais") ? (
                  <MetricCard key={i.id} indicatorId={i.id} />
                ) : (
                  <Link
                    key={i.id}
                    href={`/indicadores/${i.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-celeste"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink-soft">{i.name}</p>
                      <p className="mt-1 text-sm text-ink-faint">{i.question}</p>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-primary group-hover:underline">
                      Ver por departamento →
                    </p>
                  </Link>
                )
              )}
            </div>
          </section>
        );
      })}

      {plannedIndicators.length > 0 ? (
        <section aria-labelledby="en-preparacion" className="mt-10">
          <h2 id="en-preparacion" className="font-display text-2xl font-bold text-ink-soft">
            En preparación
          </h2>
          <p className="mt-1 text-sm text-ink-faint">
            Indicadores ya definidos en el diccionario, a la espera de ingesta y validación
            de su fuente.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plannedIndicators.map((i) => (
              <div
                key={i.id}
                className="rounded-2xl border border-dashed border-line bg-surface p-4"
              >
                <p className="text-sm font-bold text-ink-soft">{i.name}</p>
                <p className="mt-1 text-xs text-ink-faint">{i.question}</p>
                <p className="mt-2 inline-block rounded-full border border-line px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-faint">
                  Próximamente
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
