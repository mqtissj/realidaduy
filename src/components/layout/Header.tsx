"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/departamentos", label: "Departamentos" },
  { href: "/indicadores", label: "Indicadores" },
  { href: "/elecciones", label: "Elecciones" },
  { href: "/comparar", label: "Comparar" },
  { href: "/fuentes", label: "Fuentes" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
            realidad<span className="text-celeste-deep">.uy</span>
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-widest text-ink-faint sm:inline">
            beta
          </span>
        </Link>
        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`pressable rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-ink-soft hover:bg-primary-soft/60 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
