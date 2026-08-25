import type { Metadata } from "next";
import Link from "next/link";
import { departmentSummaries } from "@/lib/data/summaries";
import { PartyBadge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Departamentos de Uruguay",
  description:
    "Los 19 departamentos de Uruguay: población, capital y gobierno departamental, con perfiles completos.",
};

export default function DepartamentosPage() {
  const departments = departmentSummaries();
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Departamentos</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Los 19 departamentos de Uruguay. Cada perfil reúne población, política y los datos
        disponibles, siempre con su fuente.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "es"))
          .map((d) => (
            <li key={d.id}>
              <Link
                href={`/departamentos/${d.slug}`}
                className="flex h-full flex-col rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-celeste"
              >
                <h2 className="font-display text-xl font-bold text-ink">{d.name}</h2>
                <p className="text-sm text-ink-faint">Capital: {d.capital}</p>
                <p className="tnum mt-2 text-lg font-bold text-ink">
                  {d.poblacion?.display ?? "—"}{" "}
                  <span className="text-sm font-normal text-ink-faint">hab. (Censo 2023)</span>
                </p>
                <div className="mt-2">
                  {d.gov ? <PartyBadge color={d.gov.color} name={d.gov.partyShort} /> : null}
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
