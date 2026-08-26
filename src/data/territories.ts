import type { Territory } from "@/lib/types";

export const uruguay: Territory = {
  id: "UY",
  slug: "uruguay",
  name: "Uruguay",
  level: "pais",
};

// 19 departamentos — códigos ISO 3166-2:UY.
export const departments: Territory[] = [
  { id: "UY-AR", slug: "artigas", name: "Artigas", level: "departamento", capital: "Artigas" },
  { id: "UY-CA", slug: "canelones", name: "Canelones", level: "departamento", capital: "Canelones" },
  { id: "UY-CL", slug: "cerro-largo", name: "Cerro Largo", level: "departamento", capital: "Melo" },
  { id: "UY-CO", slug: "colonia", name: "Colonia", level: "departamento", capital: "Colonia del Sacramento" },
  { id: "UY-DU", slug: "durazno", name: "Durazno", level: "departamento", capital: "Durazno" },
  { id: "UY-FS", slug: "flores", name: "Flores", level: "departamento", capital: "Trinidad" },
  { id: "UY-FD", slug: "florida", name: "Florida", level: "departamento", capital: "Florida" },
  { id: "UY-LA", slug: "lavalleja", name: "Lavalleja", level: "departamento", capital: "Minas" },
  { id: "UY-MA", slug: "maldonado", name: "Maldonado", level: "departamento", capital: "Maldonado" },
  { id: "UY-MO", slug: "montevideo", name: "Montevideo", level: "departamento", capital: "Montevideo" },
  { id: "UY-PA", slug: "paysandu", name: "Paysandú", level: "departamento", capital: "Paysandú" },
  { id: "UY-RN", slug: "rio-negro", name: "Río Negro", level: "departamento", capital: "Fray Bentos" },
  { id: "UY-RV", slug: "rivera", name: "Rivera", level: "departamento", capital: "Rivera" },
  { id: "UY-RO", slug: "rocha", name: "Rocha", level: "departamento", capital: "Rocha" },
  { id: "UY-SA", slug: "salto", name: "Salto", level: "departamento", capital: "Salto" },
  { id: "UY-SJ", slug: "san-jose", name: "San José", level: "departamento", capital: "San José de Mayo" },
  { id: "UY-SO", slug: "soriano", name: "Soriano", level: "departamento", capital: "Mercedes" },
  { id: "UY-TA", slug: "tacuarembo", name: "Tacuarembó", level: "departamento", capital: "Tacuarembó" },
  { id: "UY-TT", slug: "treinta-y-tres", name: "Treinta y Tres", level: "departamento", capital: "Treinta y Tres" },
];

// Los 136 municipios del país (generados desde el desglose oficial 2025).
// Import relativo con extensión para que los scripts de Node puedan ejecutarlo.
import { municipalTerritories } from "./territorios-municipios.ts";

export { municipalTerritories };

/** Los 8 municipios de Montevideo (subconjunto con datos de población y mapa). */
export const montevideoMunicipalities: Territory[] = municipalTerritories.filter(
  (t) => t.parentId === "UY-MO"
);

export const allTerritories: Territory[] = [uruguay, ...departments, ...municipalTerritories];

/** Municipios de un departamento, ordenados alfabéticamente. */
export function municipalitiesOf(departmentId: string): Territory[] {
  return municipalTerritories
    .filter((t) => t.parentId === departmentId)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getTerritoryById(id: string): Territory | undefined {
  return allTerritories.find((t) => t.id === id);
}

export function getDepartmentBySlug(slug: string): Territory | undefined {
  return departments.find((t) => t.slug === slug);
}

export function getMunicipalityBySlug(slug: string): Territory | undefined {
  return montevideoMunicipalities.find((t) => t.slug === slug);
}
