// Historia electoral nacional 1984–2019 (retorno a la democracia → presente).
//
// Fuente: Corte Electoral. Para cada elección se cargan los votos de cada lema,
// los votos emitidos (votantes) y los habilitados tal como los publica la Corte:
//
// - 1984, 1989, 1999, 2004 y 2009: los resultados oficiales en PDF de la página
//   de estadísticas de la Corte (cuadro "Resultado por partido político" y, si
//   hubo, el del balotaje).
// - 2014: acta 9409 de la Corte (votos de cada lema y total de emitidos) y los
//   datos abiertos por circuito (habilitados y balotaje).
// - 2019: Anuario Estadístico del INE, cuadros 3.8.1 y 3.8.2 (fuente: Corte
//   Electoral), y los datos abiertos del balotaje.
// - 1994: la Corte no tiene publicados los resultados de ese año; los números
//   salen de Wikipedia y se marcan como fuente secundaria en la página.
//
// scripts/ingest/check-elecciones-historicas.mjs vuelve a sumar 2014 y 2019
// desde los datos abiertos de la Corte y falla si algo no coincide.
//
// Los porcentajes NO se cargan a mano: se calculan sobre los votos emitidos
// (votantes), igual que los de 2024 y que las actas de la Corte. Por eso no
// suman 100: la diferencia son los votos en blanco y anulados (y, en algunos
// años, las papeletas solo por el Sí de un plebiscito). La participación es
// emitidos / habilitados.

export interface HistoricPartyResult {
  /** Etiqueta histórica del lema (los nombres cambiaron con los años). */
  label: string;
  /** Partido actual asociado para el color (fa/pn/pc/ca/pi) o null (gris). */
  partyId: string | null;
  votes: number;
  /** % sobre votos emitidos, calculado. */
  pct: number;
}

export interface HistoricRunoff {
  date: string;
  candidates: { name: string; label: string; partyId: string | null; votes: number; pct: number }[];
  emitted: number;
  enabled: number;
  /** Participación (%), calculada. */
  turnout: number;
  note?: string;
}

export interface HistoricElection {
  year: number;
  date: string;
  emitted: number;
  enabled: number;
  /** Participación (%), calculada. */
  turnout: number;
  firstRound: HistoricPartyResult[];
  runoff?: HistoricRunoff;
  president: { name: string; label: string; partyId: string | null };
  sourceUrl: string;
  /** Corte Electoral (oficial) o Wikipedia (secundaria, solo 1994). */
  source: "corte" | "wikipedia";
}

type Lema = Omit<HistoricPartyResult, "pct">;
type Candidato = Omit<HistoricRunoff["candidates"][number], "pct">;

const pct = (part: number, total: number) => Math.round((part / total) * 10000) / 100;

function eleccion(e: Omit<HistoricElection, "turnout" | "firstRound" | "runoff"> & {
  firstRound: Lema[];
  runoff?: Omit<HistoricRunoff, "turnout" | "candidates"> & { candidates: Candidato[] };
}): HistoricElection {
  return {
    ...e,
    turnout: pct(e.emitted, e.enabled),
    firstRound: e.firstRound.map((l) => ({ ...l, pct: pct(l.votes, e.emitted) })),
    runoff: e.runoff && {
      ...e.runoff,
      turnout: pct(e.runoff.emitted, e.runoff.enabled),
      candidates: e.runoff.candidates.map((c) => ({ ...c, pct: pct(c.votes, e.runoff!.emitted) })),
    },
  };
}

const CORTE = "https://www.gub.uy/corte-electoral/datos-y-estadisticas/estadisticas";

export const historicElections: HistoricElection[] = [
  eleccion({
    year: 2019,
    date: "2019-10-27",
    enabled: 2699978,
    emitted: 2433364,
    firstRound: [
      { label: "Frente Amplio", partyId: "fa", votes: 949376 },
      { label: "Partido Nacional", partyId: "pn", votes: 696452 },
      { label: "Partido Colorado", partyId: "pc", votes: 300177 },
      { label: "Cabildo Abierto", partyId: "ca", votes: 268736 },
      { label: "Partido Independiente", partyId: "pi", votes: 23580 },
      // PERI 33.461, de la Gente 26.313, Asamblea Popular 19.728, Verde
      // Animalista 19.392, Digital 6.363 y de los Trabajadores 1.387.
      { label: "Otros partidos", partyId: null, votes: 106644 },
    ],
    runoff: {
      date: "2019-11-24",
      // Datos abiertos por circuito: emitidos = votos no observados (que ya
      // incluyen los observados escrutados); habilitados = total menos los
      // observados, que figuran también en su circuito de origen.
      enabled: 2699585,
      emitted: 2432801,
      candidates: [
        { name: "Luis Lacalle Pou", label: "Partido Nacional", partyId: "pn", votes: 1189313 },
        { name: "Daniel Martínez", label: "Frente Amplio", partyId: "fa", votes: 1152271 },
      ],
      note: "Diferencia final: 37.042 votos.",
    },
    president: { name: "Luis Lacalle Pou", label: "Partido Nacional", partyId: "pn" },
    sourceUrl: `${CORTE}/resultados-elecciones-nacionales-plebiscito-balotaje-2019`,
    source: "corte",
  }),
  eleccion({
    year: 2014,
    date: "2014-10-26",
    // Acta 9409: 2.372.117 emitidos. Habilitados: datos abiertos por circuito,
    // con el mismo criterio que 2019 (coincide con el total que informó la Corte).
    enabled: 2620791,
    emitted: 2372117,
    firstRound: [
      { label: "Frente Amplio", partyId: "fa", votes: 1134187 },
      { label: "Partido Nacional", partyId: "pn", votes: 732601 },
      { label: "Partido Colorado", partyId: "pc", votes: 305699 },
      { label: "Partido Independiente", partyId: "pi", votes: 73379 },
      { label: "Unidad Popular (Asamblea Popular)", partyId: null, votes: 26869 },
      // PERI 17.835 y de los Trabajadores 3.218.
      { label: "Otros partidos", partyId: null, votes: 21053 },
    ],
    runoff: {
      date: "2014-11-30",
      enabled: 2620358,
      emitted: 2320942,
      candidates: [
        { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa", votes: 1241568 },
        { name: "Luis Lacalle Pou", label: "Partido Nacional", partyId: "pn", votes: 955741 },
      ],
    },
    president: { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa" },
    sourceUrl: `${CORTE}/resultados-elecciones-nacionales-plebiscito-balotaje-2014`,
    source: "corte",
  }),
  eleccion({
    year: 2009,
    date: "2009-10-25",
    enabled: 2563250,
    emitted: 2304686,
    firstRound: [
      { label: "Frente Amplio", partyId: "fa", votes: 1105262 },
      { label: "Partido Nacional", partyId: "pn", votes: 669942 },
      { label: "Partido Colorado", partyId: "pc", votes: 392307 },
      { label: "Partido Independiente", partyId: "pi", votes: 57360 },
      { label: "Asamblea Popular", partyId: null, votes: 15428 },
    ],
    runoff: {
      date: "2009-11-29",
      // La Corte publica los votantes del balotaje; el padrón es el de octubre.
      enabled: 2563250,
      emitted: 2285958,
      candidates: [
        { name: "José Mujica", label: "Frente Amplio", partyId: "fa", votes: 1197638 },
        { name: "Luis Alberto Lacalle", label: "Partido Nacional", partyId: "pn", votes: 994510 },
      ],
    },
    president: { name: "José Mujica", label: "Frente Amplio", partyId: "fa" },
    sourceUrl: `${CORTE}/resultados-elecciones-nacionales-plebiscitos-balotaje-2009`,
    source: "corte",
  }),
  eleccion({
    year: 2004,
    date: "2004-10-31",
    enabled: 2487816,
    emitted: 2229611,
    firstRound: [
      { label: "EP–Frente Amplio–Nueva Mayoría", partyId: "fa", votes: 1124761 },
      { label: "Partido Nacional", partyId: "pn", votes: 764739 },
      { label: "Partido Colorado", partyId: "pc", votes: 231036 },
      { label: "Partido Independiente", partyId: "pi", votes: 41011 },
      // Intransigente 8.572, Unión Cívica 4.859, Laboral 1.548 y de los Trabajadores 513.
      { label: "Otros partidos", partyId: null, votes: 15492 },
    ],
    president: { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa" },
    sourceUrl: `${CORTE}/resultado-elecciones-nacionales-plebiscito-2004`,
    source: "corte",
  }),
  eleccion({
    year: 1999,
    date: "1999-10-31",
    enabled: 2402160,
    emitted: 2204884,
    firstRound: [
      { label: "EP–Frente Amplio", partyId: "fa", votes: 861202 },
      { label: "Partido Colorado", partyId: "pc", votes: 703915 },
      { label: "Partido Nacional", partyId: "pn", votes: 478980 },
      { label: "Nuevo Espacio", partyId: null, votes: 97943 },
      { label: "Unión Cívica", partyId: null, votes: 5109 },
    ],
    runoff: {
      date: "1999-11-28",
      enabled: 2402160,
      emitted: 2206112,
      candidates: [
        { name: "Jorge Batlle", label: "Partido Colorado", partyId: "pc", votes: 1158708 },
        { name: "Tabaré Vázquez", label: "Frente Amplio", partyId: "fa", votes: 981778 },
      ],
    },
    president: { name: "Jorge Batlle", label: "Partido Colorado", partyId: "pc" },
    sourceUrl: `${CORTE}/resultados-elecciones-nacionales-balotaje-1999`,
    source: "corte",
  }),
  eleccion({
    year: 1994,
    date: "1994-11-27",
    enabled: 2330154,
    emitted: 2129245,
    firstRound: [
      { label: "Partido Colorado", partyId: "pc", votes: 656428 },
      { label: "Partido Nacional", partyId: "pn", votes: 633384 },
      { label: "Encuentro Progresista–Frente Amplio", partyId: "fa", votes: 621226 },
      { label: "Nuevo Espacio", partyId: null, votes: 104773 },
      { label: "Otros partidos", partyId: null, votes: 13470 },
    ],
    president: { name: "Julio María Sanguinetti", label: "Partido Colorado", partyId: "pc" },
    sourceUrl: "https://es.wikipedia.org/wiki/Elecciones_generales_de_Uruguay_de_1994",
    source: "wikipedia",
  }),
  eleccion({
    year: 1989,
    date: "1989-11-26",
    enabled: 2319022,
    emitted: 2056355,
    firstRound: [
      { label: "Partido Nacional", partyId: "pn", votes: 765990 },
      { label: "Partido Colorado", partyId: "pc", votes: 596964 },
      { label: "Frente Amplio", partyId: "fa", votes: 418403 },
      { label: "Nuevo Espacio (lema Por el Gobierno del Pueblo)", partyId: null, votes: 177453 },
      // Verde Eto-Ecologista 10.835, Movimiento Justiciero 441, de los
      // Trabajadores 310 y Convergencia 190.
      { label: "Otros partidos", partyId: null, votes: 11776 },
    ],
    president: { name: "Luis Alberto Lacalle", label: "Partido Nacional", partyId: "pn" },
    sourceUrl: `${CORTE}/resultados-elecciones-nacionales-departamentales-1989`,
    source: "corte",
  }),
  eleccion({
    year: 1984,
    date: "1984-11-25",
    enabled: 2197503,
    emitted: 1930931,
    firstRound: [
      { label: "Partido Colorado", partyId: "pc", votes: 777701 },
      { label: "Partido Nacional", partyId: "pn", votes: 660773 },
      { label: "Frente Amplio (lema Demócrata Cristiano)", partyId: "fa", votes: 401104 },
      { label: "Unión Cívica", partyId: null, votes: 45841 },
      // De los Trabajadores 488, Unión Patriótica 302 y Convergencia 153.
      { label: "Otros partidos", partyId: null, votes: 943 },
    ],
    president: { name: "Julio María Sanguinetti", label: "Partido Colorado", partyId: "pc" },
    sourceUrl: `${CORTE}/resultados-elecciones-nacionales-departamentales-1984`,
    source: "corte",
  }),
];
