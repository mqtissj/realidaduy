import type { Election, ElectionResult, Party } from "@/lib/types";
// Import relativo (no alias) para que scripts/validate-data.mjs pueda ejecutarlo con Node.
import {
  departamental2025PorDepartamento,
  municipal2025PorMunicipio,
  nacional2024PorDepartamento,
} from "./elecciones-generadas.ts";

// Resultados electorales. Verificación 2026-08-25 y auditoría adversarial
// 2026-08-26 (41 valores cotejados contra Corte Electoral/Wikipedia/prensa).
// 2026-08-27: los 136 alcaldes/as 2025-2030 verificados uno a uno contra las
// actas de proclamación de las Juntas Electorales Departamentales (fuente
// primaria; Wikipedia y OPP quedaron descartadas como fuente por errores
// detectados, ver commit).
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

// Los 136 alcaldes/as electos 2025-2030, transcriptos verbatim de las actas
// de proclamación de las Juntas Electorales Departamentales (Corte Electoral).
// Verificación 2026-08-27: lectura íntegra de las 20 actas (223 páginas).
const ALCALDES_2025: Record<string, string> = {
  // Montevideo (verificado contra acta)
  "UY-MO-A": "Juan Carlos Plachot",
  "UY-MO-B": "Patricia Soria",
  "UY-MO-C": "Damián Salvetto",
  "UY-MO-CH": "Matilde Antía",
  "UY-MO-D": "Gabriel Velazco",
  "UY-MO-E": "Mercedes Ruiz",
  "UY-MO-F": "Matilde Palermo",
  "UY-MO-G": "Leticia de Torres",
  // Artigas
  "UY-AR-BALTASAR-BRUM": "Laura Roza",
  "UY-AR-BELLA-UNION": "Fabiana García",
  "UY-AR-TOMAS-GOMENSORO": "Federico Arbiza",
  // Canelones
  "UY-CA-18-DE-MAYO": "Juan Carlos Cervini",
  "UY-CA-AGUAS-CORRIENTES": "Marcelo Fernando Delgado",
  "UY-CA-ATLANTIDA": "Javier Ernesto Capano",
  "UY-CA-BARROS-BLANCOS": "Braian Rafael Ferri",
  "UY-CA-CANELONES": "Américo Raúl Puga",
  "UY-CA-CIUDAD-DE-LA-COSTA": "Julia Matilla",
  "UY-CA-COLONIA-NICOLICH": "Fernando Javier Méndez",
  "UY-CA-DEL-ANDALUZ": "Iris Mabel Bentos",
  "UY-CA-EMPALME-OLMOS": "Edgard Marcelo Blanco",
  "UY-CA-JUANICO": "Mario Fernando Luquez",
  "UY-CA-LA-FLORESTA": "Anaclara De Los Santos",
  "UY-CA-LA-PAZ": "Juan Ángel Tons",
  "UY-CA-LAS-PIEDRAS": "Romina Noel Espiga",
  "UY-CA-LOS-CERRILLOS": "Claudia Elizabeth Felipez",
  "UY-CA-MIGUES": "Nahuel Juliani Jorge",
  "UY-CA-MONTES": "Gustavo Adrián Borges",
  "UY-CA-PANDO": "Leonardo Mauricio Chiesa",
  "UY-CA-PARQUE-DEL-PLATA": "Tania Susana Vecchio",
  "UY-CA-PASO-CARRASCO": "Luis Alberto Martínez",
  "UY-CA-PROGRESO": "Claudio Zelmar Duarte",
  "UY-CA-SALINAS": "Julio César Aquino",
  "UY-CA-SAN-ANTONIO": "Rubén Fernando Pani",
  "UY-CA-SAN-BAUTISTA": "Pablo Joaquín Farina",
  "UY-CA-SAN-JACINTO": "Yanina Betina Curbelo",
  "UY-CA-SAN-RAMON": "Gonzalo Melogno",
  "UY-CA-SANTA-LUCIA": "Cristian Ismael López",
  "UY-CA-SANTA-ROSA": "Ramiro Ramón Azor",
  "UY-CA-SAUCE": "Agustín Cabrera",
  "UY-CA-SOCA": "Jorge Marcel Quintana",
  "UY-CA-SUAREZ": "Juan Carlos Arellano",
  "UY-CA-TALA": "Leonardo Gabriel Pérez",
  "UY-CA-TOLEDO": "Lady Diana Peña",
  // Cerro Largo
  "UY-CL-ACEGUA": "Milton Javier Rodríguez",
  "UY-CL-ARBOLITO": "Dany Javier Barboza",
  "UY-CL-AREVALO": "Cristina Janet Cortondo",
  "UY-CL-BANADO-DE-MEDINA": "Niver Daniel Segade",
  "UY-CL-CENTURION": "Juan Nery Dos Santos",
  "UY-CL-CERRO-DE-LAS-CUENTAS": "Mariana Juárez",
  "UY-CL-FRAILE-MUERTO": "Pablo Gastón Nauar",
  "UY-CL-ISIDORO-NOBLIA": "Jenifer Márquez",
  "UY-CL-LAGUNA-MERIN": "Óscar Rodolfo Conde",
  "UY-CL-LAS-CANAS": "Víctor Atalibar Noda",
  "UY-CL-PLACIDO-ROSAS": "Facundo Ramiro Monzón",
  "UY-CL-QUEBRACHO": "Héctor Urbano Ortiz",
  "UY-CL-RAMON-TRIGO": "Esteban Fabián Presa",
  "UY-CL-RIO-BRANCO": "José Federico López",
  "UY-CL-TRES-ISLAS": "Carlos Eduardo González",
  "UY-CL-TUPAMBAE": "Macarena Gisel Da Rosa",
  // Colonia
  "UY-CO-CARMELO": "Luis Pablo Parodi",
  "UY-CO-COLONIA-MIGUELETE": "María Elena Martín",
  "UY-CO-COLONIA-VALDENSE": "Fernando Matías Eguiluz",
  "UY-CO-CONCHILLAS": "Martín Hernández",
  "UY-CO-CUFRE": "Anthony Müller",
  "UY-CO-FLORENCIO-SANCHEZ": "María del Luján Sánchez",
  "UY-CO-JUAN-L-LACAZE": "José Darío Brugman",
  "UY-CO-LA-PAZ": "Walter Eduardo Miranda",
  "UY-CO-NUEVA-HELVECIA": "Marcelo Federico Alonso",
  "UY-CO-NUEVA-PALMIRA": "Andrés Passarino",
  "UY-CO-OMBUES-DE-LAVALLE": "Antonio Dávila",
  "UY-CO-ROSARIO": "Daniela Amed",
  "UY-CO-TARARIRAS": "Marisel María Saporitti",
  // Durazno
  "UY-DU-SARANDI-DEL-YI": "Mario César Pereyra",
  "UY-DU-VILLA-DEL-CARMEN": "Nuber Omar Medina",
  // Flores
  "UY-FS-ISMAEL-CORTINAS": "Agustín Musa",
  // Florida
  "UY-FD-CASUPA": "Luis Emilio Oliva",
  "UY-FD-FRAY-MARCOS": "Eduardo Fabián Gancio",
  "UY-FD-SARANDI-GRANDE": "Carlos Maximiliano Ripoll",
  // Lavalleja
  "UY-LA-JOSE-BATLLE-Y-ORDONEZ": "Conrado Da Cunha",
  "UY-LA-JOSE-PEDRO-VARELA": "Rosario Pereira",
  "UY-LA-MARISCALA": "Francisco De La Peña",
  "UY-LA-PIRARAJA": "Marianela García",
  "UY-LA-SOLIS-DE-MATAOJO": "Joaquín Cabana",
  "UY-LA-ZAPICAN": "Fabián Miraballes",
  // Maldonado
  "UY-MA-AIGUA": "Daniel Elías Perdomo",
  "UY-MA-GARZON": "Roosvel Nazareno Lazo",
  "UY-MA-MALDONADO": "Damián Rafael Tort",
  "UY-MA-PAN-DE-AZUCAR": "Rubens Alejandro Echavarría",
  "UY-MA-PIRIAPOLIS": "René Jesús Graña",
  "UY-MA-PUNTA-DEL-ESTE": "Javier Antonio Carballal",
  "UY-MA-SAN-CARLOS": "Luis Martín Cima",
  "UY-MA-SOLIS-GRANDE": "Patricia Marcela Martínez",
  // Paysandú
  "UY-PA-CERRO-CHATO": "Gerald Vázquez",
  "UY-PA-CHAPICUY": "Melina Figueroa",
  "UY-PA-EL-EUCALIPTO": "Leo Moreira",
  "UY-PA-GUICHON": "Martín Álvarez",
  "UY-PA-LORENZO-GEYRES": "Orlando Stoletniy",
  "UY-PA-PIEDRAS-COLORADAS": "Jhonn Cáceres",
  "UY-PA-PORVENIR": "Nilson Ayende",
  "UY-PA-QUEBRACHO": "Silbia María Visoso",
  "UY-PA-TAMBORES": "Daniel Giménez",
  // Río Negro
  "UY-RN-NUEVO-BERLIN": "Elbio Hernán Godoy",
  "UY-RN-SAN-JAVIER": "Washington Andrés Laco",
  "UY-RN-YOUNG": "Ana Cecilia Rodríguez",
  // Rocha
  "UY-RO-CASTILLOS": "Gastón Federico Larrosa",
  "UY-RO-CHUY": "Miriam Raquel Nieves",
  "UY-RO-LA-PALOMA": "Rubén Waldemir González",
  "UY-RO-LASCANO": "Pablo Martín Pintos",
  // Rivera
  "UY-RV-MINAS-DE-CORRALES": "Richar Correa",
  "UY-RV-TRANQUERAS": "Luciano Viera",
  "UY-RV-VICHADERO": "Heber Mario López",
  // Salto
  "UY-SA-COLONIA-LAVALLEJA": "Antonio Tejeira",
  "UY-SA-MATAOJO": "María Rosita Moreno",
  "UY-SA-PUEBLO-BELEN": "Luis Enrique Zuliani",
  "UY-SA-PUEBLO-RINCON-DE-VALENTIN": "Santiago Dalmao",
  "UY-SA-PUEBLO-SAN-ANTONIO": "Sandra Mariela Toncobitz",
  "UY-SA-VILLA-CONSTITUCION": "Luis Valerio",
  // San José
  "UY-SJ-CIUDAD-DEL-PLATA": "Richard Leonardo Mariani",
  "UY-SJ-ECILDA-PAULLIER": "José Ignacio Mesa",
  "UY-SJ-LIBERTAD": "Matías Eduardo Santos",
  "UY-SJ-RODRIGUEZ": "Norberto Carlos Zunino",
  // Soriano
  "UY-SO-CARDONA": "Juan Gabriel Bentancur",
  "UY-SO-DOLORES": "Joaquín Gómez",
  "UY-SO-JOSE-ENRIQUE-RODO": "Héctor Pedro Urchipia",
  "UY-SO-PALMITAS": "María de los Ángeles Jaime",
  "UY-SO-VILLA-DE-SANTO-DOMINGO-DE-SORIANO": "Daniela Elizabeth Ruiz",
  // Tacuarembó
  "UY-TA-ANSINA": "Ana Isabel Camejo",
  "UY-TA-PASO-DE-LOS-TOROS": "Carlos Luis Irigoin",
  "UY-TA-SAN-GREGORIO-DE-POLANCO": "Asdrúbal Rodríguez",
  "UY-TA-VILLA-CARAGUATA": "Álvaro José Mattos",
  // Treinta y Tres
  "UY-TT-CERRO-CHATO": "Elías Javier Fuentes",
  "UY-TT-GENERAL-ENRIQUE-MARTINEZ": "Nidia Janet Vera",
  "UY-TT-RINCON": "Eduardo Ariel González",
  "UY-TT-SANTA-CLARA-DE-OLIMAR": "Óscar Alfredo Viera",
  "UY-TT-VERGARA": "Matilde Nazarena Barreto",
  "UY-TT-VILLA-SARA": "Analía Beatriz Larrañaga",
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

  // ── Municipales 2025, TODO el país (generado; todos los lemas) ──
  // 136 municipios. Nombres de alcaldes/as verificados contra las actas de
  // proclamación de las 19 Juntas Electorales Departamentales.
  ...withNames(municipal2025PorMunicipio, ALCALDES_2025),
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
      : territoryId.split("-").length >= 3
        ? "municipal-2025"
        : "departamental-2025";
  return electionResults.find(
    (r) => r.electionId === electionId && r.territoryId === territoryId && r.winner
  );
}
