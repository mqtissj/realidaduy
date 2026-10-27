// Reglas de comparabilidad que revisó la UMAD (FCS-UdelaR, octubre 2026):
// notas metodológicas a la vista y semestres comparados solo con semestres.
import { test } from "node:test";
import assert from "node:assert/strict";
import { dictionary } from "../src/data/dictionary.ts";
import { allObservations } from "../src/data/observations/index.ts";

test("todo indicador con un quiebre de metodología lo avisa a la vista", () => {
  const conQuiebre = new Set(allObservations.filter((o) => o.breakBefore).map((o) => o.indicatorId));
  for (const id of conQuiebre) {
    const ind = dictionary.find((i) => i.id === id);
    assert.ok(ind?.comparability, `${id} tiene breakBefore pero no tiene nota «Ojo al comparar»`);
  }
});

test("el último semestre de pobreza tiene el mismo semestre del año anterior para comparar", () => {
  const semestres = allObservations
    .filter((o) => o.indicatorId === "pobreza-personas" && o.territoryId === "UY" && /^\d{4}-S[12]$/.test(o.period))
    .map((o) => o.period)
    .sort();
  const ultimo = semestres[semestres.length - 1];
  const mismoAnterior = `${Number(ultimo.slice(0, 4)) - 1}${ultimo.slice(4)}`;
  assert.ok(semestres.includes(mismoAnterior), `falta ${mismoAnterior} para comparar con ${ultimo}`);
});
