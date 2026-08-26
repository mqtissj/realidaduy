// API de acceso a datos. Toda la UI consume estas funciones; cuando la capa de
// datos migre de archivos estáticos a una base real (V2+), solo cambia este módulo.

import type { Indicator, Observation, Territory } from "@/lib/types";
import { dictionary, getIndicator } from "@/data/dictionary";
import { nationalObservations } from "@/data/observations/nacional";
import { departmentObservations } from "@/data/observations/departamentos";
import { municipioObservations } from "@/data/observations/municipios";
import { departmentEchObservations } from "@/data/observations/departamentos-ech";
import { seguridadObservations } from "@/data/observations/seguridad";
import { worldBankSeries } from "@/data/observations/series-banco-mundial";
import { departments, getTerritoryById } from "@/data/territories";

export { dictionary, getIndicator };
export * from "@/data/territories";
export * from "@/data/elections";
export { getSource, sources } from "@/data/sources";

const allObservations: Observation[] = [
  ...nationalObservations,
  ...departmentObservations,
  ...departmentEchObservations,
  ...seguridadObservations,
  ...municipioObservations,
  ...worldBankSeries,
];

/** Observaciones de un indicador en un territorio, ordenadas por período. */
export function getObservations(indicatorId: string, territoryId: string): Observation[] {
  return allObservations
    .filter((o) => o.indicatorId === indicatorId && o.territoryId === territoryId)
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Serie homogénea para gráficos: mismo indicador, territorio y granularidad de
 * período, filtrable por estado (p. ej. solo la serie anual SECONDARY del Banco
 * Mundial). Nunca mezcla granularidades en una misma serie.
 */
export function getSeries(
  indicatorId: string,
  territoryId: string,
  opts?: { status?: Observation["status"]; periodLength?: number }
): Observation[] {
  let obs = getObservations(indicatorId, territoryId).filter((o) => o.value !== null);
  if (opts?.status) obs = obs.filter((o) => o.status === opts.status);
  const len = opts?.periodLength ?? obs[obs.length - 1]?.period.length;
  return obs.filter((o) => o.period.length === len);
}

export interface LatestResult {
  obs: Observation;
  /** Observación inmediatamente anterior de la misma granularidad, si existe. */
  prev?: Observation;
  delta?: number;
}

/**
 * Último dato disponible + variación respecto al período anterior comparable.
 * Si existen datos de mejor jerarquía que SECONDARY (p. ej. el Censo frente a la
 * estimación del Banco Mundial), los titulares nunca usan la fuente secundaria.
 */
export function getLatest(indicatorId: string, territoryId: string): LatestResult | undefined {
  let obs = getObservations(indicatorId, territoryId).filter((o) => o.value !== null);
  if (obs.some((o) => o.status !== "SECONDARY")) {
    obs = obs.filter((o) => o.status !== "SECONDARY");
  }
  if (obs.length === 0) return undefined;
  const latest = obs[obs.length - 1];
  const comparable = obs.filter(
    (o) => o.period.length === latest.period.length && o.period < latest.period
  );
  const prev = comparable[comparable.length - 1];
  const delta =
    prev && latest.value !== null && prev.value !== null ? latest.value - prev.value : undefined;
  return { obs: latest, prev, delta };
}

export interface RankingEntry {
  territory: Territory;
  obs: Observation;
}

/** Último valor por departamento, ordenado descendente. */
export function getDepartmentRanking(indicatorId: string): RankingEntry[] {
  const entries: RankingEntry[] = [];
  for (const d of departments) {
    const latest = getLatest(indicatorId, d.id);
    if (latest && latest.obs.value !== null) entries.push({ territory: d, obs: latest.obs });
  }
  return entries.sort((a, b) => (b.obs.value ?? 0) - (a.obs.value ?? 0));
}

/** Indicadores activos que declaran datos para un nivel territorial. */
export function indicatorsForLevel(level: Territory["level"]): Indicator[] {
  return dictionary.filter((i) => i.status === "active" && i.geographicLevel.includes(level));
}

/** ¿Tiene el indicador al menos una observación en este territorio? */
export function hasData(indicatorId: string, territoryId: string): boolean {
  return getObservations(indicatorId, territoryId).some((o) => o.value !== null);
}

export { getTerritoryById };
