import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";

/**
 * Marco del sitio: cabecera, pie y navegación inferior.
 * Lo usan el route group (chrome) y la página 404; las páginas de inserción
 * (/embed/…) deliberadamente no lo usan: van dentro del iframe de un medio.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:text-primary"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1 pb-24 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
