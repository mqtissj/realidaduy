import type { Indicator } from "@/lib/types";

// Data Dictionary — fuente de verdad (resumen humano en docs/05-data-dictionary.md).
// Regla: reading solo juzga dirección cuando existe consenso amplio (desempleo ↓ mejor);
// en indicadores discutibles (inflación, PIB, actividad) es "neutral" y la UI no colorea.

export const dictionary: Indicator[] = [
  // ── Población ──────────────────────────────────────────────
  {
    id: "poblacion",
    slug: "poblacion",
    name: "Población",
    shortName: "Población",
    question: "¿Cuánta gente vive en cada departamento?",
    description: "Población residente habitual según el Censo 2023 (resultados finales).",
    plainDefinition:
      "Cantidad de personas que viven habitualmente en el territorio, contadas por el Censo Nacional 2023 del INE.",
    category: "poblacion",
    unit: "personas",
    unitLabel: "habitantes",
    sourceId: "ine",
    sourceUrl:
      "https://www5.ine.gub.uy/documents/CENSO%202023/Poblaci%C3%B3n%20estimada,%20crecimiento%20intercensal%20y%20estructura%20por%20sexo%20y%20edad.pdf",
    periodicity: "decenal",
    geographicLevel: ["pais", "departamento"],
    availableFrom: "2023",
    methodology:
      "Censo Nacional 2023 (INE). Resultados finales publicados en diciembre de 2024. No existe apertura municipal comparable publicada en esta plataforma todavía.",
    isCalculated: false,
    reading: "neutral",
    decimals: 0,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  // ── Trabajo ────────────────────────────────────────────────
  {
    id: "tasa-desempleo",
    slug: "desempleo",
    name: "Tasa de desempleo",
    shortName: "Desempleo",
    question: "¿Cuánta gente busca trabajo y no encuentra?",
    description:
      "Porcentaje de la población económicamente activa que busca trabajo y no lo encuentra.",
    plainDefinition:
      "Mide el porcentaje de personas que buscan trabajo y no lo encuentran, dentro de la población que trabaja o quiere trabajar (población económicamente activa).",
    category: "trabajo",
    unit: "%",
    unitLabel: "por ciento de la población activa",
    sourceId: "ine",
    sourceUrl: "https://www7.ine.gub.uy/Dashboard-%20ML-ECH/MercadoLaboral/",
    periodicity: "mensual",
    geographicLevel: ["pais", "departamento"],
    availableFrom: "2006",
    methodology:
      "Encuesta Continua de Hogares (ECH) del INE. La ECH fue rediseñada en 2021–2022: las series anteriores y posteriores no son estrictamente comparables. La apertura departamental es el promedio anual calculado por el Observatorio Social del MIDES sobre los microdatos de la ECH, y puede diferir levemente de los boletines de trimestres móviles del INE.",
    isCalculated: false,
    reading: "lowerIsBetter",
    decimals: 1,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  {
    id: "tasa-empleo",
    slug: "empleo",
    name: "Tasa de empleo",
    shortName: "Empleo",
    question: "¿Qué parte de la población tiene trabajo?",
    description: "Personas ocupadas como porcentaje de la población de 14 años o más.",
    plainDefinition:
      "Porcentaje de personas de 14 años o más que tienen trabajo (aunque sea por pocas horas).",
    category: "trabajo",
    unit: "%",
    unitLabel: "por ciento de la población de 14 años o más",
    sourceId: "ine",
    sourceUrl: "https://www7.ine.gub.uy/Dashboard-%20ML-ECH/MercadoLaboral/",
    periodicity: "mensual",
    geographicLevel: ["pais", "departamento"],
    availableFrom: "2006",
    methodology: "Encuesta Continua de Hogares (ECH) del INE.",
    isCalculated: false,
    reading: "higherIsBetter",
    decimals: 1,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  {
    id: "tasa-actividad",
    slug: "actividad",
    name: "Tasa de actividad",
    shortName: "Actividad",
    question: "¿Qué parte de la población trabaja o busca trabajo?",
    description:
      "Población económicamente activa como porcentaje de la población de 14 años o más.",
    plainDefinition:
      "Porcentaje de personas de 14 años o más que trabajan o están buscando trabajo activamente.",
    category: "trabajo",
    unit: "%",
    unitLabel: "por ciento de la población de 14 años o más",
    sourceId: "ine",
    sourceUrl: "https://www7.ine.gub.uy/Dashboard-%20ML-ECH/MercadoLaboral/",
    periodicity: "mensual",
    geographicLevel: ["pais", "departamento"],
    availableFrom: "2006",
    methodology: "Encuesta Continua de Hogares (ECH) del INE.",
    isCalculated: false,
    reading: "neutral",
    decimals: 1,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  // ── Economía ───────────────────────────────────────────────
  {
    id: "inflacion-interanual",
    slug: "inflacion",
    name: "Inflación interanual",
    question: "¿Cuánto subieron los precios en el último año?",
    description:
      "Variación del Índice de Precios del Consumo (IPC) respecto al mismo mes del año anterior.",
    plainDefinition:
      "Cuánto subieron los precios de una canasta de bienes y servicios respecto al mismo mes del año anterior.",
    category: "economia",
    unit: "%",
    unitLabel: "variación respecto al mismo mes del año anterior",
    sourceId: "ine",
    sourceUrl: "https://www7.ine.gub.uy/Dashboard-IPC/",
    periodicity: "mensual",
    geographicLevel: ["pais"],
    availableFrom: "1998",
    methodology: "Índice de Precios del Consumo (IPC) del INE, base 2022.",
    isCalculated: false,
    reading: "neutral",
    decimals: 2,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  {
    id: "pib-variacion",
    slug: "pib",
    name: "Variación del PIB",
    question: "¿Creció o se achicó la economía?",
    description:
      "Variación real del Producto Interno Bruto respecto al mismo trimestre del año anterior.",
    plainDefinition:
      "Mide si la economía produjo más o menos que en el mismo período del año anterior, descontando el efecto de los precios.",
    category: "economia",
    unit: "%",
    unitLabel: "variación real interanual",
    sourceId: "bcu",
    sourceUrl:
      "https://www.bcu.gub.uy/Estadisticas-e-Indicadores/Paginas/Presentacion%20Cuentas%20Nacionales.aspx",
    periodicity: "trimestral",
    geographicLevel: ["pais"],
    availableFrom: "2016",
    methodology:
      "Cuentas Nacionales del BCU, base 2016, a precios constantes. La variación trimestral desestacionalizada es otra medida distinta: nunca se mezclan en un mismo gráfico.",
    isCalculated: false,
    reading: "neutral",
    decimals: 1,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  {
    id: "pib-per-capita",
    slug: "pib-per-capita",
    name: "PIB per cápita",
    question: "¿Cuánto produce la economía por persona?",
    description: "Producto Interno Bruto dividido por la población, en dólares corrientes.",
    plainDefinition:
      "El valor de todo lo que produce el país en un año, dividido por la cantidad de habitantes. En dólares corrientes (no descuenta inflación del dólar).",
    category: "economia",
    unit: "USD",
    unitLabel: "dólares corrientes por habitante",
    sourceId: "banco-mundial",
    sourceUrl: "https://datos.bancomundial.org/indicator/NY.GDP.PCAP.CD?locations=UY",
    periodicity: "anual",
    geographicLevel: ["pais"],
    availableFrom: "1960",
    methodology:
      "Serie del Banco Mundial (fuente secundaria internacional, comparable entre países). El dato oficial nacional surge de BCU + INE.",
    isCalculated: false,
    reading: "neutral",
    decimals: 0,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  {
    id: "salario-minimo",
    slug: "salario-minimo",
    name: "Salario mínimo nacional",
    question: "¿Cuál es el salario mínimo vigente?",
    description: "Salario mínimo nacional mensual fijado por decreto, a precios corrientes.",
    plainDefinition:
      "El sueldo mensual mínimo que puede pagarse legalmente por un trabajo a tiempo completo. Es un valor nominal: no descuenta la inflación.",
    category: "economia",
    unit: "pesos",
    unitLabel: "pesos corrientes por mes",
    sourceId: "mtss",
    sourceUrl:
      "https://www.gub.uy/ministerio-trabajo-seguridad-social/comunicacion/noticias/salario-minimo-nacional-24572-desde-1o-enero-2026",
    periodicity: "semestral",
    geographicLevel: ["pais"],
    availableFrom: "1969",
    methodology:
      "Fijado por decreto del Poder Ejecutivo. En 2026 el ajuste fue en dos tramos: $24.572 desde enero y $25.383 desde julio. Valores a precios corrientes (nominales).",
    isCalculated: false,
    reading: "neutral",
    decimals: 0,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  {
    id: "indice-medio-salarios",
    slug: "salarios",
    name: "Índice medio de salarios",
    question: "¿Cuánto subieron los salarios en el último año?",
    description:
      "Variación interanual del Índice Medio de Salarios (IMS), a valores nominales.",
    plainDefinition:
      "Mide cuánto subieron en promedio los salarios respecto al mismo mes del año anterior, sin descontar la inflación. Para saber si el salario 'le ganó' a los precios hay que compararlo con la inflación.",
    category: "economia",
    unit: "%",
    unitLabel: "variación nominal interanual",
    sourceId: "ine",
    sourceUrl:
      "https://www.gub.uy/instituto-nacional-estadistica/tematica/ims-indice-medio-salarios",
    periodicity: "mensual",
    geographicLevel: ["pais"],
    availableFrom: "1968",
    methodology: "Índice Medio de Salarios del INE. Valores nominales.",
    isCalculated: false,
    reading: "neutral",
    decimals: 2,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  // ── Sociedad ───────────────────────────────────────────────
  {
    id: "pobreza-personas",
    slug: "pobreza",
    name: "Pobreza (personas)",
    shortName: "Pobreza",
    question: "¿Qué parte de la población vive en situación de pobreza?",
    description:
      "Porcentaje de personas bajo la línea de pobreza, según la metodología vigente del INE.",
    plainDefinition:
      "Porcentaje de personas cuyos hogares no alcanzan el ingreso necesario para cubrir una canasta básica de alimentos y otros bienes y servicios esenciales.",
    category: "sociedad",
    unit: "%",
    unitLabel: "por ciento de las personas",
    sourceId: "ine",
    sourceUrl:
      "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Pobreza/2025/Informe%20pobreza%20primer%20semestre%202025.html",
    periodicity: "semestral",
    geographicLevel: ["pais", "departamento"],
    availableFrom: "2006",
    methodology:
      "ECH del INE. El dato nacional usa la metodología actualizada del INE (canasta de la ENGIH 2016-2017, adoptada en 2025). La apertura departamental disponible corresponde a 2023 con la metodología anterior (canasta 2006, cálculo del Observatorio Social del MIDES): ambas mediciones NO son comparables entre sí y esta plataforma nunca las mezcla en un mismo gráfico.",
    isCalculated: false,
    reading: "lowerIsBetter",
    decimals: 1,
    lastUpdated: "2026-08-25",
    status: "active",
  },
  // ── Planificados (sin datos todavía; la UI los muestra como "en preparación") ──
  {
    id: "ingreso-medio-hogar",
    slug: "ingreso",
    name: "Ingreso medio de los hogares",
    shortName: "Ingreso",
    question: "¿Cuánto ingresa por mes un hogar promedio?",
    description:
      "Ingreso medio mensual de los hogares por departamento (con valor locativo), según la ECH.",
    plainDefinition:
      "El ingreso total promedio que recibe un hogar por mes, incluyendo salarios, jubilaciones, otras fuentes y el valor locativo (lo que 'vale' vivir en una vivienda propia).",
    category: "economia",
    unit: "pesos",
    unitLabel: "pesos de 2023 por mes, con valor locativo",
    sourceId: "ine",
    sourceUrl:
      "https://www.gub.uy/ministerio-desarrollo-social/indicador/promedio-ingresos-del-hogar-valor-locativo-pesos-corrientes-segun-departamento-total-pais",
    periodicity: "anual",
    geographicLevel: ["departamento"],
    availableFrom: "2006",
    methodology:
      "ECH del INE, elaboración del Observatorio Social del MIDES. El nivel de esta serie difiere del de la serie nacional del INE (~+17-21%, metodología de ponderación propia): es útil para comparar departamentos entre sí, no como nivel oficial nacional. Serie 2006–2023.",
    isCalculated: false,
    reading: "higherIsBetter",
    decimals: 0,
    lastUpdated: "2026-08-26",
    status: "active",
  },
  {
    id: "informalidad",
    slug: "informalidad",
    name: "Informalidad laboral",
    shortName: "Informalidad",
    question: "¿Cuántos trabajadores están en la informalidad?",
    description:
      "Ocupación informal (medición ampliada de la OIT) como porcentaje del total de ocupados.",
    plainDefinition:
      "Porcentaje de personas ocupadas en la informalidad: principalmente quienes no aportan a la seguridad social por su trabajo, más otras formas de trabajo no registrado que define la OIT.",
    category: "trabajo",
    unit: "%",
    unitLabel: "por ciento de los ocupados",
    sourceId: "ine",
    sourceUrl:
      "https://www5.ine.gub.uy/documents/Demograf%C3%ADayEESS/HTML/ECH/Informalidad/Informe-caracterizaci%C3%B3n-puestos-de-trabajo-2025.html",
    periodicity: "anual",
    geographicLevel: ["pais", "departamento"],
    availableFrom: "2022",
    methodology:
      "ECH del INE, informe anual de informalidad. Medición ampliada de ocupación informal (OIT, 21.ª CIET): no registro a la seguridad social más otras formas de informalidad. Es algo más amplia que el 'no registro' clásico (2024: 22,7% ampliada vs 21,7% no registro).",
    isCalculated: false,
    reading: "lowerIsBetter",
    decimals: 1,
    lastUpdated: "2026-08-26",
    status: "active",
  },
];

export function getIndicator(idOrSlug: string): Indicator | undefined {
  return dictionary.find((i) => i.id === idOrSlug || i.slug === idOrSlug);
}

export const activeIndicators = dictionary.filter((i) => i.status === "active");
export const plannedIndicators = dictionary.filter((i) => i.status === "planned");
