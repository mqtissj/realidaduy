// Mortalidad infantil (muertes de menores de un año cada 1.000 nacidos vivos)
// para el país y por departamento.
//
// Sale de dos cuadros del Anuario Estadístico Nacional del INE (capítulo 2.3,
// con datos de estadísticas vitales del MSP), que solo se publican en .xls:
//
// - 2.3.1: nacimientos por departamento de residencia de la madre (los últimos
//   tres años) y la serie histórica del país desde 1970;
// - 2.3.6: defunciones de menores de un año, con la misma apertura y la serie
//   del país desde 1900.
//
// La tasa la calcula realidad.uy: defunciones / nacimientos × 1.000. Para el
// país es anual. Por departamento se suman los tres años del cuadro, porque en
// los departamentos chicos hay entre 0 y 10 muertes por año y la tasa de un solo
// año salta mucho por azar.
//
// Ante la duda, romper: la tasa del país tiene que coincidir con la que publica
// el MSP (CONTROL_MSP), y los cuadros tienen que traer los 19 departamentos con
// sus totales cerrando.
//
// El Anuario es anual y su dirección cambia con cada edición: al salir uno
// nuevo hay que actualizar ANUARIO (y sumar el año nuevo a CONTROL_MSP).
//
// Genera src/data/observations/mortalidad-infantil.ts.
// Uso: node scripts/ingest/fetch-mortalidad-infantil.mjs

import { readFile, writeFile } from "node:fs/promises";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { leerXls } from "./lib/xls.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "mortalidad-infantil.ts");
const CERTS = path.join(ROOT, "scripts", "ingest", "certs", "ine-intermedios.pem");
const TODAY = new Date().toISOString().slice(0, 10);

const ANUARIO =
  "https://www5.ine.gub.uy/documents/ANUARIOS/Anuario%202025/2%20-%20POBLACI%C3%93N/2.3%20Indicadores%20Demogr%C3%A1ficos";
const URL_NACIMIENTOS = `${ANUARIO}/2.3.1ok.xls`;
const URL_DEFUNCIONES = `${ANUARIO}/2.3.6ok.xls`;
const PAGINA =
  "https://www.gub.uy/instituto-nacional-estadistica/comunicacion/publicaciones/anuario-estadistico-nacional-2025-vol-102/capitulo-2-poblacion/23";

// Tasa de mortalidad infantil que publica el MSP (presentación de estadísticas
// vitales): el cálculo tiene que dar lo mismo, redondeado a un decimal.
const CONTROL_MSP = { 2019: 6.8, 2020: 6.2, 2021: 6.3, 2022: 6.2, 2023: 7.3, 2024: 6.5 };

const DEPARTAMENTOS = {
  artigas: "UY-AR",
  canelones: "UY-CA",
  "cerro largo": "UY-CL",
  colonia: "UY-CO",
  durazno: "UY-DU",
  flores: "UY-FS",
  florida: "UY-FD",
  lavalleja: "UY-LA",
  maldonado: "UY-MA",
  montevideo: "UY-MO",
  paysandu: "UY-PA",
  "rio negro": "UY-RN",
  rivera: "UY-RV",
  rocha: "UY-RO",
  salto: "UY-SA",
  "san jose": "UY-SJ",
  soriano: "UY-SO",
  tacuarembo: "UY-TA",
  "treinta y tres": "UY-TT",
};

const intermedios = (await readFile(CERTS, "utf8")).match(
  /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g
);
tls.setDefaultCACertificates([...tls.getCACertificates("default"), ...intermedios]);

function fail(msg) {
  throw new Error(`Mortalidad infantil (Anuario del INE): ${msg}`);
}

const clave = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

/** Celda numérica; "-" es cero. Cualquier otra cosa rompe. */
function cantidad(v, donde) {
  if (v === "-") return 0;
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0) fail(`valor raro en ${donde}: ${JSON.stringify(v)}`);
  return Math.round(v);
}

async function bajar(url) {
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (intento >= 3) throw e;
      await new Promise((r) => setTimeout(r, 3000 * intento));
    }
  }
}

/** Cuadro de los últimos años: { años, filas: { clave: [valor por año] } }. */
function cuadroReciente(filas, nombre) {
  const iCab = filas.findIndex((f) => f && f.slice(1).length >= 3 && f.slice(1).every((v) => Number.isInteger(v) && v > 2000));
  if (iCab < 0) fail(`no encontré la fila de años en ${nombre}`);
  const años = filas[iCab].slice(1);
  const out = {};
  for (const f of filas.slice(iCab + 1)) {
    if (!f || typeof f[0] !== "string" || f.length < 2) continue;
    out[clave(f[0])] = años.map((a, k) => cantidad(f[k + 1], `${nombre}, ${f[0].trim()} ${a}`));
  }
  for (const d of [...Object.keys(DEPARTAMENTOS), "total pais"])
    if (!out[d]) fail(`falta "${d}" en ${nombre}`);
  // Los 19 departamentos más las madres residentes en el exterior o sin dato
  // suman el total del país. (La fila "Resto País" no sirve de control: en el
  // 2.3.6 de 2023 incluye a la madre residente en el extranjero.)
  años.forEach((a, k) => {
    const interior = Object.keys(DEPARTAMENTOS)
      .filter((d) => d !== "montevideo")
      .reduce((s, d) => s + out[d][k], 0);
    const sinDepto = (out["en el exterior"] ?? out.extranjero ?? [])[k] ?? 0;
    const total = out.montevideo[k] + interior + sinDepto + (out["no indicado"]?.[k] ?? 0);
    if (total !== out["total pais"][k]) fail(`en ${nombre} ${a} las filas suman ${total} y no ${out["total pais"][k]}`);
  });
  return { años, filas: out };
}

/** Serie histórica del país: { año: valor }, salteando años sin dato. */
function serieHistorica(filas, nombre) {
  const iCab = filas.findIndex((f) => f && clave(f[0]) === "ano" && clave(f[1]) === "total");
  if (iCab < 0) fail(`no encontré la cabecera Año / Total en ${nombre}`);
  const out = {};
  for (const f of filas.slice(iCab + 1)) {
    // Algunos años vienen como texto (" 1970").
    const año = typeof f?.[0] === "string" && /^\s*\d{4}\s*$/.test(f[0]) ? Number(f[0]) : f?.[0];
    if (!Number.isInteger(año)) continue;
    if (f[1] === undefined || f[1] === null) continue;
    out[año] = cantidad(f[1], `${nombre}, ${año}`);
  }
  return out;
}

const hoja = (libro, re, archivo) => {
  const n = Object.keys(libro).find((k) => re.test(k));
  if (!n) fail(`${archivo} no tiene la hoja ${re} (tiene ${Object.keys(libro).join(", ")})`);
  return libro[n];
};

const nac = leerXls(await bajar(URL_NACIMIENTOS));
const def = leerXls(await bajar(URL_DEFUNCIONES));

const nacReciente = cuadroReciente(hoja(nac, /^2\.3\.1$/, "2.3.1"), "cuadro 2.3.1");
const defReciente = cuadroReciente(hoja(def, /^2\.3\.6$/, "2.3.6"), "cuadro 2.3.6");
if (nacReciente.años.join() !== defReciente.años.join())
  fail(`los cuadros traen años distintos: ${nacReciente.años} y ${defReciente.años}`);
const años = nacReciente.años;

// Serie del país: la histórica más los años del cuadro principal (la histórica
// suele no tener el último año). Donde se pisan, tienen que coincidir.
const nacidos = serieHistorica(hoja(nac, /^serie hist/i, "2.3.1"), "serie histórica de nacimientos");
const muertes = serieHistorica(hoja(def, /^serie hist/i, "2.3.6"), "serie histórica de defunciones");
años.forEach((a, k) => {
  for (const [serie, cuadro, nombre] of [
    [nacidos, nacReciente, "nacimientos"],
    [muertes, defReciente, "defunciones"],
  ]) {
    const v = cuadro.filas["total pais"][k];
    if (serie[a] !== undefined && serie[a] !== v) fail(`${nombre} ${a}: la serie histórica dice ${serie[a]} y el cuadro ${v}`);
    serie[a] = v;
  }
});

const tasa = (d, n) => (d / n) * 1000;
const fmt = (n, d = 1) => n.toFixed(d).replace(".", ",");
const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const observaciones = [];
const periodos = Object.keys(nacidos)
  .map(Number)
  .filter((a) => muertes[a] !== undefined)
  .sort((a, b) => a - b);
if (periodos[0] > 1980 || periodos.at(-1) !== años.at(-1)) fail(`serie del país incompleta: ${periodos[0]}–${periodos.at(-1)}`);
for (const a of periodos) {
  const v = Math.round(tasa(muertes[a], nacidos[a]) * 10) / 10;
  if (CONTROL_MSP[a] !== undefined && Math.abs(v - CONTROL_MSP[a]) > 0.05)
    fail(`${a}: el cálculo da ${v} y el MSP publica ${CONTROL_MSP[a]}`);
  observaciones.push({
    territoryId: "UY",
    period: String(a),
    periodLabel: String(a),
    value: v,
    // Solo los años del cuadro llevan la cuenta: en la serie larga, una nota
    // por año llenaría el pie del gráfico.
    notes: años.includes(a)
      ? `${a}: ${miles(muertes[a])} muertes de menores de un año y ${miles(nacidos[a])} nacimientos.`
      : undefined,
  });
}
for (const a of Object.keys(CONTROL_MSP)) if (!periodos.includes(Number(a))) fail(`falta ${a} en la serie del país`);

// Departamentos: los tres años del cuadro juntos. El período es el del medio,
// como la esperanza de vida departamental.
if (años.length !== 3) fail(`se esperaban tres años en los cuadros y vinieron ${años.length}`);
const medio = String(años[1]);
const rango = `${años[0]}–${años[2]}`;
for (const [d, territoryId] of Object.entries(DEPARTAMENTOS)) {
  const m = defReciente.filas[d].reduce((s, x) => s + x, 0);
  const n = nacReciente.filas[d].reduce((s, x) => s + x, 0);
  if (n < 500) fail(`${d}: solo ${n} nacimientos en ${rango}`);
  observaciones.push({
    territoryId,
    period: medio,
    periodLabel: `${medio} (promedio ${rango})`,
    value: Math.round(tasa(m, n) * 10) / 10,
    notes: `${miles(m)} muertes de menores de un año y ${miles(n)} nacimientos en ${rango}, sumados. Por año: ${años
      .map((a, k) => `${a}: ${defReciente.filas[d][k]} muertes y ${miles(nacReciente.filas[d][k])} nacimientos`)
      .join("; ")}.`,
  });
}

const lineas = observaciones.map((o) =>
  JSON.stringify({
    indicatorId: "mortalidad-infantil",
    territoryId: o.territoryId,
    period: o.period,
    periodLabel: o.periodLabel,
    value: o.value,
    status: "CALCULATED",
    demo: false,
    sourceUrl: PAGINA,
    retrievedAt: TODAY,
    notes: o.notes,
  })
    .replace(/^\{/, "{ ")
    .replace(/\}$/, " }")
    .replace(/","/g, '", "')
    .replace(/,"(\w+)":/g, ', "$1":')
    .replace(/"(\w+)":/g, "$1: ")
);

const ts = `// GENERADO por scripts/ingest/fetch-mortalidad-infantil.mjs — no editar a mano.
// Fuente: INE, Anuario Estadístico Nacional 2025, cuadros 2.3.1 y 2.3.6 (datos
// del MSP). Tasa calculada por realidad.uy: muertes de menores de un año cada
// 1.000 nacidos vivos. Por departamento, ${rango} sumados.
import type { Observation } from "@/lib/types";

export const mortalidadInfantilObservations: Observation[] = [
${lineas.map((l) => `  ${l},`).join("\n")}
];
`;
await writeFile(OUT, ts);
const ultimo = observaciones.find((o) => o.territoryId === "UY" && o.period === String(años.at(-1)));
console.log(
  `Mortalidad infantil: ${periodos.length} años del país (${periodos[0]}–${periodos.at(-1)}, último ${fmt(ultimo.value)}) y 19 departamentos (${rango}).`
);
