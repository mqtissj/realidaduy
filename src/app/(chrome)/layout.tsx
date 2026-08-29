import SiteChrome from "@/components/layout/SiteChrome";

// Route group: no cambia ninguna URL, solo separa las páginas del sitio (con
// cabecera y pie) de las de inserción /embed/…, que viven dentro de un iframe.
export default function ChromeLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
