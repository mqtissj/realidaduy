import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso de realidad.uy: plataforma cívica independiente, datos de fuentes oficiales, sin garantías y con metodología a la vista.",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">Legal</p>
      <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
        Términos y condiciones
      </h1>
      <p className="mt-1 text-sm text-ink-faint">Última actualización: 26 de agosto de 2026</p>

      <div className="mt-8 space-y-8 text-ink-soft">
        <section aria-labelledby="que-es">
          <h2 id="que-es" className="font-display text-xl font-bold text-ink">
            1. Qué es realidad.uy
          </h2>
          <p className="mt-2">
            realidad.uy es una plataforma <strong>cívica e independiente</strong> que reúne y
            visualiza datos públicos de Uruguay. <strong>No es un sitio estatal</strong> ni
            está afiliada a ningún organismo público, partido político ni empresa. Usar el
            sitio implica aceptar estos términos.
          </p>
        </section>

        <section aria-labelledby="neutralidad">
          <h2 id="neutralidad" className="font-display text-xl font-bold text-ink">
            2. Neutralidad
          </h2>
          <p className="mt-2">
            La plataforma no favorece a ningún partido ni presenta conclusiones políticas:
            muestra datos con su fuente, período y metodología para que cada persona saque
            sus propias conclusiones. Los colores partidarios aparecen únicamente como
            codificación visual en mapas y gráficos electorales.
          </p>
        </section>

        <section aria-labelledby="datos">
          <h2 id="datos" className="font-display text-xl font-bold text-ink">
            3. Origen de los datos y ausencia de garantías
          </h2>
          <p className="mt-2">
            Los datos provienen de fuentes públicas identificadas (INE, BCU, Corte
            Electoral, Ministerio del Interior, MIDES, Banco Mundial, entre otras) y cada
            cifra enlaza a su origen. Aun así, el sitio se ofrece{" "}
            <strong>&quot;tal cual&quot;, sin garantía de exactitud, completitud o vigencia</strong>:
            puede haber errores de ingesta, revisiones de los organismos o demoras de
            actualización. Antes de tomar decisiones importantes (periodísticas, académicas,
            comerciales o legales) verificá el dato contra la fuente original enlazada. La
            plataforma no ofrece asesoramiento de ningún tipo.
          </p>
        </section>

        <section aria-labelledby="licencias">
          <h2 id="licencias" className="font-display text-xl font-bold text-ink">
            4. Licencias y atribución
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Los datos de organismos uruguayos se publican bajo sus propios regímenes de
              datos abiertos (p. ej. la Licencia de Datos Abiertos Uruguay del catálogo
              nacional).
            </li>
            <li>
              Los límites territoriales derivan de IDE/Servicio Geográfico Militar y de la
              cartografía censal del INE (simplificados para la web; no aptos para fines
              catastrales o de deslinde).
            </li>
            <li>
              Podés citar y reutilizar las visualizaciones de realidad.uy mencionando la
              plataforma y la fuente original del dato. El código del proyecto está
              disponible en{" "}
              <a
                className="font-semibold text-primary underline decoration-line underline-offset-2 hover:decoration-primary"
                href="https://github.com/mqtissj/realidaduy"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              .
            </li>
          </ul>
        </section>

        <section aria-labelledby="uso">
          <h2 id="uso" className="font-display text-xl font-bold text-ink">
            5. Uso aceptable
          </h2>
          <p className="mt-2">
            No está permitido usar el sitio para actividades ilícitas, intentar vulnerar su
            seguridad, sobrecargarlo deliberadamente ni presentar sus contenidos de forma
            que sugiera afiliación estatal o partidaria de la plataforma.
          </p>
        </section>

        <section aria-labelledby="responsabilidad">
          <h2 id="responsabilidad" className="font-display text-xl font-bold text-ink">
            6. Limitación de responsabilidad
          </h2>
          <p className="mt-2">
            En la máxima medida permitida por la ley, la plataforma y sus responsables no
            responden por daños derivados del uso del sitio o de decisiones tomadas en base
            a su contenido. El servicio puede interrumpirse o modificarse sin aviso.
          </p>
        </section>

        <section aria-labelledby="cambios">
          <h2 id="cambios" className="font-display text-xl font-bold text-ink">
            7. Cambios
          </h2>
          <p className="mt-2">
            Estos términos pueden actualizarse; la versión vigente es la publicada en esta
            página, con su fecha de revisión. El uso del sitio después de un cambio implica
            su aceptación.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/privacidad"
          className="pressable inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary hover:border-celeste"
        >
          Política de privacidad
        </Link>
        <Link
          href="/"
          className="pressable inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-primary hover:border-celeste"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
