"use client";

import ChoroplethMap, { type MapEntry } from "@/components/map/ChoroplethMap";
import { CategoricalLegend, SequentialLegend } from "@/components/map/MapLegend";
import { legendFormat } from "@/lib/format";

export type EmbedLegend =
  | { kind: "sequential"; breaks: number[]; unit: string; decimals: number; title: string }
  | { kind: "categorical"; items: { color: string; label: string }[]; title: string };

/**
 * Mapa de una pieza insertable: sin selector de modo ni panel lateral (el medio
 * eligió qué mostrar), pero con tooltip y navegación por teclado intactos.
 */
export default function EmbedMap({
  entries,
  mapTitle,
  geoUrl,
  backdropUrl,
  legend,
}: {
  entries: Record<string, MapEntry>;
  mapTitle: string;
  geoUrl: string;
  backdropUrl?: string;
  legend: EmbedLegend;
}) {
  return (
    <div className="min-w-0">
      {/* El mapa es casi cuadrado y crece con el ancho: se le pone techo para
          que la pieza entera entre en la altura fija del iframe del medio. */}
      <div className="mx-auto w-full max-w-[26rem]">
        <ChoroplethMap
          geoUrl={geoUrl}
          backdropUrl={backdropUrl}
          entries={entries}
          title={mapTitle}
          showCodes={false}
        />
      </div>
      <div className="mt-3">
        {legend.kind === "sequential" ? (
          <SequentialLegend
            breaks={legend.breaks}
            format={legendFormat(legend.unit, legend.decimals)}
            title={legend.title}
          />
        ) : (
          <CategoricalLegend items={legend.items} title={legend.title} />
        )}
      </div>
    </div>
  );
}
