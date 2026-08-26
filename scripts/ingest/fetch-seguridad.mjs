// Ingesta de delitos denunciados (Ministerio del Interior, datos abiertos) y
// cálculo de tasas cada 100.000 habitantes (población Censo 2023 como base fija).
//
// Datasets CKAN "delitos_denunciados_en_el_uruguay" (microdatos 2013→presente):
//  - homicidios_dolosos_consumados.csv (una fila por VÍCTIMA)
//  - otros-delitos.csv (una fila por EVENTO denunciado; incluye RAPIÑA y HURTO,
//    con y sin tentativa)
//
// Salida: src/data/observations/seguridad.ts
// Regla del brief §17: nunca un ranking de seguridad sin población, período y
// metodología — por eso se publican TASAS con la fórmula documentada.
//
// Uso: node scripts/ingest/fetch-seguridad.mjs

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { departmentObservations } from "../../src/data/observations/departamentos.ts";
import { nationalObservations } from "../../src/data/observations/nacional.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = path.join(ROOT, "scripts", "ingest", ".cache");
const OUT = path.join(ROOT, "src", "data", "observations", "seguridad.ts");
const TODAY = new Date().toISOString().slice(0, 10);
const YEAR = "2025"; // último año completo del dataset

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
};

const SRC = {
  homicidios:
    "https://catalogodatos.gub.uy/dataset/999f2edc-5ef5-4d41-bed7-824a5635ea8d/resource/5ed98add-f127-4377-b529-aa8ad35b77e3/download/homicidios_dolosos_consumados.csv",
  otros:
    "https://catalogodatos.gub.uy/dataset/999f2edc-5ef5-4d41-bed7-824a5635ea8d/resource/c8c4cc18-57cf-448b-9c68-901b3752fc11/download/otros-delitos.csv",
};

// Nombres de departamento tal como aparecen en los CSV del MI → ISO 3166-2:UY.
const DEPT_NAME_TO_ISO = {
  ARTIGAS: "UY-AR",
  CANELONES: "UY-CA",
  "CERRO LARGO": "UY-CL",
  COLONIA: "UY-CO",
  DURAZNO: "UY-DU",
  FLORES: "UY-FS",
  FLORIDA: "UY-FD",
  LAVALLEJA: "UY-LA",
  MALDONADO: "UY-MA",
  MONTEVIDEO: "UY-MO",
  PAYSANDU: "UY-PA",
  "RIO NEGRO": "UY-RN",
  RIVERA: "UY-RV",
  ROCHA: "UY-RO",
  SALTO: "UY-SA",
  "SAN JOSE": "UY-SJ",
  SORIANO: "UY-SO",
  TACUAREMBO: "UY-TA",
  "TREINTA Y TRES": "UY-TT",
};
// Claves del CSV que no son un departamento (sin base poblacional propia).
const NON_DEPT_KEYS = new Set(["CENTROS CARCELARIOS"]);

// Población Censo 2023 (misma base que el resto de la plataforma).
const POP = Object.fromEntries(
  departmentObservations
    .filter((o) => o.indicatorId === "poblacion")
    .map((o) => [o.territoryId, o.value])
);
const POP_UY = nationalObservations.find(
  (o) => o.indicatorId === "poblacion" && o.territoryId === "UY"
)?.value;
if (!POP_UY || Object.keys(POP).length !== 19) {
  throw new Error("No se pudo cargar la población censal de referencia");
}

async function cachedDownload(name, url) {
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, name);
  if (await access(file).then(() => true, () => false)) {
    console.log(`  ${name}: usando caché`);
    return readFile(file, "utf8");
  }
  console.log(`  ${name}: descargando…`);
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  const text = await res.text();
  await writeFile(file, text);
  return text;
}

/** Parser CSV con soporte de comillas dobles. */
function parseLine(line, sep) {
  const out = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === sep) {
      out.push(field);
      field = "";
    } else field += c;
  }
  out.push(field);
  return out;
}

const round1 = (n) => Math.round(n * 10) / 10;

// ── Homicidios dolosos consumados (una fila por víctima) ─────────────────────
console.log("Homicidios dolosos consumados…");
const homTxt = await cachedDownload("mi-homicidios.csv", SRC.homicidios);
const homLines = homTxt.trim().split(/\r?\n/);
const homHeader = parseLine(homLines[0].replace(/^﻿/, ""), ",");
const hDepto = homHeader.indexOf("DEPARTAMENTO");
const homByYear = {};
for (let i = 1; i < homLines.length; i++) {
  const p = parseLine(homLines[i], ",");
  const y = p[2];
  const d = p[hDepto];
  if (!homByYear[y]) homByYear[y] = {};
  homByYear[y][d] = (homByYear[y][d] ?? 0) + 1;
}
for (const key of Object.keys(homByYear[YEAR] ?? {})) {
  if (!DEPT_NAME_TO_ISO[key] && !NON_DEPT_KEYS.has(key)) {
    throw new Error(`Departamento desconocido en homicidios: "${key}"`);
  }
}

// ── Rapiñas y hurtos (una fila por evento denunciado) ────────────────────────
console.log("Rapiñas y hurtos denunciados…");
const otrosTxt = await cachedDownload("mi-otros-delitos.csv", SRC.otros);
const otrosLines = otrosTxt.trim().split(/\r?\n/);
const oHeader = otrosLines[0].replace(/^﻿/, "").split(";");
const oDelito = oHeader.indexOf("DELITO");
const oAno = oHeader.findIndex((h) => /A.?O/.test(h) && h.length <= 4);
const oDepto = oHeader.indexOf("DEPTO");
const delitos = { RAPIÑA: {}, HURTO: {} }; // delito → año → depto → n
for (let i = 1; i < otrosLines.length; i++) {
  const p = otrosLines[i].split(";");
  const delito = p[oDelito];
  if (delito !== "RAPIÑA" && delito !== "HURTO") continue;
  const y = p[oAno];
  if (y !== YEAR && y !== String(Number(YEAR) - 1)) continue;
  const d = p[oDepto];
  if (!delitos[delito][y]) delitos[delito][y] = {};
  delitos[delito][y][d] = (delitos[delito][y][d] ?? 0) + 1;
}

// ── Construcción de observaciones ────────────────────────────────────────────
const PREV = String(Number(YEAR) - 1);

function nationalTotal(counts) {
  return Object.values(counts ?? {}).reduce((a, b) => a + b, 0);
}

function buildBlock({ indicatorId, byYear, sourceUrl, deptNote, natNote }) {
  const rows = [];
  const current = byYear[YEAR] ?? {};
  // 19 departamentos, con cero explícito cuando no hubo casos.
  for (const [name, iso] of Object.entries(DEPT_NAME_TO_ISO)) {
    const count = current[name] ?? 0;
    const rate = round1((count / POP[iso]) * 100000);
    rows.push({
      indicatorId,
      territoryId: iso,
      period: YEAR,
      periodLabel: `Año ${YEAR}`,
      value: rate,
      notes: `${count} casos registrados. ${deptNote}`,
      sourceUrl,
    });
  }
  // Nacional, año actual y anterior (para la variación).
  for (const y of [PREV, YEAR]) {
    const total = nationalTotal(byYear[y]);
    rows.push({
      indicatorId,
      territoryId: "UY",
      period: y,
      periodLabel: `Año ${y}`,
      value: round1((total / POP_UY) * 100000),
      notes: `${total} casos registrados en todo el país. ${natNote}`,
      sourceUrl,
    });
  }
  return rows;
}

const homDeptNote =
  "Tasa = víctimas de homicidio doloso consumado / población del Censo 2023 × 100.000. Los homicidios en centros carcelarios se contabilizan solo en el total nacional.";
const homNatNote =
  "Incluye los homicidios en centros carcelarios. Tasa sobre población del Censo 2023.";
const rapNote =
  "Tasa = rapiñas denunciadas (incluye tentativas) / población del Censo 2023 × 100.000. Son denuncias, no condenas.";
const hurNote =
  "Tasa = hurtos denunciados (incluye tentativas) / población del Censo 2023 × 100.000. Son denuncias, no condenas.";

const blocks = [
  ...buildBlock({
    indicatorId: "homicidios-100k",
    byYear: homByYear,
    sourceUrl: SRC.homicidios,
    deptNote: homDeptNote,
    natNote: homNatNote,
  }),
  ...buildBlock({
    indicatorId: "rapinas-100k",
    byYear: delitos["RAPIÑA"],
    sourceUrl: SRC.otros,
    deptNote: rapNote,
    natNote: rapNote,
  }),
  ...buildBlock({
    indicatorId: "hurtos-100k",
    byYear: delitos["HURTO"],
    sourceUrl: SRC.otros,
    deptNote: hurNote,
    natNote: hurNote,
  }),
];

// Chequeos de plausibilidad.
const homTotal = nationalTotal(homByYear[YEAR]);
if (homTotal < 300 || homTotal > 450) {
  throw new Error(`Total de homicidios ${YEAR} fuera de rango plausible: ${homTotal}`);
}
console.log(
  `  ✓ homicidios ${YEAR}: ${homTotal} víctimas (balance preliminar del MI: ~372; el microdato abierto se actualiza después)`
);
console.log(`  ✓ rapiñas ${YEAR}: ${nationalTotal(delitos["RAPIÑA"][YEAR])} denuncias`);
console.log(`  ✓ hurtos ${YEAR}: ${nationalTotal(delitos["HURTO"][YEAR])} denuncias`);

const serialize = (rows) =>
  rows
    .map(
      (r) =>
        `  { indicatorId: ${JSON.stringify(r.indicatorId)}, territoryId: ${JSON.stringify(r.territoryId)}, period: ${JSON.stringify(r.period)}, periodLabel: ${JSON.stringify(r.periodLabel)}, value: ${r.value}, status: "CALCULATED", demo: false, sourceUrl: ${JSON.stringify(r.sourceUrl)}, retrievedAt: ${JSON.stringify(TODAY)}, notes: ${JSON.stringify(r.notes)} },`
    )
    .join("\n");

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-seguridad.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente de los conteos: microdatos abiertos del
// Ministerio del Interior (denuncias/víctimas registradas, 2013→presente,
// actualizados trimestralmente). Las TASAS cada 100.000 habitantes son cálculo
// propio sobre la población del Censo 2023 (base fija, misma que usa toda la
// plataforma). El balance preliminar del MI puede diferir levemente porque los
// microdatos se siguen actualizando después de su publicación.

export const seguridadObservations: Observation[] = [
${serialize(blocks)}
];
`;

await writeFile(OUT, file);
console.log(`→ ${OUT} (${blocks.length} observaciones)`);
