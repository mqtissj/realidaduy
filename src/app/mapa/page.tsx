import type { Metadata } from "next";
import MapExplorer from "@/components/map/MapExplorer";
import { departmentSummaries } from "@/lib/data/summaries";

export const metadata: Metadata = {
  title: "Explorá Uruguay — Mapa interactivo",
  description:
    "Mapa interactivo de los 19 departamentos de Uruguay: población del Censo 2023 y partido de gobierno de cada departamento.",
};

export default function MapaPage() {
  const territories = departmentSummaries();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Explorá Uruguay</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Tocá un departamento para ver su resumen. Elegí qué mostrar: población o partido de
        gobierno.
      </p>
      <div className="mt-6">
        <MapExplorer
          territories={territories}
          geoUrl="/geo/departamentos.json"
          profileBase="/departamentos"
          mapTitle="Mapa de los 19 departamentos de Uruguay"
        />
      </div>
      <p className="mt-6 text-xs text-ink-faint">
        Límites: IDE / Servicio Geográfico Militar vía catalogodatos.gub.uy (Licencia de
        Datos Abiertos Uruguay). Población: INE, Censo 2023. Gobierno: Corte Electoral,
        elecciones departamentales 2025.
      </p>
    </div>
  );
}
