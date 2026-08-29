/* eslint-disable @next/next/no-img-element */
// Generador de las imágenes de vista previa (Open Graph / Twitter Card).
//
// Es lo que se ve cuando alguien pega un link de realidad.uy en WhatsApp, X,
// LinkedIn o Slack. Se renderizan en el build (una por página), así que el
// costo en producción es cero.
//
// Satori (el motor detrás de ImageResponse) soporta un subconjunto de CSS:
// solo flexbox, sin grid, y todo div con más de un hijo necesita display:flex.

import { ImageResponse } from "next/og";
import { SITE_HOST } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const NAVY = "#1e3a5f";
const CELESTE = "#7fa3c4";
const CELESTE_SOFT = "#dde7f1";

export interface OgContent {
  /** Línea chica de arriba: "Indicador", "Departamento", "Elecciones". */
  eyebrow?: string;
  /** Título principal (2 líneas como máximo a este tamaño). */
  title: string;
  /** Dato destacado, ya formateado ("8,2 %"). */
  value?: string;
  /** Qué es ese dato: unidad, período y fuente. */
  valueLabel?: string;
  /** Pie: período, fuente, alcance. */
  meta?: string;
}

/** Barras decorativas, el mismo motivo que el favicon. */
function Bars() {
  const heights = [58, 96, 140, 112, 180];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: 34,
            height: h,
            borderRadius: 10,
            background: i === heights.length - 1 ? "#ffffff" : CELESTE,
            opacity: i === heights.length - 1 ? 1 : 0.35 + i * 0.13,
          }}
        />
      ))}
    </div>
  );
}

export function renderOgImage(content: OgContent): ImageResponse {
  const { eyebrow, title, value, valueLabel, meta } = content;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "60px 64px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em" }}>
              realidad
            </span>
            <span style={{ fontSize: 40, fontWeight: 800, color: CELESTE }}>.uy</span>
          </div>
          {eyebrow ? (
            <div
              style={{
                display: "flex",
                borderRadius: 999,
                border: `2px solid ${CELESTE}`,
                padding: "8px 22px",
                fontSize: 22,
                fontWeight: 600,
                color: CELESTE_SOFT,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {eyebrow}
            </div>
          ) : null}
        </div>

        {/* Cuerpo */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: value ? 660 : 900 }}>
            <div
              style={{
                fontSize: title.length > 60 ? 56 : 66,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            {meta ? (
              <div style={{ marginTop: 26, fontSize: 26, color: CELESTE_SOFT, lineHeight: 1.35 }}>
                {meta}
              </div>
            ) : null}
          </div>

          {value ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                textAlign: "right",
                maxWidth: 400,
              }}
            >
              <div style={{ fontSize: 118, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em" }}>
                {value}
              </div>
              {valueLabel ? (
                <div style={{ marginTop: 12, fontSize: 24, color: CELESTE_SOFT, lineHeight: 1.3 }}>
                  {valueLabel}
                </div>
              ) : null}
            </div>
          ) : (
            <Bars />
          )}
        </div>

        {/* Pie */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid rgba(255,255,255,0.18)`,
            paddingTop: 24,
            fontSize: 24,
            color: CELESTE_SOFT,
          }}
        >
          <span>Datos públicos con fuente, período y metodología a la vista</span>
          <span style={{ fontWeight: 700, color: "#ffffff" }}>{SITE_HOST}</span>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
