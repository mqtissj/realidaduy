// Catálogo de descargas: define, en un solo lugar, qué archivos CSV publica la
// plataforma. Lo consumen la página /datos (listado) y la ruta /datos/[archivo]
// (que genera el archivo en el build, no en cada visita).
//
// Las URLs son estables y citables: un periodista puede escribir
// "realidad.uy/datos/desempleo.csv" en una nota y el link va a seguir andando.

import { activeIndicators, getIndicator } from "@/data/dictionary";
import { getObservationSource, getSource } from "@/data/sources";
import { electionResults, getElection, getParty } from "@/data/elections";
import { getTerritoryById } from "@/data/territories";
import { getAllObservations, getIndicatorObservations } from "@/lib/data";
import {
  authoritiesCsv,
  dictionaryCsv,
  electionsCsv,
  observationsCsv,
  type CsvContext,
} from "@/lib/csv";
import type { Indicator, Observation } from "@/lib/types";

// La columna "fuente" del CSV cita a quien publica cada fila (Banco Mundial,
// PRISMA), no siempre al organismo del indicador.
function sourceNameFor(indicator: Indicator | undefined, obs: Observation): string {
  return getObservationSource(indicator?.sourceId, obs)?.name ?? "";
}

const observationCtx: CsvContext = {
  indicatorById: (id) => getIndicator(id),
  territoryById: (id) => getTerritoryById(id),
  sourceName: sourceNameFor,
};

const electionCtx = {
  election: (id: string) => getElection(id),
  party: (id: string) => getParty(id),
  territory: (id: string) => getTerritoryById(id),
};

const sourceNameOf = (i: Indicator) => getSource(i.sourceId)?.name ?? "";

export interface Download {
  /** Nombre del archivo, con extensión: "desempleo.csv". */
  file: string;
  title: string;
  description: string;
  /** Filas de datos, sin contar el encabezado. */
  rows: number;
  group: "indicador" | "completo";
  /** Página de la que salen los datos, para volver al contexto. */
  href?: string;
  build: () => string;
}

const completeDownloads: Download[] = [
  {
    file: "realidad-uy-observaciones.csv",
    title: "Todas las observaciones",
    description:
      "Cada dato de la plataforma en una fila, con territorio, período, valor, estado, fuente y URL del dato original.",
    rows: getAllObservations().length,
    group: "completo",
    href: "/indicadores",
    build: () => observationsCsv(getAllObservations(), observationCtx),
  },
  {
    file: "indicadores-diccionario.csv",
    title: "Diccionario de indicadores",
    description:
      "Qué mide cada indicador, con definición en lenguaje llano, metodología, periodicidad, niveles territoriales y fuente.",
    rows: activeIndicators.length,
    group: "completo",
    href: "/indicadores",
    build: () => dictionaryCsv(activeIndicators, sourceNameOf),
  },
  {
    file: "elecciones-resultados.csv",
    title: "Resultados electorales",
    description:
      "Resultados por territorio y partido (nacionales 2024, departamentales y municipales 2025), con la base de cada porcentaje declarada.",
    rows: electionResults.length,
    group: "completo",
    href: "/elecciones",
    build: () => electionsCsv(electionResults, electionCtx),
  },
  {
    file: "autoridades-electas-2025-2030.csv",
    title: "Autoridades electas 2025–2030",
    description:
      "Presidencia, 19 intendencias y 136 alcaldías, con partido y nombre. Los alcaldes están verificados uno por uno contra las actas de proclamación de las Juntas Electorales Departamentales.",
    rows: electionResults.filter((r) => r.winner && r.electedName).length,
    group: "completo",
    href: "/municipios",
    build: () => authoritiesCsv(electionResults, electionCtx),
  },
];

const indicatorDownloads: Download[] = activeIndicators.map((indicator) => ({
  file: `${indicator.slug}.csv`,
  title: indicator.name,
  description: indicator.plainDefinition,
  rows: getIndicatorObservations(indicator.id).length,
  group: "indicador",
  href: `/indicadores/${indicator.slug}`,
  build: () => observationsCsv(getIndicatorObservations(indicator.id), observationCtx),
}));

export const downloads: Download[] = [...completeDownloads, ...indicatorDownloads];

export function getDownload(file: string): Download | undefined {
  return downloads.find((d) => d.file === file);
}

/** Descarga correspondiente a un indicador, para el botón de su página. */
export function downloadForIndicator(slug: string): Download | undefined {
  return indicatorDownloads.find((d) => d.file === `${slug}.csv`);
}
