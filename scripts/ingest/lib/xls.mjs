// Lector mínimo de planillas .xls (Excel 97-2003, BIFF8), sin dependencias.
//
// Varios cuadros del Anuario Estadístico del INE solo se publican en .xls. El
// lector saca el flujo "Workbook" del archivo compuesto (CFB) y recorre sus
// registros BIFF quedándose con los valores de las celdas: números (NUMBER, RK,
// MULRK), textos (LABELSST, LABEL) y resultados de fórmulas numéricas
// (FORMULA). Formatos, estilos y gráficos se ignoran.
//
// Uso: const hojas = leerXls(buffer); hojas["2.3.6"][fila][columna]
// (filas y columnas desde 0; una celda vacía es undefined).

const FIN_CADENA = 0xfffffffe;

/** Flujo "Workbook" de un archivo compuesto (Compound File Binary). */
function flujoWorkbook(buf) {
  if (buf.readUInt32LE(0) !== 0xe011cfd0 || buf.readUInt32LE(4) !== 0xe11ab1a1)
    throw new Error("No es un archivo .xls (falta la firma del archivo compuesto)");
  const tamSector = 1 << buf.readUInt16LE(30);
  const tamMini = 1 << buf.readUInt16LE(32);
  const primerDir = buf.readUInt32LE(48);
  const corteMini = buf.readUInt32LE(56);
  const primerMiniFat = buf.readUInt32LE(60);
  let sectorDifat = buf.readUInt32LE(68);
  const sector = (n) => buf.subarray(512 + n * tamSector, 512 + (n + 1) * tamSector);

  // FAT: los primeros 109 sectores están en la cabecera; el resto, en la DIFAT.
  const sectoresFat = [];
  for (let i = 0; i < 109; i++) {
    const s = buf.readUInt32LE(76 + i * 4);
    if (s < FIN_CADENA) sectoresFat.push(s);
  }
  while (sectorDifat < FIN_CADENA) {
    const d = sector(sectorDifat);
    for (let i = 0; i < tamSector / 4 - 1; i++) {
      const s = d.readUInt32LE(i * 4);
      if (s < FIN_CADENA) sectoresFat.push(s);
    }
    sectorDifat = d.readUInt32LE(tamSector - 4);
  }
  const fat = [];
  for (const s of sectoresFat) {
    const d = sector(s);
    for (let i = 0; i < tamSector / 4; i++) fat.push(d.readUInt32LE(i * 4));
  }
  const cadena = (inicio) => {
    const partes = [];
    for (let s = inicio, n = 0; s < FIN_CADENA; s = fat[s], n++) {
      if (n > fat.length) throw new Error("Cadena de sectores circular en el .xls");
      partes.push(sector(s));
    }
    return Buffer.concat(partes);
  };

  // Directorio: entradas de 128 bytes con nombre UTF-16, tipo, primer sector y tamaño.
  const dir = cadena(primerDir);
  const entradas = [];
  for (let off = 0; off + 128 <= dir.length; off += 128) {
    const largo = dir.readUInt16LE(off + 64);
    entradas.push({
      nombre: dir.subarray(off, off + Math.max(0, largo - 2)).toString("utf16le"),
      tipo: dir[off + 66],
      inicio: dir.readUInt32LE(off + 116),
      tam: dir.readUInt32LE(off + 120),
    });
  }
  const wb = entradas.find((e) => e.tipo === 2 && /^(Workbook|Book)$/.test(e.nombre));
  if (!wb) throw new Error("El .xls no tiene el flujo Workbook");
  if (wb.tam >= corteMini) return cadena(wb.inicio).subarray(0, wb.tam);

  // Flujos chicos: viven en el mini flujo de la entrada raíz.
  const raiz = entradas[0];
  const mini = cadena(raiz.inicio);
  const miniFat = [];
  const mf = cadena(primerMiniFat);
  for (let i = 0; i < mf.length / 4; i++) miniFat.push(mf.readUInt32LE(i * 4));
  const partes = [];
  for (let s = wb.inicio; s < FIN_CADENA; s = miniFat[s]) partes.push(mini.subarray(s * tamMini, (s + 1) * tamMini));
  return Buffer.concat(partes).subarray(0, wb.tam);
}

/** Valor de un RK: entero o double comprimido, opcionalmente dividido por 100. */
function rk(v) {
  let n;
  if (v & 2) n = v >> 2;
  else {
    const b = Buffer.alloc(8);
    b.writeUInt32LE(v & 0xfffffffc, 4);
    n = b.readDoubleLE(0);
  }
  return v & 1 ? n / 100 : n;
}

/**
 * Lee una cadena Unicode de BIFF8 que puede seguir en registros CONTINUE.
 * `trozos` son los cuerpos del SST y sus CONTINUE; devuelve [texto, nueva posición].
 */
function cadenasSst(trozos) {
  const out = [];
  let t = 0;
  let p = 8; // el SST empieza con el total y la cantidad de cadenas únicas
  const total = trozos[0].readUInt32LE(4);
  const byte = () => {
    if (p >= trozos[t].length) {
      t++;
      p = 0;
    }
    return trozos[t][p++];
  };
  const u16 = () => byte() | (byte() << 8);
  const u32 = () => (u16() | (u16() << 16)) >>> 0;
  for (let i = 0; i < total; i++) {
    let falta = u16();
    let flags = byte();
    const extRich = flags & 0x8 ? u16() : 0;
    const extAsia = flags & 0x4 ? u32() : 0;
    let s = "";
    while (falta > 0) {
      let anchos = flags & 1;
      while (falta > 0 && p < trozos[t].length) {
        s += String.fromCharCode(anchos ? trozos[t][p] | (trozos[t][p + 1] << 8) : trozos[t][p]);
        p += anchos ? 2 : 1;
        falta--;
      }
      // La cadena sigue en el próximo CONTINUE, que repite el byte de flags.
      if (falta > 0) {
        t++;
        p = 0;
        flags = byte();
      }
    }
    for (let k = 0; k < extRich * 4 + extAsia; k++) byte();
    out.push(s);
  }
  return out;
}

/** Hojas de un .xls como matrices de valores: { nombre: valores[fila][columna] }. */
export function leerXls(buf) {
  const w = flujoWorkbook(buf);
  const registros = [];
  for (let off = 0; off + 4 <= w.length; ) {
    const tipo = w.readUInt16LE(off);
    const largo = w.readUInt16LE(off + 2);
    registros.push({ tipo, off, cuerpo: w.subarray(off + 4, off + 4 + largo) });
    off += 4 + largo;
  }

  const hojas = [];
  let sst = [];
  for (let i = 0; i < registros.length; i++) {
    const r = registros[i];
    if (r.tipo === 0x0085) {
      // BOUNDSHEET: posición de la hoja y su nombre.
      const pos = r.cuerpo.readUInt32LE(0);
      const largo = r.cuerpo[6];
      const anchos = r.cuerpo[7] & 1;
      const nombre = anchos
        ? r.cuerpo.subarray(8, 8 + largo * 2).toString("utf16le")
        : r.cuerpo.subarray(8, 8 + largo).toString("latin1");
      hojas.push({ pos, nombre });
    } else if (r.tipo === 0x00fc) {
      const trozos = [r.cuerpo];
      while (registros[i + 1]?.tipo === 0x003c) trozos.push(registros[++i].cuerpo);
      sst = cadenasSst(trozos);
    }
  }

  const resultado = {};
  for (const h of hojas) {
    const filas = [];
    const poner = (f, c, v) => {
      (filas[f] ??= [])[c] = v;
    };
    let i = registros.findIndex((r) => r.off === h.pos);
    if (i < 0) throw new Error(`No se encontró la hoja ${h.nombre}`);
    // Los gráficos incrustados son sub-flujos BOF…EOF dentro de la hoja, con sus
    // propios registros de números: se saltean enteros.
    let anidado = 0;
    for (i++; i < registros.length; i++) {
      const { tipo, cuerpo: b } = registros[i];
      if (tipo === 0x0809) anidado++;
      else if (tipo === 0x000a) {
        if (anidado === 0) break;
        anidado--;
      } else if (anidado > 0) continue;
      else if (tipo === 0x0203) poner(b.readUInt16LE(0), b.readUInt16LE(2), b.readDoubleLE(6));
      else if (tipo === 0x027e) poner(b.readUInt16LE(0), b.readUInt16LE(2), rk(b.readInt32LE(6)));
      else if (tipo === 0x00bd) {
        const f = b.readUInt16LE(0);
        const c0 = b.readUInt16LE(2);
        const n = (b.length - 6) / 6;
        for (let k = 0; k < n; k++) poner(f, c0 + k, rk(b.readInt32LE(4 + k * 6 + 2)));
      } else if (tipo === 0x00fd) poner(b.readUInt16LE(0), b.readUInt16LE(2), sst[b.readUInt32LE(6)]);
      else if (tipo === 0x0204) {
        const largo = b.readUInt16LE(6);
        const anchos = b[8] & 1;
        poner(
          b.readUInt16LE(0),
          b.readUInt16LE(2),
          anchos ? b.subarray(9, 9 + largo * 2).toString("utf16le") : b.subarray(9, 9 + largo).toString("latin1")
        );
      } else if (tipo === 0x0006) {
        // FORMULA: si los dos últimos bytes del resultado son 0xFFFF no es un número.
        if (b.readUInt16LE(12) !== 0xffff) poner(b.readUInt16LE(0), b.readUInt16LE(2), b.readDoubleLE(6));
      }
    }
    resultado[h.nombre] = filas;
  }
  return resultado;
}
