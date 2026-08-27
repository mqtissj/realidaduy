import type { Metadata } from "next";
import Link from "next/link";
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
        Elegí qué mostrar con los botones de arriba del mapa y tocá un departamento para ver
        su resumen completo.
      </p>

      <nav aria-label="Nivel territorial" className="mt-4 inline-flex rounded-xl border border-line bg-surface p-1 shadow-card">
        <span
          aria-current="page"
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
        >
          Departamentos
        </span>
        <Link
          href="/mapa/municipios"
          className="pressable rounded-lg px-3 py-1.5 text-sm font-semibold text-ink-soft hover:text-primary"
        >
          Municipios
        </Link>
      </nav>

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
        Datos Abiertos Uruguay). Población: INE, Censo 2023. Desempleo, pobreza e
        informalidad: ECH del INE (elaboraciones INE y Observatorio Social del MIDES).
        Gobierno: Corte Electoral, elecciones departamentales 2025. Cada indicador tiene su
        metodología en su propia página.
      </p>
    </div>
  );
}
