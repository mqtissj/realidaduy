import type { ReactNode } from "react";

/**
 * Marco estándar de todo gráfico: título-pregunta, fuente, período y
 * "Ver datos" (tabla accesible). Un gráfico nunca se publica suelto.
 */
export default function ChartCard({
  question,
  subtitle,
  sourceLine,
  note,
  table,
  children,
}: {
  question: string;
  subtitle?: string;
  sourceLine: string;
  note?: string;
  table: { caption: string; head: string[]; rows: (string | number)[][] };
  children: ReactNode;
}) {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
      <figcaption>
        <h3 className="font-display text-lg font-bold text-ink md:text-xl">{question}</h3>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p> : null}
      </figcaption>
      <div className="mt-4">{children}</div>
      <details className="fold mt-3">
        <summary className="pressable inline-block rounded-lg text-sm font-semibold text-primary">
          Ver datos
        </summary>
        <div className="tablewrap mt-2">
          <table className="tabla min-w-[320px]">
            <caption className="sr-only">{table.caption}</caption>
            <thead>
              <tr>
                {table.head.map((h, j) => (
                  <th key={h} scope="col" className={j > 0 ? "num" : undefined}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className={j > 0 ? "num" : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="mt-3 text-xs text-ink-faint">{sourceLine}</p>
      {note ? <p className="mt-1 text-xs text-ink-faint">{note}</p> : null}
    </figure>
  );
}
