// Generación de los CSV descargables.
//
// Decisiones de formato (pensadas para que el archivo se abra igual de bien en
// Excel, en Google Sheets y en pandas/R):
//   · UTF-8 con BOM  → Excel muestra los acentos correctamente.
//   · separador coma y punto decimal → estándar interoperable; el número queda
//     listo para analizar, sin conversión de locale.
//   · CRLF → fin de línea de la especificación (RFC 4180).
//   · una fila = una observación, con toda su procedencia al lado (fuente, URL,
//     estado, fecha de obtención): el dato nunca viaja separado de su origen.

import type { Election, ElectionResult, Indicator, Observation, Party, Territory } from "@/lib/types";

const BOM = "﻿";
const EOL = "\r\n";

function cell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "sí" : "no";
  const text = value.replace(/\r?\n/g, " ").trim();
  return /[",;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(head: string[], rows: Array<Array<string | number | boolean | null | undefined>>): string {
  return BOM + [head, ...rows].map((r) => r.map(cell).join(",")).join(EOL) + EOL;
}

const LEVEL_ORDER: Record<Territory["level"], number> = {
  pais: 0,
  departamento: 1,
  municipio: 2,
};

export const OBSERVATION_HEAD = [
  "indicador_id",
  "indicador",
  "territorio_id",
  "territorio",
  "nivel",
  "periodo",
  "periodo_etiqueta",
  "valor",
  "unidad",
  "estado",
  "fuente",
  "fuente_url",
  "obtenido",
  "quiebre_metodologico",
  "notas",
];

export interface CsvContext {
  indicatorById: (id: string) => Indicator | undefined;
  territoryById: (id: string) => Territory | undefined;
  /**
   * Organismo de esa observación concreta, que no siempre es el del indicador:
   * la serie histórica de un indicador del INE puede venir del Banco Mundial.
   * En un CSV la columna "fuente" se lee como atribución, así que tiene que
   * decir quién produjo ese dato y no quién produce el indicador en general.
   */
  sourceName: (indicator: Indicator | undefined, obs: Observation) => string;
}

function observationRow(obs: Observation, ctx: CsvContext) {
  const indicator = ctx.indicatorById(obs.indicatorId);
  const territory = ctx.territoryById(obs.territoryId);
  return [
    obs.indicatorId,
    indicator?.name ?? "",
    obs.territoryId,
    territory?.name ?? "",
    territory?.level ?? "",
    obs.period,
    obs.periodLabel,
    obs.value,
    indicator?.unit ?? "",
    obs.status,
    ctx.sourceName(indicator, obs),
    obs.sourceUrl,
    obs.retrievedAt,
    obs.breakBefore ?? false,
    obs.notes ?? "",
  ];
}

/** Ordena país → departamentos → municipios, alfabético, y por período. */
export function sortObservations(obs: Observation[], ctx: CsvContext): Observation[] {
  return [...obs].sort((a, b) => {
    const ta = ctx.territoryById(a.territoryId);
    const tb = ctx.territoryById(b.territoryId);
    const la = LEVEL_ORDER[ta?.level ?? "pais"];
    const lb = LEVEL_ORDER[tb?.level ?? "pais"];
    if (la !== lb) return la - lb;
    const byName = (ta?.name ?? "").localeCompare(tb?.name ?? "", "es");
    if (byName !== 0) return byName;
    return a.period.localeCompare(b.period);
  });
}

export function observationsCsv(obs: Observation[], ctx: CsvContext): string {
  return toCsv(
    OBSERVATION_HEAD,
    sortObservations(obs, ctx).map((o) => observationRow(o, ctx))
  );
}

/** Diccionario de indicadores: qué mide cada uno, con metodología y fuente. */
export function dictionaryCsv(indicators: Indicator[], sourceName: (i: Indicator) => string): string {
  return toCsv(
    [
      "id",
      "nombre",
      "pregunta",
      "definicion",
      "categoria",
      "unidad",
      "periodicidad",
      "niveles",
      "desde",
      "calculado",
      "metodologia",
      "fuente",
      "fuente_url",
      "actualizado",
    ],
    indicators.map((i) => [
      i.id,
      i.name,
      i.question,
      i.plainDefinition,
      i.category,
      i.unit,
      i.periodicity,
      i.geographicLevel.join(" "),
      i.availableFrom ?? "",
      i.isCalculated,
      i.methodology,
      sourceName(i),
      i.sourceUrl,
      i.lastUpdated,
    ])
  );
}

/** Resultados electorales, incluyendo el nombre de la persona electa. */
export function electionsCsv(
  results: ElectionResult[],
  ctx: {
    election: (id: string) => Election | undefined;
    party: (id: string) => Party | undefined;
    territory: (id: string) => Territory | undefined;
  }
): string {
  return toCsv(
    [
      "eleccion_id",
      "eleccion",
      "fecha",
      "tipo",
      "territorio_id",
      "territorio",
      "nivel",
      "partido_id",
      "partido",
      "votos",
      "porcentaje",
      "base_porcentaje",
      "ganador",
      "electo",
      "fuente_url",
    ],
    results.map((r) => {
      const election = ctx.election(r.electionId);
      const territory = ctx.territory(r.territoryId);
      return [
        r.electionId,
        election?.name ?? "",
        election?.date ?? "",
        election?.type ?? "",
        r.territoryId,
        territory?.name ?? "",
        territory?.level ?? "",
        r.partyId,
        ctx.party(r.partyId)?.name ?? "",
        r.votes,
        r.pct,
        r.pctBase,
        r.winner,
        r.electedName ?? "",
        r.sourceUrl,
      ];
    })
  );
}

/** Autoridades electas 2025–2030: intendentes y alcaldes, una fila por persona. */
export function authoritiesCsv(
  results: ElectionResult[],
  ctx: {
    election: (id: string) => Election | undefined;
    party: (id: string) => Party | undefined;
    territory: (id: string) => Territory | undefined;
  }
): string {
  const CARGO: Record<Territory["level"], string> = {
    pais: "Presidente/a",
    departamento: "Intendente/a",
    municipio: "Alcalde/Alcaldesa",
  };
  const rows = results
    .filter((r) => r.winner && r.electedName)
    .map((r) => {
      const territory = ctx.territory(r.territoryId);
      const parent = territory?.parentId ? ctx.territory(territory.parentId) : undefined;
      return {
        cargo: CARGO[territory?.level ?? "pais"],
        territory,
        parent,
        r,
      };
    })
    .sort((a, b) => {
      const la = LEVEL_ORDER[a.territory?.level ?? "pais"];
      const lb = LEVEL_ORDER[b.territory?.level ?? "pais"];
      if (la !== lb) return la - lb;
      const byParent = (a.parent?.name ?? "").localeCompare(b.parent?.name ?? "", "es");
      if (byParent !== 0) return byParent;
      return (a.territory?.name ?? "").localeCompare(b.territory?.name ?? "", "es");
    });

  return toCsv(
    [
      "cargo",
      "territorio_id",
      "territorio",
      "nivel",
      "departamento",
      "nombre",
      "partido",
      "eleccion",
      "fecha",
      "fuente_url",
    ],
    rows.map(({ cargo, territory, parent, r }) => [
      cargo,
      r.territoryId,
      territory?.name ?? "",
      territory?.level ?? "",
      parent?.name ?? territory?.name ?? "",
      r.electedName ?? "",
      ctx.party(r.partyId)?.name ?? "",
      ctx.election(r.electionId)?.name ?? "",
      ctx.election(r.electionId)?.date ?? "",
      r.sourceUrl,
    ])
  );
}
