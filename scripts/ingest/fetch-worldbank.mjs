// Ingesta de series históricas anuales del Banco Mundial (fuente SECUNDARIA).
// Genera src/data/observations/series-banco-mundial.ts con provenance completo.
// Estas series alimentan SOLO los gráficos de evolución histórica y siempre se
// etiquetan como fuente secundaria internacional; los titulares usan datos INE/BCU.
//
// Uso: node scripts/ingest/fetch-worldbank.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "series-banco-mundial.ts");
const RANGE = "2000:2025";
const TODAY = new Date().toISOString().slice(0, 10);

// indicador WB → indicador nuestro + nota metodológica obligatoria.
const SERIES = [
  {
    wb: "NY.GDP.PCAP.CD",
    indicatorId: "pib-per-capita",
    decimals: 2,
    note: "Serie del Banco Mundial (dólares corrientes). Fuente secundaria internacional.",
  },
  {
    wb: "NY.GDP.MKTP.KD.ZG",
    indicatorId: "pib-variacion",
    decimals: 1,
    note: "Variación anual real según Banco Mundial. Serie anual: no comparable con la variación trimestral del BCU en un mismo gráfico.",
  },
  {
    wb: "FP.CPI.TOTL.ZG",
    indicatorId: "inflacion-interanual",
    decimals: 2,
    note: "Variación promedio anual del IPC según Banco Mundial. Es un promedio anual: no comparable con la variación interanual mensual del INE en un mismo gráfico.",
  },
  {
    wb: "SL.UEM.TOTL.ZS",
    indicatorId: "tasa-desempleo",
    decimals: 1,
    note: "Estimación modelada de la OIT (Banco Mundial). No coincide exactamente con la definición de la ECH del INE: se usa solo para tendencia histórica.",
  },
  {
    wb: "SP.POP.TOTL",
    indicatorId: "poblacion",
    decimals: 0,
    note: "Estimaciones anuales de población del Banco Mundial. El dato de referencia es el Censo 2023 del INE.",
  },
];

async function fetchSeries({ wb }) {
  const url = `https://api.worldbank.org/v2/country/URY/indicator/${wb}?format=json&date=${RANGE}&per_page=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  const [, data] = await res.json();
  return { url, data: (data ?? []).filter((d) => d.value !== null) };
}

const blocks = [];
for (const serie of SERIES) {
  const { url, data } = await fetchSeries(serie);
  console.log(`${serie.wb} → ${serie.indicatorId}: ${data.length} puntos`);
  const obs = data
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => {
      const value = Number(Number(d.value).toFixed(serie.decimals));
      return `  { indicatorId: ${JSON.stringify(serie.indicatorId)}, territoryId: "UY", period: ${JSON.stringify(d.date)}, periodLabel: ${JSON.stringify(d.date)}, value: ${value}, status: "SECONDARY", demo: false, sourceUrl: ${JSON.stringify(url)}, retrievedAt: ${JSON.stringify(TODAY)}, notes: ${JSON.stringify(serie.note)} },`;
    });
  blocks.push(obs.join("\n"));
}

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-worldbank.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Series anuales del Banco Mundial (fuente SECUNDARIA)
// para gráficos de evolución histórica. Los titulares usan datos INE/BCU.

export const worldBankSeries: Observation[] = [
${blocks.join("\n")}
];
`;

await writeFile(OUT, file);
console.log(`→ ${OUT}`);
