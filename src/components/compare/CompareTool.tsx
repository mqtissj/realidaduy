"use client";

import { useMemo, useState } from "react";
import { DemoBadge } from "@/components/ui/Badge";
import { formatNumber } from "@/lib/format";
import type { TerritorySummary } from "@/lib/data/summaries";

const EMPTY = "";

export default function CompareTool({
  territories,
  initial,
}: {
  territories: TerritorySummary[];
  initial: string[];
}) {
  const [picks, setPicks] = useState<string[]>([
    initial[0] ?? EMPTY,
    initial[1] ?? EMPTY,
    initial[2] ?? EMPTY,
  ]);

  const bySlug = useMemo(
    () => Object.fromEntries(territories.map((t) => [t.slug + "|" + t.level, t])),
    [territories]
  );
  const departments = territories.filter((t) => t.level === "departamento");
  const municipios = territories.filter((t) => t.level === "municipio");

  const chosen = picks
    .filter((p) => p !== EMPTY)
    .map((p) => bySlug[p])
    .filter((t): t is TerritorySummary => Boolean(t?.poblacion));

  const max = Math.max(...chosen.map((t) => t.poblacion!.value), 1);
  const base = chosen[0];

  const update = (index: number, value: string) => {
    setPicks((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  return (
    <div>
      <fieldset className="rounded-2xl border border-line bg-surface p-4 shadow-card">
        <legend className="px-1 font-display text-sm font-bold text-ink-soft">
          Elegí hasta 3 territorios
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <label key={i} className="block text-sm">
              <span className="font-semibold text-ink-soft">
                Territorio {i + 1}
                {i === 2 ? " (opcional)" : ""}
              </span>
              <select
                value={picks[i]}
                onChange={(e) => update(i, e.target.value)}
                className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base"
              >
                <option value={EMPTY}>— Elegir —</option>
                <optgroup label="Departamentos">
                  {departments.map((t) => (
                    <option key={t.id} value={t.slug + "|departamento"}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Municipios de Montevideo">
                  {municipios.map((t) => (
                    <option key={t.id} value={t.slug + "|municipio"}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
          ))}
        </div>
        <label className="mt-3 block text-sm">
          <span className="font-semibold text-ink-soft">Indicador</span>
          <select
            disabled
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-base text-ink-soft sm:max-w-xs"
          >
            <option>Población (Censo 2023, INE)</option>
          </select>
          <span className="mt-1 block text-xs text-ink-faint">
            Más indicadores comparables se sumarán al ingerir la apertura departamental de la
            ECH (desempleo, ingreso, pobreza).
          </span>
        </label>
      </fieldset>

      <div aria-live="polite" className="mt-6">
        {chosen.length < 2 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-8 text-center text-ink-soft">
            Elegí al menos dos territorios para comparar.
          </div>
        ) : (
          <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
            <figcaption>
              <h2 className="font-display text-lg font-bold md:text-xl">
                ¿Cuánta gente vive en cada territorio?
              </h2>
              <p className="mt-0.5 text-sm text-ink-soft">Población · Censo 2023 · INE</p>
            </figcaption>
            <div className="mt-4 space-y-2">
              {chosen.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[8rem_1fr_auto] items-center gap-2 text-sm sm:grid-cols-[11rem_1fr_auto]"
                >
                  <span className="truncate font-semibold">{t.name}</span>
                  <span aria-hidden className="h-5 overflow-hidden rounded-r-sm bg-primary-soft">
                    <span
                      className="block h-full rounded-r-sm bg-primary"
                      style={{ width: `${Math.max((t.poblacion!.value / max) * 100, 2)}%` }}
                    />
                  </span>
                  <span className="tnum font-bold">{t.poblacion!.display}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <caption className="sr-only">
                  Comparación de población entre los territorios elegidos
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">
                      Territorio
                    </th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-right font-bold text-ink-soft">
                      Población
                    </th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-right font-bold text-ink-soft">
                      Diferencia vs {base.name}
                    </th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-right font-bold text-ink-soft">
                      Diferencia %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chosen.map((t, i) => {
                    const diff = t.poblacion!.value - base.poblacion!.value;
                    const pct = (diff / base.poblacion!.value) * 100;
                    return (
                      <tr key={t.id}>
                        <td className="border-b border-line px-2 py-1.5 font-semibold">{t.name}</td>
                        <td className="tnum border-b border-line px-2 py-1.5 text-right">
                          {t.poblacion!.display}
                        </td>
                        <td className="tnum border-b border-line px-2 py-1.5 text-right">
                          {i === 0 ? "—" : `${diff > 0 ? "+" : "−"}${formatNumber(Math.abs(diff))}`}
                        </td>
                        <td className="tnum border-b border-line px-2 py-1.5 text-right">
                          {i === 0 ? "—" : `${pct > 0 ? "+" : "−"}${formatNumber(Math.abs(pct), 1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              Fuente: INE, Censo 2023 (resultados finales). La población de los municipios de
              Montevideo se calcula sumando sus CCZ según la cartografía censal.
            </p>
            {chosen.some((t) => t.poblacion!.demo) ? (
              <div className="mt-2">
                <DemoBadge />
              </div>
            ) : null}
          </figure>
        )}
      </div>
    </div>
  );
}
