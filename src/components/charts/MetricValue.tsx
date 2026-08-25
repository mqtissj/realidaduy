"use client";

import { AnimatedNumber } from "@/components/cult/AnimatedNumber";
import { formatValue } from "@/lib/format";

/*
 * Cifra principal de una tarjeta de indicador, animada con el
 * AnimatedNumber de Cult UI y formateada es-UY (coma decimal).
 */

export default function MetricValue({
  value,
  unit,
  decimals,
}: {
  value: number;
  unit: string;
  decimals: number;
}) {
  return (
    <AnimatedNumber
      value={value}
      precision={decimals}
      format={(v) => formatValue(v, unit, decimals)}
    />
  );
}
