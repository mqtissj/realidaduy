import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_PUBLISHED,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";
import "./globals.css";

// Las fuentes viven en src/app/fonts (subconjunto latin de Google Fonts, licencia
// OFL) en vez de bajarse de Google en cada build: a veces Google responde con
// links sin extensión (fonts.gstatic.com/l/font?kit=…) y next/font/google corta
// el build con "Cannot read properties of null (reading '1')". Son archivos
// variables: uno por familia cubre todos los pesos que usa el sitio.
const bricolage = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  weight: "500 800",
  variable: "--font-bricolage",
});

const sourceSans = localFont({
  src: "./fonts/source-sans-3-latin.woff2",
  weight: "400 700",
  variable: "--font-source-sans",
});

// metadataBase resuelve las URLs relativas (canónica, OG, sitemap) contra el
// dominio real: sin esto, los links compartidos viajan sin vista previa.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // "./" se resuelve contra la ruta de cada página: cada una es su propia
  // canónica. Con "/" todas apuntaban al inicio, y Google las trataba como
  // copias de la portada y no las indexaba.
  alternates: { canonical: "./" },
  keywords: [
    "Uruguay",
    "datos abiertos",
    "estadísticas",
    "INE",
    "departamentos",
    "municipios",
    "elecciones",
    "indicadores",
  ],
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  publisher: SITE_AUTHOR,
  // La imagen se declara acá, y no por la convención de archivo
  // opengraph-image, porque esa emite og:image:alt y og:image:type ANTES de
  // og:image: fuera del orden que manda el spec de Open Graph, y los
  // rastreadores estrictos (LinkedIn) descartan la imagen.
  openGraph: {
    type: "article",
    locale: "es_UY",
    siteName: SITE_NAME,
    url: "./",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    publishedTime: SITE_PUBLISHED,
    authors: [SITE_AUTHOR],
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Las variables de fuente van en <html>: globals.css (@theme) arma --font-body y
// --font-display en :root a partir de ellas. Puestas en <body>, en :root no
// existían, esas dos variables quedaban inválidas y todo el sitio caía a la
// fuente del sistema.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bricolage.variable} ${sourceSans.variable}`}>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
