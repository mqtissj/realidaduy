import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Más secciones",
};

const LINKS = [
  { href: "/departamentos", title: "Departamentos", body: "Perfiles de los 19 departamentos." },
  { href: "/montevideo/municipios", title: "Municipios de Montevideo", body: "Los 8 municipios de la capital." },
  { href: "/elecciones", title: "Elecciones", body: "¿Cómo votó Uruguay? 2024 y 2025." },
  { href: "/fuentes", title: "Fuentes y metodología", body: "De dónde sale cada dato." },
];

export default function MasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="font-display text-3xl font-bold">Más secciones</h1>
      <ul className="mt-6 space-y-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-2xl border border-line bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-celeste"
            >
              <p className="font-display text-lg font-bold text-ink">{l.title}</p>
              <p className="text-sm text-ink-soft">{l.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
