import type { Observation } from "@/lib/types";

// GENERADO por scripts/ingest/fetch-ine-pobreza.mjs — no editar a mano.
// Última ejecución: 2026-10-27. Fuente: informes de pobreza del INE (metodología
// 2017). Los períodos que ya están en nacional.ts no se repiten acá: el script
// solo controla que coincidan.

export const inePobrezaObservations: Observation[] = [
  { indicatorId: "pobreza-hogares", territoryId: "UY", period: "2024", periodLabel: "Año 2024", value: 13.4, status: "OFFICIAL", demo: false, sourceUrl: "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2025/Informe%20pobreza%20Anual-2025.html", retrievedAt: "2026-10-27", notes: "Metodología 2017 del INE. Margen de error al 95%: ±0,6 punto. Personas: 17,3%. Cuadro 1 del informe del INE publicado el 20/04/2026." },
  { indicatorId: "pobreza-hogares", territoryId: "UY", period: "2025", periodLabel: "Año 2025", value: 13.2, status: "OFFICIAL", demo: false, sourceUrl: "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2025/Informe%20pobreza%20Anual-2025.html", retrievedAt: "2026-10-27", notes: "Metodología 2017 del INE. Margen de error al 95%: ±0,5 punto. Personas: 16,6%. Cuadro 1 del informe del INE publicado el 20/04/2026." },
  { indicatorId: "pobreza-hogares", territoryId: "UY", period: "2026-S1", periodLabel: "1er semestre 2026", value: 11.6, status: "OFFICIAL", demo: false, sourceUrl: "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2026/Informe%20Pobreza_Monetaria_%20primer%20semestre%202026.html", retrievedAt: "2026-10-27", notes: "Metodología 2017 del INE. Margen de error al 95%: ±0,7 punto. Personas: 14,8%. Es una estimación semestral: se compara con otros semestres, no con el año completo. Cuadro 1 del informe del INE publicado el 07/10/2026." },
];

// Pobreza en hogares según quién encabeza el hogar (cuadro 5 del informe anual).
export const inePobrezaReferente: Observation[] = [
  { indicatorId: "pobreza-hogares", territoryId: "UY", period: "2025", periodLabel: "Año 2025", value: 9.7, status: "OFFICIAL", demo: false, sourceUrl: "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2025/Informe%20pobreza%20Anual-2025.html", retrievedAt: "2026-10-27", notes: "Hogares según el sexo de la persona de referencia (quien lo encabeza). Cuadro 5 del informe anual 2025 del INE.", breakdown: { dimension: "sexo", group: "referente-hombre", label: "Encabezados por un hombre" } },
  { indicatorId: "pobreza-hogares", territoryId: "UY", period: "2025", periodLabel: "Año 2025", value: 16, status: "OFFICIAL", demo: false, sourceUrl: "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2025/Informe%20pobreza%20Anual-2025.html", retrievedAt: "2026-10-27", notes: "Hogares según el sexo de la persona de referencia (quien lo encabeza). Cuadro 5 del informe anual 2025 del INE.", breakdown: { dimension: "sexo", group: "referente-mujer", label: "Encabezados por una mujer" } },
];

export interface LineaPobrezaFila {
  personas: number;
  montevideo: { inquilinos: number; noInquilinos: number };
  interior: { inquilinos: number; noInquilinos: number };
}

/** Valor de la línea de pobreza del hogar, en pesos por mes. */
export const lineaPobreza = {
  periodLabel: "junio de 2026",
  sourceUrl: "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2026/Informe%20Pobreza_Monetaria_%20primer%20semestre%202026.html",
  retrievedAt: "2026-10-27",
  filas: [{"personas":1,"montevideo":{"inquilinos":25195,"noInquilinos":15572},"interior":{"inquilinos":20257,"noInquilinos":13540}},{"personas":2,"montevideo":{"inquilinos":42659,"noInquilinos":29961},"interior":{"inquilinos":33339,"noInquilinos":25070}},{"personas":3,"montevideo":{"inquilinos":58893,"noInquilinos":43959},"interior":{"inquilinos":45364,"noInquilinos":36026}}] as LineaPobrezaFila[],
};
