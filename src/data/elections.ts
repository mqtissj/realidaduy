import type { Election, ElectionResult, Party } from "@/lib/types";
// Import relativo (no alias) para que scripts/validate-data.mjs pueda ejecutarlo con Node.
import {
  departamental2025PorDepartamento,
  municipal2025Montevideo,
  nacional2024PorDepartamento,
} from "./elecciones-generadas";

// Resultados electorales. Verificación 2026-08-25 y auditoría adversarial
// 2026-08-26 (41 valores cotejados contra Corte Electoral/Wikipedia/prensa).
// demo: true ⇒ pendiente de validación final contra los XLSX de la Corte Electoral.
// Los colores de partido se usan SOLO en mapas/gráficos electorales, siempre con
// etiqueta de texto (nunca solo color).

export const parties: Party[] = [
  { id: "fa", name: "Frente Amplio", shortName: "FA", color: "#2E5C9E" },
  { id: "pn", name: "Partido Nacional", shortName: "PN", color: "#8FC1E8" },
  { id: "pc", name: "Partido Colorado", shortName: "PC", color: "#C0392B" },
  { id: "ca", name: "Cabildo Abierto", shortName: "CA", color: "#D9A400" },
  { id: "pi", name: "Partido Independiente", shortName: "PI", color: "#7B5EA7" },
  { id: "is", name: "Identidad Soberana", shortName: "IS", color: "#5E8C61" },
  { id: "cr", name: "Coalición Republicana", shortName: "CR", color: "#4B8B9B" },
  { id: "otros", name: "Otros partidos", shortName: "Otros", color: "#8A8A8A" },
];

export function getParty(id: string): Party | undefined {
  return parties.find((p) => p.id === id);
}

const WIKI_2024 = "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_2024";
const CKAN_2025 =
  "https://catalogodatos.gub.uy/dataset/corte-electoral-elecciones_departamentales_y_municipales_2025";

export const elections: Election[] = [
  {
    id: "nacional-2024",
    date: "2024-10-27",
    name: "Elección nacional 2024 — primera vuelta",
    type: "nacional",
    sourceUrl:
      "https://www.gub.uy/corte-electoral/datos-y-estadisticas/estadisticas/resultados-elecciones-nacionales-del-2024",
  },
  {
    id: "balotaje-2024",
    date: "2024-11-24",
    name: "Balotaje 2024",
    type: "balotaje",
    sourceUrl: WIKI_2024,
  },
  {
    id: "departamental-2025",
    date: "2025-05-11",
    name: "Elecciones departamentales 2025",
    type: "departamental",
    sourceUrl:
      "https://www.gub.uy/corte-electoral/datos-y-estadisticas/estadisticas/resultados-del-escrutinio-primario-elecciones-departamentales",
  },
  {
    id: "municipal-2025",
    date: "2025-05-11",
    name: "Elecciones municipales 2025 — Montevideo",
    type: "municipal",
    sourceUrl: CKAN_2025,
  },
];

/** Participación electoral por elección (% de habilitados que votaron). */
export const turnout: { electionId: string; pct: number; demo: boolean; sourceUrl: string }[] = [
  { electionId: "nacional-2024", pct: 89.6, demo: true, sourceUrl: WIKI_2024 },
  { electionId: "balotaje-2024", pct: 89.35, demo: true, sourceUrl: WIKI_2024 },
  {
    electionId: "departamental-2025",
    pct: 86.88,
    demo: true,
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_departamentales_y_municipales_de_Uruguay_de_2025",
  },
];

// Nombres de las personas electas en 2025 (verificados; se adjuntan a las filas
// ganadoras generadas desde los datos oficiales de la Corte Electoral).
const INTENDENTES_2025: Record<string, string> = {
  "UY-AR": "Emiliano Soravilla",
  "UY-CA": "Francisco Legnani",
  "UY-CL": "Christian Morel",
  "UY-CO": "Guillermo Rodríguez",
  "UY-DU": "Felipe Algorta",
  "UY-FS": "Diego Irazábal",
  "UY-FD": "Carlos Enciso",
  "UY-LA": "Daniel Ximénez",
  "UY-MA": "Miguel Abella",
  "UY-MO": "Mario Bergara",
  "UY-PA": "Nicolás Olivera",
  "UY-RN": "Guillermo Levratto",
  "UY-RV": "Richard Sander",
  "UY-RO": "Alejo Umpiérrez",
  "UY-SA": "Carlos Albisu",
  "UY-SJ": "Ana Bentaberri",
  "UY-SO": "Guillermo Besozzi",
  "UY-TA": "Wilson Ezquerra",
  "UY-TT": "Mario Silvera",
};

const ALCALDES_2025: Record<string, string> = {
  "UY-MO-A": "Juan Carlos Plachot",
  "UY-MO-B": "Patricia Soria",
  "UY-MO-C": "Damián Salvetto",
  "UY-MO-CH": "Matilde Antía",
  "UY-MO-D": "Gabriel Velazco",
  "UY-MO-E": "Mercedes Ruiz",
  "UY-MO-F": "Matilde Palermo",
  "UY-MO-G": "Leticia de Torres",
};

const withNames = (rows: ElectionResult[], names: Record<string, string>): ElectionResult[] =>
  rows.map((r) => (r.winner && names[r.territoryId] ? { ...r, electedName: names[r.territoryId] } : r));

export const electionResults: ElectionResult[] = [
  // ── Nacional 2024, primera vuelta (nivel país) ──
  // Porcentajes sobre el TOTAL DE VOTOS EMITIDOS (2.443.801), la forma en que se
  // difundieron públicamente. Verificado por máquina contra los datos abiertos de
  // la Corte Electoral (scripts/ingest/fetch-elecciones.mjs): demo false.
  { electionId: "nacional-2024", territoryId: "UY", partyId: "fa", votes: 1071826, pct: 43.86, pctBase: "emitidos", winner: true, demo: false, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "pn", votes: 655426, pct: 26.82, pctBase: "emitidos", winner: false, demo: false, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "pc", votes: 392592, pct: 16.06, pctBase: "emitidos", winner: false, demo: false, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "is", votes: 65796, pct: 2.69, pctBase: "emitidos", winner: false, demo: false, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "ca", votes: 60549, pct: 2.47, pctBase: "emitidos", winner: false, demo: false, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "pi", votes: 41618, pct: 1.7, pctBase: "emitidos", winner: false, demo: false, sourceUrl: WIKI_2024 },

  // ── Nacional 2024 por departamento (generado desde datos oficiales) ──
  ...nacional2024PorDepartamento,

  // ── Balotaje 2024 (% sobre votos válidos, escrutinio definitivo) ──
  { electionId: "balotaje-2024", territoryId: "UY", partyId: "fa", votes: 1212833, pct: 52.0, pctBase: "validos", winner: true, electedName: "Yamandú Orsi", demo: true, sourceUrl: WIKI_2024 },
  { electionId: "balotaje-2024", territoryId: "UY", partyId: "pn", votes: 1119537, pct: 48.0, pctBase: "validos", winner: false, electedName: "Álvaro Delgado", demo: true, sourceUrl: WIKI_2024 },

  // ── Departamentales 2025 (generado desde datos oficiales; todos los lemas) ──
  // Balance: PN 13 · FA 4 · PC 1 · CR 1. Nombres de intendentes adjuntados.
  ...withNames(departamental2025PorDepartamento, INTENDENTES_2025),

  // ── Municipales 2025, Montevideo (generado; todos los lemas) ──
  // Balance: FA 6 · CR 2. Nombres de alcaldes/as adjuntados.
  ...withNames(municipal2025Montevideo, ALCALDES_2025),
];

export function getElection(id: string): Election | undefined {
  return elections.find((e) => e.id === id);
}

export function getElectionResults(electionId: string, territoryId?: string): ElectionResult[] {
  return electionResults.filter(
    (r) => r.electionId === electionId && (territoryId === undefined || r.territoryId === territoryId)
  );
}

/** Gobierno actual de un territorio (CALCULATED: ganador de la última elección del nivel). */
export function getGovernment(territoryId: string): ElectionResult | undefined {
  const electionId =
    territoryId === "UY"
      ? "balotaje-2024"
      : territoryId.split("-").length === 3
        ? "municipal-2025"
        : "departamental-2025";
  return electionResults.find(
    (r) => r.electionId === electionId && r.territoryId === territoryId && r.winner
  );
}
