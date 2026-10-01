// Ingesta del PBI anual desde PRISMA, el portal de indicadores de la ANII
// (https://prisma.uy). El dato es del BCU (cuentas nacionales, base 2016);
// PRISMA lo publica procesado. Los datos de PRISMA son públicos y la condición
// de uso es citar el portal: cada observación lleva la página de PRISMA como
// sourceUrl y lo dice en la nota.
// Genera src/data/observations/prisma.ts, solo con los años hasta 2016: desde
// 2017 el PIB anual sale de la serie trimestral del BCU (fetch-bcu-pib.mjs), que
// trae las revisiones posteriores a la última carga de PRISMA. Es la misma serie
// del BCU con base 2016: de 2016 a 2021 los niveles coinciden exacto, así que el
// empalme no tiene salto.
//
// PRISMA no tiene una API documentada: el portal arma sus gráficos con
// consultas CDA de Pentaho, que son públicas. Si cambian el nombre de una
// columna, la fuente o la base de precios, el script corta sin escribir nada.
//
// Uso: node scripts/ingest/fetch-prisma.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "prisma.ts");
const TODAY = new Date().toISOString().slice(0, 10);

const API =
  "https://prisma.uy/pentaho/plugin/cda/api/doQuery?path=/public/prisma/contexto-economico/api.cda";
const PAGE = "https://prisma.uy/indicadores/contexto-economico/pbi";

async function query(dataAccessId) {
  const url = `${API}&dataAccessId=${dataAccessId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

function fail(msg) {
  throw new Error(`PRISMA cambió y el script no puede seguir: ${msg}`);
}

// 1. Metadatos del gráfico: fuente original, base de precios y fecha de
// actualización en PRISMA.
const metadata = await query("metadata");
const cols = metadata.metadata.map((c) => c.colName);
const meta = metadata.resultset
  .map((row) => Object.fromEntries(cols.map((c, i) => [c, row[i]])))
  .find((m) => m.nombre === "pbi_uy");
if (!meta) fail("no aparece el gráfico pbi_uy en los metadatos");
if (meta.fuentes_de_datos !== "BCU") fail(`la fuente ahora es "${meta.fuentes_de_datos}"`);
if (!/pesos constantes de 2016/.test(meta.subtitulo ?? ""))
  fail(`la serie ya no está en pesos constantes de 2016 ("${meta.subtitulo}")`);
const actualizadoEnPrisma = String(meta.fecha_de_actualizacion).slice(0, 10);
const actualizadoLegible = actualizadoEnPrisma.split("-").reverse().join("/");

// 2. La serie: año, PBI en millones de pesos constantes de 2016 y crecimiento
// anual en %.
const pbi = await query("pbi_uy");
const pbiCols = pbi.metadata.map((c) => c.colName).join(",");
if (pbiCols !== "Año,pbi,crecimiento_anual_pbi") fail(`columnas inesperadas: ${pbiCols}`);
const rows = pbi.resultset.map(([anio, nivel, crecimiento]) => ({
  anio: String(anio),
  nivel: Number(nivel),
  crecimiento: Number(crecimiento),
}));
if (rows.length < 10) fail(`la serie trae solo ${rows.length} años`);

// 3. Controles antes de escribir. El crecimiento publicado tiene que salir del
// nivel (con tolerancia de redondeo) y los años tienen que ser consecutivos.
const obs = [];
for (let i = 1; i < rows.length; i++) {
  const prev = rows[i - 1];
  const r = rows[i];
  if (Number(r.anio) !== Number(prev.anio) + 1) fail(`falta el año entre ${prev.anio} y ${r.anio}`);
  if (!(r.nivel > 0)) fail(`nivel inválido en ${r.anio}`);
  const calculado = (r.nivel / prev.nivel - 1) * 100;
  if (Math.abs(calculado - r.crecimiento) > 0.01)
    fail(`en ${r.anio} el crecimiento publicado (${r.crecimiento}) no sale del nivel (${calculado.toFixed(2)})`);
  obs.push({ periodo: r.anio, valor: Number(r.crecimiento.toFixed(1)) });
}
// El primer año no tiene contra qué compararse: PRISMA lo publica como 0, que
// no es un dato. Por eso arranca del segundo año.
const covid = obs.find((o) => o.periodo === "2020");
if (!covid || covid.valor > -7 || covid.valor < -8)
  fail(`la caída de 2020 no es la esperada (${covid?.valor}); revisar la serie`);

const ULTIMO_ANIO = 2016;
const tramo = obs.filter((o) => Number(o.periodo) <= ULTIMO_ANIO);
if (tramo[tramo.length - 1]?.periodo !== String(ULTIMO_ANIO)) fail(`falta el año ${ULTIMO_ANIO}`);

const nota = `Variación real anual del PBI, a precios constantes de 2016. Dato del BCU publicado por PRISMA (ANII), actualizado en el portal el ${actualizadoLegible}. Serie anual: no se mezcla con la variación trimestral en un mismo gráfico.`;
const lines = tramo.map(
  (o) =>
    `  { indicatorId: "pib-variacion", territoryId: "UY", period: ${JSON.stringify(o.periodo)}, periodLabel: ${JSON.stringify(o.periodo)}, value: ${o.valor}, status: "OFFICIAL", demo: false, sourceUrl: ${JSON.stringify(PAGE)}, retrievedAt: ${JSON.stringify(TODAY)}, notes: ${JSON.stringify(nota)} },`
);

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-prisma.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente: PRISMA, portal de indicadores de la ANII
// (prisma.uy), que publica el PBI anual del BCU a precios constantes de 2016.
// Datos públicos; la condición de uso es citar el portal. Solo hasta
// ${ULTIMO_ANIO}: desde ${ULTIMO_ANIO + 1} el PIB anual sale del BCU (bcu-pib.ts).

export const prismaObservations: Observation[] = [
${lines.join("\n")}
];
`;

await writeFile(OUT, file);
console.log(
  `pbi_uy → pib-variacion: ${tramo.length} años (${tramo[0].periodo}–${ULTIMO_ANIO}) de ${obs.length} publicados, actualizado en PRISMA el ${actualizadoEnPrisma}`
);
