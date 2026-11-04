import type { Territory } from "@/lib/types";
import { CENUR_SALTO_ANIOS, cenurSaltoFuente, getSedeIntake } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { TablaPlegable } from "@/components/educacion/EducacionTerciaria";

/** El último año del cuadro es parcial (inscripciones hasta marzo). */
const PARCIAL = CENUR_SALTO_ANIOS[CENUR_SALTO_ANIOS.length - 1];
const ULTIMO_COMPLETO = CENUR_SALTO_ANIOS[CENUR_SALTO_ANIOS.length - 2];

/**
 * Serie de ingresos por carrera a la sede de la UdelaR del departamento, según la
 * propia sede. Complementa el anuario del MEC, que trae un solo año.
 */
export default function IngresosSede({ dept }: { dept: Territory }) {
  const { carreras, totales } = getSedeIntake(dept.id);
  if (carreras.length === 0) return null;
  const completos = totales.filter((t) => t.anio !== PARCIAL);
  const ultimo = completos[completos.length - 1];
  const maximo = completos.reduce((a, b) => (b.total > a.total ? b : a));
  const tope = Math.max(...totales.map((t) => t.total));
  const enlace = "text-primary underline decoration-line underline-offset-2 hover:decoration-primary";
  const celda = (v: number | null | undefined) => (v == null ? "–" : formatNumber(v));

  return (
    <section aria-labelledby="ingresos-sede" className="mt-10">
      <h2 id="ingresos-sede" className="font-display text-2xl font-bold">
        Ingresos a la sede de la UdelaR en {dept.name}
      </h2>
      <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
        <p className="text-sm text-ink-soft">
          En {ultimo.anio} entraron <strong className="tnum text-ink">{formatNumber(ultimo.total)}</strong>{" "}
          estudiantes a la Sede {dept.name} del CENUR Litoral Norte
          {maximo.anio === ultimo.anio ? `, la cifra más alta desde ${completos[0].anio}` : ""}.
        </p>
        <ul className="mt-4 space-y-1.5" aria-label={`Ingresos totales por año a la Sede ${dept.name}`}>
          {totales.map((t) => (
            <li key={t.anio} className="grid grid-cols-[4.5rem_1fr_3.5rem] items-center gap-2 text-sm">
              <span className="tnum text-ink-soft">
                {t.anio}
                {t.anio === PARCIAL ? "*" : ""}
              </span>
              <span className="h-3 overflow-hidden rounded-r-sm bg-primary-soft" aria-hidden="true">
                <span
                  className={`block h-full rounded-r-sm ${t.anio === PARCIAL ? "bg-primary/50" : "bg-primary"}`}
                  style={{ width: `${(t.total / tope) * 100}%` }}
                />
              </span>
              <span className="tnum text-right text-ink">{formatNumber(t.total)}</span>
            </li>
          ))}
        </ul>
        <TablaPlegable
          label={`Ingresos por carrera a la Sede ${dept.name}, ${CENUR_SALTO_ANIOS[0]} a ${PARCIAL}`}
          minWidth="min-w-[720px]"
          verTodas={`Ver las ${carreras.length} carreras`}
          head={
            <tr>
              <th scope="col">Carrera</th>
              {CENUR_SALTO_ANIOS.map((a) => (
                <th key={a} scope="col" className="num">
                  {a}
                  {a === PARCIAL ? "*" : ""}
                </th>
              ))}
            </tr>
          }
          rows={carreras.map((c) => (
            <tr key={c.career}>
              <td>{c.career}</td>
              {CENUR_SALTO_ANIOS.map((a) => (
                <td key={a} className="num">
                  {celda(c.ingresos[a])}
                </td>
              ))}
            </tr>
          ))}
        />
        <p className="mt-3 text-xs text-ink-faint">
          Fuente:{" "}
          <a className={enlace} href={cenurSaltoFuente.sourceUrl} rel="noopener noreferrer" target="_blank">
            {cenurSaltoFuente.cita}
          </a>
          , cuadro enviado por la sede a realidad.uy. Ordenadas por los ingresos de {ULTIMO_COMPLETO}. *{" "}
          {PARCIAL}: inscripciones hasta marzo, puede cambiar. «–» = el cuadro no trae dato ese año; algunas
          carreras abren inscripciones un año sí y otro no. La sede cuenta sus propias inscripciones, por eso
          los números no coinciden del todo con los ingresos del Anuario del MEC que se muestran más arriba.
        </p>
      </div>
    </section>
  );
}
