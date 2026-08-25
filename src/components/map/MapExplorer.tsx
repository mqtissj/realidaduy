"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ChoroplethMap, { type MapEntry } from "@/components/map/ChoroplethMap";
import { CategoricalLegend, SequentialLegend } from "@/components/map/MapLegend";
import { DemoBadge, PartyBadge } from "@/components/ui/Badge";
import { quantileScale } from "@/lib/scale";
import { formatCompact } from "@/lib/format";
import type { TerritorySummary } from "@/lib/data/summaries";

type Mode = "poblacion" | "gobierno";

export default function MapExplorer({
  territories,
  geoUrl,
  profileBase,
  mapTitle,
  defaultMode = "poblacion",
}: {
  territories: TerritorySummary[];
  geoUrl: string;
  /** Base del enlace "Ver perfil completo" (null = sin perfil individual). */
  profileBase: string | null;
  mapTitle: string;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const byId = useMemo(
    () => Object.fromEntries(territories.map((t) => [t.id, t])),
    [territories]
  );

  const scale = useMemo(() => {
    const values = territories
      .map((t) => t.poblacion?.value)
      .filter((v): v is number => v !== undefined);
    return quantileScale(values);
  }, [territories]);

  const entries = useMemo(() => {
    const out: Record<string, MapEntry> = {};
    for (const t of territories) {
      if (mode === "poblacion") {
        out[t.id] = {
          fill: t.poblacion ? scale.fillFor(t.poblacion.value) : "var(--color-line)",
          label: t.name,
          sublabel: t.poblacion
            ? `${t.poblacion.display} habitantes (${t.poblacion.periodLabel})`
            : "Sin datos",
        };
      } else {
        out[t.id] = {
          fill: t.gov?.color ?? "var(--color-line)",
          label: t.name,
          sublabel: t.gov ? `Gobierno: ${t.gov.partyName}` : "Sin datos",
        };
      }
    }
    return out;
  }, [territories, mode, scale]);

  const partiesInMap = useMemo(() => {
    const seen = new Map<string, { color: string; label: string }>();
    for (const t of territories) {
      if (t.gov && !seen.has(t.gov.partyId)) {
        seen.set(t.gov.partyId, { color: t.gov.color, label: t.gov.partyName });
      }
    }
    return [...seen.values()];
  }, [territories]);

  const selected = selectedId ? byId[selectedId] : null;

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6">
      <div>
        <div
          role="group"
          aria-label="Elegir qué mostrar en el mapa"
          className="inline-flex rounded-lg border border-line bg-surface p-1"
        >
          {(
            [
              ["poblacion", "Población"],
              ["gobierno", "Partido de gobierno"],
            ] as [Mode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                mode === value ? "bg-primary text-white" : "text-ink-soft hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <ChoroplethMap
            geoUrl={geoUrl}
            entries={entries}
            selectedId={selectedId}
            onSelect={setSelectedId}
            title={mapTitle}
          />
        </div>

        <div className="mt-4">
          {mode === "poblacion" ? (
            <SequentialLegend
              breaks={scale.breaks}
              format={(v) => formatCompact(v)}
              title="Habitantes (Censo 2023)"
            />
          ) : (
            <CategoricalLegend items={partiesInMap} title="Partido de gobierno (2025)" />
          )}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Navegable con teclado: usá Tab para recorrer los territorios y Enter para
          seleccionar.
        </p>
      </div>

      {selected ? (
        <aside
          aria-label={`Detalle de ${selected.name}`}
          className="fixed inset-x-0 bottom-14 z-30 max-h-[55dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface p-5 shadow-overlay md:bottom-0 lg:static lg:z-auto lg:mt-12 lg:max-h-none lg:rounded-2xl lg:border lg:shadow-card"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl font-bold">{selected.name}</h2>
              {selected.capital ? (
                <p className="text-sm text-ink-faint">Capital: {selected.capital}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Cerrar detalle"
              className="rounded-lg border border-line px-2.5 py-1 text-sm font-bold text-ink-soft hover:bg-primary-soft"
            >
              ✕
            </button>
          </div>

          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-bold text-ink-faint">
                {selected.level === "municipio" ? "Alcalde/sa" : "Gobierno departamental"}
              </dt>
              <dd className="mt-1">
                {selected.gov ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <PartyBadge color={selected.gov.color} name={selected.gov.partyName} />
                    {selected.gov.electedName ? (
                      <span className="font-semibold">{selected.gov.electedName}</span>
                    ) : null}
                    {selected.gov.demo ? <DemoBadge /> : null}
                  </div>
                ) : (
                  "Sin datos"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-ink-faint">Población</dt>
              <dd className="mt-1">
                {selected.poblacion ? (
                  <span className="tnum text-lg font-bold">
                    {selected.poblacion.display}{" "}
                    <span className="text-sm font-normal text-ink-faint">
                      habitantes · {selected.poblacion.periodLabel}
                    </span>
                  </span>
                ) : (
                  "Sin datos"
                )}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-ink-faint">Empleo, ingreso y pobreza</dt>
              <dd className="mt-1 text-ink-soft">
                {selected.level === "municipio"
                  ? "Disponible a nivel departamental. No existe información municipal comparable."
                  : "La apertura departamental (ECH del INE) todavía no fue ingerida en la plataforma."}
              </dd>
            </div>
          </dl>

          {profileBase ? (
            <Link
              href={`${profileBase}/${selected.slug}`}
              className="mt-5 inline-block rounded-lg bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Ver perfil completo →
            </Link>
          ) : null}
        </aside>
      ) : (
        <aside className="hidden lg:mt-12 lg:block">
          <div className="rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-ink-soft">
            Seleccioná un territorio en el mapa para ver su resumen.
          </div>
        </aside>
      )}
    </div>
  );
}
