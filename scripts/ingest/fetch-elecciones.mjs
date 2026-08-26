// Ingesta de resultados electorales oficiales (Corte Electoral, datos abiertos).
//
//  1. Elección nacional 2024 (1ª vuelta) por departamento — dataset CKAN
//     "Elecciones Nacionales 2024", recurso "Desglose de votos" (por hoja y
//     circuito) + "Totales generales por CRV" (emitidos por circuito).
//  2. Elecciones departamentales 2025 por departamento y municipales 2025 de
//     TODO el país (los ~125 municipios) — dataset CKAN "Elecciones
//     Departamentales y Municipales 2025", recurso "Desglose de votos"
//     (tipos HOJA_ED/VOTO_LEMA_ED y HOJA_EM/VOTO_LEMA_EM; DESCRIPCION_2 = municipio).
//
// Salida: src/data/elecciones-generadas.ts (resultados) y
//         src/data/territorios-municipios.ts (territorios municipales)
//
// GARANTÍAS (el script FALLA si no se cumplen):
//  - Totales nacionales 2024 por partido == escrutinio oficial ya auditado.
//  - Lema ganador 2025 en cada departamento == ganadores verificados (19/19).
//  - Lema ganador municipal en los 8 municipios de Montevideo == verificados,
//    incluido FA = 19.590 votos en el Municipio F.
//
// Uso: node scripts/ingest/fetch-elecciones.mjs

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CACHE = path.join(ROOT, "scripts", "ingest", ".cache");
const OUT = path.join(ROOT, "src", "data", "elecciones-generadas.ts");
const OUT_TERR = path.join(ROOT, "src", "data", "territorios-municipios.ts");
const TODAY = new Date().toISOString().slice(0, 10);

/** "PASO CARRASCO" → "Paso Carrasco"; letras solas (A…G, CH) → "Municipio A". */
function displayName(raw) {
  const name = raw.trim();
  if (/^[A-ZÁÉÍÓÚÑ]{1,2}$/.test(name)) return `Municipio ${name}`;
  const menores = new Set(["de", "del", "la", "las", "los", "el", "y"]);
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) =>
      i > 0 && menores.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

/** "PASO CARRASCO" → "paso-carrasco" (sin tildes ni ñ para slug/id). */
function slugify(raw) {
  return raw
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/gi, "n")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWikit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
};

const SRC = {
  desglose2024:
    "https://catalogodatos.gub.uy/dataset/7aaa1ff0-8ea5-4302-a3e6-c2d589b484a3/resource/f74aa981-47d3-4165-81be-5d2abcc5f6d5/download/desglose-de-votos.csv",
  totales2024:
    "https://catalogodatos.gub.uy/dataset/7aaa1ff0-8ea5-4302-a3e6-c2d589b484a3/resource/0f149bb6-4fff-463b-bc3a-8ab671bcdf34/download/totales-generales-por-comision-receptora-de-votos-y-plebiscitos-constitucionales.csv",
  desglose2025:
    "https://catalogodatos.gub.uy/dataset/2d5eb299-0d95-478b-9271-c62f601e7bc1/resource/92d7ca7b-32f1-4cde-b607-d94aef825c4d/download/desglose-de-votos.csv",
};

// Los códigos de departamento de la Corte Electoral coinciden con los sufijos
// ISO 3166-2:UY usados en src/data/territories.ts (verificado: 19 códigos).
const DEPT_CODES = [
  "AR", "CA", "CL", "CO", "DU", "FS", "FD", "LA", "MA", "MO",
  "PA", "RN", "RV", "RO", "SA", "SJ", "SO", "TA", "TT",
];

const LEMA_2024 = {
  "Partido Frente Amplio": "fa",
  "Partido Nacional": "pn",
  "Partido Colorado": "pc",
  "Partido Cabildo Abierto": "ca",
  "Partido Independiente": "pi",
  "Partido Identidad Soberana": "is",
};

const LEMA_2025 = {
  "FRENTE AMPLIO": "fa",
  "PARTIDO NACIONAL": "pn",
  "PARTIDO COLORADO": "pc",
  "PARTIDO CABILDO ABIERTO": "ca",
  "PARTIDO COALICIÓN REPUBLICANA": "cr",
};

// Escrutinio oficial 2024 ya verificado y auditado (base de todo el chequeo).
const EXPECTED_2024 = { fa: 1071826, pn: 655426, pc: 392592, is: 65796, ca: 60549, pi: 41618 };
const EXPECTED_EMITTED_2024 = 2443801;

// Lemas ganadores verificados (auditoría adversarial 2026-08-26).
const EXPECTED_WINNERS_2025 = {
  AR: "pn", CA: "fa", CL: "pn", CO: "pn", DU: "pn", FS: "pn", FD: "pn", LA: "fa",
  MA: "pn", MO: "fa", PA: "pn", RN: "fa", RV: "pc", RO: "pn", SA: "cr", SJ: "pn",
  SO: "pn", TA: "pn", TT: "pn",
};
const EXPECTED_WINNERS_MUNI = { A: "fa", B: "fa", C: "fa", CH: "cr", D: "fa", E: "cr", F: "fa", G: "fa" };
const EXPECTED_MUNI_F_FA_VOTES = 19590;

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

/** Parser CSV mínimo con soporte de comillas dobles. */
function parseLine(line) {
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
    else if (c === ",") {
      out.push(field);
      field = "";
    } else field += c;
  }
  out.push(field);
  return out;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`CHEQUEO FALLIDO — ${label}: esperado ${expected}, obtenido ${actual}`);
  }
  console.log(`  ✓ ${label}: ${actual}`);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/** Convierte {dept: {party: votes}} en filas ElectionResult serializadas. */
function toRows({ byDept, electionId, denominators, pctBase, sourceUrl, territoryFor }) {
  const rows = [];
  for (const [key, parties] of Object.entries(byDept)) {
    const denom = denominators[key];
    const entries = Object.entries(parties).sort((a, b) => b[1] - a[1]);
    const winnerParty = entries[0][0];
    for (const [partyId, votes] of entries) {
      if (votes === 0) continue;
      rows.push({
        electionId,
        territoryId: territoryFor(key),
        partyId,
        votes,
        pct: denom ? round2((votes / denom) * 100) : null,
        pctBase,
        winner: partyId === winnerParty,
        sourceUrl,
      });
    }
  }
  return rows;
}

// ── 1. Nacional 2024 por departamento ────────────────────────────────────────
console.log("Elección nacional 2024 (desglose por circuito)…");
const d24 = await cachedDownload("elecciones-desglose-2024.csv", SRC.desglose2024);
const lines24 = d24.trim().split(/\r?\n/);
const byDept2024 = Object.fromEntries(DEPT_CODES.map((d) => [d, {}]));
for (let i = 1; i < lines24.length; i++) {
  const p = parseLine(lines24[i]);
  const [tipo, depto, , , lema] = p;
  if (tipo !== "HOJA_EN" && tipo !== "VOTO_LEMA") continue;
  if (!byDept2024[depto]) throw new Error(`Departamento desconocido en 2024: "${depto}"`);
  const party = LEMA_2024[lema] ?? "otros";
  const votes = Number(p[p.length - 1]);
  byDept2024[depto][party] = (byDept2024[depto][party] ?? 0) + votes;
}

// Chequeo: totales nacionales por partido = escrutinio oficial.
const totals2024 = {};
for (const parties of Object.values(byDept2024)) {
  for (const [party, votes] of Object.entries(parties)) {
    totals2024[party] = (totals2024[party] ?? 0) + votes;
  }
}
for (const [party, expected] of Object.entries(EXPECTED_2024)) {
  assertEqual(totals2024[party], expected, `total nacional 2024 ${party.toUpperCase()}`);
}

// Emitidos por departamento (denominador de %).
console.log("Totales de votos emitidos 2024 por circuito…");
const t24 = await cachedDownload("elecciones-totales-2024.csv", SRC.totales2024);
const linesT24 = t24.trim().split(/\r?\n/);
const headerT24 = parseLine(linesT24[0]);
const emittedIdx = headerT24.indexOf("TotalVotosEmitidos");
if (emittedIdx < 0) throw new Error("No se encontró la columna TotalVotosEmitidos");
const emitted2024 = {};
for (let i = 1; i < linesT24.length; i++) {
  const p = parseLine(linesT24[i]);
  emitted2024[p[0]] = (emitted2024[p[0]] ?? 0) + Number(p[emittedIdx]);
}
const emittedTotal = Object.values(emitted2024).reduce((a, b) => a + b, 0);
if (emittedTotal !== EXPECTED_EMITTED_2024) {
  console.warn(
    `  AVISO: total de emitidos ${emittedTotal} difiere del esperado ${EXPECTED_EMITTED_2024}`
  );
} else {
  console.log(`  ✓ total nacional de votos emitidos: ${emittedTotal}`);
}

const rows2024 = toRows({
  byDept: byDept2024,
  electionId: "nacional-2024",
  denominators: emitted2024,
  pctBase: "emitidos",
  sourceUrl: SRC.desglose2024,
  territoryFor: (code) => `UY-${code}`,
});

// ── 2. Departamentales y municipales 2025 ────────────────────────────────────
console.log("Elecciones departamentales y municipales 2025 (desglose por circuito)…");
const d25 = await cachedDownload("elecciones-desglose-2025.csv", SRC.desglose2025);
const lines25 = d25.trim().split(/\r?\n/);
const byDept2025 = Object.fromEntries(DEPT_CODES.map((d) => [d, {}]));
// byMuni[depto]["NOMBRE MUNICIPIO"][party] = votos (todo el país).
const byMuni = {};
for (let i = 1; i < lines25.length; i++) {
  const p = parseLine(lines25[i]);
  const [tipo, depto, , , lema, , desc2] = p;
  const votes = Number(p[p.length - 1]);
  const party = LEMA_2025[lema] ?? "otros";
  if (tipo === "HOJA_ED" || tipo === "VOTO_LEMA_ED") {
    if (!byDept2025[depto]) throw new Error(`Departamento desconocido en 2025: "${depto}"`);
    byDept2025[depto][party] = (byDept2025[depto][party] ?? 0) + votes;
  } else if (tipo === "HOJA_EM" || tipo === "VOTO_LEMA_EM") {
    if (!byDept2025[depto]) throw new Error(`Departamento desconocido en municipales: "${depto}"`);
    const muni = desc2.trim();
    if (!muni) throw new Error(`Municipio vacío en fila ${i}`);
    if (!byMuni[depto]) byMuni[depto] = {};
    if (!byMuni[depto][muni]) byMuni[depto][muni] = {};
    byMuni[depto][muni][party] = (byMuni[depto][muni][party] ?? 0) + votes;
  }
}
const byMuniMO = byMuni.MO ?? {};

// Chequeo: lema ganador por departamento = ganadores verificados.
for (const [code, expected] of Object.entries(EXPECTED_WINNERS_2025)) {
  const winner = Object.entries(byDept2025[code]).sort((a, b) => b[1] - a[1])[0][0];
  assertEqual(winner, expected, `ganador departamental 2025 en ${code}`);
}
// Chequeo: municipios de Montevideo (8) y sus ganadores.
const muniKeys = Object.keys(byMuniMO).sort();
assertEqual(muniKeys.join(","), "A,B,C,CH,D,E,F,G", "municipios de Montevideo en el desglose");
for (const [letter, expected] of Object.entries(EXPECTED_WINNERS_MUNI)) {
  const winner = Object.entries(byMuniMO[letter]).sort((a, b) => b[1] - a[1])[0][0];
  assertEqual(winner, expected, `ganador municipal 2025 en Municipio ${letter}`);
}
assertEqual(byMuniMO.F.fa, EXPECTED_MUNI_F_FA_VOTES, "votos FA en Municipio F");

// Denominador 2025: votos válidos (suma de votos a lemas) por territorio.
const valid2025 = Object.fromEntries(
  Object.entries(byDept2025).map(([k, v]) => [k, Object.values(v).reduce((a, b) => a + b, 0)])
);

const rows2025 = toRows({
  byDept: byDept2025,
  electionId: "departamental-2025",
  denominators: valid2025,
  pctBase: "validos",
  sourceUrl: SRC.desglose2025,
  territoryFor: (code) => `UY-${code}`,
});

// ── Municipios de TODO el país: territorios + resultados ─────────────────────
const muniTerritories = [];
const rowsMuni = [];
const seenIds = new Set();
for (const depto of Object.keys(byMuni).sort()) {
  for (const muniName of Object.keys(byMuni[depto]).sort()) {
    const slug = slugify(muniName);
    const id = `UY-${depto}-${slug.toUpperCase()}`;
    if (seenIds.has(id)) throw new Error(`Id de municipio duplicado: ${id}`);
    seenIds.add(id);
    muniTerritories.push({
      id,
      slug,
      name: displayName(muniName),
      parentId: `UY-${depto}`,
    });
    const parties = Object.entries(byMuni[depto][muniName]).sort((a, b) => b[1] - a[1]);
    const valid = parties.reduce((s, [, v]) => s + v, 0);
    if (valid <= 0) throw new Error(`Municipio sin votos válidos: ${id}`);
    const winnerParty = parties[0][0];
    for (const [partyId, votes] of parties) {
      if (votes === 0) continue;
      rowsMuni.push({
        electionId: "municipal-2025",
        territoryId: id,
        partyId,
        votes,
        pct: round2((votes / valid) * 100),
        pctBase: "validos",
        winner: partyId === winnerParty,
        sourceUrl: SRC.desglose2025,
      });
    }
  }
}
if (muniTerritories.length < 100 || muniTerritories.length > 150) {
  throw new Error(`Cantidad de municipios fuera de rango plausible: ${muniTerritories.length}`);
}
console.log(`  ✓ municipios en todo el país: ${muniTerritories.length}`);

// ── Salida ───────────────────────────────────────────────────────────────────
const serialize = (rows) =>
  rows
    .map(
      (r) =>
        `  { electionId: ${JSON.stringify(r.electionId)}, territoryId: ${JSON.stringify(r.territoryId)}, partyId: ${JSON.stringify(r.partyId)}, votes: ${r.votes}, pct: ${r.pct}, pctBase: ${JSON.stringify(r.pctBase)}, winner: ${r.winner}, demo: false, sourceUrl: ${JSON.stringify(r.sourceUrl)} },`
    )
    .join("\n");

const file = `import type { ElectionResult } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-elecciones.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente: Corte Electoral (datos abiertos oficiales,
// desglose por circuito), agregado por departamento/municipio. El script valida
// los totales contra el escrutinio oficial antes de escribir este archivo:
//  - 2024: totales nacionales por partido exactos (FA 1.071.826, PN 655.426, …).
//  - 2025: lema ganador verificado en los 19 departamentos y 8 municipios de
//    Montevideo (incl. FA 19.590 votos en el Municipio F).
// "otros" agrupa los lemas menores. Bases de %: 2024 sobre votos emitidos;
// 2025 sobre votos válidos al lema (declarado en pctBase de cada fila).

export const nacional2024PorDepartamento: ElectionResult[] = [
${serialize(rows2024)}
];

export const departamental2025PorDepartamento: ElectionResult[] = [
${serialize(rows2025)}
];

/** Resultados municipales 2025 de TODO el país (${muniTerritories.length} municipios). */
export const municipal2025PorMunicipio: ElectionResult[] = [
${serialize(rowsMuni)}
];
`;

await writeFile(OUT, file);

const terrFile = `import type { Territory } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-elecciones.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Los ${muniTerritories.length} municipios de Uruguay según el
// desglose oficial de las elecciones municipales 2025 (Corte Electoral).
// Ids: UY-<depto>-<slug>. No todo el territorio nacional está municipalizado.

export const municipalTerritories: Territory[] = [
${muniTerritories
  .map(
    (t) =>
      `  { id: ${JSON.stringify(t.id)}, slug: ${JSON.stringify(t.slug)}, name: ${JSON.stringify(t.name)}, level: "municipio", parentId: ${JSON.stringify(t.parentId)} },`
  )
  .join("\n")}
];
`;
await writeFile(OUT_TERR, terrFile);

console.log(
  `→ ${OUT}\n  nacional-2024: ${rows2024.length} filas · departamental-2025: ${rows2025.length} filas · municipal-2025: ${rowsMuni.length} filas`
);
console.log(`→ ${OUT_TERR} (${muniTerritories.length} municipios)`);
