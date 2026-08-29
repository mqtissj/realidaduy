import type { Metadata } from "next";

// Las piezas insertables no llevan cabecera, pie ni navegación: viven dentro
// del iframe de otro sitio. Tampoco se indexan: el contenido canónico está en
// la página del sitio a la que apuntan.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
