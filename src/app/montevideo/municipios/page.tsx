import type { Metadata } from "next";
import Link from "next/link";
import MapExplorer from "@/components/map/MapExplorer";
import { municipioSummaries } from "@/lib/data/summaries";
import { PartyBadge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Montevideo por municipios",
  description:
    "Los 8 municipios de Montevideo (A, B, C, CH, D, E, F y G): alcaldes electos en 2025, partido de gobierno y población del Censo 2023.",
};

export default function MunicipiosPage() {
  const municipios = municipioSummaries();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <nav aria-label="Miga de pan" className="text-sm text-ink-faint">
        <Link className="hover:text-primary" href="/departamentos/montevideo">
          Montevideo
        </Link>{" "}
        / <span className="text-ink-soft">Municipios</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
        Montevideo por municipios
      </h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        La capital se divide en 8 municipios: A, B, C, CH, D, E, F y G. Tocá uno en el mapa
        para ver su gobierno y su población.
      </p>

      <div className="mt-6">
        <MapExplorer
          territories={municipios}
          geoUrl="/geo/municipios-montevideo.json"
          profileBase={null}
          mapTitle="Mapa de los 8 municipios de Montevideo"
          defaultMode="gobierno"
        />
      </div>

      <section aria-labelledby="lista-municipios" className="mt-10">
        <h2 id="lista-municipios" className="font-display text-2xl font-bold">
          Los 8 municipios
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {municipios.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-line bg-surface p-4 shadow-card"
            >
              <h3 className="font-display text-xl font-bold">{m.name}</h3>
              <p className="tnum mt-1 text-lg font-bold">
                {m.poblacion?.display ?? "—"}{" "}
                <span className="text-sm font-normal text-ink-faint">hab.</span>
              </p>
              {m.gov ? (
                <div className="mt-2 space-y-1 text-sm">
                  <PartyBadge color={m.gov.color} name={m.gov.partyShort} />
                  <p>
                    Alcalde/sa: <span className="font-semibold">{m.gov.electedName}</span>
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/comparar?nivel=municipio"
            className="pressable rounded-lg bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Comparar municipios
          </Link>
        </div>
      </section>

      <details className="fold mt-8 rounded-2xl border border-line bg-surface px-4 py-3">
        <summary className="text-sm font-semibold text-primary">
          ¿De dónde salen estos datos?
        </summary>
        <div className="mt-3 space-y-2 text-sm text-ink-soft">
          <p>
            <strong>Límites y población:</strong> derivados de la cartografía censal oficial
            del INE (Censo 2023, capa de Centros Comunales Zonales de Montevideo), agrupando
            los 18 CCZ según la correspondencia oficial de la Intendencia (Municipio A = CCZ
            14, 17 y 18; B = 1 y 2; C = 3, 15 y 16; CH = 4 y 5; D = 10 y 11; E = 6, 7 y 8;
            F = 9; G = 12 y 13). La población municipal es la suma de los CCZ y cubre a las
            personas en viviendas particulares (difiere 0,23% del total departamental).
          </p>
          <p>
            <strong>Alcaldes y partidos:</strong> elecciones municipales del 11 de mayo de
            2025; pendiente de validación final contra los archivos de la Corte Electoral.
          </p>
          <p>
            El shapefile oficial de límites municipales de la Intendencia de Montevideo
            estaba dañado en el servidor al momento de la ingesta (25/08/2026); se documentó
            el problema y se usará cuando esté reparado.
          </p>
        </div>
      </details>
    </div>
  );
}
