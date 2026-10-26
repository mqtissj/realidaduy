import { test } from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "../src/lib/csv.ts";

test("toCsv arranca con BOM y termina cada fila en CRLF", () => {
  const csv = toCsv(["a", "b"], [[1, "x"]]);
  assert.ok(csv.startsWith("﻿"));
  assert.equal(csv, "﻿a,b\r\n1,x\r\n");
});

test("toCsv entrecomilla comas, punto y coma y comillas, y aplana saltos de línea", () => {
  const csv = toCsv(["t"], [['dice "hola", chau'], ["a;b"], ["línea 1\nlínea 2"]]);
  const rows = csv.slice(1).split("\r\n");
  assert.equal(rows[1], '"dice ""hola"", chau"');
  assert.equal(rows[2], '"a;b"');
  assert.equal(rows[3], "línea 1 línea 2");
});

test("toCsv deja vacíos los nulos y escribe sí/no en los booleanos", () => {
  const csv = toCsv(["a", "b", "c", "d"], [[null, undefined, true, false]]);
  assert.equal(csv.slice(1).split("\r\n")[1], ",,sí,no");
});

test("toCsv mantiene el punto decimal (no el formato es-UY)", () => {
  assert.equal(toCsv(["v"], [[49.77]]).slice(1).split("\r\n")[1], "49.77");
});
