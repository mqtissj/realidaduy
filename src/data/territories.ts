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

// 8 municipios de Montevideo.
export const montevideoMunicipalities: Territory[] = [
  { id: "UY-MO-A", slug: "a", name: "Municipio A", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-B", slug: "b", name: "Municipio B", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-C", slug: "c", name: "Municipio C", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-CH", slug: "ch", name: "Municipio CH", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-D", slug: "d", name: "Municipio D", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-E", slug: "e", name: "Municipio E", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-F", slug: "f", name: "Municipio F", level: "municipio", parentId: "UY-MO" },
  { id: "UY-MO-G", slug: "g", name: "Municipio G", level: "municipio", parentId: "UY-MO" },
];

export const allTerritories: Territory[] = [uruguay, ...departments, ...montevideoMunicipalities];

export function getTerritoryById(id: string): Territory | undefined {
  return allTerritories.find((t) => t.id === id);
}

export function getDepartmentBySlug(slug: string): Territory | undefined {
  return departments.find((t) => t.slug === slug);
}

export function getMunicipalityBySlug(slug: string): Territory | undefined {
  return montevideoMunicipalities.find((t) => t.slug === slug);
}
