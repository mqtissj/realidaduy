// Historia electoral nacional 1984–2019 (retorno a la democracia → presente).
// Fuente: Wikipedia en español (reproduce datos de la Corte Electoral), páginas
// por elección verificadas el 2026-08-26. Pendiente de cotejo final contra las
// publicaciones oficiales de la Corte Electoral (demo interno: true).
// Los % de primera vuelta son SOBRE VOTOS VÁLIDOS en todas las elecciones.

export interface HistoricPartyResult {
  /** Etiqueta histórica del lema (los nombres cambiaron con los años). */
  label: string;
  /** Partido actual asociado para el color (fa/pn/pc/ca/pi) o null (gris). */
  partyId: string | null;
  pct: number;
  votes: number | null;
}

export interface HistoricRunoff {
  date: string;
  candidates: { name: string; label: string; partyId: string | null; pct: number; votes: number | null }[];
  /** Base de los porcentajes del balotaje. */
  pctBase: "validos" | "emitidos";
  turnout: number | null;
  note?: string;
}

export interface HistoricElection {
  year: number;
  date: string;
  turnout: number;
  firstRound: HistoricPartyResult[];
  runoff?: HistoricRunoff;
  president: { name: string; label: string; partyId: string | null };
  sourceUrl: string;
}

export const historicElections: HistoricElection[] = [
  {
    year: 2019,
    date: "2019-10-27",
    turnout: 90.13,
    firstRound: [
      { label: "Frente Amplio", partyId: "fa", pct: 39.02, votes: 949376 },
      { label: "Partido Nacional", partyId: "pn", pct: 28.62, votes: 696452 },
      { label: "Partido Colorado", partyId: "pc", pct: 12.34, votes: 300177 },
      { label: "Cabildo Abierto", partyId: "ca", pct: 11.04, votes: 268736 },
      { label: "Partido Independiente", partyId: "pi", pct: 0.97, votes: 23580 },
      { label: "Otros partidos", partyId: null, pct: 8.01, votes: null },
    ],
    runoff: {
      date: "2019-11-24",
      candidates: [
        { name: "Luis Lacalle Pou", label: "Partido Nacional", partyId: "pn", pct: 49.98, votes: 1189313 },
        { name: "Daniel Martínez", label: "Frente Amplio", partyId: "fa", pct: 48.42, votes: 1152271 },
      ],
      pctBase: "emitidos",
      turnout: 90.12,
      note: "Los porcentajes no suman 100 por los votos en blanco y anulados. Diferencia final: 37.042 votos.",
    },
    president: { name: "Luis Lacalle Pou", label: "Partido Nacional", partyId: "pn" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_2019",
  },
  {
    year: 2014,
    date: "2014-10-26",
    turnout: 90.51,
    firstRound: [
      { label: "Frente Amplio", partyId: "fa", pct: 47.81, votes: 1134187 },
      { label: "Partido Nacional", partyId: "pn", pct: 30.88, votes: 732601 },
      { label: "Partido Colorado", partyId: "pc", pct: 12.89, votes: 305699 },
      { label: "Partido Independiente", partyId: "pi", pct: 3.09, votes: 73379 },
      { label: "Unidad Popular", partyId: null, pct: 1.13, votes: 26869 },
      { label: "Otros partidos", partyId: null, pct: 0.88, votes: null },
    ],
    runoff: {
      date: "2014-11-30",
      candidates: [
        { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa", pct: 56.5, votes: 1241568 },
        { name: "Luis Lacalle Pou", label: "Partido Nacional", partyId: "pn", pct: 43.5, votes: 955741 },
      ],
      pctBase: "validos",
      turnout: 88.58,
    },
    president: { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_2014",
  },
  {
    year: 2009,
    date: "2009-10-25",
    turnout: 89.85,
    firstRound: [
      { label: "Frente Amplio", partyId: "fa", pct: 47.96, votes: null },
      { label: "Partido Nacional", partyId: "pn", pct: 29.07, votes: null },
      { label: "Partido Colorado", partyId: "pc", pct: 17.02, votes: null },
      { label: "Partido Independiente", partyId: "pi", pct: 2.49, votes: null },
      { label: "Otros partidos", partyId: null, pct: 3.46, votes: null },
    ],
    runoff: {
      date: "2009-11-29",
      candidates: [
        { name: "José Mujica", label: "Frente Amplio", partyId: "fa", pct: 54.63, votes: 1197638 },
        { name: "Luis Alberto Lacalle", label: "Partido Nacional", partyId: "pn", pct: 45.37, votes: 994510 },
      ],
      pctBase: "validos",
      turnout: 89.13,
    },
    president: { name: "José Mujica", label: "Frente Amplio", partyId: "fa" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_2009",
  },
  {
    year: 2004,
    date: "2004-10-31",
    turnout: 89.61,
    firstRound: [
      { label: "EP–Frente Amplio–Nueva Mayoría", partyId: "fa", pct: 51.68, votes: 1124761 },
      { label: "Partido Nacional", partyId: "pn", pct: 35.13, votes: 764739 },
      { label: "Partido Colorado", partyId: "pc", pct: 10.61, votes: 231036 },
      { label: "Partido Independiente", partyId: "pi", pct: 1.88, votes: 41011 },
      { label: "Otros partidos", partyId: null, pct: 0.7, votes: 14492 },
    ],
    president: { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_2004",
  },
  {
    year: 1999,
    date: "1999-10-31",
    turnout: 91.7,
    firstRound: [
      { label: "EP–Frente Amplio", partyId: "fa", pct: 40.11, votes: 861202 },
      { label: "Partido Colorado", partyId: "pc", pct: 32.78, votes: 703915 },
      { label: "Partido Nacional", partyId: "pn", pct: 22.31, votes: 478980 },
      { label: "Nuevo Espacio", partyId: null, pct: 4.56, votes: 97943 },
      { label: "Otros partidos", partyId: null, pct: 0.24, votes: 5109 },
    ],
    runoff: {
      date: "1999-11-28",
      candidates: [
        { name: "Jorge Batlle", label: "Partido Colorado", partyId: "pc", pct: 54.13, votes: 1158708 },
        { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa", pct: 45.87, votes: 982049 },
      ],
      pctBase: "validos",
      turnout: 91.84,
    },
    president: { name: "Jorge Batlle", label: "Partido Colorado", partyId: "pc" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_1999",
  },
  {
    year: 1994,
    date: "1994-11-27",
    turnout: 91.4,
    firstRound: [
      { label: "Partido Colorado", partyId: "pc", pct: 32.35, votes: 656428 },
      { label: "Partido Nacional", partyId: "pn", pct: 31.21, votes: 633384 },
      { label: "Encuentro Progresista–Frente Amplio", partyId: "fa", pct: 30.61, votes: 621226 },
      { label: "Nuevo Espacio", partyId: null, pct: 4.56, votes: 104773 },
      { label: "Otros partidos", partyId: null, pct: 0.66, votes: 13470 },
    ],
    president: { name: "Julio María Sanguinetti", label: "Partido Colorado", partyId: "pc" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_1994",
  },
  {
    year: 1989,
    date: "1989-11-26",
    turnout: 88.67,
    firstRound: [
      { label: "Partido Nacional", partyId: "pn", pct: 37.25, votes: 765990 },
      { label: "Partido Colorado", partyId: "pc", pct: 29.03, votes: 596964 },
      { label: "Frente Amplio", partyId: "fa", pct: 20.35, votes: 418403 },
      { label: "Nuevo Espacio", partyId: null, pct: 8.63, votes: 177453 },
      { label: "Otros partidos", partyId: null, pct: 4.74, votes: null },
    ],
    president: { name: "Luis Alberto Lacalle", label: "Partido Nacional", partyId: "pn" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_1989",
  },
  {
    year: 1984,
    date: "1984-11-25",
    turnout: 87.87,
    firstRound: [
      { label: "Partido Colorado", partyId: "pc", pct: 40.28, votes: 777701 },
      { label: "Partido Nacional", partyId: "pn", pct: 34.22, votes: 660773 },
      { label: "Frente Amplio", partyId: "fa", pct: 20.77, votes: 401104 },
      { label: "Unión Cívica", partyId: null, pct: 2.37, votes: 45841 },
      { label: "Otros partidos", partyId: null, pct: 0.06, votes: 830 },
    ],
    president: { name: "Julio María Sanguinetti", label: "Partido Colorado", partyId: "pc" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_1984",
  },
];
