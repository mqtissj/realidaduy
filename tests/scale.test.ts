import { test } from "node:test";
import assert from "node:assert/strict";
import { SEQ_COLORS, quantileScale } from "../src/lib/scale.ts";

test("quantileScale da 4 cortes para 5 clases, en orden", () => {
  const s = quantileScale([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(s.breaks.length, 4);
  assert.deepEqual([...s.breaks].sort((a, b) => a - b), s.breaks);
});

test("quantileScale pinta el mínimo con el color más claro y el máximo con el más oscuro", () => {
  const s = quantileScale([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(s.fillFor(1), SEQ_COLORS[0]);
  assert.equal(s.fillFor(10), SEQ_COLORS[4]);
});

test("quantileScale no se rompe con un solo valor", () => {
  const s = quantileScale([7]);
  assert.equal(s.fillFor(7), SEQ_COLORS[0]);
});
