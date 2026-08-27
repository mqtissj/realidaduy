// Ingesta del nivel MUNICIPAL del Observatorio Territorio Uruguay (OPP):
// población del Censo 2023 por municipio, para los municipios del interior.
//
// Cómo funciona el OTU a nivel municipal (descubierto 2026-08-26):
//  - POST /?q=municipios-engine → JSON [{id, nombre}] (~125 municipios, padrón
//    previo a la expansión de 2025; id = código INE del depto × 100 + secuencia).
//  - POST /?q=tabla-engine con {consulta: <datosId>, d, r, m: "ids", l} → JSON
//    (string HTML) con una tabla por municipio; para el indicador 3778
//    ("Población total por sexo y edad", Censo 2023) cada tabla trae 18 celdas
//    (Hombres/Mujeres/Total × 6 tramos de edad) y la última celda "Total" es la
//    población total del municipio.
//
// Reglas:
//  - Los 8 municipios de Montevideo NO se ingieren de acá (ya tienen población
//    derivada de la cartografía censal del INE): se usan solo como CRUCE y el
//    script avisa si difieren >2%.
//  - Los municipios creados en 2025 (no existen en el padrón del OTU) quedan
//    sin dato, declarado en la UI.
//
// Salida: src/data/observations/otu-municipios.ts
// Uso: node scripts/ingest/fetch-otu-municipios.mjs

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { municipalTerritories } from "../../src/data/territorios-municipios.ts";
import { municipioObservations } from "../../src/data/observations/municipios.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = path.join(ROOT, "scripts", "ingest", ".cache");
const OUT = path.join(ROOT, "src", "data", "observations", "otu-municipios.ts");
const TODAY = new Date().toISOString().slice(0, 10);
const DATOS_ID = 3778; // Población total por sexo y edad — Censo 2023
const SOURCE_PAGE = `https://otu.opp.gub.uy/?q=listados/listados_datos_formato&id=${DATOS_ID}&cant=0&fecha=2023-01-01`;

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  "Content-Type": "application/x-www-form-urlencoded",
};

// Código INE de departamento (id OTU = codigo*100 + n) → ISO 3166-2:UY.
const INE_DEPT_TO_ISO = {
  1: "UY-MO", 2: "UY-AR", 3: "UY-CA", 4: "UY-CL", 5: "UY-CO", 6: "UY-DU",
  7: "UY-FS", 8: "UY-FD", 9: "UY-LA", 10: "UY-MA", 11: "UY-PA", 12: "UY-RN",
  13: "UY-RV", 14: "UY-RO", 15: "UY-SA", 16: "UY-SJ", 17: "UY-SO", 18: "UY-TA",
  19: "UY-TT",
};

const normalize = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

async function cachedPost(name, url, body) {
  await mkdir(CACHE, { recursive: true });
  const file = path.join(CACHE, name);
  if (await access(file).then(() => true, () => false)) {
    console.log(`  ${name}: usando cache`);
    return readFile(file, "utf8");
  }
  console.log(`  ${name}: consultando...`);
  const res = await fetch(url, { method: "POST", headers: UA, body });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  const text = await res.text();
  await writeFile(file, text);
  return text;
}

// ── 1. Padrón de municipios del OTU ──────────────────────────────────────────
console.log("Municipios del OTU (municipios-engine)…");
const munisRaw = await cachedPost("otu-municipios-engine.json", "https://otu.opp.gub.uy/?q=municipios-engine", "");
const otuMunis = JSON.parse(munisRaw)
  .map((m) => ({ id: String(m.id), nombre: String(m.nombre).trim() }))
  .filter((m) => /^\d+$/.test(m.id));
console.log(`  ✓ ${otuMunis.length} municipios en el padrón del OTU`);
if (otuMunis.length < 100) throw new Error("Padrón municipal sospechosamente chico");

// ── 2. Población por municipio (tabla-engine, en tandas) ─────────────────────
console.log("Población Censo 2023 por municipio (tabla-engine)…");
const CHUNK = 25;
const byOtuId = {};
for (let i = 0; i < otuMunis.length; i += CHUNK) {
  const chunk = otuMunis.slice(i, i + CHUNK);
  const ids = chunk.map((m) => m.id).join(",");
  const body = new URLSearchParams({ consulta: String(DATOS_ID), d: "", r: "", m: ids, l: "" }).toString();
  const raw = await cachedPost(`otu-tabla-3778-chunk${i / CHUNK}.json`, "https://otu.opp.gub.uy/?q=tabla-engine", body);
  let html;
  try {
    html = JSON.parse(raw);
  } catch {
    html = raw;
  }
  if (typeof html !== "string") html = String(html);
  // Una tabla por municipio (data-row = nombre); celdas en orden
  // Hombres(6) Mujeres(6) Total(6); la última celda 'Total' es la población.
  for (const t of html.matchAll(/<table[^>]*data-row='([^']+)'[\s\S]*?<\/table>/g)) {
    const cells = [];
    for (const c of t[0].matchAll(/data-option-value='([^']+)'[\s\S]*?data-datocsv='([^']+)'/g)) {
      cells.push({ opt: c[1], val: Number(String(c[2]).replace(",", ".")) });
    }
    const totals = cells.filter((c) => c.opt === "Total").map((c) => c.val);
    if (totals.length < 3) continue;
    const nombre = t[1].trim();
    const muni = chunk.find((m) => normalize(m.nombre) === normalize(nombre));
    if (!muni) continue;
    byOtuId[muni.id] = {
      nombre,
      hombres: totals[0],
      mujeres: totals[1],
      total: totals[2],
    };
  }
}
console.log(`  ✓ población obtenida para ${Object.keys(byOtuId).length} municipios`);

// ── 3. Mapeo al padrón 2025 de la plataforma (por depto + nombre) ────────────
const oursByKey = new Map();
for (const t of municipalTerritories) {
  oursByKey.set(`${t.parentId}|${normalize(t.name)}`, t);
}
const matched = [];
const unmatched = [];
for (const [otuId, data] of Object.entries(byOtuId)) {
  const deptCode = Math.floor(Number(otuId) / 100);
  const parentIso = INE_DEPT_TO_ISO[deptCode];
  if (!parentIso) {
    unmatched.push(`${data.nombre} (id ${otuId}: depto desconocido)`);
    continue;
  }
  // Variantes de nombre del OTU: sufijos desambiguadores "(Can.)"/"(CL)",
  // prefijo "Villa", alias históricos, y en Montevideo 'a'..'ch' vs 'Municipio X'.
  const ALIAS = { nicolich: "colonia nicolich", "gral enrique martinez": "general enrique martinez" };
  const base = normalize(data.nombre.replace(/\s*\([^)]*\)\s*$/, ""));
  const names = new Set([
    base,
    ALIAS[base] ?? base,
    base.replace(/^villa /, ""),
    `municipio ${base}`,
  ]);
  const ours = [...names].map((n) => oursByKey.get(`${parentIso}|${n}`)).find(Boolean);
  if (!ours) {
    unmatched.push(`${data.nombre} (${parentIso})`);
    continue;
  }
  matched.push({ territory: ours, ...data });
}
console.log(`  ✓ mapeados ${matched.length}/${Object.keys(byOtuId).length} al padrón 2025`);
if (unmatched.length > 0) {
  console.warn(`  AVISO: sin mapear (${unmatched.length}): ${unmatched.join("; ")}`);
}
if (matched.length < 110) throw new Error("Demasiados municipios sin mapear");

// ── 4. Cruce Montevideo (CCZ vs OTU) y separación interior ───────────────────
const cczPop = Object.fromEntries(
  municipioObservations
    .filter((o) => o.indicatorId === "poblacion")
    .map((o) => [o.territoryId, o.value])
);
const interior = [];
for (const m of matched) {
  if (m.territory.parentId === "UY-MO") {
    const ours = cczPop[m.territory.id];
    if (ours) {
      const diff = Math.abs(m.total - ours) / ours;
      if (diff > 0.02) {
        console.warn(
          `  AVISO cruce MVD ${m.territory.name}: CCZ ${ours} vs OTU ${m.total} (${(diff * 100).toFixed(1)}%)`
        );
      }
    }
    continue; // Montevideo ya tiene población por CCZ: no se ingiere.
  }
  if (!(m.total > 100 && m.total < 200000)) {
    console.warn(`  AVISO: población fuera de rango en ${m.territory.name}: ${m.total}`);
  }
  interior.push(m);
}
console.log(`  ✓ cruce Montevideo hecho · ${interior.length} municipios del interior a ingerir`);
const sumInterior = interior.reduce((s, m) => s + m.total, 0);
if (!(sumInterior > 1000000 && sumInterior < 2300000)) {
  throw new Error(`Suma de población del interior municipal fuera de rango: ${sumInterior}`);
}
console.log(`  ✓ suma interior municipalizado: ${sumInterior} personas`);

// ── Salida ───────────────────────────────────────────────────────────────────
const lines = interior
  .sort((a, b) => a.territory.id.localeCompare(b.territory.id))
  .map(
    (m) =>
      `  { indicatorId: "poblacion", territoryId: ${JSON.stringify(m.territory.id)}, period: "2023", periodLabel: "Censo 2023", value: ${m.total}, status: "OFFICIAL", demo: false, sourceUrl: ${JSON.stringify(SOURCE_PAGE)}, retrievedAt: ${JSON.stringify(TODAY)}, notes: "Hombres: ${m.hombres} · Mujeres: ${m.mujeres}. Censo 2023, elaboración Observatorio Territorio Uruguay (OPP). Padrón municipal previo a la expansión de 2025." },`
  );

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-otu-municipios.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Población del Censo 2023 por municipio del
// INTERIOR (los 8 de Montevideo salen de la cartografía censal por CCZ).
// Los municipios creados en la expansión de 2025 no existen en el padrón del
// OTU y quedan sin dato (la UI lo declara).

export const otuMunicipioObservations: Observation[] = [
${lines.join("\n")}
];
`;

await writeFile(OUT, file);
console.log(`→ ${OUT} (${lines.length} observaciones)`);
