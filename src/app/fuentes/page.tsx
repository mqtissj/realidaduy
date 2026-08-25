import type { Metadata } from "next";
import { sources } from "@/data/sources";
import { dictionary } from "@/data/dictionary";
import { getSource } from "@/data/sources";
import { DemoBadge, StatusBadge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Fuentes y metodología",
  description:
    "De dónde salen los datos de Uruguay Data: organismos oficiales, diccionario de indicadores, tipos de dato y proceso de validación.",
};

const LEVEL_ICON: Record<string, string> = {
  pais: "País",
  departamento: "Departamento",
  municipio: "Municipio",
};

export default function FuentesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Fuentes y metodología</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Ningún dato de esta plataforma es propio: todo proviene de fuentes públicas
        identificadas. Acá está el detalle de cada organismo, cada indicador y cómo se
        valida un dato antes de publicarse.
      </p>

      <section aria-labelledby="organismos" className="mt-8">
        <h2 id="organismos" className="font-display text-2xl font-bold">Organismos fuente</h2>
        <ul className="mt-4 space-y-3">
          {sources.map((s) => (
            <li key={s.id} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{s.name}</h3>
                <a
                  className="text-sm font-semibold text-primary hover:underline"
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sitio oficial ↗
                </a>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{s.provides}</p>
              {s.type === "international" ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Fuente secundaria — solo series históricas comparables
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tipos" className="mt-10">
        <h2 id="tipos" className="font-display text-2xl font-bold">Tipos de dato</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            <dt><StatusBadge status="OFFICIAL" /></dt>
            <dd className="text-ink-soft">Publicado por el organismo oficial competente, sin transformación.</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt><StatusBadge status="CALCULATED" /></dt>
            <dd className="text-ink-soft">Derivado de datos oficiales con una fórmula documentada (p. ej. población municipal = suma de CCZ).</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt><StatusBadge status="SECONDARY" /></dt>
            <dd className="text-ink-soft">Fuente internacional que reproduce o estima datos del país (Banco Mundial). Solo para evolución histórica, nunca para titulares si existe dato oficial.</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt><StatusBadge status="ESTIMATED" /></dt>
            <dd className="text-ink-soft">Estimación metodológicamente documentada. No se usa en esta versión.</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt><StatusBadge status="UNAVAILABLE" /></dt>
            <dd className="text-ink-soft">No existe dato público para ese territorio o período: la plataforma lo dice en lugar de estimar.</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <dt><DemoBadge /></dt>
            <dd className="text-ink-soft">
              El valor proviene de investigación verificada (prensa que cita al organismo, o
              fuente aún no cotejada a mano) y está pendiente de validación final contra el
              boletín oficial. Desaparece cuando una persona verifica el dato en la fuente.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="diccionario" className="mt-10">
        <h2 id="diccionario" className="font-display text-2xl font-bold">Diccionario de indicadores</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Diccionario de indicadores de la plataforma</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Indicador</th>
                <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Unidad</th>
                <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Fuente</th>
                <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Frecuencia</th>
                <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Nivel</th>
                <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Estado</th>
              </tr>
            </thead>
            <tbody>
              {dictionary.map((i) => (
                <tr key={i.id}>
                  <td className="border-b border-line px-2 py-1.5 font-semibold">{i.name}</td>
                  <td className="border-b border-line px-2 py-1.5">{i.unit}</td>
                  <td className="border-b border-line px-2 py-1.5">{getSource(i.sourceId)?.shortName}</td>
                  <td className="border-b border-line px-2 py-1.5">{i.periodicity}</td>
                  <td className="border-b border-line px-2 py-1.5">
                    {i.geographicLevel.map((l) => LEVEL_ICON[l]).join(" · ")}
                  </td>
                  <td className="border-b border-line px-2 py-1.5">
                    {i.status === "active" ? "Activo" : "En preparación"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="validacion" className="mt-10">
        <h2 id="validacion" className="font-display text-2xl font-bold">
          ¿Cómo se valida un dato antes de publicarse?
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
          <li>Se verifica la fuente (organismo competente y URL del dato concreto).</li>
          <li>Se verifica el período y la unidad contra la publicación original.</li>
          <li>Se verifica el territorio (códigos ISO 3166-2 para departamentos).</li>
          <li>Se detectan valores faltantes: nunca se rellenan con ceros ni estimaciones propias.</li>
          <li>Se detectan valores atípicos y se contrastan con la fuente.</li>
          <li>
            Se registran los cambios metodológicos (rediseño de la ECH 2021, nueva medición
            de pobreza 2025, cambio de base del PIB): las series no comparables nunca se
            empalman en silencio.
          </li>
          <li>
            Recién entonces el dato pierde el distintivo &quot;Pendiente de validación&quot;.
          </li>
        </ol>
      </section>

      <section aria-labelledby="geo" className="mt-10">
        <h2 id="geo" className="font-display text-2xl font-bold">Límites territoriales</h2>
        <div className="mt-4 space-y-3 text-sm text-ink-soft">
          <p>
            <strong>Departamentos:</strong> GeoJSON oficial de IDE Uruguay / Servicio
            Geográfico Militar, publicado en catalogodatos.gub.uy bajo la Licencia de Datos
            Abiertos Uruguay. Geometría simplificada para la web (la precisión de los bordes
            se reduce; no usar para fines catastrales).
          </p>
          <p>
            <strong>Municipios de Montevideo:</strong> derivados de la cartografía censal del
            INE (Censo 2023) agrupando los Centros Comunales Zonales según la correspondencia
            oficial de la Intendencia de Montevideo. El shapefile oficial de la Intendencia
            estaba dañado en su servidor al momento de la ingesta (25/08/2026, documentado en
            el repositorio).
          </p>
        </div>
      </section>
    </div>
  );
}
