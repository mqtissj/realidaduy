// Ingesta del Monitor Mipymes de ANDE (monitor.ande.org.uy), elaborado por
// ANDE a partir de datos de BPS:
//
// - "Mipymes activas": cantidad de micro, pequeñas y medianas empresas activas.
// - "Puestos de trabajo en Mipymes".
//
// El monitor es mensual y abre por departamento (DepartamentoId 1 a 19, en
// orden alfabético; 20 es el total del país). Se toma el último mes publicado y
// el mismo mes de los años anteriores, desde 2022 (antes el monitor devuelve
// cero: hubo un cambio de metodología). Así la variación que muestra el sitio es
// siempre interanual, sin estacionalidad.
//
// Chequeos duros: cada página tiene que tener la tarjeta esperada y un valor
// mayor que cero, y los 19 departamentos tienen que sumar el total del país
// (entre el 98 % y el 100 %: unas pocas empresas no tienen departamento).
//
// Genera src/data/observations/ande-mipymes.ts.
// Uso: node scripts/ingest/fetch-ande-mipymes.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "ande-mipymes.ts");
const TODAY = new Date().toISOString().slice(0, 10);
const BASE = "https://monitor.ande.org.uy/graficosmapamensual.aspx";
const DESDE = 2022;

const UA = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

// DepartamentoId del monitor → territorio. 20 es el país.
const TERRITORIOS = [
  "UY-AR", "UY-CA", "UY-CL", "UY-CO", "UY-DU", "UY-FS", "UY-FD", "UY-LA", "UY-MA", "UY-MO",
  "UY-PA", "UY-RN", "UY-RV", "UY-RO", "UY-SA", "UY-SJ", "UY-SO", "UY-TA", "UY-TT",
].map((territoryId, i) => ({ territoryId, depto: i + 1 }));
TERRITORIOS.push({ territoryId: "UY", depto: 20 });

const SERIES = [
  { indicatorId: "mipymes-activas", tipo: "Empresas", tarjeta: "Mipymes activas" },
  { indicatorId: "puestos-mipymes", tipo: "Empleo", tarjeta: "Puestos de trabajo en Mipymes" },
];

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

function fail(msg) {
  throw new Error(`El Monitor Mipymes de ANDE cambió y el script no puede seguir: ${msg}`);
}

const url = (depto, periodo, tipo) => `${BASE}?DepartamentoId=${depto}&Periodo=${periodo}&tipo=${tipo}`;

/** Valor de la tarjeta "Relación interanual" (kpi2) de una página del monitor. */
async function valor(depto, periodo, serie) {
  const u = url(depto, periodo, serie.tipo);
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(u, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${u}`);
      const html = await res.text();
      if (!html.includes(serie.tarjeta)) fail(`la página ${u} no tiene la tarjeta «${serie.tarjeta}»`);
      const m = html.match(/name="W0016vKPI2_VALOR" value="([\d.]+)"/);
      if (!m) fail(`la página ${u} no tiene el valor de la tarjeta`);
      return Number(m[1].replace(/\./g, ""));
    } catch (e) {
      if (intento >= 3 || e.message.startsWith("El Monitor")) throw e;
      await new Promise((r) => setTimeout(r, 1000 * intento));
    }
  }
}

// Último mes publicado: el más reciente con dato del país.
const hoy = new Date();
let ultimo;
for (let atras = 0; atras < 8 && !ultimo; atras++) {
  const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - atras, 1));
  const periodo = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  if ((await valor(20, periodo, SERIES[0])) > 0) ultimo = { anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 };
}
if (!ultimo) fail("no hay datos del país en los últimos 8 meses");

const anios = [];
for (let a = DESDE; a <= ultimo.anio; a++) anios.push(a);
const mm = String(ultimo.mes).padStart(2, "0");

const tareas = SERIES.flatMap((serie) =>
  TERRITORIOS.flatMap((t) => anios.map((anio) => ({ serie, ...t, anio })))
);
const obs = [];
// De a 8 pedidos por vez, para no cargar el servidor.
for (let i = 0; i < tareas.length; i += 8) {
  const lote = tareas.slice(i, i + 8);
  const valores = await Promise.all(lote.map((t) => valor(t.depto, `${t.anio}${mm}`, t.serie)));
  lote.forEach((t, j) => {
    if (!(valores[j] > 0)) fail(`${t.serie.tarjeta} en ${t.territoryId}, ${t.anio}-${mm}: valor ${valores[j]}`);
    obs.push({ ...t, value: valores[j] });
  });
}

for (const serie of SERIES)
  for (const anio of anios) {
    const del = obs.filter((o) => o.serie === serie && o.anio === anio);
    const pais = del.find((o) => o.territoryId === "UY").value;
    const suma = del.filter((o) => o.territoryId !== "UY").reduce((a, o) => a + o.value, 0);
    // Unas pocas empresas no tienen departamento: la suma queda apenas debajo.
    if (suma > pais || suma < pais * 0.98)
      fail(`${serie.tarjeta} ${anio}: los departamentos suman ${suma} y el país tiene ${pais}`);
  }

const NOTA = "Elaboración de ANDE a partir de datos de BPS. El monitor cambió de metodología en 2022: no hay datos comparables antes.";
const linea = (o) =>
  `  { indicatorId: "${o.serie.indicatorId}", territoryId: "${o.territoryId}", period: "${o.anio}-${mm}", periodLabel: "${MESES[ultimo.mes - 1]} ${o.anio}", value: ${o.value}, status: "OFFICIAL", demo: false, sourceUrl: ${JSON.stringify(url(o.depto, `${o.anio}${mm}`, o.serie.tipo))}, retrievedAt: "${TODAY}", notes: ${JSON.stringify(NOTA)} },`;

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-ande-mipymes.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente: Monitor Mipymes de ANDE (datos de BPS).
// Mes de ${MESES[ultimo.mes - 1].toLowerCase()} de cada año desde ${DESDE}, para que la
// variación sea interanual.

export const andeMipymesObservations: Observation[] = [
${SERIES.map((s) => `  // ${s.tarjeta}\n` + obs.filter((o) => o.serie === s).map(linea).join("\n")).join("\n")}
];
`;
await writeFile(OUT, file);
const pais = (s, a) => obs.find((o) => o.serie === s && o.anio === a && o.territoryId === "UY").value;
console.log(
  `ANDE ${MESES[ultimo.mes - 1]} ${anios[0]}–${ultimo.anio}: ${pais(SERIES[0], ultimo.anio)} mipymes activas y ${pais(SERIES[1], ultimo.anio)} puestos de trabajo en el país (${obs.length} datos)`
);
console.log(`→ ${path.relative(ROOT, OUT)}`);
