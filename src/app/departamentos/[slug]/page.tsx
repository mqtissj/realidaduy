import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { departments, getDepartmentBySlug } from "@/data/territories";
import { getGovernment, getParty, turnout } from "@/data/elections";
import { getIndicator } from "@/data/dictionary";
import { getLatest } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { DemoBadge, PartyBadge, StatusBadge } from "@/components/ui/Badge";
import SourceNote from "@/components/ui/SourceNote";
import StateView from "@/components/ui/StateView";

export function generateStaticParams() {
  return departments.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dept = getDepartmentBySlug(slug);
  if (!dept) return {};
  return {
    title: `${dept.name} — Perfil territorial`,
    description: `Datos públicos de ${dept.name}: población del Censo 2023, gobierno departamental 2025 y más, con fuentes verificables.`,
  };
}

export default async function DepartmentProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dept = getDepartmentBySlug(slug);
  if (!dept) notFound();

  const poblacion = getLatest("poblacion", dept.id);
  const poblacionUY = getLatest("poblacion", "UY");
  const indicadorPoblacion = getIndicator("poblacion")!;
  const gov = getGovernment(dept.id);
  const party = gov ? getParty(gov.partyId) : undefined;
  const turnout2025 = turnout.find((t) => t.electionId === "departamental-2025");
  const share =
    poblacion?.obs.value && poblacionUY?.obs.value
      ? (poblacion.obs.value / poblacionUY.obs.value) * 100
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <nav aria-label="Miga de pan" className="text-sm text-ink-faint">
        <Link className="hover:text-primary" href="/departamentos">
          Departamentos
        </Link>{" "}
        / <span className="text-ink-soft">{dept.name}</span>
      </nav>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold md:text-5xl">{dept.name}</h1>
          <p className="mt-1 text-ink-faint">Capital: {dept.capital}</p>
        </div>
        <Link
          href={`/comparar?a=${dept.slug}`}
          className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-celeste"
        >
          Comparar con otro territorio
        </Link>
      </div>

      {/* Panorama */}
      <section aria-labelledby="panorama" className="mt-8">
        <h2 id="panorama" className="font-display text-2xl font-bold">
          Panorama
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <p className="text-sm font-bold text-ink-soft">Población</p>
            {poblacion?.obs.value ? (
              <>
                <p className="tnum mt-1 font-display text-3xl font-bold">
                  {formatNumber(poblacion.obs.value)}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {poblacion.obs.periodLabel} · INE
                  {share !== null ? ` · ${formatNumber(share, 1)}% del país` : ""}
                </p>
              </>
            ) : (
              <StateView kind="nodata" compact />
            )}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:col-span-2">
            <p className="text-sm font-bold text-ink-soft">Gobierno departamental</p>
            {gov && party ? (
              <div className="mt-2 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <PartyBadge color={party.color} name={party.name} />
                  {gov.demo ? <DemoBadge /> : null}
                </div>
                <p className="text-lg">
                  Intendente: <span className="font-bold">{gov.electedName}</span>
                </p>
                <p className="text-xs text-ink-faint">
                  Elecciones departamentales del 11 de mayo de 2025 · Corte Electoral
                </p>
              </div>
            ) : (
              <StateView kind="nodata" compact />
            )}
          </div>
        </div>
      </section>

      {/* Política */}
      <section aria-labelledby="politica" className="mt-10">
        <h2 id="politica" className="font-display text-2xl font-bold">
          Política
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <h3 className="font-display text-lg font-bold">Elección departamental 2025</h3>
            {gov && party ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Lema ganador</dt>
                  <dd className="font-semibold">{party.name}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Intendente electo</dt>
                  <dd className="font-semibold">{gov.electedName}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Participación nacional</dt>
                  <dd className="tnum font-semibold">
                    {turnout2025 ? `${formatNumber(turnout2025.pct, 2)}%` : "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <StateView kind="nodata" compact />
            )}
            <p className="mt-3 text-xs text-ink-faint">
              El desglose de votos y porcentajes por departamento se ingerirá desde los
              archivos oficiales de la Corte Electoral (escrutinio primario 2025).
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <h3 className="font-display text-lg font-bold">Resultados por departamento 2024</h3>
            <div className="mt-3">
              <StateView
                kind="pending"
                detail="Los resultados de la elección nacional 2024 desagregados por departamento se ingerirán desde los datos abiertos de la Corte Electoral. Los resultados nacionales están en la sección Elecciones."
                compact
              />
            </div>
            <Link
              href="/elecciones"
              className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Ver resultados nacionales →
            </Link>
          </div>
        </div>
      </section>

      {/* Datos departamentales pendientes — honestidad ante todo (brief §27) */}
      <section aria-labelledby="datos-dept" className="mt-10">
        <h2 id="datos-dept" className="font-display text-2xl font-bold">
          Economía y sociedad
        </h2>
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="UNAVAILABLE" />
            <p className="text-sm font-semibold text-ink-soft">
              Apertura departamental pendiente de ingesta
            </p>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            El INE publica desempleo, empleo, ingreso de los hogares y pobreza con apertura
            departamental (ECH, frecuencia anual). Esos datos todavía no fueron ingeridos en
            la plataforma: antes de mostrarlos, cada serie pasa por el proceso de validación
            documentado en <Link className="font-semibold text-primary hover:underline" href="/fuentes">Fuentes</Link>.
            Mientras tanto podés ver los valores nacionales en{" "}
            <Link className="font-semibold text-primary hover:underline" href="/indicadores">
              Indicadores
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Fuente */}
      <section aria-labelledby="fuente" className="mt-10">
        <h2 id="fuente" className="sr-only">
          Fuente de los datos
        </h2>
        <SourceNote indicator={indicadorPoblacion} obs={poblacion?.obs} />
      </section>
    </div>
  );
}
