// Invariantes de los datos publicados que no dependen de la red. Complementan
// a scripts/validate-data.mjs: acá van las reglas que ya se rompieron una vez
// y no deberían volver.
import { test } from "node:test";
import assert from "node:assert/strict";
import { electionResults, getElectionResults, turnout } from "../src/data/elections.ts";
import { balotaje2024Totales } from "../src/data/elecciones-generadas.ts";
import { allBreakdowns, allObservations } from "../src/data/observations/index.ts";

const esWikipedia = (url: string) => new URL(url).hostname.endsWith("wikipedia.org");

test("ningún resultado electoral publicado cita Wikipedia (auditoría 24/10)", () => {
  const conWiki = electionResults.filter((r) => esWikipedia(r.sourceUrl));
  assert.deepEqual(conWiki, []);
});

test("ninguna participación electoral cita Wikipedia ni está pendiente", () => {
  for (const t of turnout) {
    assert.equal(esWikipedia(t.sourceUrl), false, t.electionId);
    assert.equal(t.demo, false, t.electionId);
    assert.ok(t.pct > 50 && t.pct < 100, `${t.electionId}: ${t.pct}`);
  }
});

test("balotaje 2024: los votos coinciden con el escrutinio y los % suman 100", () => {
  const rows = getElectionResults("balotaje-2024", "UY");
  const votos = Object.fromEntries(rows.map((r) => [r.partyId, r.votes]));
  assert.deepEqual(votos, { fa: 1212833, pn: 1119537 });
  assert.equal(rows.reduce((s, r) => s + (r.pct ?? 0), 0), 100);
  assert.equal(balotaje2024Totales.validos, 1212833 + 1119537);
});

test("balotaje 2024 sobre emitidos: 49,77 % y 45,94 % (no 49,84 / 45,87)", () => {
  const pct = (v: number) => Math.round((v / balotaje2024Totales.emitidos) * 10000) / 100;
  assert.equal(pct(1212833), 49.77);
  assert.equal(pct(1119537), 45.94);
});

test("cada observación tiene fuente, período y un valor numérico o vacío", () => {
  for (const o of [...allObservations, ...allBreakdowns]) {
    const ref = `${o.indicatorId}/${o.territoryId}/${o.period}`;
    assert.ok(o.sourceUrl?.startsWith("http"), `sin fuente: ${ref}`);
    assert.ok(o.period, `sin período: ${ref}`);
    // null es "sin dato" (se muestra como tal); NaN o un texto serían un error de ingesta.
    assert.ok(o.value === null || Number.isFinite(o.value), `valor inválido: ${ref}`);
  }
});
