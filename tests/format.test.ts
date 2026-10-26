import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDelta, formatNumber, formatValue, legendFormat, toSlug } from "../src/lib/format.ts";

test("formatNumber usa coma decimal y punto de miles (es-UY)", () => {
  assert.equal(formatNumber(1212833), "1.212.833");
  assert.equal(formatNumber(49.7725, 2), "49,77");
  assert.equal(formatNumber(0.5, 1), "0,5");
});

test("formatValue pone la unidad donde corresponde", () => {
  assert.equal(formatValue(8.8, "%", 1), "8,8%");
  assert.equal(formatValue(24572, "pesos", 0), "$ 24.572");
  assert.equal(formatValue(23000, "USD", 0), "US$ 23.000");
  assert.equal(formatValue(3444263, "habitantes", 0), "3.444.263");
  assert.equal(formatValue(0.4, "pp", 1), "0,4 pp");
  assert.equal(formatValue(12, "años", 0), "12 años");
});

test("formatDelta siempre lleva signo textual y los % se leen en puntos", () => {
  assert.equal(formatDelta(0.4, "%"), "+0,4 pp");
  assert.equal(formatDelta(-2.9, "%"), "−2,9 pp");
  assert.equal(formatDelta(0, "%"), "sin cambios");
  assert.equal(formatDelta(-150, "personas", 0), "−150");
});

test("legendFormat limita los decimales de los porcentajes a uno", () => {
  assert.equal(legendFormat("%", 2)(36.712), "36,7%");
});

test("toSlug saca tildes, signos y espacios", () => {
  assert.equal(toSlug("¿Cómo evolucionó el desempleo?"), "como-evoluciono-el-desempleo");
  assert.equal(toSlug("  Paysandú — Río Negro  "), "paysandu-rio-negro");
});
