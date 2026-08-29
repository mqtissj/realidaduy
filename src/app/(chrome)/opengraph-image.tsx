import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";
import { SITE_TAGLINE } from "@/lib/site";

export const alt = `realidad.uy — ${SITE_TAGLINE}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    title: SITE_TAGLINE,
    meta: "Mapas, indicadores, elecciones y comparaciones por departamento y municipio.",
  });
}
