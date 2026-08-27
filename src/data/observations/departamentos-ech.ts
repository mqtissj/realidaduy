import type { Observation } from "@/lib/types";

// Indicadores departamentales de economía y sociedad (base ECH del INE).
// Investigados y verificados adversarialmente (doble agente contra la fuente)
// el 2026-08-25/26. Cada bloque documenta su fuente exacta y sus advertencias
// metodológicas; las series completas están disponibles en las mismas URLs.

const D = {
  artigas: "UY-AR",
  canelones: "UY-CA",
  cerroLargo: "UY-CL",
  colonia: "UY-CO",
  durazno: "UY-DU",
  flores: "UY-FS",
  florida: "UY-FD",
  lavalleja: "UY-LA",
  maldonado: "UY-MA",
  montevideo: "UY-MO",
  paysandu: "UY-PA",
  rioNegro: "UY-RN",
  rivera: "UY-RV",
  rocha: "UY-RO",
  salto: "UY-SA",
  sanJose: "UY-SJ",
  soriano: "UY-SO",
  tacuarembo: "UY-TA",
  treintaYTres: "UY-TT",
} as const;

const RETRIEVED = "2026-08-25";

// NOTA (auditoría 2026-08-26): la tasa de desempleo departamental 2024 se
// cargaba desde MIDES (tabla 7976), pero su total país (8,9%) y su apertura
// departamental no cuadran con la cifra oficial del INE (~8,2%). Se reemplazó
// por la elaboración del Observatorio Territorio Uruguay (OPP), cuyo total sí
// coincide — ver scripts/ingest/fetch-otu.mjs y src/data/observations/otu.ts.

// ── Informalidad por departamento — año 2025 ─────────────────────────────────
// Fuente: INE, informe "Informalidad y subutilización de la fuerza de trabajo
// 2025" (ECH), Cuadro 4: tasa de ocupación informal por departamento.
// Definición: ocupación informal AMPLIADA (OIT, 21.ª CIET) — algo más amplia
// que el "no registro" clásico a la seguridad social.
const INFORMALIDAD_URL =
  "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Informalidad/Informe-caracterizaci%C3%B3n-puestos-de-trabajo-2025.html";
const INFORMALIDAD_NOTE =
  "Año 2025. Medición ampliada de ocupación informal (OIT/21.ª CIET): incluye no registro a la seguridad social y otras formas de informalidad. Total país 2025: 22,8%.";
const informalidad2025: [string, number][] = [
  [D.artigas, 39.1],
  [D.canelones, 23.0],
  [D.cerroLargo, 44.5],
  [D.colonia, 19.1],
  [D.durazno, 23.7],
  [D.flores, 13.4],
  [D.florida, 20.3],
  [D.lavalleja, 24.5],
  [D.maldonado, 27.4],
  [D.montevideo, 15.5],
  [D.paysandu, 24.7],
  [D.rioNegro, 27.1],
  [D.rivera, 41.6],
  [D.rocha, 31.5],
  [D.salto, 34.4],
  [D.sanJose, 21.2],
  [D.soriano, 37.8],
  [D.tacuarembo, 32.6],
  [D.treintaYTres, 30.2],
];

// ── Ingreso medio de los hogares por departamento — año 2023 ─────────────────
// Fuente: MIDES (Observatorio Social / DNTAD) en base a la ECH del INE.
// CSV oficial: export-table 8586 ("Promedio de ingresos del hogar con valor
// locativo según departamento"). Con valor locativo, a precios de 2023.
// ⚠️ El nivel de esta elaboración de MIDES no coincide con la serie nacional
// publicada por el INE (~+17-21%, probable ponderación por personas): usar para
// comparar departamentos entre sí, no como nivel oficial del INE.
const INGRESO_URL = "https://www.gub.uy/ministerio-desarrollo-social/export-table/8586/csv";
const INGRESO_NOTE =
  "Promedio anual 2023, con valor locativo, a precios de 2023. Elaboración del Observatorio Social del MIDES sobre la ECH del INE; su nivel difiere de la serie nacional del INE (metodología propia): sirve para comparar departamentos entre sí. Serie 2006–2023 en la misma fuente.";
const ingreso2023: [string, number][] = [
  [D.artigas, 61516.4],
  [D.canelones, 106596.5],
  [D.cerroLargo, 68206.5],
  [D.colonia, 96448.2],
  [D.durazno, 98940.4],
  [D.flores, 97752.0],
  [D.florida, 106445.3],
  [D.lavalleja, 91323.5],
  [D.maldonado, 98982.7],
  [D.montevideo, 139526.8],
  [D.paysandu, 87717.3],
  [D.rioNegro, 94782.4],
  [D.rivera, 72744.3],
  [D.rocha, 89109.5],
  [D.salto, 93622.3],
  [D.sanJose, 99584.2],
  [D.soriano, 95218.1],
  [D.tacuarembo, 93865.6],
  [D.treintaYTres, 81777.9],
];

// ── Pobreza (personas) por departamento — año 2023, metodología anterior ─────
// Fuente: MIDES (Observatorio Social) en base a la ECH del INE, metodología
// INE 2006. ⚠️ NO comparable con el 16,6% nacional de 2025 (metodología nueva,
// canasta 2017): el INE todavía no publica apertura departamental con la
// metodología nueva en formato tabla. Chequeo cruzado: el total país de esta
// tabla (10,1%) coincide con la cifra oficial del INE 2023 (metodología 2006).
const POBREZA_URL =
  "https://www.gub.uy/ministerio-desarrollo-social/indicador/porcentaje-personas-situacion-pobreza-segun-departamento-total-pais";
const POBREZA_NOTE =
  "Año 2023, metodología anterior del INE (canasta 2006). NO comparable con el dato nacional de 2025 (16,6%, metodología nueva): son mediciones distintas. Es la última apertura departamental publicada en formato tabla.";
const pobreza2023: [string, number][] = [
  [D.artigas, 18.5],
  [D.canelones, 6.7],
  [D.cerroLargo, 17.4],
  [D.colonia, 1.8],
  [D.durazno, 7.0],
  [D.flores, 2.4],
  [D.florida, 6.7],
  [D.lavalleja, 5.8],
  [D.maldonado, 3.5],
  [D.montevideo, 12.8],
  [D.paysandu, 9.7],
  [D.rioNegro, 8.2],
  [D.rivera, 18.5],
  [D.rocha, 8.8],
  [D.salto, 14.3],
  [D.sanJose, 2.7],
  [D.soriano, 5.2],
  [D.tacuarembo, 7.8],
  [D.treintaYTres, 13.0],
];

function block(
  indicatorId: string,
  period: string,
  periodLabel: string,
  status: Observation["status"],
  sourceUrl: string,
  notes: string,
  values: [string, number][]
): Observation[] {
  return values.map(([territoryId, value]) => ({
    indicatorId,
    territoryId,
    period,
    periodLabel,
    value,
    status,
    demo: false,
    sourceUrl,
    retrievedAt: RETRIEVED,
    notes,
  }));
}

export const departmentEchObservations: Observation[] = [
  ...block(
    "informalidad",
    "2025",
    "Año 2025",
    "OFFICIAL",
    INFORMALIDAD_URL,
    INFORMALIDAD_NOTE,
    informalidad2025
  ),
  ...block(
    "ingreso-medio-hogar",
    "2023",
    "2023 (promedio anual)",
    "OFFICIAL",
    INGRESO_URL,
    INGRESO_NOTE,
    ingreso2023
  ),
  ...block(
    "pobreza-personas",
    "2023",
    "2023 · metodología anterior",
    "OFFICIAL",
    POBREZA_URL,
    POBREZA_NOTE,
    pobreza2023
  ),
  // Informalidad nacional (mismo informe INE; serie corta para variación).
  {
    indicatorId: "informalidad",
    territoryId: "UY",
    period: "2024",
    periodLabel: "Año 2024",
    value: 22.7,
    status: "OFFICIAL",
    demo: false,
    sourceUrl:
      "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Informalidad/Informe%20informalidad%20y%20subutilizacion%202024.html",
    retrievedAt: RETRIEVED,
    notes: "Medición ampliada de ocupación informal (OIT). Informe INE 2024.",
  },
  {
    indicatorId: "informalidad",
    territoryId: "UY",
    period: "2025",
    periodLabel: "Año 2025",
    value: 22.8,
    status: "OFFICIAL",
    demo: false,
    sourceUrl: INFORMALIDAD_URL,
    retrievedAt: RETRIEVED,
    notes: "Medición ampliada de ocupación informal (OIT). Informe INE 2025.",
  },
];
