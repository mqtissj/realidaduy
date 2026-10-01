// Ingesta del PIB trimestral del BCU: variación real interanual (contra el
// mismo trimestre del año anterior), calculada sobre la serie trimestral a
// precios constantes de 2016 de las cuentas nacionales. Es la cifra que el BCU
// da como titular: antes de escribir, el script la compara contra el texto de
// su página "Último informe disponible".
// También calcula la variación anual (suma de los cuatro trimestres contra la del
// año anterior), que desde 2017 alimenta el gráfico de evolución del PIB; hasta
// 2016 ese gráfico usa PRISMA (fetch-prisma.mjs).
// Genera src/data/observations/bcu-pib.ts.
//
// El BCU no manda la cadena completa de certificados: los intermedios están en
// scripts/ingest/certs/bcu-intermedios.pem (ahí se explica cuándo cambiarlos).
//
// Uso: node scripts/ingest/fetch-bcu-pib.mjs

import { readFile, writeFile } from "node:fs/promises";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import path from "node:path";
import AdmZip from "adm-zip";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "bcu-pib.ts");
const CERTS = path.join(ROOT, "scripts", "ingest", "certs", "bcu-intermedios.pem");
const TODAY = new Date().toISOString().slice(0, 10);

// Planilla "Series del PIB por industrias en millones de pesos constantes de
// 2016" (Cuentas Nacionales Trimestrales → PIB enfoque de la producción).
const XLSX =
  "https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Cuentas%20Nacionales/1.%20Actividades_K.xlsx";
const INFORME =
  "https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Ultimo-informe-disponible.aspx";

const intermedios = (await readFile(CERTS, "utf8")).match(
  /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g
);
tls.setDefaultCACertificates([...tls.getCACertificates("default"), ...intermedios]);

async function get(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (e) {
    const code = e.cause?.code ?? "";
    if (/CERT|SIGNATURE|ISSUER/.test(code))
      throw new Error(
        `TLS (${code}) en ${url}: el BCU cambió de certificado. Actualizar scripts/ingest/certs/bcu-intermedios.pem`
      );
    throw e;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res;
}

function fail(msg) {
  throw new Error(`La planilla del BCU cambió y el script no puede seguir: ${msg}`);
}

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/[​ ]/g, (c) => (c === " " ? " " : ""));

// 1. La planilla: un xlsx es un zip con XML adentro.
const zip = new AdmZip(Buffer.from(await (await get(XLSX)).arrayBuffer()));
const leer = (nombre) => {
  const entry = zip.getEntry(nombre);
  if (!entry) fail(`falta ${nombre}`);
  return entry.getData().toString("utf8");
};
if (!leer("xl/workbook.xml").includes('name="Valores_K"')) fail("no está la hoja Valores_K");
const strings = [...leer("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
  decode(m[1].replace(/<[^>]+>/g, "")).trim()
);
if (!strings.some((s) => /precios constantes de 2016/.test(s)))
  fail("la serie ya no está en precios constantes de 2016");

const filas = new Map(); // fila → (columna → valor)
for (const m of leer("xl/worksheets/sheet1.xml").matchAll(
  /<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g
)) {
  const [, col, fila, attrs, inner] = m;
  const v = inner?.match(/<v>([\s\S]*?)<\/v>/)?.[1];
  if (v === undefined) continue;
  if (!filas.has(fila)) filas.set(fila, new Map());
  filas.get(fila).set(col, attrs.includes('t="s"') ? strings[Number(v)] : v);
}
const TRIM = /^(I|II|III|IV) (\d{4})\*?$/;
const encabezado = [...filas.values()].find((f) => [...f.values()].some((v) => TRIM.test(v)));
if (!encabezado) fail("no se encuentran los trimestres");
const primeraCol = [...encabezado].find(([, v]) => TRIM.test(v))[0];
// "Producto Interno Bruto" también es el título de la hoja: la fila buscada es
// la que, además del rótulo, tiene números bajo los trimestres.
const filaPib = [...filas.values()].find(
  (f) =>
    [...f.values()].some((v) => v.trim().toUpperCase() === "PRODUCTO INTERNO BRUTO") &&
    Number(f.get(primeraCol)) > 0
);
if (!filaPib) fail("no se encuentra la fila del PIB");

// 2. La serie, en orden, con controles: trimestres consecutivos y niveles > 0.
const ROMANO = { I: 1, II: 2, III: 3, IV: 4 };
const serie = [...encabezado]
  .filter(([, v]) => TRIM.test(v))
  .map(([col, v]) => {
    const [, r, anio] = v.match(TRIM);
    return { anio: Number(anio), q: ROMANO[r], nivel: Number(filaPib.get(col)) };
  });
if (serie.length < 20) fail(`la serie trae solo ${serie.length} trimestres`);
for (let i = 0; i < serie.length; i++) {
  const s = serie[i];
  if (!(s.nivel > 0)) fail(`nivel inválido en ${s.anio}-Q${s.q}`);
  const p = serie[i - 1];
  if (p && s.anio * 4 + s.q !== p.anio * 4 + p.q + 1)
    fail(`los trimestres no son consecutivos (${p.anio}-Q${p.q} → ${s.anio}-Q${s.q})`);
}

// 3. Variación interanual: cada trimestre contra el mismo del año anterior.
const ETIQUETA = ["1er", "2do", "3er", "4to"];
const obs = serie.slice(4).map((s, i) => ({
  periodo: `${s.anio}-Q${s.q}`,
  etiqueta: `${ETIQUETA[s.q - 1]} trimestre ${s.anio}`,
  valor: Number(((s.nivel / serie[i].nivel - 1) * 100).toFixed(1)) || 0,
}));
const ultimo = obs[obs.length - 1];

// Variación anual: solo años con los cuatro trimestres, contra el año anterior
// completo.
const porAnio = new Map();
for (const s of serie) porAnio.set(s.anio, [...(porAnio.get(s.anio) ?? []), s.nivel]);
const anuales = [...porAnio]
  .filter(([anio, niveles]) => niveles.length === 4 && porAnio.get(anio - 1)?.length === 4)
  .map(([anio, niveles]) => {
    const suma = (n) => n.reduce((a, b) => a + b, 0);
    const v = (suma(niveles) / suma(porAnio.get(anio - 1)) - 1) * 100;
    return { periodo: String(anio), valor: Number(v.toFixed(1)) || 0 };
  });
if (anuales[0]?.periodo !== "2017") fail(`la serie anual arranca en ${anuales[0]?.periodo}, no en 2017`);

// 4. Control contra el titular que publica el BCU ("En el segundo trimestre de
// 2026 el Producto Interno Bruto (PIB) se contrajo 0,5% con relación al mismo
// trimestre de 2025"). Si el texto no aparece, avisa; si aparece y no coincide
// con la planilla, corta.
const ORDINAL = { primer: 1, segundo: 2, tercer: 3, cuarto: 4 };
const texto = decode((await (await get(INFORME)).text()).replace(/<[^>]+>/g, " ")).replace(
  /\s+/g,
  " "
);
const t = texto.match(
  /(primer|segundo|tercer|cuarto) trimestre de (\d{4}),? el Producto Interno Bruto \(PIB\) (creció|aumentó|se expandió|se contrajo|cayó|disminuyó|se redujo) (\d+(?:,\d+)?) ?%/i
);
if (!t) {
  console.warn("AVISO: no encontré el titular en la página del BCU; no se pudo comparar.");
} else {
  const periodo = `${t[2]}-Q${ORDINAL[t[1].toLowerCase()]}`;
  const signo = /contrajo|cayó|disminuyó|redujo/i.test(t[3]) ? -1 : 1;
  const valor = signo * Number(t[4].replace(",", "."));
  if (periodo !== ultimo.periodo || Math.abs(valor - ultimo.valor) > 0.05)
    throw new Error(
      `El titular del BCU (${periodo}: ${valor}%) no coincide con la planilla (${ultimo.periodo}: ${ultimo.valor}%)`
    );
  console.log(`Titular del BCU verificado: ${periodo} ${valor}%`);
}

const nota =
  "Variación real interanual del PIB: contra el mismo trimestre del año anterior, a precios constantes de 2016. Calculada sobre la serie trimestral del BCU (cifras preliminares, que el BCU revisa con cada publicación). La variación desestacionalizada contra el trimestre anterior es otra medida y no se mezcla con esta.";
const notaAnual =
  "Desde 2017, variación real anual del PIB: suma de los cuatro trimestres del BCU contra la del año anterior, a precios constantes de 2016 (última versión publicada; cifras preliminares). Hasta 2016, la misma serie del BCU publicada por PRISMA: de 2016 a 2021 las dos coinciden exacto.";
const linea = (o, etiqueta, notas) =>
  `  { indicatorId: "pib-variacion", territoryId: "UY", period: ${JSON.stringify(o.periodo)}, periodLabel: ${JSON.stringify(etiqueta)}, value: ${o.valor}, status: "OFFICIAL", demo: false, sourceUrl: ${JSON.stringify(XLSX)}, retrievedAt: ${JSON.stringify(TODAY)}, notes: ${JSON.stringify(notas)} },`;
const lines = [
  "  // Anual (gráfico de evolución, desde 2017)",
  ...anuales.map((o) => linea(o, o.periodo, notaAnual)),
  "  // Trimestral (titular)",
  ...obs.map((o) => linea(o, o.etiqueta, nota)),
];

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-bcu-pib.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente: BCU, cuentas nacionales trimestrales
// (PIB a precios constantes de 2016). El último trimestre se verificó contra el
// titular de la página "Último informe disponible" del BCU. La serie anual
// empalma con prisma.ts, que llega hasta 2016.

export const bcuPibObservations: Observation[] = [
${lines.join("\n")}
];
`;

await writeFile(OUT, file);
console.log(
  `PIB → pib-variacion: ${anuales.length} años (${anuales[0].periodo}–${anuales[anuales.length - 1].periodo}) y ${obs.length} trimestres (${obs[0].periodo}–${ultimo.periodo}), último ${ultimo.valor}%`
);
