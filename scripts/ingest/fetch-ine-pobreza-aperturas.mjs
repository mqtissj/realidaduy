// Ingesta de las aperturas de la pobreza del informe anual del INE
// ("Estimación de la pobreza por el método del ingreso", versión HTML en
// www5.ine.gub.uy):
//
// - Cuadro 3: incidencia de la pobreza en personas según grupos de edad.
// - Cuadro 4: según ascendencia étnico-racial declarada.
//
// Cada grupo viene con su margen de error al 95 %, que va a la nota. Chequeo
// duro: la fila Total de cada cuadro tiene que ser la pobreza anual del país que
// ya publica el sitio (src/data/observations/nacional.ts) para el mismo año.
//
// El informe sale una vez por año (abril), con una URL nueva: cuando salga el
// próximo, cambian INFORME y ANIO. Por eso no corre en la actualización
// mensual.
//
// Genera src/data/observations/ine-pobreza-aperturas.ts.
// Uso: node scripts/ingest/fetch-ine-pobreza-aperturas.mjs

import { readFile, writeFile } from "node:fs/promises";
import tls from "node:tls";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = path.join(ROOT, "src", "data", "observations", "ine-pobreza-aperturas.ts");
const CERTS = path.join(ROOT, "scripts", "ingest", "certs", "ine-intermedios.pem");
const TODAY = new Date().toISOString().slice(0, 10);

const ANIO = "2025";
const INFORME =
  "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2025/Informe%20pobreza%20Anual-2025.html";

const UA = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

// www5.ine.gub.uy manda un intermedio equivocado: se suma el correcto, como en
// fetch-ine-anuales.mjs.
const intermedios = (await readFile(CERTS, "utf8")).match(
  /-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g
);
tls.setDefaultCACertificates([...tls.getCACertificates("default"), ...intermedios]);

function fail(msg) {
  throw new Error(`El informe de pobreza del INE cambió y el script no puede seguir: ${msg}`);
}

const res = await fetch(INFORME, { headers: UA });
if (!res.ok) throw new Error(`HTTP ${res.status} en ${INFORME}`);
const texto = (await res.text())
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, " ");

// El total que el sitio ya publica para ese año, para controlar cada cuadro.
const nacional = await readFile(path.join(ROOT, "src", "data", "observations", "nacional.ts"), "utf8");
const totalAnio = nacional.match(
  new RegExp(`indicatorId: "pobreza-personas",\\s*territoryId: "UY",\\s*period: "${ANIO}",[\\s\\S]*?value: ([\\d.]+)`)
);
if (!totalAnio) fail(`nacional.ts no tiene la pobreza ${ANIO} del país`);
const TOTAL = Number(totalAnio[1]);

const num = (s) => Number(s.replace(",", "."));
const fmt = (n) => n.toFixed(1).replace(".", ",");

/** Filas "Grupo estimación margen" de un cuadro, entre su título y la fuente. */
function cuadro(n, tituloEsperado, grupos) {
  const i = texto.indexOf(`Cuadro ${n}:`);
  if (i < 0) fail(`no está el cuadro ${n}`);
  const fin = texto.indexOf("Fuente:", i);
  const bloque = texto.slice(i, fin);
  if (!bloque.includes(tituloEsperado)) fail(`el cuadro ${n} ya no es «${tituloEsperado}»`);
  if (!bloque.includes(`Año ${ANIO}`)) fail(`el cuadro ${n} no es del año ${ANIO}`);
  const fila = (nombre) => {
    const m = bloque.match(new RegExp(`${nombre} (\\d+,\\d) (\\d+,\\d)`));
    if (!m) fail(`el cuadro ${n} no tiene la fila «${nombre}»`);
    return { valor: num(m[1]), margen: num(m[2]) };
  };
  const total = fila("Total");
  if (Math.abs(total.valor - TOTAL) > 0.05)
    fail(`el total del cuadro ${n} (${total.valor}) no es la pobreza ${ANIO} publicada (${TOTAL})`);
  return grupos.map((g) => {
    const { valor, margen } = fila(g.fila);
    if (!(valor > 0 && valor < 100)) fail(`valor fuera de rango en el cuadro ${n}, ${g.fila}: ${valor}`);
    return { ...g, valor, margen, cuadro: n };
  });
}

const edad = cuadro(3, "según grupos de edades", [
  { fila: "Menores de 6 años", group: "0-5", label: "Menores de 6 años" },
  { fila: "6 a 12 años", group: "6-12", label: "6 a 12 años" },
  { fila: "13 a 17 años", group: "13-17", label: "13 a 17 años" },
  { fila: "18 a 64 años", group: "18-64", label: "18 a 64 años" },
  { fila: "65 o más años", group: "65+", label: "65 años o más" },
]).map((g) => ({ ...g, dimension: "edad" }));

const ascendencia = cuadro(4, "según ascendencia étnico-racial declarada", [
  { fila: "Afro/Negra", group: "afro", label: "Afro o negra" },
  { fila: "Blanca", group: "blanca", label: "Blanca" },
  { fila: "Otra", group: "otra", label: "Otra" },
]).map((g) => ({ ...g, dimension: "ascendencia" }));

const linea = (g) =>
  `  { indicatorId: "pobreza-personas", territoryId: "UY", period: ${JSON.stringify(ANIO)}, periodLabel: "Año ${ANIO}", value: ${g.valor}, status: "OFFICIAL", demo: false, sourceUrl: ${JSON.stringify(INFORME)}, retrievedAt: "${TODAY}", notes: ${JSON.stringify(`Margen de error al 95%: ±${fmt(g.margen)} punto. Cuadro ${g.cuadro} del informe anual ${ANIO} del INE.`)}, breakdown: { dimension: ${JSON.stringify(g.dimension)}, group: ${JSON.stringify(g.group)}, label: ${JSON.stringify(g.label)} } },`;

const file = `import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-ine-pobreza-aperturas.mjs — no editar a mano.
// Última ejecución: ${TODAY}. Fuente: INE, informe anual de pobreza ${ANIO}
// (cuadros 3 y 4). El script verifica que el total de cada cuadro sea la
// pobreza ${ANIO} que publica el sitio (${fmt(TOTAL)}%).

export const inePobrezaAperturas: Observation[] = [
  // Pobreza en personas por grupo de edad (cuadro 3)
${edad.map(linea).join("\n")}
  // Pobreza en personas por ascendencia étnico-racial declarada (cuadro 4)
${ascendencia.map(linea).join("\n")}
];
`;
await writeFile(OUT, file);
console.log(
  `pobreza ${ANIO}: ${edad.length} grupos de edad (menores de 6: ${fmt(edad[0].valor)}%) y ${ascendencia.length} de ascendencia, total ${fmt(TOTAL)}%`
);
console.log(`→ ${path.relative(ROOT, OUT)}`);
