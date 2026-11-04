// Coteja la historia electoral 2014 y 2019 (src/data/elecciones-historicas.ts)
// contra los datos abiertos de la Corte Electoral, por circuito:
//
// - votos de cada lema en la primera vuelta (desglose de votos);
// - emitidos y habilitados (totales por circuito);
// - votos de cada fórmula, emitidos y habilitados del balotaje.
//
// En estos archivos, los votos observados figuran dos veces en los totales: en
// el circuito donde se votó y en el de origen. Por eso los emitidos son los
// "votos no observados" (que ya incluyen los observados escrutados) y los
// habilitados son el total menos los observados. Lo único que no traen son los
// sobres observados rechazados (205 en 2019, 222 en 2014): el script exige que
// la diferencia con el dato oficial sea la misma en emitidos y en habilitados.
//
// 1984–2009 se cargaron de los PDF oficiales de la Corte y no tienen datos
// abiertos; 1994 sale de Wikipedia (ver el encabezado del archivo de datos).
//
// No escribe nada: si algo no coincide, falla.
// Uso: node scripts/ingest/check-elecciones-historicas.mjs

import { historicElections } from "../../src/data/elecciones-historicas.ts";

const CKAN = "https://catalogodatos.gub.uy/dataset";
const SRC = {
  2019: {
    desglose: `${CKAN}/7c3caf30-b59e-43de-b928-547030cc682b/resource/fae2be5e-44db-4763-8b32-9c18679d3aad/download/desglose-de-votos.csv`,
    totales: `${CKAN}/7c3caf30-b59e-43de-b928-547030cc682b/resource/4e6c2564-a178-4802-b7ed-59be68485146/download/totales-generales-por-comision-receptora-de-votos.csv`,
    balotaje: `${CKAN}/8a20dcc5-77c7-499d-9932-5d0ebea4df37/resource/a71df2ea-b075-40e7-80b5-1df4c781bb99/download/balotaje-2019.csv`,
    lemas: {
      "Partido Frente Amplio": "Frente Amplio",
      "Partido Nacional": "Partido Nacional",
      "Partido Colorado": "Partido Colorado",
      "Partido Cabildo Abierto": "Cabildo Abierto",
      "Partido Independiente": "Partido Independiente",
    },
    formulas: { Total_Martinez_Villar: "Daniel Martínez", "Total_Lacalle Pou_Argimon": "Luis Lacalle Pou" },
  },
  2014: {
    desglose: `${CKAN}/1d025bf7-5b0d-42c5-8a9a-0696e24f7634/resource/91bc8eeb-227a-47a3-96e9-c2fe4e4a3e1c/download/desglose-de-votos.csv`,
    totales: `${CKAN}/1d025bf7-5b0d-42c5-8a9a-0696e24f7634/resource/1e851dea-cd81-4ca5-82d2-55fa8920fc1f/download/totales-generales-por-comision-receptora-de-votos.csv`,
    balotaje: `${CKAN}/6455b729-be2e-47d7-9205-b9355a593252/resource/5a0b3b75-890b-401e-a44a-08546a043576/download/balotaje-2014.csv`,
    lemas: {
      "Frente Amplio": "Frente Amplio",
      "Partido Nacional": "Partido Nacional",
      "Partido Colorado": "Partido Colorado",
      "Partido Independiente": "Partido Independiente",
      "Partido Asamblea Popular": "Unidad Popular (Asamblea Popular)",
    },
    formulas: { Total_Vazquez_Sendic: "Tabaré Vázquez", "Total_Lacalle Pou_Larrañaga": "Luis Lacalle Pou" },
  },
};

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
};

const errores = [];
const igual = (real, esperado, que) => {
  if (real !== esperado) errores.push(`${que}: datos abiertos ${real}, archivo ${esperado}`);
  else console.log(`  ✓ ${que}: ${real}`);
};

async function csv(url) {
  for (let intento = 1; ; intento++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
      const lineas = (await res.text()).replace(/^﻿/, "").trim().split(/\r?\n/);
      const campos = (l) => l.split(",").map((c) => c.replace(/^"|"$/g, ""));
      const cab = campos(lineas[0]);
      return lineas.slice(1).map((l) => Object.fromEntries(campos(l).map((v, i) => [cab[i], v])));
    } catch (e) {
      if (intento >= 3) throw e;
      await new Promise((r) => setTimeout(r, 3000 * intento));
    }
  }
}

const sumar = (filas, campo) => filas.reduce((s, f) => s + Number(f[campo]), 0);

for (const [año, src] of Object.entries(SRC)) {
  const e = historicElections.find((x) => x.year === Number(año));
  if (!e) throw new Error(`Falta la elección ${año} en elecciones-historicas.ts`);
  console.log(`Elección nacional ${año}…`);

  const porLema = {};
  for (const f of await csv(src.desglose)) {
    const etiqueta = src.lemas[f.Lema] ?? "Otros partidos";
    porLema[etiqueta] = (porLema[etiqueta] ?? 0) + Number(f.CantidadVotos);
  }
  const etiquetas = new Set([...Object.keys(porLema), ...e.firstRound.map((l) => l.label)]);
  for (const et of etiquetas) igual(porLema[et], e.firstRound.find((l) => l.label === et)?.votes, `${año} ${et}`);

  const tot = await csv(src.totales);
  const emitidos = sumar(tot, "TotalVotosNOObservados");
  const habilitados = sumar(tot, "TotalHabilitados") - sumar(tot, "TotalVotosObservados");
  const rechazados = e.emitted - emitidos;
  if (rechazados < 0 || rechazados > 1000 || e.enabled - habilitados !== rechazados)
    errores.push(
      `${año}: emitidos ${emitidos} y habilitados ${habilitados} en datos abiertos; el archivo dice ${e.emitted} y ${e.enabled}`
    );
  else console.log(`  ✓ ${año} emitidos y habilitados (más ${rechazados} sobres observados rechazados)`);

  if (!e.runoff) throw new Error(`Falta el balotaje ${año}`);
  const bal = await csv(src.balotaje);
  for (const [campo, nombre] of Object.entries(src.formulas))
    igual(sumar(bal, campo), e.runoff.candidates.find((c) => c.name === nombre)?.votes, `balotaje ${año} ${nombre}`);
  igual(sumar(bal, "Total_Votos_NO_Observados"), e.runoff.emitted, `balotaje ${año} emitidos`);
  igual(sumar(bal, "Total_Habilitados") - sumar(bal, "Total_Votos_Observados"), e.runoff.enabled, `balotaje ${año} habilitados`);
}

if (errores.length) {
  for (const m of errores) console.error(`ERROR ${m}`);
  process.exit(1);
}
console.log("Historia electoral 2014 y 2019: coincide con los datos abiertos de la Corte Electoral.");
