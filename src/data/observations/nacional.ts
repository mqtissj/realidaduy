import type { Observation } from "@/lib/types";

// Valores de titulares nacionales. Investigación verificada el 2026-08-25.
// demo: true ⇒ el valor proviene de prensa que cita al organismo oficial y
// está PENDIENTE DE VALIDACIÓN humana contra el boletín original.

export const nationalObservations: Observation[] = [
  // ── Población ──────────────────────────────────────────────
  {
    indicatorId: "poblacion",
    territoryId: "UY",
    period: "2023",
    periodLabel: "Censo 2023",
    value: 3499451,
    status: "OFFICIAL",
    demo: false,
    sourceUrl:
      "https://www.gub.uy/presidencia/comunicacion/noticias/censo-nacional-2023-contabilizo-3499451-habitantes-uruguay",
    retrievedAt: "2026-08-26",
    notes:
      "Resultados finales del Censo 2023 (publicados en diciembre de 2024). Cifra verificada dígito a dígito contra el PDF oficial del INE (auditoría 2026-08-26).",
  },
  // ── Economía ───────────────────────────────────────────────
  {
    indicatorId: "pib-variacion",
    territoryId: "UY",
    period: "2026-Q1",
    periodLabel: "1er trimestre 2026",
    value: 0.9,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.ambito.com/uruguay/la-economia-crecio-09-el-primer-trimestre-pesar-la-caida-del-campo-y-la-construccion-n6288981",
    retrievedAt: "2026-08-25",
    notes:
      "Variación real interanual (BCU). La variación trimestral desestacionalizada fue +0,8%: es otra medida y no se mezcla con esta.",
  },
  {
    indicatorId: "salario-minimo",
    territoryId: "UY",
    period: "2026-01",
    periodLabel: "Desde enero 2026",
    value: 24572,
    status: "OFFICIAL",
    demo: false,
    sourceUrl:
      "https://www.gub.uy/ministerio-trabajo-seguridad-social/comunicacion/noticias/salario-minimo-nacional-24572-desde-1o-enero-2026",
    retrievedAt: "2026-08-25",
    notes: "Decreto 319/025. Valor nominal (a precios corrientes).",
  },
  {
    indicatorId: "salario-minimo",
    territoryId: "UY",
    period: "2026-07",
    periodLabel: "Desde julio 2026",
    value: 25383,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.infobae.com/america/agencias/2026/07/01/el-salario-minimo-en-uruguay-aumenta-un-33-y-ronda-los-630-dolares/",
    retrievedAt: "2026-08-25",
    notes: "Ajuste de +3,3% desde el 1º de julio de 2026. Valor nominal.",
  },
  // ── Sociedad ───────────────────────────────────────────────
  {
    indicatorId: "pobreza-personas",
    territoryId: "UY",
    period: "2025",
    periodLabel: "Año 2025",
    value: 16.6,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.ambito.com/uruguay/la-pobreza-al-166-2025-pero-se-concentro-mas-fuerza-ninos-y-hogares-encabezados-mujeres-n6268800",
    retrievedAt: "2026-08-25",
    notes:
      "Metodología nueva del INE (canasta de la ENGIH 2016-2017, adoptada en 2025): no comparable con la serie de la metodología anterior. Equivale a 578.665 personas; hogares: 13,2%; indigencia: 1,7%. El informe del 1er semestre 2026 aún no estaba publicado al 26/08/2026.",
  },
];
