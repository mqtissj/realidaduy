// Resúmenes serializables para componentes cliente (mapa, comparador).

import { departments, montevideoMunicipalities, municipalTerritories } from "@/data/territories";
import { getGovernment, getParty } from "@/data/elections";
import { breakdownDimensions, getBreakdownAt, getLatest, indicatorsForLevel } from "@/lib/data";
import { getObservationSource } from "@/data/sources";
import { dataHref, getCatalogDataset } from "@/data/catalogo";
import { formatNumber, formatValue } from "@/lib/format";
import type { BreakdownDimension, Category, GeoLevel } from "@/lib/types";

export interface MetricSummary {
  indicatorId: string;
  slug: string;
  name: string;
  /** Tema del diccionario: agrupa las filas de la vista general del comparador. */
  category: Category;
  /** Etiqueta corta para selectores ("Desempleo"). */
  mapLabel: string;
  unit: string;
  decimals: number;
  value: number;
  /** Valor formateado con unidad ("7,2%", "$ 91.500"). */
  display: string;
  periodLabel: string;
  sourceShort: string;
  /** Enlace al dato: la página del conjunto si viene del Catálogo Nacional, si no la URL de origen. */
  sourceHref: string;
  /** Nombre del conjunto del Catálogo Nacional, si el dato sale de ahí. */
  datasetTitle?: string;
  /** Aperturas del mismo período que el valor (hombres y mujeres), si las hay. */
  breakdowns?: MetricBreakdown[];
}

export interface MetricBreakdown {
  dimension: BreakdownDimension;
  groups: { group: string; label: string; value: number; display: string }[];
}

export interface TerritorySummary {
  id: string;
  slug: string;
  name: string;
  capital?: string;
  level: "departamento" | "municipio";
  poblacion?: { value: number; display: string; demo: boolean; periodLabel: string };
  gov?: {
    partyId: string;
    partyName: string;
    partyShort: string;
    color: string;
    electedName?: string;
    demo: boolean;
  };
  /** Todos los indicadores del nivel con dato en este territorio (incluye población). */
  metrics: MetricSummary[];
}

function breakdownsFor(
  indicatorId: string,
  territoryId: string,
  period: string,
  unit: string,
  decimals: number
): MetricBreakdown[] | undefined {
  const out: MetricBreakdown[] = [];
  for (const dimension of breakdownDimensions(indicatorId)) {
    const groups = getBreakdownAt(indicatorId, territoryId, dimension, period);
    if (groups.length === 0) continue;
    out.push({
      dimension,
      groups: groups.map((g) => ({
        group: g.group,
        label: g.label,
        value: g.obs.value!,
        display: formatValue(g.obs.value!, unit, decimals),
      })),
    });
  }
  return out.length ? out : undefined;
}

function metricsFor(territoryId: string, level: GeoLevel): MetricSummary[] {
  const out: MetricSummary[] = [];
  for (const i of indicatorsForLevel(level)) {
    const latest = getLatest(i.id, territoryId);
    if (!latest || latest.obs.value === null) continue;
    out.push({
      indicatorId: i.id,
      slug: i.slug,
      name: i.name,
      category: i.category,
      mapLabel: i.shortName ?? i.name,
      unit: i.unit,
      decimals: i.decimals,
      value: latest.obs.value,
      display: formatValue(latest.obs.value, i.unit, i.decimals),
      periodLabel: latest.obs.periodLabel,
      sourceShort: getObservationSource(i.sourceId, latest.obs)?.shortName ?? i.sourceId,
      sourceHref: dataHref(latest.obs.sourceUrl),
      datasetTitle: getCatalogDataset(latest.obs.sourceUrl)?.title,
      breakdowns: breakdownsFor(i.id, territoryId, latest.obs.period, i.unit, i.decimals),
    });
  }
  return out;
}

function summarize(
  territory: { id: string; slug: string; name: string; capital?: string },
  level: "departamento" | "municipio"
): TerritorySummary {
  const pobla = getLatest("poblacion", territory.id);
  const gov = getGovernment(territory.id);
  const party = gov ? getParty(gov.partyId) : undefined;
  return {
    id: territory.id,
    slug: territory.slug,
    name: territory.name,
    capital: territory.capital,
    level,
    poblacion:
      pobla && pobla.obs.value !== null
        ? {
            value: pobla.obs.value,
            display: formatNumber(pobla.obs.value, 0),
            demo: pobla.obs.demo,
            periodLabel: pobla.obs.periodLabel,
          }
        : undefined,
    gov:
      gov && party
        ? {
            partyId: party.id,
            partyName: party.name,
            partyShort: party.shortName,
            color: party.color,
            electedName: gov.electedName,
            demo: gov.demo,
          }
        : undefined,
    metrics: metricsFor(territory.id, level),
  };
}

export function departmentSummaries(): TerritorySummary[] {
  return departments.map((d) => summarize(d, "departamento"));
}

export function municipioSummaries(): TerritorySummary[] {
  return montevideoMunicipalities.map((m) => summarize(m, "municipio"));
}

/** Los 136 municipios del país (incluye los 8 de Montevideo). */
export function allMunicipioSummaries(): TerritorySummary[] {
  return municipalTerritories.map((m) => summarize(m, "municipio"));
}
