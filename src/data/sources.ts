import type { Source } from "@/lib/types";

// Estrategia completa en docs/06-fuentes.md.
export const sources: Source[] = [
  {
    id: "ine",
    name: "Instituto Nacional de Estadística",
    shortName: "INE",
    url: "https://www.gub.uy/instituto-nacional-estadistica/",
    type: "official",
    provides:
      "Empleo, desempleo, ingresos y pobreza (ECH), inflación (IPC), salarios (IMS) y Censo 2023.",
  },
  {
    id: "bcu",
    name: "Banco Central del Uruguay",
    shortName: "BCU",
    url: "https://www.bcu.gub.uy/",
    type: "official",
    provides: "PIB y cuentas nacionales trimestrales, sector externo, tipo de cambio.",
  },
  {
    id: "corte-electoral",
    name: "Corte Electoral",
    shortName: "Corte Electoral",
    url: "https://www.gub.uy/corte-electoral/",
    type: "official",
    provides: "Resultados de elecciones nacionales, departamentales y municipales; participación.",
  },
  {
    id: "mtss",
    name: "Ministerio de Trabajo y Seguridad Social",
    shortName: "MTSS",
    url: "https://www.gub.uy/ministerio-trabajo-seguridad-social/",
    type: "official",
    provides: "Salario mínimo nacional (decretos).",
  },
  {
    id: "mi",
    name: "Ministerio del Interior",
    shortName: "M. Interior",
    url: "https://www.gub.uy/ministerio-interior/",
    type: "official",
    provides:
      "Delitos denunciados (homicidios, rapiñas, hurtos) — microdatos abiertos 2013→presente, actualizados trimestralmente.",
  },
  {
    id: "opp",
    name: "Oficina de Planeamiento y Presupuesto — Observatorio Territorio Uruguay",
    shortName: "OPP",
    url: "https://www.opp.gub.uy/",
    type: "official",
    provides: "Indicadores territoriales por departamento y municipio.",
  },
  {
    id: "banco-mundial",
    name: "Banco Mundial — Indicadores de Desarrollo Mundial",
    shortName: "Banco Mundial",
    url: "https://datos.bancomundial.org/pais/uruguay",
    type: "international",
    provides:
      "Series históricas anuales comparables (PIB per cápita, inflación, desempleo OIT). Fuente secundaria: se usa solo para evolución histórica y siempre se etiqueta como tal.",
  },
];

export function getSource(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}
