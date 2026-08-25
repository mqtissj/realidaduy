import type { Election, ElectionResult, Party } from "@/lib/types";

// Resultados electorales. Verificación 2026-08-25 (prensa + Wikipedia que reproducen
// datos de la Corte Electoral). demo: true ⇒ pendiente de validación contra los
// XLSX oficiales de la Corte Electoral (docs/06-fuentes.md).
// Los colores de partido se usan SOLO en mapas/gráficos electorales, siempre con
// etiqueta de texto (nunca solo color) — brief §42.

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
const OBS_DEPTALES_2025 =
  "https://www.elobservador.com.uy/nacional/elecciones-departamentales-2025-uruguay-el-detalle-como-quedo-cada-departamento-los-resultados-del-domingo-n5998998";
const CYC_MUNICIPIOS_2025 =
  "https://www.carasycaretas.com.uy/politica/elecciones-municipales-asi-quedo-conformado-el-mapa-alcaldes-y-alcaldesas-montevideo-n84251";

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
    sourceUrl: CYC_MUNICIPIOS_2025,
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

export const electionResults: ElectionResult[] = [
  // ── Nacional 2024, primera vuelta (nivel país, % sobre votos válidos) ──
  { electionId: "nacional-2024", territoryId: "UY", partyId: "fa", votes: 1071826, pct: 43.86, pctBase: "validos", winner: true, demo: true, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "pn", votes: 655426, pct: 26.82, pctBase: "validos", winner: false, demo: true, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "pc", votes: 392592, pct: 16.06, pctBase: "validos", winner: false, demo: true, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "is", votes: 65796, pct: 2.69, pctBase: "validos", winner: false, demo: true, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "ca", votes: 60549, pct: 2.47, pctBase: "validos", winner: false, demo: true, sourceUrl: WIKI_2024 },
  { electionId: "nacional-2024", territoryId: "UY", partyId: "pi", votes: 41618, pct: 1.7, pctBase: "validos", winner: false, demo: true, sourceUrl: WIKI_2024 },

  // ── Balotaje 2024 (% sobre votos válidos, escrutinio definitivo) ──
  { electionId: "balotaje-2024", territoryId: "UY", partyId: "fa", votes: 1212833, pct: 52.0, pctBase: "validos", winner: true, electedName: "Yamandú Orsi", demo: true, sourceUrl: WIKI_2024 },
  { electionId: "balotaje-2024", territoryId: "UY", partyId: "pn", votes: 1119537, pct: 48.0, pctBase: "validos", winner: false, electedName: "Álvaro Delgado", demo: true, sourceUrl: WIKI_2024 },

  // ── Departamentales 2025: partido ganador e intendente electo (19/19) ──
  // Balance: PN 13 · FA 4 · PC 1 · CR 1. Los % por departamento se ingerirán
  // desde los XLSX de la Corte Electoral (V1.1); por ahora votes/pct = null.
  { electionId: "departamental-2025", territoryId: "UY-AR", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Emiliano Soravilla", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-CA", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Francisco Legnani", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-CL", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Christian Morel", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-CO", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Guillermo Rodríguez", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-DU", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Felipe Algorta", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-FS", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Diego Irazábal", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-FD", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Carlos Enciso", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-LA", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Daniel Ximénez", demo: true, sourceUrl: "https://www.subrayado.com.uy/gano-el-frente-amplio-lavalleja-95-votos-y-daniel-ximenez-es-el-intendente-electo-n977357" },
  { electionId: "departamental-2025", territoryId: "UY-MA", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Miguel Abella", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-MO", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Mario Bergara", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-PA", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Nicolás Olivera", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-RN", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Guillermo Levratto", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-RV", partyId: "pc", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Richard Sander", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-RO", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Alejo Umpiérrez", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-SA", partyId: "cr", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Carlos Albisu", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-SJ", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Ana Bentaberri", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-SO", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Guillermo Besozzi", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-TA", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Wilson Ezquerra", demo: true, sourceUrl: OBS_DEPTALES_2025 },
  { electionId: "departamental-2025", territoryId: "UY-TT", partyId: "pn", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Mario Silvera", demo: true, sourceUrl: OBS_DEPTALES_2025 },

  // ── Municipales 2025, Montevideo: alcaldes electos (8/8) ──
  // Balance: FA 6 · CR 2.
  { electionId: "municipal-2025", territoryId: "UY-MO-A", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Juan Carlos Plachot", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
  { electionId: "municipal-2025", territoryId: "UY-MO-B", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Patricia Soria", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
  { electionId: "municipal-2025", territoryId: "UY-MO-C", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Damián Salvetto", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
  { electionId: "municipal-2025", territoryId: "UY-MO-CH", partyId: "cr", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Matilde Antía", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
  { electionId: "municipal-2025", territoryId: "UY-MO-D", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Gabriel Velazco", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
  { electionId: "municipal-2025", territoryId: "UY-MO-E", partyId: "cr", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Mercedes Ruiz", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
  { electionId: "municipal-2025", territoryId: "UY-MO-F", partyId: "fa", votes: 19590, pct: null, pctBase: "validos", winner: true, electedName: "Matilde Palermo", demo: true, sourceUrl: "https://www.subrayado.com.uy/matilde-palermo-sera-la-proxima-alcaldesa-del-municipio-f-la-victoria-del-frente-amplio-581-votos-n977508" },
  { electionId: "municipal-2025", territoryId: "UY-MO-G", partyId: "fa", votes: null, pct: null, pctBase: "validos", winner: true, electedName: "Leticia de Torres", demo: true, sourceUrl: CYC_MUNICIPIOS_2025 },
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
