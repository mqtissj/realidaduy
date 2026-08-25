"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  inicio: (
    <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  ),
  mapa: (
    <path
      d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Zm0 0v14m6-12v14"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  indicadores: (
    <path d="M4 20V10m5.5 10V4M15 20v-7m5.5 7V8" strokeWidth={1.8} strokeLinecap="round" />
  ),
  comparar: (
    <path d="M8 7h12m0 0-4-3.5M20 7l-4 3.5M16 17H4m0 0 4-3.5M4 17l4 3.5" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  ),
  mas: (
    <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth={3} strokeLinecap="round" />
  ),
};

const ITEMS = [
  { href: "/", label: "Inicio", icon: "inicio" },
  { href: "/mapa", label: "Mapa", icon: "mapa" },
  { href: "/indicadores", label: "Indicadores", icon: "indicadores" },
  { href: "/comparar", label: "Comparar", icon: "comparar" },
  { href: "/mas", label: "Más", icon: "mas" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegación inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                  active ? "text-primary" : "text-ink-faint"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6" aria-hidden>
                  {ICONS[item.icon]}
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
