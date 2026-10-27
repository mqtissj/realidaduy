import { lineaPobreza } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import TableWrap from "@/components/ui/TableWrap";

const pesos = (n: number) => `$\u00a0${formatNumber(n, 0)}`;

/**
 * "¿Cuánta plata hace falta para no ser pobre?": el valor de la línea de
 * pobreza de un hogar por mes, según su tamaño, región y si alquila. Va en las
 * páginas de pobreza (personas y hogares).
 */
export default function LineaPobreza() {
  const { filas, periodLabel } = lineaPobreza;
  const uno = filas[0];
  return (
    <section aria-labelledby="linea-pobreza" className="mt-8">
      <h2 id="linea-pobreza" className="font-display text-2xl font-bold">
        ¿Cuánta plata hace falta para no ser pobre?
      </h2>
      <p className="mt-1 max-w-prose text-sm text-ink-soft">
        Un hogar es pobre si su ingreso del mes no llega a esta línea. Depende de cuántos son,
        de si viven en Montevideo o en el Interior y de si alquilan: una persona sola que alquila
        en Montevideo necesita {pesos(uno.montevideo.inquilinos)}; si no alquila,{" "}
        {pesos(uno.montevideo.noInquilinos)}.
      </p>
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card md:p-5">
        <h3 className="font-display text-lg font-bold md:text-xl">Línea de pobreza del hogar, en pesos por mes</h3>
        <p className="mt-0.5 text-sm text-ink-soft">Valores de {periodLabel} · Fuente: INE</p>
        <TableWrap label="Línea de pobreza del hogar por región, tenencia y tamaño" className="mt-3">
          <table className="tabla min-w-[520px]">
            <caption className="sr-only">
              Línea de pobreza del hogar en pesos por mes, {periodLabel}, por región, tenencia de la vivienda y
              tamaño del hogar
            </caption>
            <thead>
              <tr>
                <th scope="col">Hogar de</th>
                <th scope="col" className="num">Montevideo, alquila</th>
                <th scope="col" className="num">Montevideo, no alquila</th>
                <th scope="col" className="num">Interior, alquila</th>
                <th scope="col" className="num">Interior, no alquila</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.personas}>
                  <th scope="row">{f.personas === 1 ? "1 persona" : `${f.personas} personas`}</th>
                  <td className="num">{pesos(f.montevideo.inquilinos)}</td>
                  <td className="num">{pesos(f.montevideo.noInquilinos)}</td>
                  <td className="num">{pesos(f.interior.inquilinos)}</td>
                  <td className="num">{pesos(f.interior.noInquilinos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="mt-3 text-xs text-ink-faint">
          La línea no crece en proporción al tamaño: varios integrantes comparten la vivienda y otros gastos.
          Metodología 2017 del INE. Fuente:{" "}
          <a className="underline" href={lineaPobreza.sourceUrl}>
            informe de pobreza del INE
          </a>
          .
        </p>
      </div>
    </section>
  );
}
