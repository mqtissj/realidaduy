// Validación de datos previa a publicación (docs/04, brief §26).
// Uso: npm run validate:data
// Importa los módulos de datos TypeScript directamente (Node >=23.6 con
// type-stripping; los módulos de datos solo usan `import type`, que se borra).

const { dictionary } = await import("../src/data/dictionary.ts");
const { allTerritories, departments, montevideoMunicipalities } = await import(
  "../src/data/territories.ts"
);
const { nationalObservations } = await import("../src/data/observations/nacional.ts");
const { departmentObservations } = await import("../src/data/observations/departamentos.ts");
const { departmentEchObservations } = await import("../src/data/observations/departamentos-ech.ts");
const { municipioObservations } = await import("../src/data/observations/municipios.ts");
const { worldBankSeries } = await import("../src/data/observations/series-banco-mundial.ts");
const { sources } = await import("../src/data/sources.ts");
const { parties, elections, electionResults } = await import("../src/data/elections.ts");

const observations = [
  ...nationalObservations,
  ...departmentObservations,
  ...departmentEchObservations,
  ...municipioObservations,
  ...worldBankSeries,
];

const errors = [];
const warnings = [];
const indicatorIds = new Set(dictionary.map((i) => i.id));
const territoryIds = new Set(allTerritories.map((t) => t.id));
const sourceIds = new Set(sources.map((s) => s.id));
const partyIds = new Set(parties.map((p) => p.id));
const electionIds = new Set(elections.map((e) => e.id));

const PERIOD_RE = /^\d{4}(-((0[1-9]|1[0-2])(-([0-2]\d|3[01]))?|Q[1-4]|S[12]))?$/;

// 1-4: fuente, período, territorio, integridad referencial de cada observación.
for (const o of observations) {
  const ref = `${o.indicatorId}/${o.territoryId}/${o.period}`;
  if (!indicatorIds.has(o.indicatorId)) errors.push(`Indicador inexistente: ${ref}`);
  if (!territoryIds.has(o.territoryId)) errors.push(`Territorio inexistente: ${ref}`);
  if (!PERIOD_RE.test(o.period)) errors.push(`Período mal formado: ${ref}`);
  if (!/^https?:\/\//.test(o.sourceUrl)) errors.push(`sourceUrl inválida: ${ref}`);
  if (o.value === null && o.status !== "UNAVAILABLE")
    errors.push(`value null sin status UNAVAILABLE: ${ref}`);
  if (o.value !== null && typeof o.value !== "number")
    errors.push(`value no numérico: ${ref}`);
}

// Diccionario: fuentes válidas.
for (const i of dictionary) {
  if (!sourceIds.has(i.sourceId)) errors.push(`Indicador ${i.id}: fuente ${i.sourceId} inexistente`);
}

// 5: consistencia territorial.
if (departments.length !== 19) errors.push(`Se esperaban 19 departamentos, hay ${departments.length}`);
if (montevideoMunicipalities.length !== 8)
  errors.push(`Se esperaban 8 municipios, hay ${montevideoMunicipalities.length}`);

// 6: la suma de población departamental debe igualar el total censal del país.
const totalUY = nationalObservations.find(
  (o) => o.indicatorId === "poblacion" && o.territoryId === "UY" && o.period === "2023"
)?.value;
const sumaDeptos = departmentObservations
  .filter((o) => o.indicatorId === "poblacion")
  .reduce((s, o) => s + (o.value ?? 0), 0);
if (totalUY !== sumaDeptos)
  errors.push(`Suma departamental (${sumaDeptos}) ≠ total censal (${totalUY})`);

// Municipios: suma dentro del margen documentado respecto al total de Montevideo.
const montevideo = departmentObservations.find(
  (o) => o.indicatorId === "poblacion" && o.territoryId === "UY-MO"
)?.value;
const sumaMunicipios = municipioObservations.reduce((s, o) => s + (o.value ?? 0), 0);
if (montevideo && Math.abs(sumaMunicipios - montevideo) / montevideo > 0.01)
  errors.push(`Suma municipal (${sumaMunicipios}) difiere >1% de Montevideo (${montevideo})`);

// Series departamentales ECH: cada bloque debe cubrir los 19 departamentos.
for (const [indicatorId, period] of [
  ["tasa-desempleo", "2024"],
  ["informalidad", "2025"],
  ["ingreso-medio-hogar", "2023"],
  ["pobreza-personas", "2023"],
]) {
  const n = departmentEchObservations.filter(
    (o) => o.indicatorId === indicatorId && o.period === period && o.territoryId !== "UY"
  ).length;
  if (n !== 19) errors.push(`${indicatorId} ${period}: ${n}/19 departamentos`);
}

// Elecciones: referencias válidas y exactamente un ganador por territorio/elección.
const winnerKey = new Map();
for (const r of electionResults) {
  const ref = `${r.electionId}/${r.territoryId}/${r.partyId}`;
  if (!electionIds.has(r.electionId)) errors.push(`Elección inexistente: ${ref}`);
  if (!territoryIds.has(r.territoryId)) errors.push(`Territorio inexistente en elección: ${ref}`);
  if (!partyIds.has(r.partyId)) errors.push(`Partido inexistente: ${ref}`);
  if (r.winner) {
    const k = `${r.electionId}|${r.territoryId}`;
    winnerKey.set(k, (winnerKey.get(k) ?? 0) + 1);
  }
}
for (const [k, n] of winnerKey) {
  if (n !== 1) errors.push(`${n} ganadores en ${k}`);
}
for (const d of departments) {
  if (!winnerKey.has(`departamental-2025|${d.id}`))
    errors.push(`Falta ganador departamental 2025 en ${d.name}`);
}
for (const m of montevideoMunicipalities) {
  if (!winnerKey.has(`municipal-2025|${m.id}`))
    errors.push(`Falta ganador municipal 2025 en ${m.name}`);
}

// 7: outliers en series (aviso, no error): |z| > 3 dentro de cada serie anual.
const seriesByIndicator = new Map();
for (const o of worldBankSeries) {
  if (!seriesByIndicator.has(o.indicatorId)) seriesByIndicator.set(o.indicatorId, []);
  seriesByIndicator.get(o.indicatorId).push(o);
}
for (const [id, serie] of seriesByIndicator) {
  const values = serie.map((o) => o.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  if (sd === 0) continue;
  for (const o of serie) {
    const z = Math.abs((o.value - mean) / sd);
    if (z > 3) warnings.push(`Outlier |z|=${z.toFixed(1)} en ${id} ${o.period} (${o.value})`);
  }
}

// Resumen.
console.log(`Observaciones: ${observations.length}`);
console.log(`Indicadores: ${dictionary.length} (${dictionary.filter((i) => i.status === "active").length} activos)`);
console.log(`Resultados electorales: ${electionResults.length}`);
for (const w of warnings) console.warn(`AVISO: ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  console.error(`\n${errors.length} errores de validación.`);
  process.exit(1);
}
console.log(`\nValidación OK (${warnings.length} avisos).`);
