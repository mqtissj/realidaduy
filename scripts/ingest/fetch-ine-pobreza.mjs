// Ingesta de los informes de pobreza del INE ("Estimación de la pobreza por el
// método del ingreso"), que salen dos veces por año en gub.uy:
//
// - el del primer semestre (setiembre u octubre),
// - el anual (abril del año siguiente).
//
// Cada página enlaza el informe completo en www5.ine.gub.uy. De ahí salen:
//
// - pobreza en personas y en hogares, con su margen de error (cuadro 1);
// - pobreza en hogares según el sexo de quien lo encabeza (cuadro 5, solo el
//   informe anual);
// - el valor de la línea de pobreza en pesos, por región, tenencia de la
//   vivienda y tamaño del hogar (cuadro 2 del semestral, 7 del anual).
//
// Lee los informes con metodología 2017 en el formato actual: desde el anual
// 2025 y el primer semestre 2026. Los anteriores se cargaron a mano en
// nacional.ts. Para cada período que ya está en nacional.ts, el script exige que
// el valor coincida y no lo vuelve a escribir; los períodos nuevos van al
// archivo generado. Así, cuando el INE publique un informe, la actualización
// mensual lo trae sola.
//
// Ante la duda, romper: si un informe cambia de formato, el script falla.
//
// Genera src/data/observations/ine-pobreza.ts.
// Uso: node scripts/ingest/fetch-ine-pobreza.mjs

import { readFile, writeFile } from "node:fs/promises";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "ine-pobreza.ts");
const CERTS = path.join(ROOT, "scripts", "ingest", "certs", "ine-intermedios.pem");
const TODAY = new Date().toISOString().slice(0, 10);
const BASE =
  "https://www.gub.uy/instituto-nacional-estadistica/comunicacion/publicaciones/estimacion-pobreza-metodo-del-ingreso";

// El WAF de gub.uy responde 403 a clientes sin User-Agent de navegador.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

// www5.ine.gub.uy manda un intermedio equivocado: se suma el correcto, como en
// fetch-ine.mjs.
const intermedios = (await readFile(CERTS, "utf8")).match(
  /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g
);
tls.setDefaultCACertificates([...tls.getCACertificates("default"), ...intermedios]);

function fail(msg) {
  throw new Error(`Informe de pobreza del INE: ${msg}`);
}

const texto = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ");

const num = (s) => Number(s.replace(/\./g, "").replace(",", "."));
const fmt = (n, d = 1) => n.toFixed(d).replace(".", ",");

async function pedir(url) {
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "es-UY,es" } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
      return await res.text();
    } catch (e) {
      if (intento >= 3) throw e;
      await new Promise((r) => setTimeout(r, 3000 * intento));
    }
  }
}

/** Bloque de un cuadro: desde "Cuadro N:" hasta su "Fuente:". */
function cuadro(t, n, url) {
  const i = t.indexOf(`Cuadro ${n}:`);
  if (i < 0) fail(`no está el cuadro ${n} en ${url}`);
  return t.slice(i, t.indexOf("Fuente:", i));
}

const N = "(\\d+,\\d)";

/** Cuadro 1 del semestral: "Personas bajo la LP 14,8 1,0" (estimación y margen). */
function semestral(t, anio, url) {
  const c = cuadro(t, 1, url);
  if (!c.includes(`Primer semestre ${anio}`)) fail(`el cuadro 1 no es del primer semestre ${anio} (${url})`);
  if (!c.includes("Margen de error al 95%")) fail(`el cuadro 1 cambió de formato (${url})`);
  const fila = (nombre) => {
    const m = c.match(new RegExp(`${nombre} ${N} ${N}`));
    if (!m) fail(`falta la fila «${nombre}» del cuadro 1 (${url})`);
    return { valor: num(m[1]), margen: num(m[2]) };
  };
  return [
    {
      period: `${anio}-S1`,
      periodLabel: `1er semestre ${anio}`,
      personas: fila("Personas bajo la LP"),
      hogares: fila("Hogares bajo la LP"),
      indigencia: fila("Personas bajo la LI"),
    },
  ];
}

/** Cuadro 1 del anual: el año anterior y el del informe, con el margen entre paréntesis. */
function anual(t, anio, url) {
  const c = cuadro(t, 1, url);
  if (!c.includes(`Total país ${anio - 1} ${anio}`)) fail(`el cuadro 1 no compara ${anio - 1} y ${anio} (${url})`);
  const fila = (nombre) => {
    const m = c.match(new RegExp(`${nombre} ${N} \\(${N}\\) ${N} \\(${N}\\)`));
    if (!m) fail(`falta la fila «${nombre}» del cuadro 1 (${url})`);
    return [
      { valor: num(m[1]), margen: num(m[2]) },
      { valor: num(m[3]), margen: num(m[4]) },
    ];
  };
  const [personas, hogares, indigencia] = ["Personas bajo la LP", "Hogares bajo la LP", "Personas bajo la LI"].map(fila);
  return [anio - 1, anio].map((a, i) => ({
    period: String(a),
    periodLabel: `Año ${a}`,
    personas: personas[i],
    hogares: hogares[i],
    indigencia: indigencia[i],
  }));
}

/** Cuadro 5 del anual: pobreza en hogares según el sexo del referente, total país. */
function porReferente(t, anio, url) {
  const c = cuadro(t, 5, url);
  if (!c.includes("según sexo del referente") || !c.includes(`Año ${anio}`))
    fail(`el cuadro 5 ya no es la pobreza en hogares por sexo del referente de ${anio} (${url})`);
  const fila = (nombre) => {
    const m = c.match(new RegExp(`${nombre} ${N} ${N} ${N}`));
    if (!m) fail(`falta la fila «${nombre}» del cuadro 5 (${url})`);
    return num(m[1]);
  };
  return [
    { group: "referente-hombre", label: "Encabezados por un hombre", valor: fila("Hombre") },
    { group: "referente-mujer", label: "Encabezados por una mujer", valor: fila("Mujer") },
  ];
}

/** Valor de la línea de pobreza del hogar: 3 tamaños × región × tenencia. */
function lineas(t, n, periodo, url) {
  const c = cuadro(t, n, url);
  if (!/línea de pobreza|líneas de pobreza/i.test(c)) fail(`el cuadro ${n} ya no es la línea de pobreza (${url})`);
  const M = "(\\d{1,3}\\.\\d{3})";
  return ["1 persona", "2 personas", "3 personas"].map((tam, i) => {
    const m = c.match(new RegExp(`${tam} ${M} ${M} ${M} ${M}`));
    if (!m) fail(`falta la fila «${tam}» del cuadro ${n} (${url})`);
    const [mvdInq, mvdNo, intInq, intNo] = m.slice(1).map(num);
    // Alquilar cuesta: la línea de los inquilinos es siempre mayor.
    if (!(mvdInq > mvdNo && intInq > intNo && mvdNo > intNo)) fail(`valores raros en el cuadro ${n}, ${tam} (${url})`);
    return { personas: i + 1, montevideo: { inquilinos: mvdInq, noInquilinos: mvdNo }, interior: { inquilinos: intInq, noInquilinos: intNo } };
  });
}

// Informes a leer: los que existen desde el formato actual hasta hoy.
const hoy = new Date().getFullYear();
const informes = [];
for (let anio = 2025; anio <= hoy; anio++) informes.push({ tipo: "anual", anio, slug: `ano-${anio}` });
for (let anio = 2026; anio <= hoy; anio++) informes.push({ tipo: "semestral", anio, slug: `primer-semestre-${anio}` });

const periodos = new Map();
let referente;
let linea;
for (const inf of informes) {
  const pagina = `${BASE}-${inf.slug}`;
  const html = await pedir(pagina);
  if (html === null) continue; // todavía no salió
  const link = html.match(/href="(https:\/\/www5\.ine\.gub\.uy\/[^"]+\.html)"/i);
  if (!link) fail(`la página ${pagina} no enlaza el informe completo`);
  const url = new URL(link[1]).href;
  const informe = await pedir(url);
  if (informe === null) fail(`el informe completo no está (${url})`);
  const t = texto(informe);
  const fecha = texto(html).match(/(\d{2}\/\d{2}\/\d{4})/)?.[1];

  const filas = inf.tipo === "anual" ? anual(t, inf.anio, url) : semestral(t, inf.anio, url);
  for (const f of filas) {
    const previo = periodos.get(f.period);
    if (previo && (previo.personas.valor !== f.personas.valor || previo.hogares.valor !== f.hogares.valor))
      fail(`dos informes con valores distintos para ${f.period}`);
    // El informe de cada período manda sobre el que lo repite como comparación.
    if (!previo || f.period.startsWith(String(inf.anio))) periodos.set(f.period, { ...f, url, pagina, fecha });
  }
  // La línea de pobreza y la apertura por referente: siempre la del informe más reciente.
  const periodoInforme = inf.tipo === "anual" ? String(inf.anio) : `${inf.anio}-S1`;
  if (inf.tipo === "anual" && (!referente || referente.period < periodoInforme))
    referente = { period: periodoInforme, periodLabel: `Año ${inf.anio}`, url, grupos: porReferente(t, inf.anio, url) };
  const etiqueta = inf.tipo === "anual" ? `promedio del año ${inf.anio}` : `junio de ${inf.anio}`;
  if (!linea || linea.orden < periodoInforme)
    linea = { orden: periodoInforme, periodLabel: etiqueta, url, filas: lineas(t, inf.tipo === "anual" ? 7 : 2, etiqueta, url) };
}
if (periodos.size === 0) fail("no se encontró ningún informe");

// Los períodos que ya están cargados a mano en nacional.ts tienen que coincidir.
const nacional = await readFile(path.join(ROOT, "src", "data", "observations", "nacional.ts"), "utf8");
const manual = (indicatorId, period) => {
  const m = nacional.match(
    new RegExp(`indicatorId: "${indicatorId}",\\s*territoryId: "UY",\\s*period: "${period}",[\\s\\S]*?value: ([\\d.]+)`)
  );
  return m ? Number(m[1]) : undefined;
};

const obs = [];
for (const p of [...periodos.values()].sort((a, b) => a.period.localeCompare(b.period))) {
  const semestre = p.period.includes("-S");
  const notaBase = `Metodología 2017 del INE. Margen de error al 95%: ±${fmt(p.personas.margen)} punto.`;
  for (const [indicatorId, d, extra] of [
    ["pobreza-personas", p.personas, `Hogares: ${fmt(p.hogares.valor)}%; indigencia: ${fmt(p.indigencia.valor)}% de las personas.`],
    ["pobreza-hogares", p.hogares, `Personas: ${fmt(p.personas.valor)}%.`],
  ]) {
    const yaEsta = manual(indicatorId, p.period);
    if (yaEsta !== undefined) {
      if (yaEsta !== d.valor) fail(`${indicatorId} ${p.period}: nacional.ts tiene ${yaEsta} y el informe ${d.valor} (${p.url})`);
      continue;
    }
    if (!(d.valor > 0 && d.valor < 60)) fail(`${indicatorId} ${p.period} fuera de rango: ${d.valor}`);
    const nota =
      indicatorId === "pobreza-personas"
        ? `${notaBase} ${extra}`
        : `Metodología 2017 del INE. Margen de error al 95%: ±${fmt(d.margen)} punto. ${extra}`;
    obs.push({
      indicatorId,
      period: p.period,
      periodLabel: p.periodLabel,
      value: d.valor,
      sourceUrl: p.url,
      notes: `${nota}${semestre ? " Es una estimación semestral: se compara con otros semestres, no con el año completo." : ""} Cuadro 1 del informe del INE${p.fecha ? ` publicado el ${p.fecha}` : ""}.`,
    });
  }
}

const linea_ = (o) =>
  `  { indicatorId: "${o.indicatorId}", territoryId: "UY", period: ${JSON.stringify(o.period)}, periodLabel: ${JSON.stringify(o.periodLabel)}, value: ${o.value}, status: "OFFICIAL", demo: false, sourceUrl: ${JSON.stringify(o.sourceUrl)}, retrievedAt: "${TODAY}", notes: ${JSON.stringify(o.notes)}${o.breakdown ? `, breakdown: { dimension: "sexo", group: ${JSON.stringify(o.breakdown.group)}, label: ${JSON.stringify(o.breakdown.label)} }` : ""} },`;

const aperturas = referente.grupos.map((g) => ({
  indicatorId: "pobreza-hogares",
  period: referente.period,
  periodLabel: referente.periodLabel,
  value: g.valor,
  sourceUrl: referente.url,
  notes: `Hogares según el sexo de la persona de referencia (quien lo encabeza). Cuadro 5 del informe anual ${referente.period} del INE.`,
  breakdown: g,
}));

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-ine-pobreza.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente: informes de pobreza del INE (metodología
// 2017). Los períodos que ya están en nacional.ts no se repiten acá: el script
// solo controla que coincidan.

export const inePobrezaObservations: Observation[] = [
${obs.map(linea_).join("\n")}
];

// Pobreza en hogares según quién encabeza el hogar (cuadro 5 del informe anual).
export const inePobrezaReferente: Observation[] = [
${aperturas.map(linea_).join("\n")}
];

export interface LineaPobrezaFila {
  personas: number;
  montevideo: { inquilinos: number; noInquilinos: number };
  interior: { inquilinos: number; noInquilinos: number };
}

/** Valor de la línea de pobreza del hogar, en pesos por mes. */
export const lineaPobreza = {
  periodLabel: ${JSON.stringify(linea.periodLabel)},
  sourceUrl: ${JSON.stringify(linea.url)},
  retrievedAt: "${TODAY}",
  filas: ${JSON.stringify(linea.filas)} as LineaPobrezaFila[],
};
`;
await writeFile(OUT, file);
console.log(
  `pobreza: ${periodos.size} períodos leídos (${[...periodos.keys()].sort().join(", ")}), ${obs.length} observaciones nuevas; línea de pobreza de ${linea.periodLabel} (1 persona en Montevideo, no inquilina: $ ${linea.filas[0].montevideo.noInquilinos})`
);
console.log(`→ ${path.relative(ROOT, OUT)}`);
