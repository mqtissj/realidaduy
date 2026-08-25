// Resúmenes serializables para componentes cliente (mapa, comparador).

import { departments, montevideoMunicipalities } from "@/data/territories";
import { getGovernment, getParty } from "@/data/elections";
import { getLatest } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export interface TerritorySummary {
  id: string;
  slug: string;
  name: string;
  capital?: string;
  level: "departamento" | "municipio";
  poblacion?: { value: number; display: string; demo: boolean; periodLabel: string };
  gov?: {
    partyId: string;
    partyName: string;
    partyShort: string;
    color: string;
    electedName?: string;
    demo: boolean;
  };
}

function summarize(
  territory: { id: string; slug: string; name: string; capital?: string },
  level: "departamento" | "municipio"
): TerritorySummary {
  const pobla = getLatest("poblacion", territory.id);
  const gov = getGovernment(territory.id);
  const party = gov ? getParty(gov.partyId) : undefined;
  return {
    id: territory.id,
    slug: territory.slug,
    name: territory.name,
    capital: territory.capital,
    level,
    poblacion:
      pobla && pobla.obs.value !== null
        ? {
            value: pobla.obs.value,
            display: formatNumber(pobla.obs.value, 0),
            demo: pobla.obs.demo,
            periodLabel: pobla.obs.periodLabel,
          }
        : undefined,
    gov:
      gov && party
        ? {
            partyId: party.id,
            partyName: party.name,
            partyShort: party.shortName,
            color: party.color,
            electedName: gov.electedName,
            demo: gov.demo,
          }
        : undefined,
  };
}

export function departmentSummaries(): TerritorySummary[] {
  return departments.map((d) => summarize(d, "departamento"));
}

export function municipioSummaries(): TerritorySummary[] {
  return montevideoMunicipalities.map((m) => summarize(m, "municipio"));
}
