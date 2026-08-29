// Identidad y URL canónica del sitio, en un único lugar.
//
// El dominio canónico es realidad.uy. Metadata, OG, sitemap, robots, el pie de
// marca de las imágenes y los códigos de inserción lo toman de este módulo: no
// hay ninguna URL escrita a mano en el resto del código.
//
// Para publicar bajo otro dominio (una vista previa de Vercel, un entorno de
// pruebas) alcanza con definir NEXT_PUBLIC_SITE_URL en ese entorno.

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://realidad.uy";

/** URL canónica sin barra final ("https://realidad.uy"). */
export const SITE_URL = rawUrl.replace(/\/+$/, "");

/** Host para mostrar en imágenes y pies de marca ("realidad.uy"). */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export const SITE_NAME = "realidad.uy";

export const SITE_TAGLINE = "Entendé Uruguay, territorio por territorio";

export const SITE_DESCRIPTION =
  "Explorá la realidad política, económica y social de Uruguay con datos públicos verificables: mapas, indicadores, elecciones y comparaciones por departamento y municipio.";

/** URL absoluta a partir de una ruta interna ("/indicadores" → "https://…/indicadores"). */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
