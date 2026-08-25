import type { Observation } from "@/lib/types";

// Valores de titulares nacionales. Investigación verificada el 2026-08-25.
// demo: true ⇒ el valor proviene de prensa que cita al organismo oficial y
// está PENDIENTE DE VALIDACIÓN humana contra el boletín original (docs/05).

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
      "https://www.opp.gub.uy/es/noticias/censo-nacional-2023-contabilizo-3499451-habitantes-en-uruguay",
    retrievedAt: "2026-08-25",
    notes: "Resultados finales del Censo 2023 (publicados en diciembre de 2024).",
  },
  // ── Trabajo (ECH, INE) ─────────────────────────────────────
  {
    indicatorId: "tasa-desempleo",
    territoryId: "UY",
    period: "2026-05",
    periodLabel: "Mayo 2026",
    value: 7.6,
    status: "CALCULATED",
    demo: true,
    sourceUrl:
      "https://www.montevideo.com.uy/Noticias/Desempleo-tuvo-una-baja-en-junio-con-respecto-a-mayo-y-se-ubico-en-el-7-0--segun-el-INE-uc970006",
    retrievedAt: "2026-08-25",
    notes:
      "Derivado de la variación informada por el INE para junio (baja de 0,6 pp respecto a mayo).",
  },
  {
    indicatorId: "tasa-desempleo",
    territoryId: "UY",
    period: "2026-06",
    periodLabel: "Junio 2026",
    value: 7.0,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.montevideo.com.uy/Noticias/Desempleo-tuvo-una-baja-en-junio-con-respecto-a-mayo-y-se-ubico-en-el-7-0--segun-el-INE-uc970006",
    retrievedAt: "2026-08-25",
    notes: "Vía prensa que cita el boletín ECH del INE (~144.900 personas desocupadas).",
  },
  {
    indicatorId: "tasa-empleo",
    territoryId: "UY",
    period: "2026-06",
    periodLabel: "Junio 2026",
    value: 59.5,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.montevideo.com.uy/Noticias/Desempleo-tuvo-una-baja-en-junio-con-respecto-a-mayo-y-se-ubico-en-el-7-0--segun-el-INE-uc970006",
    retrievedAt: "2026-08-25",
    notes: "Montevideo: 60,8% · Interior: 58,6%.",
  },
  {
    indicatorId: "tasa-actividad",
    territoryId: "UY",
    period: "2026-06",
    periodLabel: "Junio 2026",
    value: 63.9,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.montevideo.com.uy/Noticias/Desempleo-tuvo-una-baja-en-junio-con-respecto-a-mayo-y-se-ubico-en-el-7-0--segun-el-INE-uc970006",
    retrievedAt: "2026-08-25",
    notes: "Montevideo: 65,3% · Interior: 63,1%.",
  },
  // ── Economía ───────────────────────────────────────────────
  {
    indicatorId: "inflacion-interanual",
    territoryId: "UY",
    period: "2026-07",
    periodLabel: "Julio 2026",
    value: 4.27,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.infobae.com/america/agencias/2026/08/05/la-inflacion-en-uruguay-sube-a-427-en-julio/",
    retrievedAt: "2026-08-25",
    notes: "Variación mensual: 0,07%. Acumulada en el año: 3,40%.",
  },
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
    indicatorId: "pib-per-capita",
    territoryId: "UY",
    period: "2024",
    periodLabel: "2024",
    value: 24308.5,
    status: "SECONDARY",
    demo: false,
    sourceUrl:
      "https://api.worldbank.org/v2/country/URY/indicator/NY.GDP.PCAP.CD?format=json&date=2020:2025",
    retrievedAt: "2026-08-25",
    notes: "Serie del Banco Mundial (fuente secundaria internacional), dólares corrientes.",
  },
  {
    indicatorId: "pib-per-capita",
    territoryId: "UY",
    period: "2025",
    periodLabel: "2025",
    value: 25215.82,
    status: "SECONDARY",
    demo: false,
    sourceUrl:
      "https://api.worldbank.org/v2/country/URY/indicator/NY.GDP.PCAP.CD?format=json&date=2020:2025",
    retrievedAt: "2026-08-25",
    notes: "Serie del Banco Mundial (fuente secundaria internacional), dólares corrientes.",
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
  {
    indicatorId: "indice-medio-salarios",
    territoryId: "UY",
    period: "2026-05",
    periodLabel: "Mayo 2026",
    value: 5.12,
    status: "OFFICIAL",
    demo: true,
    sourceUrl:
      "https://www.gub.uy/instituto-nacional-estadistica/comunicacion/publicaciones/indice-medio-salarios-ims-mayo-2026",
    retrievedAt: "2026-08-25",
    notes: "Variación nominal interanual. Acumulada en el año: 3,83%.",
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
      "Metodología nueva (canasta actualizada 2025): no comparable con la serie anterior. Equivale a 578.665 personas; hogares: 13,2%; indigencia: 1,7%. El informe del 1er semestre 2026 aún no estaba publicado al 25/08/2026.",
  },
];
