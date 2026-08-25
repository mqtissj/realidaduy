import type { Metadata } from "next";
import {
  elections,
  electionResults,
  getElectionResults,
  getParty,
  turnout,
} from "@/data/elections";
import { departments, montevideoMunicipalities } from "@/data/territories";
import { formatNumber } from "@/lib/format";
import { DemoBadge, PartyBadge } from "@/components/ui/Badge";
import { CategoricalLegend } from "@/components/map/MapLegend";
import ChoroplethMap from "@/components/map/ChoroplethMap";
import StateView from "@/components/ui/StateView";

export const metadata: Metadata = {
  title: "¿Cómo votó Uruguay?",
  description:
    "Resultados electorales de Uruguay: elección nacional 2024, balotaje y elecciones departamentales y municipales 2025, con mapas y datos completos.",
};

function PartyBars({ rows }: { rows: { name: string; color: string; pct: number; votes: number | null }[] }) {
  const max = Math.max(...rows.map((r) => r.pct), 1);
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div
          key={r.name}
          className="grid grid-cols-[10rem_1fr_auto] items-center gap-2 text-sm sm:grid-cols-[13rem_1fr_auto]"
        >
          <span className="truncate font-semibold">{r.name}</span>
          <span aria-hidden className="h-5 overflow-hidden rounded-r-sm bg-canvas">
            <span
              className="block h-full rounded-r-sm border-y border-r border-ink/10"
              style={{ width: `${Math.max((r.pct / max) * 100, 1.5)}%`, background: r.color }}
            />
          </span>
          <span className="tnum font-bold">{formatNumber(r.pct, 2)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function EleccionesPage() {
  const nacional = getElectionResults("nacional-2024", "UY").sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const balotaje = getElectionResults("balotaje-2024", "UY").sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const presidenteElecto = balotaje.find((r) => r.winner);

  const nacionalRows = nacional.map((r) => {
    const p = getParty(r.partyId)!;
    return { name: p.name, color: p.color, pct: r.pct ?? 0, votes: r.votes };
  });
  const sumaConocida = nacionalRows.reduce((s, r) => s + r.pct, 0);
  const otros = Math.max(0, 100 - sumaConocida);

  const deptWinners = departments.map((d) => {
    const winner = electionResults.find(
      (r) => r.electionId === "departamental-2025" && r.territoryId === d.id && r.winner
    );
    const party = winner ? getParty(winner.partyId) : undefined;
    return { dept: d, winner, party };
  });
  const deptEntries = Object.fromEntries(
    deptWinners.map(({ dept, winner, party }) => [
      dept.id,
      {
        fill: party?.color ?? "var(--color-line)",
        label: dept.name,
        sublabel: party ? `${party.name} · ${winner?.electedName ?? ""}` : "Sin datos",
      },
    ])
  );
  const deptParties = [...new Map(
    deptWinners
      .filter((w) => w.party)
      .map((w) => [w.party!.id, { color: w.party!.color, label: w.party!.name }])
  ).values()];

  const muniWinners = montevideoMunicipalities.map((m) => {
    const winner = electionResults.find(
      (r) => r.electionId === "municipal-2025" && r.territoryId === m.id && r.winner
    );
    const party = winner ? getParty(winner.partyId) : undefined;
    return { muni: m, winner, party };
  });
  const muniEntries = Object.fromEntries(
    muniWinners.map(({ muni, winner, party }) => [
      muni.id,
      {
        fill: party?.color ?? "var(--color-line)",
        label: muni.name,
        sublabel: party ? `${party.name} · ${winner?.electedName ?? ""}` : "Sin datos",
      },
    ])
  );
  const muniParties = [...new Map(
    muniWinners
      .filter((w) => w.party)
      .map((w) => [w.party!.id, { color: w.party!.color, label: w.party!.name }])
  ).values()];

  const turnoutFor = (id: string) => turnout.find((t) => t.electionId === id)?.pct;
  const eleccion2024 = elections.find((e) => e.id === "nacional-2024")!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">¿Cómo votó Uruguay?</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Resultados oficiales, sin interpretación: números, mapas y fuentes. Las conclusiones
        las sacás vos.
      </p>

      {/* Nacional 2024 */}
      <section aria-labelledby="nacional-2024" className="mt-8">
        <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
          <figcaption>
            <h2 id="nacional-2024" className="font-display text-2xl font-bold">
              Elección nacional 2024 — primera vuelta
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              27 de octubre de 2024 · Porcentajes sobre votos válidos · Participación:{" "}
              {formatNumber(turnoutFor("nacional-2024") ?? 0, 2)}% de los habilitados
            </p>
          </figcaption>
          <div className="mt-4">
            <PartyBars
              rows={[...nacionalRows, { name: "Otros partidos", color: "#8A8A8A", pct: otros, votes: null }]}
            />
          </div>
          <details className="fold mt-3">
            <summary className="text-sm font-semibold text-primary">Ver datos</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[360px] border-collapse text-sm">
                <caption className="sr-only">Resultados de la primera vuelta 2024</caption>
                <thead>
                  <tr>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Partido</th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-right font-bold text-ink-soft">Votos</th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-right font-bold text-ink-soft">% válidos</th>
                  </tr>
                </thead>
                <tbody>
                  {nacionalRows.map((r) => (
                    <tr key={r.name}>
                      <td className="border-b border-line px-2 py-1.5 font-semibold">{r.name}</td>
                      <td className="tnum border-b border-line px-2 py-1.5 text-right">
                        {r.votes ? formatNumber(r.votes) : "—"}
                      </td>
                      <td className="tnum border-b border-line px-2 py-1.5 text-right">
                        {formatNumber(r.pct, 2)}%
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border-b border-line px-2 py-1.5 font-semibold">Otros partidos</td>
                    <td className="tnum border-b border-line px-2 py-1.5 text-right">—</td>
                    <td className="tnum border-b border-line px-2 py-1.5 text-right">{formatNumber(otros, 2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
          <p className="mt-3 text-xs text-ink-faint">
            Fuente: Corte Electoral (
            <a className="underline" href={eleccion2024.sourceUrl} target="_blank" rel="noopener noreferrer">
              resultados oficiales
            </a>
            ). &quot;Otros partidos&quot; se calcula como el resto hasta 100% de los votos válidos.
          </p>
          <div className="mt-2"><DemoBadge /></div>
        </figure>
      </section>

      {/* Balotaje */}
      <section aria-labelledby="balotaje" className="mt-6">
        <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
          <figcaption>
            <h2 id="balotaje" className="font-display text-2xl font-bold">Balotaje 2024</h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              24 de noviembre de 2024 · Porcentajes sobre votos válidos (escrutinio
              definitivo) · Participación: {formatNumber(turnoutFor("balotaje-2024") ?? 0, 2)}%
            </p>
          </figcaption>
          <div className="mt-4">
            <PartyBars
              rows={balotaje.map((r) => {
                const p = getParty(r.partyId)!;
                return {
                  name: `${r.electedName} (${p.shortName})`,
                  color: p.color,
                  pct: r.pct ?? 0,
                  votes: r.votes,
                };
              })}
            />
          </div>
          {presidenteElecto ? (
            <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-sm">
              Fórmula ganadora: <strong>{presidenteElecto.electedName}</strong> (
              {getParty(presidenteElecto.partyId)?.name}), con{" "}
              <span className="tnum">{formatNumber(presidenteElecto.votes ?? 0)}</span> votos.
            </p>
          ) : null}
          <p className="mt-3 text-xs text-ink-faint">
            Los porcentajes sobre el total de votos emitidos (incluye en blanco y anulados)
            son distintos: 49,84% y 45,87%. Esta plataforma nunca mezcla las dos bases en un
            mismo gráfico.
          </p>
          <div className="mt-2"><DemoBadge /></div>
        </figure>
      </section>

      {/* Departamentales 2025 */}
      <section aria-labelledby="departamentales-2025" className="mt-6">
        <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
          <figcaption>
            <h2 id="departamentales-2025" className="font-display text-2xl font-bold">
              Departamentales 2025: ¿qué partido gobierna cada departamento?
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              11 de mayo de 2025 · Participación: {formatNumber(turnoutFor("departamental-2025") ?? 0, 2)}% ·
              Balance: PN 13 · FA 4 · PC 1 · CR 1
            </p>
          </figcaption>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <ChoroplethMap
                geoUrl="/geo/departamentos.json"
                entries={deptEntries}
                title="Partido ganador de la elección departamental 2025 en cada departamento"
              />
              <div className="mt-3">
                <CategoricalLegend items={deptParties} title="Lema ganador" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Intendentes electos por departamento, 2025</caption>
                <thead>
                  <tr>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Departamento</th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Intendente</th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Partido</th>
                  </tr>
                </thead>
                <tbody>
                  {deptWinners.map(({ dept, winner, party }) => (
                    <tr key={dept.id}>
                      <td className="border-b border-line px-2 py-1.5 font-semibold">{dept.name}</td>
                      <td className="border-b border-line px-2 py-1.5">{winner?.electedName ?? "—"}</td>
                      <td className="border-b border-line px-2 py-1.5">
                        {party ? <PartyBadge color={party.color} name={party.shortName} /> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Fuente: Corte Electoral (escrutinio primario 2025). El desglose de votos por
            departamento se ingerirá desde los archivos oficiales.
          </p>
          <div className="mt-2"><DemoBadge /></div>
        </figure>
      </section>

      {/* Municipales 2025 MVD */}
      <section aria-labelledby="municipales-2025" className="mt-6">
        <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
          <figcaption>
            <h2 id="municipales-2025" className="font-display text-2xl font-bold">
              Municipales 2025: los 8 municipios de Montevideo
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              11 de mayo de 2025 · Balance: FA 6 · CR 2
            </p>
          </figcaption>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <ChoroplethMap
                geoUrl="/geo/municipios-montevideo.json"
                entries={muniEntries}
                title="Partido ganador de la elección municipal 2025 en cada municipio de Montevideo"
              />
              <div className="mt-3">
                <CategoricalLegend items={muniParties} title="Lema ganador" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Alcaldes electos por municipio de Montevideo, 2025</caption>
                <thead>
                  <tr>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Municipio</th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Alcalde/sa</th>
                    <th scope="col" className="border-b-2 border-line px-2 py-1.5 text-left font-bold text-ink-soft">Partido</th>
                  </tr>
                </thead>
                <tbody>
                  {muniWinners.map(({ muni, winner, party }) => (
                    <tr key={muni.id}>
                      <td className="border-b border-line px-2 py-1.5 font-semibold">{muni.name}</td>
                      <td className="border-b border-line px-2 py-1.5">{winner?.electedName ?? "—"}</td>
                      <td className="border-b border-line px-2 py-1.5">
                        {party ? <PartyBadge color={party.color} name={party.shortName} /> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-faint">
            Fuente: Corte Electoral / prensa que reproduce el escrutinio. En el Municipio F la
            definición llegó tras el escrutinio de votos observados (581 votos de diferencia).
          </p>
          <div className="mt-2"><DemoBadge /></div>
        </figure>
      </section>

      {/* Histórico */}
      <section aria-labelledby="historico" className="mt-6">
        <h2 id="historico" className="font-display text-2xl font-bold">
          Historia electoral (1984–2019)
        </h2>
        <div className="mt-3">
          <StateView
            kind="pending"
            detail="Las elecciones históricas se ingerirán elección por elección desde la Corte Electoral y el catálogo nacional de datos abiertos, cada una con su propia validación."
          />
        </div>
      </section>
    </div>
  );
}
