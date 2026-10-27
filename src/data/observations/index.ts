import type { Observation } from "@/lib/types";
// Imports relativos con extensión (no alias) para que scripts/validate-data.mjs
// y las pruebas puedan cargarlo con Node.
import { nationalObservations } from "./nacional.ts";
import { departmentObservations } from "./departamentos.ts";
import { municipioObservations } from "./municipios.ts";
import { departmentEchObservations } from "./departamentos-ech.ts";
import { otuObservations } from "./otu.ts";
import { otuMunicipioObservations } from "./otu-municipios.ts";
import { otuCensalObservations } from "./otu-censal.ts";
import { ineMensualDesgloses, ineMensualObservations } from "./ine-mensual.ts";
import { seguridadObservations } from "./seguridad.ts";
import { worldBankSeries } from "./series-banco-mundial.ts";
import { prismaObservations } from "./prisma.ts";
import { bcuPibObservations } from "./bcu-pib.ts";
import { bcuCotizacionesObservations } from "./bcu-cotizaciones.ts";
import { ineAnualesDesgloses, ineAnualesObservations } from "./ine-anuales.ts";
import { inePobrezaAperturas } from "./ine-pobreza-aperturas.ts";
import { andeMipymesObservations } from "./ande-mipymes.ts";
import { inePobrezaObservations, inePobrezaReferente } from "./ine-pobreza.ts";
import { mecEducacionObservations } from "./mec-educacion.ts";
import { udelarFormaObservations } from "./udelar-forma.ts";

// Lista ÚNICA de observaciones de la plataforma: la usan la app
// (src/lib/data) y el validador. Un archivo nuevo de observaciones se agrega
// acá y nada más; antes la lista estaba copiada en los dos lados.

/** Totales (sin aperturas). */
export const allObservations: Observation[] = [
  ...nationalObservations,
  ...departmentObservations,
  ...departmentEchObservations,
  ...otuObservations,
  ...otuMunicipioObservations,
  ...otuCensalObservations,
  ...ineMensualObservations,
  ...seguridadObservations,
  ...municipioObservations,
  ...worldBankSeries,
  ...prismaObservations,
  ...bcuPibObservations,
  ...bcuCotizacionesObservations,
  ...ineAnualesObservations,
  ...mecEducacionObservations,
  ...udelarFormaObservations,
  ...andeMipymesObservations,
  ...inePobrezaObservations,
];

/** Aperturas (por sexo, por edad), aparte de los totales. */
export const allBreakdowns: Observation[] = [...ineAnualesDesgloses, ...inePobrezaAperturas, ...ineMensualDesgloses, ...inePobrezaReferente];
