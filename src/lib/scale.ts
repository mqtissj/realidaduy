// Escala secuencial por cuantiles para choropleths (5 pasos, azul claro→oscuro).

export const SEQ_COLORS = ["var(--seq-1)", "var(--seq-2)", "var(--seq-3)", "var(--seq-4)", "var(--seq-5)"];

export interface QuantScale {
  fillFor: (value: number) => string;
  /** Cortes entre clases (longitud = pasos - 1). */
  breaks: number[];
}

export function quantileScale(values: number[], steps = 5): QuantScale {
  const sorted = [...values].sort((a, b) => a - b);
  const breaks: number[] = [];
  for (let i = 1; i < steps; i++) {
    const idx = (i / steps) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const frac = idx - lo;
    breaks.push(sorted[lo] * (1 - frac) + (sorted[Math.min(lo + 1, sorted.length - 1)] ?? sorted[lo]) * frac);
  }
  return {
    breaks,
    fillFor(value: number) {
      let i = 0;
      while (i < breaks.length && value > breaks[i]) i++;
      return SEQ_COLORS[i];
    },
  };
}
